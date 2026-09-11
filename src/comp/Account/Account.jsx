import { formatCurrency } from "../helpers.jsx"
import "./Account.css"

function Account({ name, balance, type }) {
    return (
        <div className="account-container" role="listitem">
            <span className="account-name" title={name}>{name}</span>
            <span className={`account-amount ${type}`}>{formatCurrency(balance)}</span>
        </div>
    )
}

export default Account
