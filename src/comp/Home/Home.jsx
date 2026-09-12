import { useEffect, useMemo, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { data_url, loan_history_url, loan_summary_url } from "../../config.jsx"
import { getTotalByType } from "../helpers.jsx"
import Details from "../Details/Details.jsx"
import Header from "../Header/Header.jsx"
import PrivacyUnlock from "../PrivacyUnlock/PrivacyUnlock.jsx"
import ScrollToTop from "../ScrollToTop/ScrollToTop.jsx"
import { parseLoanData } from "../Loan/loanData.js"
import { parseCSV } from "../../utils/csv.js"
import "./Home.css"

const EMPTY_CATEGORIES = {
    checking: [],
    saving: [],
    investment: [],
    retirement: [],
    rent: [],
    cc: [],
}

const VALUES_HIDDEN_KEY = "netfolio-values-hidden"

function createEmptyCategories() {
    return Object.fromEntries(
        Object.keys(EMPTY_CATEGORIES).map((category) => [category, []])
    )
}

function parsePortfolioCSV(rawData) {
    const rows = parseCSV(rawData)

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

async function fetchCSV(url, signal) {
    const separator = url.includes("?") ? "&" : "?"
    const response = await fetch(`${url}${separator}t=${Date.now()}`, {
        signal,
        cache: "no-store",
    })
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    return response.text()
}

export default function FinanceApp({ setIsAuthenticated }) {
    const [data, setData] = useState([])
    const [date, setDate] = useState(null)
    const [status, setStatus] = useState("loading")
    const [error, setError] = useState("")
    const [requestKey, setRequestKey] = useState(0)
    const [loanData, setLoanData] = useState(null)
    const [loanStatus, setLoanStatus] = useState("loading")
    const [loanError, setLoanError] = useState("")
    const [hideValues, setHideValues] = useState(
        () => localStorage.getItem(VALUES_HIDDEN_KEY) === "true"
    )
    const [isUnlockOpen, setIsUnlockOpen] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        let isCancelled = false

        fetchCSV(data_url, controller.signal)
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

        Promise.all([
            fetchCSV(loan_summary_url, controller.signal),
            fetchCSV(loan_history_url, controller.signal),
        ])
            .then(([summaryCSV, historyCSV]) => {
                const nextLoanData = parseLoanData(summaryCSV, historyCSV)
                if (nextLoanData.summary.currentBalance === null && nextLoanData.payments.length === 0) {
                    throw new Error("The loan spreadsheet does not contain recognizable data.")
                }
                return nextLoanData
            })
            .then((nextLoanData) => {
                if (isCancelled) return

                setLoanData(nextLoanData)
                setLoanStatus("success")
                setLoanError("")
            })
            .catch((fetchError) => {
                if (fetchError.name === "AbortError") return
                setLoanData(null)
                setLoanStatus("error")
                setLoanError("Make both loan tabs available to anyone with the link, then refresh.")
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
        setLoanStatus("loading")
        setLoanError("")
        setRequestKey((key) => key + 1)
    }

    const handleToggleValues = () => {
        if (hideValues) {
            setIsUnlockOpen(true)
            return
        }

        localStorage.setItem(VALUES_HIDDEN_KEY, "true")
        setHideValues(true)
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
                    loanSummary={loanData?.summary}
                    loanStatus={loanStatus}
                    hideValues={hideValues}
                    onToggleValues={handleToggleValues}
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
                        loanData={loanData}
                        loanStatus={loanStatus}
                        loanError={loanError}
                        hideValues={hideValues}
                    />
                )}
            </main>
            <ScrollToTop />
            {isUnlockOpen && (
                <PrivacyUnlock
                    onCancel={() => setIsUnlockOpen(false)}
                    onUnlock={() => {
                        localStorage.removeItem(VALUES_HIDDEN_KEY)
                        setHideValues(false)
                        setIsUnlockOpen(false)
                    }}
                />
            )}
        </div>
    )
}
