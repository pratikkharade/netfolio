import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import "./ScrollToTop.css"

const SHOW_AFTER = 320

function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(() => window.scrollY > SHOW_AFTER)

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > SHOW_AFTER)

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
    }

    return (
        <button
            type="button"
            className={`scroll-to-top ${isVisible ? "is-visible" : ""}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            tabIndex={isVisible ? 0 : -1}
        >
            <ArrowUp size={20} aria-hidden="true" />
        </button>
    )
}

export default ScrollToTop
