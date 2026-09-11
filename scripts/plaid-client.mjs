const PLAID_API_VERSION = "2020-09-14"

const INSTITUTIONS = [
    {
        key: "usBank",
        name: "U.S. Bank",
        tokenVariable: "PLAID_US_BANK_ACCESS_TOKEN",
        endpoints: ["/accounts/balance/get"],
    },
    {
        key: "chase",
        name: "Chase",
        tokenVariable: "PLAID_CHASE_ACCESS_TOKEN",
        endpoints: ["/accounts/balance/get"],
    },
    {
        key: "robinhood",
        name: "Robinhood",
        tokenVariable: "PLAID_ROBINHOOD_ACCESS_TOKEN",
        endpoints: ["/accounts/balance/get", "/investments/holdings/get"],
    },
]

const RETIREMENT_SUBTYPES = new Set([
    "401a",
    "401k",
    "403b",
    "457b",
    "ira",
    "keogh",
    "pension",
    "profit sharing plan",
    "roth",
    "roth 401k",
    "sep ira",
    "simple ira",
    "thrift savings plan",
    "variable annuity",
])

const SAVING_SUBTYPES = new Set([
    "cash management",
    "money market",
    "savings",
])

const ACCOUNT_NAME_OVERRIDES = {
    usBank: [
        { source: /^Checking(?: - \d{4})?$/i, name: "U.S. Bank - Checking" },
        { source: /^Credit Card(?: - \d{4})?$/i, name: "U.S. Bank - Credit Card" },
    ],
    chase: [
        { source: /^TOTAL CHECKING$/i, name: "Chase - Checking" },
        { source: /^CREDIT CARD$/i, name: "Chase - Credit Card" },
    ],
    robinhood: [
        { source: /^Crypto$/i, name: "Robinhood - Crypto" },
        { source: /^Robinhood individual$/i, name: "Robinhood - Brokerage" },
        { source: /^Robinhood Roth IRA$/i, name: "Robinhood - Roth IRA" },
        { source: /^Robinhood traditional IRA$/i, name: "Robinhood - Traditional IRA" },
        { source: /^Checking$/i, name: "Robinhood - Checking" },
        { source: /^Savings$/i, name: "Robinhood - Savings" },
        { source: /^Robinhood Credit Card(?: \*+\d{4})?$/i, name: "Robinhood - Credit Card" },
    ],
}

function getPlaidConfiguration(environment) {
    const plaidEnvironment = environment.PLAID_ENV || "sandbox"
    if (!["sandbox", "production"].includes(plaidEnvironment)) {
        throw new Error('PLAID_ENV must be either "sandbox" or "production".')
    }

    const clientId = environment.PLAID_CLIENT_ID?.trim()
    const secretVariable = plaidEnvironment === "production"
        ? "PLAID_PRODUCTION_SECRET"
        : "PLAID_SANDBOX_SECRET"
    const secret = environment[secretVariable]?.trim()

    if (!clientId) throw new Error("PLAID_CLIENT_ID is not configured.")
    if (!secret) throw new Error(`${secretVariable} is not configured.`)

    return {
        baseUrl: `https://${plaidEnvironment}.plaid.com`,
        clientId,
        plaidEnvironment,
        secret,
    }
}

async function callPlaidEndpoint(configuration, endpoint, accessToken) {
    const response = await fetch(`${configuration.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "PLAID-CLIENT-ID": configuration.clientId,
            "PLAID-SECRET": configuration.secret,
            "Plaid-Version": PLAID_API_VERSION,
        },
        body: JSON.stringify({ access_token: accessToken }),
    })

    const payload = await response.json()
    if (!response.ok) {
        const error = new Error(payload.error_message || `Plaid request failed with status ${response.status}.`)
        error.details = payload
        throw error
    }

    return payload
}

async function fetchInstitution(configuration, institution, environment) {
    const accessToken = environment[institution.tokenVariable]?.trim()
    if (!accessToken) {
        return {
            status: "skipped",
            reason: `${institution.tokenVariable} is not configured.`,
        }
    }

    const results = await Promise.all(institution.endpoints.map(async (endpoint) => {
        try {
            return [endpoint, {
                status: "success",
                data: await callPlaidEndpoint(configuration, endpoint, accessToken),
            }]
        } catch (error) {
            return [endpoint, {
                status: "error",
                error: error.details || { message: error.message },
            }]
        }
    }))

    return {
        status: results.every(([, result]) => result.status === "success") ? "success" : "error",
        endpoints: Object.fromEntries(results),
    }
}

export async function fetchPlaidPortfolio(environment) {
    const configuration = getPlaidConfiguration(environment)
    const institutionResults = await Promise.all(
        INSTITUTIONS.map(async (institution) => [
            institution.key,
            {
                name: institution.name,
                ...await fetchInstitution(configuration, institution, environment),
            },
        ])
    )

    return {
        fetchedAt: new Date().toISOString(),
        environment: configuration.plaidEnvironment,
        institutions: Object.fromEntries(institutionResults),
    }
}

function classifyAccount(account) {
    const accountType = account.type?.toLowerCase()
    const accountSubtype = account.subtype?.toLowerCase()

    if (accountType === "credit") {
        return { type: "liability", category: "cc" }
    }

    if (accountType === "investment") {
        return {
            type: "asset",
            category: RETIREMENT_SUBTYPES.has(accountSubtype) ? "retirement" : "investment",
        }
    }

    if (accountType === "depository") {
        return {
            type: "asset",
            category: SAVING_SUBTYPES.has(accountSubtype) ? "saving" : "checking",
        }
    }

    return null
}

function getAccountDisplayName(institutionKey, institutionName, accountName) {
    const override = ACCOUNT_NAME_OVERRIDES[institutionKey]
        ?.find(({ source }) => source.test(accountName))

    return override?.name || `${institutionName} - ${accountName}`
}

export function modelPlaidPortfolio(rawPortfolio) {
    const modeledAccounts = new Map()

    Object.entries(rawPortfolio.institutions).forEach(([institutionKey, institution]) => {
        if (!institution.endpoints) return

        Object.values(institution.endpoints).forEach((endpointResult) => {
            if (endpointResult.status !== "success") return

            const accounts = endpointResult.data.accounts || []
            accounts.forEach((account) => {
                const classification = classifyAccount(account)
                const balance = account.balances?.current ?? account.balances?.available
                if (!classification || !Number.isFinite(balance)) return

                const accountKey = `${institutionKey}:${account.account_id || `${account.name}:${account.mask}`}`
                if (modeledAccounts.has(accountKey)) return

                modeledAccounts.set(accountKey, {
                    name: getAccountDisplayName(institutionKey, institution.name, account.name),
                    type: classification.type,
                    category: classification.category,
                    balance,
                })
            })
        })
    })

    return {
        updatedAt: rawPortfolio.fetchedAt,
        accounts: [...modeledAccounts.values()],
    }
}
