import { useState } from "react"
import { ChartNoAxesColumnIncreasing, ChartPie } from "lucide-react"
import { formatCurrency } from "../helpers.jsx"
import Loading from "../Loading/Loading.jsx"
import "./Allocation.css"

const allocationGroups = [
    { key: "checking", label: "Checking", color: "#60a5fa" },
    { key: "saving", label: "Savings", color: "#a78bfa" },
    { key: "investment", label: "Investments", color: "#34d399" },
    { key: "retirement", label: "Retirement", color: "#fbbf24" },
]

const PIE_CENTER = 120
const PIE_RADIUS = 102

function pointOnPie(angle) {
    const radians = (angle - 90) * (Math.PI / 180)
    return {
        x: PIE_CENTER + PIE_RADIUS * Math.cos(radians),
        y: PIE_CENTER + PIE_RADIUS * Math.sin(radians),
    }
}

function createPieSlicePath(startAngle, endAngle) {
    if (endAngle - startAngle >= 359.99) {
        return `M ${PIE_CENTER} ${PIE_CENTER} L ${PIE_CENTER} ${PIE_CENTER - PIE_RADIUS} A ${PIE_RADIUS} ${PIE_RADIUS} 0 0 1 ${PIE_CENTER} ${PIE_CENTER + PIE_RADIUS} A ${PIE_RADIUS} ${PIE_RADIUS} 0 0 1 ${PIE_CENTER} ${PIE_CENTER - PIE_RADIUS} Z`
    }

    const start = pointOnPie(startAngle)
    const end = pointOnPie(endAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${PIE_CENTER} ${PIE_CENTER} L ${start.x} ${start.y} A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

function getSliceOffset(angle) {
    const radians = (angle - 90) * (Math.PI / 180)
    return {
        x: Math.cos(radians) * 9,
        y: Math.sin(radians) * 9,
    }
}

function Allocation({ categories, totalAssets, isLoading, hideValues }) {
    const [view, setView] = useState("pie")
    const [hoveredSlice, setHoveredSlice] = useState(null)
    const [selectedSlice, setSelectedSlice] = useState(null)
    const allocation = allocationGroups.map((group) => {
        const value = categories[group.key].reduce((sum, account) => sum + account.balance, 0)
        const percentage = totalAssets > 0 ? (value / totalAssets) * 100 : 0
        return { ...group, value, percentage }
    })
    const chartItems = allocation.filter((item) => item.percentage > 0)
    const pieSlices = chartItems.map((item, index) => {
        const start = Math.min(
            chartItems.slice(0, index).reduce((sum, segment) => sum + segment.percentage, 0),
            100
        )
        const end = Math.min(start + item.percentage, 100)
        const startAngle = start * 3.6
        const endAngle = end * 3.6
        return {
            ...item,
            path: createPieSlicePath(startAngle, endAngle),
            offset: getSliceOffset(startAngle + ((endAngle - startAngle) / 2)),
        }
    })
    const isPieView = view === "pie"
    const nextViewLabel = isPieView ? "bar chart" : "pie chart"
    const activeSliceKey = hoveredSlice || selectedSlice
    const activeItem = allocation.find((item) => item.key === activeSliceKey)
    const displayCurrency = (value) => hideValues ? "XXXXX" : formatCurrency(value)
    const displayPercentage = (value) => hideValues ? "XXXXX" : `${value.toFixed(0)}%`
    const describeItem = (item) => hideValues
        ? `${item.label}: values hidden`
        : `${item.label}: ${formatCurrency(item.value)}, ${item.percentage.toFixed(0)}% of assets`

    const toggleSlice = (key) => {
        setSelectedSlice((selected) => selected === key ? null : key)
    }

    const handleSliceKeyDown = (event, key) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        toggleSlice(key)
    }

    return (
        <section className="allocation-container" aria-labelledby="allocation-title">
            <div className="panel-heading">
                <div>
                    <p className="section-eyebrow">DISTRIBUTION</p>
                    <h2 id="allocation-title">Asset allocation</h2>
                </div>
                <button
                    type="button"
                    className="panel-icon allocation-view-toggle"
                    onClick={() => setView(isPieView ? "bar" : "pie")}
                    aria-controls="allocation-visualization"
                    aria-label={`Show ${nextViewLabel}`}
                    title={`Show ${nextViewLabel}`}
                >
                    {isPieView
                        ? <ChartNoAxesColumnIncreasing size={19} aria-hidden="true" />
                        : <ChartPie size={19} aria-hidden="true" />}
                </button>
            </div>

            <p className="panel-description"></p>

            <div id="allocation-visualization" className={`allocation-view allocation-view-${view}`}>
                {isPieView ? (
                    isLoading ? <Loading variant="allocation-pie" /> : (
                        <>
                            <div className="allocation-pie-stage">
                                <div className="allocation-pie-stack">
                                    <svg className="allocation-pie-svg allocation-pie-depth" viewBox="0 0 240 240" aria-hidden="true">
                                        {pieSlices.map((item) => (
                                            <path key={item.key} d={item.path} fill={item.color} />
                                        ))}
                                    </svg>
                                    <svg
                                        className="allocation-pie-svg allocation-pie-face"
                                        viewBox="0 0 240 240"
                                        role="img"
                                        aria-label={hideValues ? "Asset allocation values hidden" : allocation.map((item) => (
                                            `${item.label}: ${item.percentage.toFixed(0)}%`
                                        )).join(", ")}
                                    >
                                        {pieSlices.map((item) => {
                                            const isActive = activeSliceKey === item.key
                                            const transform = isActive
                                                ? `translate(${item.offset.x}px, ${item.offset.y}px)`
                                                : "translate(0, 0)"

                                            return (
                                                <path
                                                    key={item.key}
                                                    className={`allocation-pie-slice${isActive ? " is-active" : ""}`}
                                                    d={item.path}
                                                    fill={item.color}
                                                    style={{ transform }}
                                                    role="button"
                                                    tabIndex="0"
                                                    aria-label={describeItem(item)}
                                                    aria-pressed={selectedSlice === item.key}
                                                    onMouseEnter={() => setHoveredSlice(item.key)}
                                                    onMouseLeave={() => setHoveredSlice(null)}
                                                    onFocus={() => setHoveredSlice(item.key)}
                                                    onBlur={() => setHoveredSlice(null)}
                                                    onClick={() => toggleSlice(item.key)}
                                                    onKeyDown={(event) => handleSliceKeyDown(event, item.key)}
                                                >
                                                    <title>{hideValues ? `${item.label}: values hidden` : `${item.label}: ${formatCurrency(item.value)} (${item.percentage.toFixed(0)}%)`}</title>
                                                </path>
                                            )
                                        })}
                                    </svg>
                                </div>
                                <div className={`allocation-pie-tooltip${activeItem ? " is-visible" : ""}`} aria-live="polite">
                                    {activeItem ? (
                                        <>
                                            <strong>{activeItem.label}</strong>
                                            <span>{hideValues ? "XXXXX" : `${formatCurrency(activeItem.value)} · ${activeItem.percentage.toFixed(0)}%`}</span>
                                        </>
                                    ) : <span>Hover or tap a slice</span>}
                                </div>
                            </div>
                            <div className="allocation-legend">
                                {allocation.map((item) => (
                                    <button
                                        type="button"
                                        className={`allocation-legend-item${activeSliceKey === item.key ? " is-active" : ""}`}
                                        key={item.key}
                                        disabled={item.percentage <= 0}
                                        aria-pressed={selectedSlice === item.key}
                                        onMouseEnter={() => setHoveredSlice(item.key)}
                                        onMouseLeave={() => setHoveredSlice(null)}
                                        onFocus={() => setHoveredSlice(item.key)}
                                        onBlur={() => setHoveredSlice(null)}
                                        onClick={() => toggleSlice(item.key)}
                                    >
                                        <div className="allocation-name">
                                            <span className="allocation-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                                            <span>{item.label}</span>
                                        </div>
                                        <div className="allocation-values">
                                            <span>{displayCurrency(item.value)}</span>
                                            <span>{displayPercentage(item.percentage)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    <div className="allocation-list">
                        {isLoading ? (
                            Array.from({ length: 4 }, (_, index) => (
                                <Loading key={index} variant="allocation" />
                            ))
                        ) : allocation.map((item) => (
                            <div className="allocation-item" key={item.key}>
                                <div className="allocation-row">
                                    <div className="allocation-name">
                                        <span className="allocation-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                                        <span>{item.label}</span>
                                    </div>
                                    <div className="allocation-values">
                                        <span>{displayCurrency(item.value)}</span>
                                        <span>{displayPercentage(item.percentage)}</span>
                                    </div>
                                </div>
                                <div
                                    className="allocation-track"
                                    role="img"
                                    aria-label={describeItem(item)}
                                >
                                    <span
                                        className="allocation-fill"
                                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Allocation
