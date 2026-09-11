import { LogOut } from "lucide-react"
import "./Logout.css"

export default function Logout({ setIsAuthenticated }) {
    const handleLogout = () => {
        localStorage.setItem("auth", "false")
        setIsAuthenticated(false)
    }

    return (
        <button type="button" className="logout-button" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />
            <span>Log out</span>
        </button>
    )
}
