import { ArrowDownRight, ArrowUpRight, CarFront, Landmark } from "lucide-react"
import Loading from "../Loading/Loading"
import { formatCurrency } from "../helpers"
import "./Card.css"

const toneIcons = {
    primary: Landmark,
    asset: ArrowUpRight,
    liability: ArrowDownRight,
    loan: CarFront,
}

function Card({ title, value, tone = "primary", featured = false, isLoading = false, hideValue = false, href, children }) {
    const Icon = toneIcons[tone]
    const Component = href ? "a" : "article"

    return (
        <Component
            className={`card-wrapper card-${tone} ${featured ? "card-featured" : ""} ${href ? "card-link" : ""}`}
            {...(href ? { href, "aria-label": `View ${title}` } : {})}
        >
            <div className="card-topline">
                <p className="card-label">{title}</p>
                <span className="card-icon" aria-hidden="true"><Icon size={18} /></span>
            </div>
            <div className="card-value">
                {isLoading
                    ? <Loading variant="value" />
                    : Number.isFinite(value) ? (hideValue ? "XXXXX" : formatCurrency(value)) : "Unavailable"}
            </div>
            {children}
        </Component>
    )
}

export default Card
