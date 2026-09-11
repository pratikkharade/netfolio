import process from "node:process"
import { google } from "googleapis"
import { loadEnv } from "vite"
import { fetchPlaidPortfolio, modelPlaidPortfolio } from "./plaid-client.mjs"
import { mergePortfolioAccounts } from "../src/comp/Home/portfolio.js"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
const DISPLAY_TIME_ZONE = "America/Denver"
const environment = { ...loadEnv("development", process.cwd(), ""), ...process.env }

function requiredEnvironmentVariable(name) {
    const value = environment[name]?.trim()
    if (!value) throw new Error(`${name} is not configured.`)
    return value
}

function parseServiceAccountCredentials() {
    const rawCredentials = environment.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()
    if (!rawCredentials) return null

    try {
        return JSON.parse(rawCredentials)
    } catch {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.")
    }
}

function validateGoogleConfiguration() {
    requiredEnvironmentVariable("GOOGLE_SPREADSHEET_ID")
    const credentials = parseServiceAccountCredentials()
    const keyFile = environment.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim()

    if (!credentials && !keyFile) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_FILE is not configured.")
    }
}

function quoteSheetTitle(title) {
    return `'${title.replaceAll("'", "''")}'`
}

function formatUpdatedAt(timestamp) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: DISPLAY_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
    }).formatToParts(new Date(timestamp))
    const value = (type) => parts.find((part) => part.type === type)?.value || ""

    return `${value("month")}/${value("day")}/${value("year")} ${value("hour")}:${value("minute")} ${value("dayPeriod")} ${value("timeZoneName")}`
}

function sheetRowsToAccounts(rows) {
    return rows.slice(2)
        .filter((row) => String(row[0] ?? "").trim())
        .map((row) => ({
            name: String(row[0]).trim(),
            type: String(row[1] ?? "").trim(),
            category: String(row[2] ?? "").trim(),
            balance: row[3] ?? 0,
        }))
}

function buildUpdatedRows(existingRows, modeledPortfolio) {
    const updateRow = [...(existingRows[0] || [])]
    updateRow[0] ||= "Last Updated"
    updateRow[1] = formatUpdatedAt(modeledPortfolio.updatedAt)

    const headerRow = existingRows[1]?.length
        ? [...existingRows[1]]
        : ["Name", "Type", "Category", "Balance"]
    const existingAccounts = sheetRowsToAccounts(existingRows)
    const mergedAccounts = mergePortfolioAccounts(existingAccounts, modeledPortfolio.accounts)
    const accountRows = mergedAccounts.map(({ name, type, category, balance }) => (
        [name, type, category, balance]
    ))

    return [updateRow, headerRow, ...accountRows]
}

async function getFirstVisibleSheet(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets(properties(title,index,hidden))",
    })
    const sheet = response.data.sheets
        ?.map(({ properties }) => properties)
        .filter((properties) => properties && !properties.hidden)
        .sort((a, b) => a.index - b.index)[0]

    if (!sheet?.title) throw new Error("The spreadsheet does not contain a visible sheet.")
    return sheet.title
}

async function updateSpreadsheet(modeledPortfolio) {
    const spreadsheetId = requiredEnvironmentVariable("GOOGLE_SPREADSHEET_ID")
    const credentials = parseServiceAccountCredentials()
    const keyFile = environment.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim()
    if (!credentials && !keyFile) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_FILE is not configured.")
    }
    const auth = new google.auth.GoogleAuth({
        ...(credentials ? { credentials } : { keyFile }),
        scopes: [SHEETS_SCOPE],
    })
    const sheets = google.sheets({ version: "v4", auth })
    const sheetTitle = await getFirstVisibleSheet(sheets, spreadsheetId)
    const quotedTitle = quoteSheetTitle(sheetTitle)
    const existingResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${quotedTitle}!A:D`,
        valueRenderOption: "FORMULA",
    })
    const existingRows = existingResponse.data.values || []
    const updatedRows = buildUpdatedRows(existingRows, modeledPortfolio)

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${quotedTitle}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: updatedRows },
    })

    if (existingRows.length > updatedRows.length) {
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `${quotedTitle}!A${updatedRows.length + 1}:D${existingRows.length}`,
        })
    }

    return { accountCount: modeledPortfolio.accounts.length, sheetTitle }
}

try {
    validateGoogleConfiguration()
    const rawPortfolio = await fetchPlaidPortfolio(environment)
    const modeledPortfolio = modelPlaidPortfolio(rawPortfolio)

    if (modeledPortfolio.accounts.length === 0) {
        throw new Error("Plaid returned no usable accounts, so the spreadsheet was not changed.")
    }

    const result = await updateSpreadsheet(modeledPortfolio)
    console.log(`Updated ${result.accountCount} Plaid accounts in the "${result.sheetTitle}" sheet.`)
} catch (error) {
    console.error(`Portfolio sync failed: ${error.message}`)
    process.exitCode = 1
}
