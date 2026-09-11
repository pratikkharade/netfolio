import { useState } from "react"
import { Database, LoaderCircle, LockKeyhole } from "lucide-react"
import { generateHash, fetchStoredHash } from "../helpers.jsx"
import "./Login.css"

function Login({ setIsAuthenticated }) {
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    async function handleLogin(event) {
        event.preventDefault()
        if (!password || isSubmitting) return

        setIsSubmitting(true)
        setError("")

        try {
            const inputHash = await generateHash(password)
            const storedHash = await fetchStoredHash()

            if (inputHash === storedHash) {
                localStorage.setItem("auth", "true")
                setIsAuthenticated(true)
                return
            }

            setError("That password doesn’t match. Please try again.")
        } catch {
            setError("We couldn’t verify your password. Check your connection and try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="login-page-wrapper">
            <div className="login-backdrop login-backdrop-one" aria-hidden="true" />
            <div className="login-backdrop login-backdrop-two" aria-hidden="true" />

            <section className="login-card" aria-labelledby="login-title">
                <div className="login-brand-mark" aria-hidden="true">
                    <LockKeyhole size={26} strokeWidth={2} />
                </div>

                <p className="login-eyebrow">NETFOLIO</p>
                <h1 id="login-title" className="login-title">Welcome back</h1>
                <p className="login-description">
                    Enter your password to view your financial overview.
                </p>

                <form className="login-form" onSubmit={handleLogin}>
                    <label htmlFor="password" className="login-label">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value)
                            setError("")
                        }}
                        className={`login-card-input ${error ? "has-error" : ""}`}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "login-error" : undefined}
                        autoComplete="current-password"
                        autoFocus
                    />

                    {error && <p id="login-error" className="login-error" role="alert">{error}</p>}

                    <button
                        type="submit"
                        className="login-card-button"
                        disabled={!password || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <LoaderCircle className="button-spinner" size={18} aria-hidden="true" />
                                Verifying…
                            </>
                        ) : (
                            "Open dashboard"
                        )}
                    </button>
                </form>

                <p className="login-footnote">
                    <Database size={15} aria-hidden="true" />
                    Account data loads after the dashboard is unlocked.
                </p>
            </section>
        </main>
    )
}

export default Login
