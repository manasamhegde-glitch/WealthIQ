import StatCard from '../components/StatCard'
import WealthProjectionChart from '../components/WealthProjectionChart'
import { usePortfolio, useGoals, useHoldings, useLiabilities } from '../hooks/usePortfolio'
import { fmtUsd, fmtOrig } from '../utils/currency'
import { projectWealth, getHorizon, parseYear } from '../utils/projection'
import { holdingXIRR } from '../utils/xirr'
import styles from './Page.module.css'

export default function Dashboard() {
  const { data, loading, error } = usePortfolio()
  const { goals }                = useGoals()
  const { holdings }             = useHoldings()
  const { liabilities }          = useLiabilities()

  if (loading) return <div className={styles.state}>Loading...</div>
  if (error)   return <div className={styles.state}>Failed to load data.</div>

  const { summary } = data

  // Dynamic financials — computed from live holdings / liabilities
  const totalAssets    = holdings.reduce((s, h) => s + h.value_usd, 0)
  const totalLiab      = liabilities.reduce((s, l) => s + l.balance_usd, 0)
  const netWorth       = totalAssets - totalLiab
  const weightedReturn = holdings.length > 0
    ? holdings.reduce((s, h) => s + h.change * h.allocation / 100, 0)
    : 0

  const retirementGoal = goals.length > 0 ? goals[0] : null
  const currentYear    = new Date().getFullYear()
  const retireYear     = retirementGoal ? (parseYear(retirementGoal.deadline) ?? currentYear + 30) : currentYear + 30
  const horizonYear    = Math.max(getHorizon(holdings, liabilities), retireYear + 2)
  const projData       = projectWealth(holdings, liabilities, currentYear, horizonYear)

  // Retirement summary stats
  let retireStats = null
  if (retirementGoal) {
    const projPt    = projData.find(d => d.year === retireYear)
    const projected = Math.max(0, projPt?.netWorth ?? 0)
    const required  = retirementGoal.target_usd
    const gap       = Math.max(0, required - projected)
    const pct       = required > 0 ? Math.min(100, projected / required * 100) : 0
    retireStats     = { projected, required, gap, pct }
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.avatar}>{summary.initials}</div>
        <div>
          <h1 className={styles.name}>{summary.user_name}</h1>
          <p className={styles.sub}>Personal Finance Dashboard</p>
        </div>
      </header>

      <div className={styles.cards}>
        <StatCard
          label="Total Assets"
          value={fmtUsd(totalAssets)}
          sub={`${holdings.length} holding${holdings.length !== 1 ? 's' : ''}`}
          trend="up"
        />
        <StatCard
          label="Net Worth"
          value={(netWorth < 0 ? '−' : '') + fmtUsd(Math.abs(netWorth))}
          sub={`Liabilities: ${fmtUsd(totalLiab)}`}
          trend={netWorth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Avg Annual Return"
          value={`${weightedReturn >= 0 ? '+' : ''}${weightedReturn.toFixed(1)}%`}
          sub="weighted across portfolio"
          trend={weightedReturn >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* ── Retirement Goal Summary ── */}
      {retireStats && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Retirement Goal</h2>
          <div className={styles.retireCard}>
            <div className={styles.retireCardTop}>
              <span className={styles.retireCardName}>Retirement Fund</span>
              <span className={styles.retirementPill}>{retirementGoal.deadline}</span>
            </div>
            <div className={styles.retireStats}>
              <div className={styles.retireStat}>
                <span className={styles.retireStatLabel}>Corpus Required</span>
                <span className={`${styles.retireStatValue} ${styles.down}`}>
                  {fmtUsd(retireStats.required)}
                </span>
                {retirementGoal.currency !== 'USD' && (
                  <span className={styles.retireStatSub}>
                    {fmtOrig(retirementGoal.target, retirementGoal.currency)}
                  </span>
                )}
              </div>
              <div className={styles.retireDivider} />
              <div className={styles.retireStat}>
                <span className={styles.retireStatLabel}>Projected at {retireYear}</span>
                <span className={`${styles.retireStatValue} ${retireStats.projected >= retireStats.required ? styles.up : ''}`}>
                  {fmtUsd(retireStats.projected)}
                </span>
                <span className={styles.retireStatSub}>on current trajectory</span>
              </div>
              <div className={styles.retireDivider} />
              <div className={styles.retireStat}>
                <span className={styles.retireStatLabel}>Gap to Bridge</span>
                <span className={`${styles.retireStatValue} ${retireStats.gap === 0 ? styles.up : styles.down}`}>
                  {retireStats.gap === 0 ? 'On Track' : fmtUsd(retireStats.gap)}
                </span>
                <span className={styles.retireStatSub}>{retireStats.pct.toFixed(1)}% funded</span>
              </div>
            </div>
            <div className={styles.retireProgress}>
              <div className={styles.retireProgressFill} style={{ width: `${retireStats.pct}%` }} />
            </div>
          </div>
        </section>
      )}

      {/* ── Wealth Trajectory ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Wealth Trajectory</h2>
        <WealthProjectionChart data={projData} retirementGoal={retirementGoal} />
      </section>

      {/* ── Assets ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Assets</h2>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.thead}`}>
            <span>Asset</span>
            <span>Type</span>
            <span>Value (USD)</span>
            <span>Change</span>
            <span>Allocation</span>
          </div>
          {holdings.map(h => (
            <div key={h.id} className={styles.row}>
              <span>
                <span className={styles.assetName}>{h.name}</span>
                {(h.start_date || h.maturity_date) && (
                  <span className={styles.dateLine}>
                    {h.start_date}{h.start_date && h.maturity_date && ' → '}{h.maturity_date}
                  </span>
                )}
                {h.contribution > 0 && h.contribution_freq !== 'None' && (
                  <span className={styles.contribLine}>
                    {fmtOrig(h.contribution, h.currency)}/{h.contribution_freq === 'Monthly' ? 'mo' : 'yr'}
                  </span>
                )}
              </span>
              <span><span className={styles.badge}>{h.type}</span></span>
              <span>
                {fmtUsd(h.value_usd)}
                {h.currency !== 'USD' && (
                  <span className={styles.origAmount}>{fmtOrig(h.value, h.currency)}</span>
                )}
              </span>
              <span>
                <span className={h.change >= 0 ? styles.up : styles.down}>
                  {h.change >= 0 ? '+' : ''}{h.change}%
                </span>
                {(() => { const x = holdingXIRR(h); return x !== null ? (
                  <span className={styles.xirrLine}>XIRR {(x * 100) >= 0 ? '+' : ''}{(x * 100).toFixed(1)}%</span>
                ) : null })()}
              </span>
              <span>{h.allocation}%</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
