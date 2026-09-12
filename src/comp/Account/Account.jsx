import { formatCurrency } from "../helpers.jsx"
import "./Account.css"

function Account({ name, balance, type, hideValue }) {
    return (
        <div className="account-container" role="listitem">
            <span className="account-name" title={name}>{name}</span>
            <span className={`account-amount ${type}`}>{hideValue ? "XXXXX" : formatCurrency(balance)}</span>
        </div>
    )
}

export default Account
