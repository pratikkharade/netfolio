import process from "node:process"
import { loadEnv } from "vite"
import { fetchPlaidPortfolio, modelPlaidPortfolio } from "./plaid-client.mjs"

const fileEnvironment = loadEnv("development", process.cwd(), "PLAID_")
const environment = { ...fileEnvironment, ...process.env }

try {
    const rawPortfolio = await fetchPlaidPortfolio(environment)
    const modeledPortfolio = modelPlaidPortfolio(rawPortfolio)

    console.log("\nRaw Plaid data:")
    console.dir(rawPortfolio, { depth: null, colors: true })
    console.log("\nNetFolio JSON:")
    console.log(JSON.stringify(modeledPortfolio, null, 2))
} catch (error) {
    console.error("Unable to fetch Plaid data:", error.message)
    process.exitCode = 1
}
