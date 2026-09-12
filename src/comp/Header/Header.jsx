import { Eye, EyeOff, RefreshCw } from "lucide-react"
import "./Header.css"

function Header({ isLoading, onRefresh, hideValues, onToggleValues }) {
    return (
        <header className="app-bar">
            <div className="app-bar-inner">
                <div className="app-bar-identity">
                    <div className="brand" aria-label="NetFolio">
                        <span className="brand-mark" aria-hidden="true">
                            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
                        </span>
                        <span>NetFolio</span>
                    </div>
                </div>

                <div className="app-bar-actions">
                    <button
                        type="button"
                        className="header-icon-button refresh-button"
                        onClick={onRefresh}
                        disabled={isLoading}
                        aria-label={isLoading ? "Refreshing portfolio data" : "Refresh portfolio data"}
                        title={isLoading ? "Refreshing…" : "Refresh data"}
                    >
                        <RefreshCw className={isLoading ? "refresh-icon spinning" : "refresh-icon"} size={19} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="header-icon-button privacy-toggle"
                        role="switch"
                        aria-checked={hideValues}
                        aria-label={hideValues ? "Show financial values" : "Hide financial values"}
                        title={hideValues ? "Show values" : "Hide values"}
                        onClick={onToggleValues}
                    >
                        {hideValues ? <Eye size={19} aria-hidden="true" /> : <EyeOff size={19} aria-hidden="true" />}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
