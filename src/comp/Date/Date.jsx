import { Clock3 } from "lucide-react"
import Loading from "../Loading/Loading"
import "./Date.css"

function UpdatedDate({ date, isLoading, hasError }) {
    return (
        <div className="last-updated" aria-live="polite">
            <Clock3 size={15} aria-hidden="true" />
            {isLoading ? <Loading variant="date" /> : (
                <span>{hasError ? "Update unavailable" : `Updated ${date || "recently"}`}</span>
            )}
        </div>
    )
}

export default UpdatedDate
