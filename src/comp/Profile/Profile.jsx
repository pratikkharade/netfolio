import { Database, MoonStar } from "lucide-react"
import Date from "../Date/Date.jsx"
import Logout from "../Logout/Logout.jsx"
import "./Profile.css"

export default function Profile({ date, isLoading, hasError, setIsAuthenticated }) {
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

                <button type="button" className="profile-setting-row profile-theme-row" disabled>
                    <span className="profile-setting-icon" aria-hidden="true"><MoonStar size={19} /></span>
                    <span className="profile-setting-copy">
                        <strong>Theme</strong>
                        <span>Choose your preferred appearance</span>
                    </span>
                    <span className="profile-coming-soon">Coming soon</span>
                </button>

                <div className="profile-logout">
                    <Logout setIsAuthenticated={setIsAuthenticated} />
                </div>
            </div>
        </section>
    )
}
