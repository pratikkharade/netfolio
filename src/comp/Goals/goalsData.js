import { normalizeCSVLabel, parseCSV, parseNumber } from "../../utils/csv.js"

const GOAL_FIELDS = {
    id: ["goal id", "id"],
    name: ["name", "goal name"],
    description: ["description"],
    sourceType: ["source type"],
    source: ["source"],
    target: ["target amount", "target"],
    startDate: ["start date"],
    deadline: ["deadline", "target date"],
    enabled: ["enabled", "active"],
}

function findColumnIndex(headers, aliases) {
    return headers.findIndex((header) => aliases.includes(header))
}

function valueAt(row, index) {
    return index >= 0 ? String(row[index] ?? "").trim() : ""
}

function isEnabled(value) {
    return !["false", "no", "0", "disabled"].includes(normalizeCSVLabel(value))
}

export function parseGoalsCSV(rawData) {
    const rows = parseCSV(rawData)
    const headerIndex = rows.findIndex((row) => {
        const headers = row.map(normalizeCSVLabel)
        return GOAL_FIELDS.name.some((alias) => headers.includes(alias))
            && GOAL_FIELDS.sourceType.some((alias) => headers.includes(alias))
            && GOAL_FIELDS.target.some((alias) => headers.includes(alias))
    })

    if (headerIndex < 0) return []

    const headers = rows[headerIndex].map(normalizeCSVLabel)
    const indexes = Object.fromEntries(
        Object.entries(GOAL_FIELDS).map(([field, aliases]) => [field, findColumnIndex(headers, aliases)])
    )

    return rows
        .slice(headerIndex + 1)
        .map((row, index) => ({
            id: valueAt(row, indexes.id) || `goal-${index + 1}`,
            name: valueAt(row, indexes.name),
            description: valueAt(row, indexes.description),
            sourceType: normalizeCSVLabel(valueAt(row, indexes.sourceType)),
            source: valueAt(row, indexes.source),
            target: parseNumber(valueAt(row, indexes.target)),
            startDate: valueAt(row, indexes.startDate),
            deadline: valueAt(row, indexes.deadline),
            enabled: isEnabled(valueAt(row, indexes.enabled)),
        }))
        .filter((goal) => goal.enabled && goal.name && goal.sourceType && goal.source && goal.target > 0)
}

function findCurrentAmount(goal, accounts, metrics) {
    const normalizedSource = normalizeCSVLabel(goal.source)

    if (goal.sourceType === "account") {
        return accounts.find((account) => normalizeCSVLabel(account.name) === normalizedSource)?.balance ?? null
    }

    if (goal.sourceType === "category") {
        const matches = accounts.filter((account) => normalizeCSVLabel(account.category) === normalizedSource)
        return matches.length ? matches.reduce((total, account) => total + account.balance, 0) : null
    }

    if (goal.sourceType === "metric") {
        return metrics[normalizedSource] ?? null
    }

    return null
}

function getGoalStatus(current, target) {
    if (!Number.isFinite(current)) return "Unavailable"

    const progress = current / target
    if (progress >= 1) return "Completed"
    if (progress >= 0.75) return "Almost there"
    if (progress > 0) return "In progress"
    return "Getting started"
}

export function resolveGoals(definitions, accounts, metrics) {
    return definitions.map((goal) => {
        const current = findCurrentAmount(goal, accounts, metrics)
        return { ...goal, current, status: getGoalStatus(current, goal.target) }
    })
}
