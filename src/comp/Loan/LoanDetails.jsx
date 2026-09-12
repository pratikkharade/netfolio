import { useState } from "react"
import { AlertCircle, CarFront } from "lucide-react"
import { formatCurrency } from "../helpers.jsx"
import Loading from "../Loading/Loading.jsx"
import "./LoanDetails.css"

function displayCurrency(value, hideValues) {
    return Number.isFinite(value) ? (hideValues ? "XXXXX" : formatCurrency(value)) : "—"
}

function displayDate(value) {
    if (!value) return "—"

    const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function LoanDetails({ loanData, status, error, hideValues }) {
    const [view, setView] = useState("overview")
    const summary = loanData?.summary
    const payments = loanData?.payments || []
    const paidPercentage = summary?.paidPercentage ?? 0
    const hasPayoffProgress = Number.isFinite(summary?.paidPercentage)

    if (status === "loading") {
        return (
            <section className="loan-details-container" aria-label="Loading auto loan details">
                <Loading variant="composition" />
            </section>
        )
    }

    if (status === "error" || !summary) {
        return (
            <section className="loan-details-container loan-details-error" role="status">
                <AlertCircle size={20} aria-hidden="true" />
                <div>
                    <h2>Auto loan data is unavailable</h2>
                    <p>{error || "Check the published spreadsheet and refresh again."}</p>
                </div>
            </section>
        )
    }

    return (
        <section className="loan-details-container" aria-labelledby="loan-details-title">
            <div className="loan-details-heading">
                <div className="loan-title-group">
                    <span className="loan-title-icon" aria-hidden="true"><CarFront size={19} /></span>
                    <div>
                        <p className="section-eyebrow">AUTO LOAN</p>
                        <h2 id="loan-details-title">{summary.loanName}</h2>
                    </div>
                </div>

                <div className="loan-view-tabs" role="tablist" aria-label="Auto loan details">
                    <button
                        id="loan-overview-tab"
                        type="button"
                        role="tab"
                        aria-selected={view === "overview"}
                        aria-controls="loan-overview-panel"
                        onClick={() => setView("overview")}
                    >
                        Overview
                    </button>
                    <button
                        id="loan-history-tab"
                        type="button"
                        role="tab"
                        aria-selected={view === "history"}
                        aria-controls="loan-history-panel"
                        onClick={() => setView("history")}
                    >
                        Payment history
                    </button>
                </div>
            </div>

            <div id="loan-overview-panel" role="tabpanel" aria-labelledby="loan-overview-tab" hidden={view !== "overview"}>
                <div className="loan-overview-grid">
                    <div className="loan-payoff-summary">
                        <span>Balance principal</span>
                        <div className="loan-balance-row">
                            <strong>{displayCurrency(summary.currentBalance, hideValues)}</strong>
                            {summary.principalPaid !== null && <span>{displayCurrency(summary.principalPaid, hideValues)} paid</span>}
                        </div>
                        <div
                            className="loan-progress-track"
                            role="progressbar"
                            aria-label="Auto loan payoff progress"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={!hideValues && hasPayoffProgress ? Math.round(paidPercentage) : undefined}
                            aria-valuetext={hideValues ? "Payoff progress hidden" : hasPayoffProgress ? undefined : "Payoff progress unavailable"}
                        >
                            <span style={{ width: `${paidPercentage}%` }} />
                        </div>
                        <div className="loan-progress-labels">
                            <span>Started at {displayCurrency(summary.originalBalance, hideValues)}</span>
                            <span>{hideValues ? "XXXXX complete" : hasPayoffProgress ? `${paidPercentage.toFixed(1)}% complete` : "Progress unavailable"}</span>
                        </div>
                    </div>

                    <div className="loan-next-payment">
                        <span>Last payment · {displayDate(summary.lastPaymentDate)}</span>
                        <strong>{displayCurrency(summary.monthlyPayment, hideValues)}</strong>
                        <p>Estimated payoff: {displayDate(summary.estimatedPayoff)}</p>
                    </div>
                </div>

                <div className="loan-facts">
                    <div><span>Interest rate</span><strong>{summary.apr !== null ? (hideValues ? "XXXXX" : `${summary.apr.toFixed(2)}% APR`) : "—"}</strong></div>
                    <div><span>Paid Off</span><strong>{displayCurrency(summary.principalPaid, hideValues)}</strong></div>
                    <div><span>Next payment</span><strong>{displayDate(summary.nextDueDate)}</strong></div>
                </div>
            </div>

            <div id="loan-history-panel" role="tabpanel" aria-labelledby="loan-history-tab" hidden={view !== "history"}>
                {payments.length ? (
                    <div className="loan-history-table-wrapper">
                        <table className="loan-history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Starting balance</th>
                                    <th>Payment</th>
                                    <th>Ending balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, index) => (
                                    <tr key={`${payment.paymentDate}-${index}`}>
                                        <td>{displayDate(payment.paymentDate)}</td>
                                        <td>{displayCurrency(payment.startingBalance, hideValues)}</td>
                                        <td>{displayCurrency(payment.payment, hideValues)}</td>
                                        <td>{displayCurrency(payment.endingBalance, hideValues)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="loan-history-empty">No payment history has been added yet.</p>}
            </div>
        </section>
    )
}

export default LoanDetails
