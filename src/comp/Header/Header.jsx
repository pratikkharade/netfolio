import { useEffect, useState } from "react"
import { RefreshCw, WalletCards } from "lucide-react"
import Card from "../Card/Card.jsx"
import Date from "../Date/Date.jsx"
import Loading from "../Loading/Loading.jsx"
import Logout from "../Logout/Logout.jsx"
import { formatCurrency } from "../helpers.jsx"
import "./Header.css"

const COMPACT_HEADER_AFTER = 96

function Header({ date, netWorth, totalAssets, totalLiabilities, isLoading, hasError, onRefresh, setIsAuthenticated, loanSummary, loanStatus }) {
    const [isScrolled, setIsScrolled] = useState(() => window.scrollY > COMPACT_HEADER_AFTER)
    const grossPosition = totalAssets + totalLiabilities
    const assetShare = grossPosition > 0 ? (totalAssets / grossPosition) * 100 : 100
    const liabilityShare = grossPosition > 0 ? (totalLiabilities / grossPosition) * 100 : 0
    const hasLoanProgress = Number.isFinite(loanSummary?.paidPercentage)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > COMPACT_HEADER_AFTER)

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            <header className={`app-bar ${isScrolled ? "is-scrolled" : ""}`}>
                <div className="app-bar-identity">
                    <a className="brand" href="#top" aria-label="NetFolio dashboard home">
                        <span className="brand-mark" aria-hidden="true">
                            <WalletCards size={20} />
                        </span>
                        <span>NetFolio</span>
                    </a>

                    <div className="compact-net-worth" aria-hidden={!isScrolled}>
                        <span>Net worth</span>
                        <strong>{isLoading ? <Loading variant="compact" /> : formatCurrency(netWorth)}</strong>
                    </div>
                </div>

                <div className="app-bar-actions">
                    <Date date={date} isLoading={isLoading} hasError={hasError} />
                    <div className="app-bar-buttons">
                        <button
                            type="button"
                            className="refresh-button"
                            onClick={onRefresh}
                            disabled={isLoading}
                            aria-label={isLoading ? "Refreshing portfolio data" : "Refresh portfolio data"}
                        >
                            <RefreshCw className={isLoading ? "refresh-icon spinning" : "refresh-icon"} size={17} aria-hidden="true" />
                            <span>{isLoading ? "Refreshing…" : "Refresh"}</span>
                        </button>
                        <Logout setIsAuthenticated={setIsAuthenticated} />
                    </div>
                </div>
            </header>

            {!hasError && <section className="summary-section" aria-labelledby="overview-title">
                <div className="section-heading summary-heading">
                    <div>
                        <p className="section-eyebrow">OVERVIEW</p>
                        <h1 id="overview-title">Pratik's Finances</h1>
                    </div>
                </div>

                <div className="summary-grid">
                    <Card
                        title="Net worth"
                        value={netWorth}
                        tone="primary"
                        featured
                        isLoading={isLoading}
                    >
                        {isLoading ? <Loading variant="composition" /> : <div className="composition" aria-label={`${assetShare.toFixed(0)}% assets and ${liabilityShare.toFixed(0)}% liabilities`}>
                            <div className="composition-labels">
                                <span><i className="composition-dot asset-dot" />Assets</span>
                                <span><i className="composition-dot liability-dot" />Liabilities</span>
                            </div>
                            <div className="composition-track" aria-hidden="true">
                                <span className="composition-assets" style={{ width: `${assetShare}%` }} />
                                <span className="composition-liabilities" style={{ width: `${liabilityShare}%` }} />
                            </div>
                        </div>}
                    </Card>

                    <div className="summary-secondary-grid">
                        <Card title="Total assets" value={totalAssets} tone="asset" isLoading={isLoading} />
                        <Card title="Total liabilities" value={totalLiabilities} tone="liability" isLoading={isLoading} />
                    </div>

                    <Card
                        title="Auto loan balance"
                        value={loanSummary?.currentBalance}
                        tone="loan"
                        isLoading={loanStatus === "loading"}
                    >
                        {loanStatus === "success" && hasLoanProgress && (
                            <div className="loan-summary-completion">
                                <div className="loan-summary-track" aria-hidden="true">
                                    <span style={{ width: `${loanSummary?.paidPercentage ?? 0}%` }} />
                                </div>
                                <span>{(loanSummary?.paidPercentage ?? 0).toFixed(1)}% paid off</span>
                            </div>
                        )}
                        {loanStatus === "success" && !hasLoanProgress && <p className="loan-summary-error">Tracked separately</p>}
                        {loanStatus === "error" && <p className="loan-summary-error">Spreadsheet unavailable</p>}
                    </Card>
                </div>
            </section>}
        </>
    )
}

export default Header
