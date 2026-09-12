export function parseCSV(rawData) {
    const rows = []
    let row = []
    let value = ""
    let isInsideQuotes = false

    for (let index = 0; index < rawData.length; index += 1) {
        const character = rawData[index]
        const nextCharacter = rawData[index + 1]

        if (character === '"') {
            if (isInsideQuotes && nextCharacter === '"') {
                value += '"'
                index += 1
            } else {
                isInsideQuotes = !isInsideQuotes
            }
        } else if (character === "," && !isInsideQuotes) {
            row.push(value)
            value = ""
        } else if ((character === "\n" || character === "\r") && !isInsideQuotes) {
            if (character === "\r" && nextCharacter === "\n") index += 1
            row.push(value)
            if (row.some((cell) => cell.trim())) rows.push(row)
            row = []
            value = ""
        } else {
            value += character
        }
    }

    row.push(value)
    if (row.some((cell) => cell.trim())) rows.push(row)
    if (rows[0]?.[0]) rows[0][0] = rows[0][0].replace(/^\uFEFF/, "")
    return rows
}

export function parseNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null

    const source = String(value ?? "").trim()
    if (!source) return null

    const isNegative = source.startsWith("(") && source.endsWith(")")
    const normalized = source.replace(/[$,%()\s]/g, "")
    const number = Number.parseFloat(normalized)
    if (!Number.isFinite(number)) return null
    return isNegative ? -number : number
}

export function normalizeCSVLabel(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
}
