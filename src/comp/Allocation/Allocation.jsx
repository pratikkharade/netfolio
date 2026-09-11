import { ChartNoAxesColumnIncreasing } from "lucide-react"
import { formatCurrency } from "../helpers.jsx"
import Loading from "../Loading/Loading.jsx"
import "./Allocation.css"

const allocationGroups = [
    { key: "checking", label: "Checking", color: "#60a5fa" },
    { key: "saving", label: "Savings", color: "#a78bfa" },
    { key: "investment", label: "Investments", color: "#34d399" },
    { key: "retirement", label: "Retirement", color: "#fbbf24" },
]

function Allocation({ categories, totalAssets, isLoading }) {
    const allocation = allocationGroups.map((group) => {
        const value = categories[group.key].reduce((sum, account) => sum + account.balance, 0)
        const percentage = totalAssets > 0 ? (value / totalAssets) * 100 : 0
        return { ...group, value, percentage }
    })

    return (
        <section className="allocation-container" aria-labelledby="allocation-title">
            <div className="panel-heading">
                <div>
                    <p className="section-eyebrow">DISTRIBUTION</p>
                    <h2 id="allocation-title">Asset allocation</h2>
                </div>
                <span className="panel-icon" aria-hidden="true">
                    <ChartNoAxesColumnIncreasing size={19} />
                </span>
            </div>

            <p className="panel-description">How your assets are distributed across account types.</p>

            <div className="allocation-list">
                {isLoading ? (
                    Array.from({ length: 4 }, (_, index) => (
                        <Loading key={index} variant="allocation" />
                    ))
                ) : allocation.map((item) => (
                    <div className="allocation-item" key={item.key}>
                        <div className="allocation-row">
                            <div className="allocation-name">
                                <span className="allocation-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                                <span>{item.label}</span>
                            </div>
                            <div className="allocation-values">
                                <span>{formatCurrency(item.value)}</span>
                                <span>{item.percentage.toFixed(0)}%</span>
                            </div>
                        </div>
                        <div
                            className="allocation-track"
                            role="img"
                            aria-label={`${item.label}: ${formatCurrency(item.value)}, ${item.percentage.toFixed(0)}% of assets`}
                        >
                            <span
                                className="allocation-fill"
                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Allocation
