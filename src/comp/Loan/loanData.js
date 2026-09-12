import { normalizeCSVLabel, parseCSV, parseNumber } from "../../utils/csv.js"

const SUMMARY_FIELDS = {
    loanName: ["loan name", "name"],
    originalBalance: ["original balance", "original principal", "starting balance"],
    currentBalance: ["current balance", "remaining balance", "remaining principal"],
    apr: ["apr", "interest rate"],
    monthlyPayment: ["monthly payment", "payment amount", "regular payment"],
    startDate: ["start date", "loan start date"],
    nextDueDate: ["next due date", "next payment date"],
    estimatedPayoff: ["estimated payoff", "payoff date", "estimated payoff date"],
    lastUpdated: ["last updated", "updated at"],
}

const HISTORY_FIELDS = {
    paymentDate: ["payment date", "date"],
    startingBalance: ["starting balance", "beginning balance", "opening balance"],
    payment: ["payment", "payment amount", "total payment"],
    endingBalance: ["ending balance", "remaining balance", "balance"],
}

function findMatchingValue(fields, aliases) {
    const alias = aliases.find((name) => fields.has(name))
    return alias ? fields.get(alias) : null
}

function findColumnIndex(headers, aliases) {
    return headers.findIndex((header) => aliases.includes(header))
}

function valueAt(row, index) {
    return index >= 0 ? row[index] : null
}

export function parseLoanSummaryCSV(rawData) {
    const rows = parseCSV(rawData)
    const firstRowIsHeader = normalizeCSVLabel(rows[0]?.[0]) === "field"
    const fields = new Map(
        rows
            .slice(firstRowIsHeader ? 1 : 0)
            .filter((row) => row[0]?.trim())
            .map((row) => [normalizeCSVLabel(row[0]), row[1]?.trim() || ""])
    )
    const rawAPR = findMatchingValue(fields, SUMMARY_FIELDS.apr)
    const parsedAPR = parseNumber(rawAPR)

    return {
        loanName: findMatchingValue(fields, SUMMARY_FIELDS.loanName) || "Auto loan",
        originalBalance: parseNumber(findMatchingValue(fields, SUMMARY_FIELDS.originalBalance)),
        currentBalance: parseNumber(findMatchingValue(fields, SUMMARY_FIELDS.currentBalance)),
        apr: parsedAPR !== null && !String(rawAPR).includes("%") && parsedAPR <= 1
            ? parsedAPR * 100
            : parsedAPR,
        monthlyPayment: parseNumber(findMatchingValue(fields, SUMMARY_FIELDS.monthlyPayment)),
        startDate: findMatchingValue(fields, SUMMARY_FIELDS.startDate),
        nextDueDate: findMatchingValue(fields, SUMMARY_FIELDS.nextDueDate),
        estimatedPayoff: findMatchingValue(fields, SUMMARY_FIELDS.estimatedPayoff),
        lastUpdated: findMatchingValue(fields, SUMMARY_FIELDS.lastUpdated),
    }
}

export function parseLoanHistoryCSV(rawData) {
    const rows = parseCSV(rawData)
    const headerIndex = rows.findIndex((row) => {
        const headers = row.map(normalizeCSVLabel)
        return HISTORY_FIELDS.paymentDate.some((alias) => headers.includes(alias))
            && HISTORY_FIELDS.endingBalance.some((alias) => headers.includes(alias))
    })

    if (headerIndex < 0) return []

    const headers = rows[headerIndex].map(normalizeCSVLabel)
    const indexes = Object.fromEntries(
        Object.entries(HISTORY_FIELDS).map(([field, aliases]) => [field, findColumnIndex(headers, aliases)])
    )

    return rows
        .slice(headerIndex + 1)
        .map((row) => ({
            paymentDate: String(valueAt(row, indexes.paymentDate) ?? "").trim(),
            startingBalance: parseNumber(valueAt(row, indexes.startingBalance)),
            payment: parseNumber(valueAt(row, indexes.payment)),
            endingBalance: parseNumber(valueAt(row, indexes.endingBalance)),
        }))
        .filter((payment) => payment.paymentDate
            || payment.startingBalance !== null
            || payment.payment !== null
            || payment.endingBalance !== null)
        .sort((left, right) => {
            const rightTime = new Date(right.paymentDate).getTime() || 0
            const leftTime = new Date(left.paymentDate).getTime() || 0
            return rightTime - leftTime
        })
}

export function parseLoanData(summaryCSV, historyCSV) {
    const summary = parseLoanSummaryCSV(summaryCSV)
    const payments = parseLoanHistoryCSV(historyCSV)
    const latestEndingBalance = payments.find((payment) => payment.endingBalance !== null)?.endingBalance ?? null
    const lastPaymentDate = payments.find((payment) => (
        payment.paymentDate && payment.payment !== null
    ))?.paymentDate ?? null
    const currentBalance = summary.currentBalance ?? latestEndingBalance
    const principalPaid = summary.originalBalance !== null && currentBalance !== null
        ? Math.max(summary.originalBalance - currentBalance, 0)
        : null
    const paidPercentage = summary.originalBalance > 0 && currentBalance !== null
        ? Math.min(Math.max((principalPaid / summary.originalBalance) * 100, 0), 100)
        : null

    return {
        summary: {
            ...summary,
            currentBalance,
            principalPaid,
            paidPercentage,
            lastPaymentDate,
        },
        payments,
    }
}
