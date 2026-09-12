import { CarFront, House, UserRound, WalletCards } from "lucide-react"
import "./BottomNav.css"

const navigationItems = [
    { id: "home", label: "Home", Icon: House },
    { id: "accounts", label: "Accounts", Icon: WalletCards },
    { id: "loan", label: "Auto Loan", Icon: CarFront },
    { id: "profile", label: "Profile", Icon: UserRound },
]

export default function BottomNav({ activeView, onNavigate }) {
    return (
        <footer className="bottom-nav-shell">
            <nav className="bottom-nav" aria-label="Primary navigation">
                {navigationItems.map((item) => {
                    const NavIcon = item.Icon

                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={activeView === item.id ? "is-active" : ""}
                            aria-current={activeView === item.id ? "page" : undefined}
                            onClick={() => onNavigate(item.id)}
                        >
                            <NavIcon size={20} strokeWidth={activeView === item.id ? 2.3 : 1.8} aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </footer>
    )
}
