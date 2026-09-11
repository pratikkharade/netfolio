import { useEffect, useMemo, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { data_url } from "../../config.jsx"
import { getTotalByType } from "../helpers.jsx"
import Details from "../Details/Details.jsx"
import Header from "../Header/Header.jsx"
import ScrollToTop from "../ScrollToTop/ScrollToTop.jsx"
import "./Home.css"

const EMPTY_CATEGORIES = {
    checking: [],
    saving: [],
    investment: [],
    retirement: [],
    rent: [],
    cc: [],
}

function createEmptyCategories() {
    return Object.fromEntries(
        Object.keys(EMPTY_CATEGORIES).map((category) => [category, []])
    )
}

function parsePortfolioCSV(rawData) {
    const rows = rawData
        .split(/\r?\n/)
        .map((row) => row.split(","))

    const updatedAt = rows[0]?.[1]?.trim() || null
    const accounts = rows
        .slice(2)
        .filter((row) => row.length >= 4 && row[0]?.trim())
        .map((row) => ({
            name: row[0].trim(),
            type: row[1]?.trim(),
            category: row[2]?.trim(),
            balance: Number.parseFloat(row[3] || 0),
        }))
        .filter((account) => Number.isFinite(account.balance) && account.balance !== 0)

    return { accounts, updatedAt }
}

export default function FinanceApp({ setIsAuthenticated }) {
    const [data, setData] = useState([])
    const [date, setDate] = useState(null)
    const [status, setStatus] = useState("loading")
    const [error, setError] = useState("")
    const [requestKey, setRequestKey] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let isCancelled = false

        fetch(`${data_url}&t=${Date.now()}`, {
            signal: controller.signal,
            cache: "no-store",
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
                return response.text()
            })
            .then(parsePortfolioCSV)
            .then((spreadsheetPortfolio) => {
                if (isCancelled) return

                setDate(spreadsheetPortfolio.updatedAt)
                setData(spreadsheetPortfolio.accounts)
                setStatus("success")
                setError("")
            })
            .catch((fetchError) => {
                if (fetchError.name === "AbortError") return
                setStatus("error")
                setError("We couldn’t load your latest account data.")
            })

        return () => {
            isCancelled = true
            controller.abort()
        }
    }, [requestKey])

    const categories = useMemo(() => data.reduce((groups, item) => {
        if (groups[item.category]) groups[item.category].push(item)
        return groups
    }, createEmptyCategories()), [data])

    const totalAssets = useMemo(() => getTotalByType(data, "asset"), [data])
    const totalLiabilities = useMemo(() => getTotalByType(data, "liability"), [data])
    const netWorth = totalAssets - totalLiabilities
    const isLoading = status === "loading"

    const handleRefresh = () => {
        setStatus("loading")
        setError("")
        setRequestKey((key) => key + 1)
    }

    return (
        <div className="home-container">
            <main id="top" className="home-content">
                <Header
                    date={date}
                    netWorth={netWorth}
                    totalAssets={totalAssets}
                    totalLiabilities={totalLiabilities}
                    isLoading={isLoading}
                    hasError={status === "error"}
                    onRefresh={handleRefresh}
                    setIsAuthenticated={setIsAuthenticated}
                />

                {status === "error" ? (
                    <section className="dashboard-error" role="alert" aria-live="polite">
                        <div className="dashboard-error-icon" aria-hidden="true">
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <h2>Couldn’t load your portfolio</h2>
                            <p>{error} Check your connection and try again.</p>
                        </div>
                        <button type="button" onClick={handleRefresh}>
                            <RefreshCw size={16} aria-hidden="true" />
                            Try again
                        </button>
                    </section>
                ) : (
                    <Details
                        categories={categories}
                        totalAssets={totalAssets}
                        isLoading={isLoading}
                    />
                )}
            </main>
            <ScrollToTop />
        </div>
    )
}
