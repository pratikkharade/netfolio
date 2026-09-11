import { ArrowDownRight, ArrowUpRight, Landmark } from "lucide-react"
import Loading from "../Loading/Loading"
import { formatCurrency } from "../helpers"
import "./Card.css"

const toneIcons = {
    primary: Landmark,
    asset: ArrowUpRight,
    liability: ArrowDownRight,
}

function Card({ title, value, tone = "primary", featured = false, isLoading = false, children }) {
    const Icon = toneIcons[tone]

    return (
        <article className={`card-wrapper card-${tone} ${featured ? "card-featured" : ""}`}>
            <div className="card-topline">
                <p className="card-label">{title}</p>
                <span className="card-icon" aria-hidden="true"><Icon size={18} /></span>
            </div>
            <div className="card-value">
                {isLoading ? <Loading variant="value" /> : formatCurrency(value)}
            </div>
            {children}
        </article>
    )
}

export default Card
