import { ChevronRight } from "lucide-react"

function Chevron({ isExpanded }) {
    return (
        <span
            className={`carousel-toggle-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
            aria-hidden="true"
        >
            <ChevronRight size={18} />
        </span>
    )
}

export default Chevron
