import styles from './StatCard.module.css'

export default function StatCard({ label, value, sub, trend }) {
  const trendClass = trend === 'up' ? styles.up : trend === 'down' ? styles.down : ''
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {sub && <p className={`${styles.sub} ${trendClass}`}>{sub}</p>}
    </div>
  )
}
