import { WalletCards } from "lucide-react"
import Card from "../Card/Card.jsx"
import Date from "../Date/Date.jsx"
import Loading from "../Loading/Loading.jsx"
import Logout from "../Logout/Logout.jsx"
import "./Header.css"

function Header({ date, netWorth, totalAssets, totalLiabilities, isLoading, hasError, setIsAuthenticated }) {
    const grossPosition = totalAssets + totalLiabilities
    const assetShare = grossPosition > 0 ? (totalAssets / grossPosition) * 100 : 100
    const liabilityShare = grossPosition > 0 ? (totalLiabilities / grossPosition) * 100 : 0

    return (
        <header className="header-container">
            <div className="app-bar">
                <a className="brand" href="#top" aria-label="NetFolio dashboard home">
                    <span className="brand-mark" aria-hidden="true">
                        <WalletCards size={20} />
                    </span>
                    <span>NetFolio</span>
                </a>

                <div className="app-bar-actions">
                    <Date date={date} isLoading={isLoading} hasError={hasError} />
                    <Logout setIsAuthenticated={setIsAuthenticated} />
                </div>
            </div>

            {!hasError && <section id="top" className="summary-section" aria-labelledby="overview-title">
                <div className="section-heading summary-heading">
                    <div>
                        <p className="section-eyebrow">OVERVIEW</p>
                        <h1 id="overview-title">Your financial snapshot</h1>
                    </div>
                    <p>A clear view of what you own and what you owe.</p>
                </div>

                <div className="summary-grid">
                    <Card
                        title="Net worth"
                        value={netWorth}
                        tone="primary"
                        featured
                        isLoading={isLoading}
                    >
                        {isLoading ? <Loading variant="composition" /> : <div className="composition" aria-label={`${assetShare.toFixed(0)}% assets and ${liabilityShare.toFixed(0)}% liabilities`}>
                            <div className="composition-labels">
                                <span><i className="composition-dot asset-dot" />Assets</span>
                                <span><i className="composition-dot liability-dot" />Liabilities</span>
                            </div>
                            <div className="composition-track" aria-hidden="true">
                                <span className="composition-assets" style={{ width: `${assetShare}%` }} />
                                <span className="composition-liabilities" style={{ width: `${liabilityShare}%` }} />
                            </div>
                        </div>}
                    </Card>

                    <div className="summary-secondary-grid">
                        <Card title="Total assets" value={totalAssets} tone="asset" isLoading={isLoading} />
                        <Card title="Total liabilities" value={totalLiabilities} tone="liability" isLoading={isLoading} />
                    </div>
                </div>
            </section>}
        </header>
    )
}

export default Header
