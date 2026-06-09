import StatCard from '../components/StatCard'
import GrowthChart from '../components/GrowthChart'
import GoalProgress from '../components/GoalProgress'
import { usePortfolio, useGoals } from '../hooks/usePortfolio'
import styles from './Page.module.css'

export default function Dashboard() {
  const { data, loading, error } = usePortfolio()
  const { goals } = useGoals()

  if (loading) return <div className={styles.state}>Loading...</div>
  if (error)   return <div className={styles.state}>Failed to load data.</div>

  const { summary, growth } = data

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
        <h2 className={styles.sectionTitle}>Financial Growth</h2>
        <div className={styles.chartCard}>
          <GrowthChart data={growth} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Goals</h2>
        {goals.map(g => (
          <GoalProgress
            key={g.id}
            name={g.name}
            current={g.current}
            target={g.target}
            deadline={g.deadline}
          />
        ))}
      </section>
    </main>
  )
}
