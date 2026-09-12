import Allocation from "../Allocation/Allocation.jsx"
import Carousel from "../Carousel/Carousel.jsx"
import Loading from "../Loading/Loading.jsx"
import { formatCurrency } from "../helpers.jsx"
import "./Details.css"

const accountGroups = [
    { key: "checking", type: "asset", title: "Checking accounts" },
    { key: "saving", type: "asset", title: "Savings accounts" },
    { key: "investment", type: "asset", title: "Investment accounts" },
    { key: "retirement", type: "asset", title: "Retirement accounts" },
    { key: "rent", type: "liability", title: "Rent & utilities" },
    { key: "cc", type: "liability", title: "Credit cards" },
]

function Details({ categories, netWorth, totalAssets, totalLiabilities, isLoading, hideValues }) {
    const displayValue = (value) => isLoading
        ? <Loading variant="inline" />
        : hideValues ? "XXXXX" : formatCurrency(value)

    return (
        <section className="accounts-view" aria-labelledby="accounts-view-title">
            <div className="accounts-view-heading">
                <p className="section-eyebrow">PORTFOLIO</p>
                <h1 id="accounts-view-title">Accounts</h1>
            </div>

            <div className="accounts-summary-grid" aria-label="Account totals">
                <article className="accounts-summary-item accounts-summary-net-worth">
                    <span>Net worth</span>
                    <strong>{displayValue(netWorth)}</strong>
                </article>
                <article className="accounts-summary-item accounts-summary-assets">
                    <span>Total assets</span>
                    <strong>{displayValue(totalAssets)}</strong>
                </article>
                <article className="accounts-summary-item accounts-summary-liabilities">
                    <span>Total liabilities</span>
                    <strong>{displayValue(totalLiabilities)}</strong>
                </article>
            </div>

            <div className="dashboard-grid">
                <Allocation categories={categories} totalAssets={totalAssets} isLoading={isLoading} hideValues={hideValues} />

                <section className="details-container" aria-labelledby="accounts-title">
                    <div className="details-heading">
                        <div>
                            <p className="section-eyebrow">BALANCES</p>
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
        </section>
    )
}

export default Details
