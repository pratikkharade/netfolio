import { Database, Moon, Palette, Sun } from "lucide-react"
import Date from "../Date/Date.jsx"
import Logout from "../Logout/Logout.jsx"
import "./Profile.css"

export default function Profile({ date, isLoading, hasError, setIsAuthenticated, theme, onThemeChange }) {
    return (
        <section className="profile-view" aria-labelledby="profile-title">
            <div className="profile-heading">
                <div>
                    <p className="section-eyebrow">PROFILE</p>
                    <h1 id="profile-title">Settings</h1>
                </div>
            </div>

            <div className="profile-panel">
                <div className="profile-setting-row">
                    <span className="profile-setting-icon" aria-hidden="true"><Database size={19} /></span>
                    <div className="profile-setting-copy">
                        <strong>Portfolio data</strong>
                        <span>Your connected spreadsheet snapshot</span>
                    </div>
                    <Date date={date} isLoading={isLoading} hasError={hasError} />
                </div>

                <div className="profile-setting-row profile-theme-row">
                    <span className="profile-setting-icon" aria-hidden="true"><Palette size={19} /></span>
                    <div className="profile-setting-copy">
                        <strong>Theme</strong>
                        <span>Choose your preferred appearance</span>
                    </div>
                    <div className="theme-options" role="group" aria-label="Color theme">
                        <button
                            type="button"
                            className={theme === "dark" ? "is-active" : ""}
                            aria-pressed={theme === "dark"}
                            onClick={() => onThemeChange("dark")}
                        >
                            <Moon size={15} aria-hidden="true" />
                            Dark
                        </button>
                        <button
                            type="button"
                            className={theme === "light" ? "is-active" : ""}
                            aria-pressed={theme === "light"}
                            onClick={() => onThemeChange("light")}
                        >
                            <Sun size={15} aria-hidden="true" />
                            Light
                        </button>
                    </div>
                </div>

                <div className="profile-logout">
                    <Logout setIsAuthenticated={setIsAuthenticated} />
                </div>
            </div>
        </section>
    )
}
