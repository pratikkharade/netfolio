import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, Clock3, RefreshCw } from "lucide-react"
import { data_url, loan_history_url, loan_summary_url } from "../../config.jsx"
import { getTotalByType } from "../helpers.jsx"
import BottomNav from "../BottomNav/BottomNav.jsx"
import Details from "../Details/Details.jsx"
import Header from "../Header/Header.jsx"
import LoanDetails from "../Loan/LoanDetails.jsx"
import Overview from "../Overview/Overview.jsx"
import Profile from "../Profile/Profile.jsx"
import PrivacyUnlock from "../PrivacyUnlock/PrivacyUnlock.jsx"
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
const VIEW_HASHES = {
    home: "#home",
    accounts: "#accounts",
    loan: "#auto-loan",
    profile: "#profile",
}

function getViewFromHash() {
    return Object.entries(VIEW_HASHES).find(([, hash]) => hash === window.location.hash)?.[0] || "home"
}

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

export default function FinanceApp({ setIsAuthenticated, theme, onThemeChange }) {
    const contentRef = useRef(null)
    const toastTimeoutRef = useRef(null)
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
    const [activeView, setActiveView] = useState(getViewFromHash)
    const [showUpdateToast, setShowUpdateToast] = useState(false)

    useEffect(() => {
        const handleHashChange = () => setActiveView(getViewFromHash())
        window.addEventListener("hashchange", handleHashChange)
        return () => window.removeEventListener("hashchange", handleHashChange)
    }, [])

    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: "auto" })
    }, [activeView])

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
                setShowUpdateToast(true)
                window.clearTimeout(toastTimeoutRef.current)
                toastTimeoutRef.current = window.setTimeout(
                    () => setShowUpdateToast(false),
                    3000
                )
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
            window.clearTimeout(toastTimeoutRef.current)
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
        window.clearTimeout(toastTimeoutRef.current)
        setShowUpdateToast(false)
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

    const handleNavigate = (view) => {
        const nextHash = VIEW_HASHES[view]
        if (window.location.hash === nextHash) {
            setActiveView(view)
            return
        }

        window.location.hash = nextHash
    }

    const showPortfolioError = status === "error" && (activeView === "home" || activeView === "accounts")

    return (
        <div className="home-container">
            <Header
                isLoading={isLoading}
                onRefresh={handleRefresh}
                hideValues={hideValues}
                onToggleValues={handleToggleValues}
            />

            <main id="app-content" className="app-main" ref={contentRef}>
                <div className={`app-main-inner app-view-${activeView}`}>
                    {showPortfolioError ? (
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
                    ) : activeView === "home" ? (
                        <Overview
                            netWorth={netWorth}
                            totalAssets={totalAssets}
                            totalLiabilities={totalLiabilities}
                            isLoading={isLoading}
                            loanSummary={loanData?.summary}
                            loanStatus={loanStatus}
                            hideValues={hideValues}
                        />
                    ) : activeView === "accounts" ? (
                        <Details
                            categories={categories}
                            netWorth={netWorth}
                            totalAssets={totalAssets}
                            totalLiabilities={totalLiabilities}
                            isLoading={isLoading}
                            hideValues={hideValues}
                        />
                    ) : activeView === "loan" ? (
                        <section className="loan-page" aria-labelledby="auto-loan-page-title">
                            <div className="loan-page-heading">
                                <p className="section-eyebrow">FINANCING</p>
                                <h1 id="auto-loan-page-title">Auto Loan</h1>
                            </div>
                            <LoanDetails
                                loanData={loanData}
                                status={loanStatus}
                                error={loanError}
                                hideValues={hideValues}
                            />
                        </section>
                    ) : (
                        <Profile
                            date={date}
                            isLoading={isLoading}
                            hasError={status === "error"}
                            setIsAuthenticated={setIsAuthenticated}
                            theme={theme}
                            onThemeChange={onThemeChange}
                        />
                    )}
                </div>
            </main>

            <BottomNav activeView={activeView} onNavigate={handleNavigate} />

            {showUpdateToast && (
                <div className="update-toast" role="status" aria-live="polite">
                    <Clock3 size={16} aria-hidden="true" />
                    <span>Last updated</span>
                    <strong>{date || "recently"}</strong>
                </div>
            )}

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
