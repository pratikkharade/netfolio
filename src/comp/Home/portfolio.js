const PLAID_SPREADSHEET_ACCOUNTS = [
    { plaidPrefix: "U.S. Bank -", spreadsheetName: "US Bank" },
    { plaidPrefix: "Chase -", spreadsheetName: "Chase" },
    { plaidPrefix: "Robinhood -", spreadsheetName: "Robinhood" },
]

export function mergePortfolioAccounts(spreadsheetAccounts, plaidAccounts) {
    const replacedSpreadsheetRows = new Set(plaidAccounts.flatMap((account) => {
        const institution = PLAID_SPREADSHEET_ACCOUNTS
            .find(({ plaidPrefix }) => account.name.startsWith(plaidPrefix))

        const keys = [`${account.name.toLowerCase()}:${account.category}`]
        if (institution) {
            keys.push(`${institution.spreadsheetName.toLowerCase()}:${account.category}`)
        }

        return keys
    }))

    const retainedSpreadsheetAccounts = spreadsheetAccounts.filter((account) => (
        !replacedSpreadsheetRows.has(`${account.name.toLowerCase()}:${account.category}`)
    ))

    return [...retainedSpreadsheetAccounts, ...plaidAccounts]
}
