import StatCard from '../components/StatCard'
import GoalProgress from '../components/GoalProgress'
import WealthProjectionChart from '../components/WealthProjectionChart'
import { usePortfolio, useGoals, useHoldings, useLiabilities } from '../hooks/usePortfolio'
import { fmtUsd, fmtOrig } from '../utils/currency'
import { projectWealth, getHorizon } from '../utils/projection'
import styles from './Page.module.css'

export default function Dashboard() {
  const { data, loading, error } = usePortfolio()
  const { goals }                = useGoals()
  const { holdings }             = useHoldings()
  const { liabilities }          = useLiabilities()

  if (loading) return <div className={styles.state}>Loading...</div>
  if (error)   return <div className={styles.state}>Failed to load data.</div>

  const { summary } = data

  const currentYear    = new Date().getFullYear()
  const horizonYear    = getHorizon(holdings, liabilities)
  const projData       = projectWealth(holdings, liabilities, currentYear, horizonYear)
  const retirementGoal = goals.length > 0 ? goals[0] : null

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
          label="Current Funds"
          value={`$${summary.current_funds.toLocaleString()}`}
          sub={`▲ +$${summary.monthly_gain.toLocaleString()} this month`}
          trend="up"
        />
        <StatCard
          label="Total Growth"
          value={`+${summary.total_growth_pct}%`}
          sub={`Since ${summary.growth_since}`}
          trend="up"
        />
        <StatCard
          label="Monthly Return"
          value={`+${summary.monthly_return_pct}%`}
          sub={`Avg last 6 months: ${summary.avg_return_pct}%`}
        />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Wealth Trajectory</h2>
        <WealthProjectionChart data={projData} retirementGoal={retirementGoal} />
      </section>

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
              <span className={h.change >= 0 ? styles.up : styles.down}>
                {h.change >= 0 ? '+' : ''}{h.change}%
              </span>
              <span>{h.allocation}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Goals</h2>
        {goals.map(g => (
          <GoalProgress
            key={g.id}
            name={g.name}
            currency={g.currency}
            target={g.target}
            targetUsd={g.target_usd}
            deadline={g.deadline}
          />
        ))}
      </section>
    </main>
  )
}
