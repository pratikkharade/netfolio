import { AlertCircle, Landmark, PiggyBank, ShieldCheck, Target, TrendingUp } from "lucide-react"
import { formatCurrency } from "../helpers.jsx"
import Loading from "../Loading/Loading.jsx"
import { resolveGoals } from "./goalsData.js"
import "./Goals.css"

const GOAL_TONES = ["asset", "accent", "violet", "warning"]

function GoalIcon({ goal }) {
    if (goal.sourceType === "metric") return <Landmark size={19} />
    if (goal.sourceType === "account") return <TrendingUp size={19} />
    if (goal.source.toLowerCase() === "retirement") return <PiggyBank size={19} />
    return <ShieldCheck size={19} />
}

function displayDate(value) {
    if (!value) return "No deadline"

    const slashDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value)
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    const date = slashDate
        ? new Date(Number(slashDate[3]), Number(slashDate[1]) - 1, Number(slashDate[2]))
        : isoDate
            ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
            : new Date(value)

    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function GoalCard({ goal, index, hideValues }) {
    const hasCurrentAmount = Number.isFinite(goal.current)
    const progress = hasCurrentAmount ? Math.min(Math.max((goal.current / goal.target) * 100, 0), 100) : 0
    const remaining = hasCurrentAmount ? Math.max(goal.target - goal.current, 0) : null
    const displayAmount = (value) => hideValues
        ? "XXXXX"
        : Number.isFinite(value) ? formatCurrency(value) : "Unavailable"
    const tone = GOAL_TONES[index % GOAL_TONES.length]

    return (
        <article className={`goal-card goal-${tone}`} role="listitem">
            <div className="goal-card-heading">
                <span className="goal-icon" aria-hidden="true"><GoalIcon goal={goal} /></span>
                <div className="goal-title-group">
                    <h2>{goal.name}</h2>
                    <p>{goal.description}</p>
                </div>
                <span className="goal-status">{goal.status}</span>
            </div>

            <div className="goal-amount-row">
                <strong>{displayAmount(goal.current)}</strong>
                <span>of {displayAmount(goal.target)}</span>
            </div>

            <div
                className="goal-progress-track"
                role="progressbar"
                aria-label={`${goal.name} progress`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={!hideValues && hasCurrentAmount ? Math.round(progress) : undefined}
                aria-valuetext={hideValues ? "Goal progress hidden" : hasCurrentAmount ? `${progress.toFixed(1)}% complete` : "Current amount unavailable"}
            >
                <span style={{ width: hideValues || !hasCurrentAmount ? "0%" : `${progress}%` }} />
            </div>

            <div className="goal-progress-meta">
                <span>{hideValues ? "XXXXX complete" : hasCurrentAmount ? `${progress.toFixed(1)}% complete` : "Source not found"}</span>
                <span>{displayAmount(remaining)} remaining</span>
            </div>

            <div className="goal-deadline">
                <Target size={15} aria-hidden="true" />
                <span>Target</span>
                <strong>{displayDate(goal.deadline)}</strong>
            </div>
        </article>
    )
}

export default function Goals({ definitions, accounts, metrics, status, error, hideValues }) {
    const goals = resolveGoals(definitions, accounts, metrics)

    return (
        <section className="goals-view" aria-labelledby="goals-view-title">
            <div className="goals-heading">
                <div>
                    <p className="section-eyebrow">PLANNING</p>
                    <h1 id="goals-view-title">Financial Goals</h1>
                </div>
                <span className="goals-source-badge">Active Goals: <strong>{goals.length}</strong></span>
            </div>

            {status === "loading" ? (
                <div className="goals-state" aria-label="Loading financial goals">
                    <Loading variant="composition" />
                </div>
            ) : status === "error" ? (
                <div className="goals-state goals-state-error" role="status">
                    <AlertCircle size={20} aria-hidden="true" />
                    <div>
                        <h2>Financial goals are unavailable</h2>
                        <p>{error}</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* <div className="goals-summary">
                        <div>
                            <span>Active goals</span>
                            <strong>{goals.length}</strong>
                        </div>
                        <p>Current amounts are calculated from your latest portfolio balances.</p>
                    </div> */}

                    <div className="goals-grid" role="list" aria-label="Financial goals">
                        {goals.map((goal, index) => (
                            <GoalCard key={goal.id} goal={goal} index={index} hideValues={hideValues} />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}
