import GoalProgress from '../components/GoalProgress'
import { useGoals } from '../hooks/usePortfolio'
import styles from './Page.module.css'

export default function Goals() {
  const { goals, loading } = useGoals()

  if (loading) return <div className={styles.state}>Loading...</div>

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Financial Goals</h1>
      {goals.map(g => (
        <GoalProgress
          key={g.id}
          name={g.name}
          current={g.current}
          target={g.target}
          deadline={g.deadline}
        />
      ))}
    </main>
  )
}
