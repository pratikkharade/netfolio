import "./Loading.css"

function Loading({ variant = "text" }) {
    return (
        <span className={`loading loading-${variant}`} role="status">
            <span className="sr-only">Loading</span>
        </span>
    )
}

export default Loading
