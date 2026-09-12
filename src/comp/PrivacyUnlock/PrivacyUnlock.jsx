import { useEffect, useState } from "react"
import { Eye, LoaderCircle, X } from "lucide-react"
import { fetchStoredHash, generateHash } from "../helpers.jsx"
import "./PrivacyUnlock.css"

export default function PrivacyUnlock({ onCancel, onUnlock }) {
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !isSubmitting) onCancel()
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isSubmitting, onCancel])

    async function handleSubmit(event) {
        event.preventDefault()
        if (!password || isSubmitting) return

        setIsSubmitting(true)
        setError("")

        try {
            const [inputHash, storedHash] = await Promise.all([
                generateHash(password),
                fetchStoredHash(),
            ])

            if (inputHash === storedHash) {
                onUnlock()
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
        <div
            className="privacy-unlock-overlay"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSubmitting) onCancel()
            }}
        >
            <section
                className="privacy-unlock-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="privacy-unlock-title"
                aria-describedby="privacy-unlock-description"
            >
                <button
                    type="button"
                    className="privacy-unlock-close"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    aria-label="Cancel showing values"
                >
                    <X size={18} aria-hidden="true" />
                </button>

                <span className="privacy-unlock-icon" aria-hidden="true">
                    <Eye size={21} />
                </span>
                <p className="privacy-unlock-eyebrow">PRIVATE VALUES</p>
                <h2 id="privacy-unlock-title">Enter your password</h2>
                <p id="privacy-unlock-description" className="privacy-unlock-description">
                    Verify your password to show financial values again.
                </p>

                <form className="privacy-unlock-form" onSubmit={handleSubmit}>
                    <label htmlFor="privacy-password">Password</label>
                    <input
                        id="privacy-password"
                        type="password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value)
                            setError("")
                        }}
                        className={error ? "has-error" : ""}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "privacy-unlock-error" : undefined}
                        autoFocus
                    />

                    {error && <p id="privacy-unlock-error" className="privacy-unlock-error" role="alert">{error}</p>}

                    <button type="submit" className="privacy-unlock-submit" disabled={!password || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <LoaderCircle className="privacy-unlock-spinner" size={18} aria-hidden="true" />
                                Verifying…
                            </>
                        ) : (
                            "Show values"
                        )}
                    </button>
                </form>
            </section>
        </div>
    )
}
