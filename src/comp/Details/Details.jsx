import Allocation from "../Allocation/Allocation.jsx"
import Carousel from "../Carousel/Carousel.jsx"
import "./Details.css"

const accountGroups = [
    { key: "checking", type: "asset", title: "Checking accounts" },
    { key: "saving", type: "asset", title: "Savings accounts" },
    { key: "investment", type: "asset", title: "Investment accounts" },
    { key: "retirement", type: "asset", title: "Retirement accounts" },
    { key: "rent", type: "liability", title: "Rent & utilities" },
    { key: "cc", type: "liability", title: "Credit cards" },
]

function Details({ categories, totalAssets, isLoading }) {
    return (
        <div className="dashboard-grid">
            <Allocation categories={categories} totalAssets={totalAssets} isLoading={isLoading} />

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
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Details
