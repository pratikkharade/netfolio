import { useState } from "react"
import { CarFront, Landmark } from "lucide-react"
import Allocation from "../Allocation/Allocation.jsx"
import Carousel from "../Carousel/Carousel.jsx"
import LoanDetails from "../Loan/LoanDetails.jsx"
import "./Details.css"

const accountGroups = [
    { key: "checking", type: "asset", title: "Checking accounts" },
    { key: "saving", type: "asset", title: "Savings accounts" },
    { key: "investment", type: "asset", title: "Investment accounts" },
    { key: "retirement", type: "asset", title: "Retirement accounts" },
    { key: "rent", type: "liability", title: "Rent & utilities" },
    { key: "cc", type: "liability", title: "Credit cards" },
]

function Details({ categories, totalAssets, isLoading, loanData, loanStatus, loanError, hideValues }) {
    const [view, setView] = useState("accounts")

    return (
        <>
            <div className="detail-mode-switch" role="tablist" aria-label="Dashboard details">
                <button
                    id="account-details-tab"
                    type="button"
                    role="tab"
                    aria-selected={view === "accounts"}
                    aria-controls="account-details-panel"
                    onClick={() => setView("accounts")}
                >
                    <Landmark size={16} aria-hidden="true" />
                    Accounts
                </button>
                <button
                    id="auto-loan-details-tab"
                    type="button"
                    role="tab"
                    aria-selected={view === "loan"}
                    aria-controls="auto-loan-details-panel"
                    onClick={() => setView("loan")}
                >
                    <CarFront size={16} aria-hidden="true" />
                    Auto loan
                </button>
            </div>

            <div id="account-details-panel" role="tabpanel" aria-labelledby="account-details-tab" hidden={view !== "accounts"}>
                <div className="dashboard-grid">
                    <Allocation categories={categories} totalAssets={totalAssets} isLoading={isLoading} hideValues={hideValues} />

                    <section className="details-container" aria-labelledby="accounts-title">
                        <div className="details-heading">
                            <div>
                                <p className="section-eyebrow">ACCOUNTS</p>
                                <h2 id="accounts-title">Account details</h2>
                            </div>
                        </div>

                        <div className="carousel-wrapper">
                            {accountGroups.map((group) => (
                                <Carousel
                                    key={group.key}
                                    type={group.type}
                                    title={group.title}
                                    data={categories[group.key]}
                                    isLoading={isLoading}
                                    hideValues={hideValues}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <div id="auto-loan-details-panel" role="tabpanel" aria-labelledby="auto-loan-details-tab" hidden={view !== "loan"}>
                <LoanDetails
                    loanData={loanData}
                    status={loanStatus}
                    error={loanError}
                    hideValues={hideValues}
                />
            </div>
        </>
    )
}

export default Details
