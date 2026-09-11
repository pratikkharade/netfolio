import { useId, useMemo, useState } from "react"
import Account from "../Account/Account.jsx"
import Loading from "../Loading/Loading.jsx"
import Chevron from "./Chevron.jsx"
import { formatCurrency } from "../helpers.jsx"
import "./Carousel.css"

function Carousel({ type, title, data, isLoading }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const contentId = useId()
    const total = data.reduce((sum, item) => sum + item.balance, 0)
    const sortedData = useMemo(() => [...data].sort((a, b) => b.balance - a.balance), [data])

    return (
        <div className="carousel-container">
            <button
                type="button"
                className="carousel-header"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-expanded={isExpanded}
                aria-controls={contentId}
            >
                <div className="carousel-title">
                    <div className="carousel-title-line">
                        <span>{title}</span>
                        {!isLoading && <span className="account-count">{data.length}</span>}
                    </div>
                    <span className={`carousel-total ${type}`}>
                        {isLoading ? <Loading variant="inline" /> : formatCurrency(total)}
                    </span>
                </div>
                <Chevron isExpanded={isExpanded} />
            </button>

            <div
                id={contentId}
                className={`carousel-collapse ${isExpanded ? "expanded" : "collapsed"}`}
                aria-hidden={!isExpanded}
            >
                <div className="carousel-content" role="list">
                    {sortedData.length > 0 ? sortedData.map((account) => (
                        <Account
                            key={`${account.name}-${account.type}`}
                            name={account.name}
                            balance={account.balance}
                            type={account.type}
                        />
                    )) : (
                        <p className="accounts-empty">No accounts in this category.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Carousel
