import Card from "../Card/Card.jsx"
import Loading from "../Loading/Loading.jsx"
import "./Overview.css"

export default function Overview({ netWorth, totalAssets, totalLiabilities, isLoading, loanSummary, loanStatus, hideValues }) {
    const grossPosition = totalAssets + totalLiabilities
    const assetShare = grossPosition > 0 ? (totalAssets / grossPosition) * 100 : 100
    const liabilityShare = grossPosition > 0 ? (totalLiabilities / grossPosition) * 100 : 0
    const hasLoanProgress = Number.isFinite(loanSummary?.paidPercentage)

    return (
        <section className="overview-view" aria-labelledby="overview-title">
            <div className="overview-heading">
                <p className="section-eyebrow">OVERVIEW</p>
                <h1 id="overview-title">Pratik's Finances</h1>
            </div>

            <div className="summary-grid">
                <Card
                    title="Net worth"
                    value={netWorth}
                    tone="primary"
                    featured
                    isLoading={isLoading}
                    hideValue={hideValues}
                >
                    {isLoading ? <Loading variant="composition" /> : (
                        <div
                            className="composition"
                            aria-label={hideValues ? "Asset and liability values hidden" : `${assetShare.toFixed(0)}% assets and ${liabilityShare.toFixed(0)}% liabilities`}
                        >
                            <div className="composition-labels">
                                <span><i className="composition-dot asset-dot" />Assets</span>
                                <span><i className="composition-dot liability-dot" />Liabilities</span>
                            </div>
                            <div className="composition-track" aria-hidden="true">
                                <span className="composition-assets" style={{ width: `${assetShare}%` }} />
                                <span className="composition-liabilities" style={{ width: `${liabilityShare}%` }} />
                            </div>
                        </div>
                    )}
                </Card>

                <div className="summary-secondary-grid">
                    <Card title="Total assets" value={totalAssets} tone="asset" isLoading={isLoading} hideValue={hideValues} />
                    <Card title="Total liabilities" value={totalLiabilities} tone="liability" isLoading={isLoading} hideValue={hideValues} />
                </div>

                <Card
                    title="Auto loan balance"
                    value={loanSummary?.currentBalance}
                    tone="loan"
                    isLoading={loanStatus === "loading"}
                    hideValue={hideValues}
                >
                    {loanStatus === "success" && hasLoanProgress && (
                        <div className="loan-summary-completion">
                            <div className="loan-summary-track" aria-hidden="true">
                                <span style={{ width: `${loanSummary?.paidPercentage ?? 0}%` }} />
                            </div>
                            <span>{hideValues ? "XXXXX paid off" : `${(loanSummary?.paidPercentage ?? 0).toFixed(1)}% paid off`}</span>
                        </div>
                    )}
                    {loanStatus === "success" && !hasLoanProgress && <p className="loan-summary-error">Tracked separately</p>}
                    {loanStatus === "error" && <p className="loan-summary-error">Spreadsheet unavailable</p>}
                </Card>
            </div>
        </section>
    )
}
