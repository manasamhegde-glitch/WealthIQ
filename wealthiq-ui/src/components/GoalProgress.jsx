import { useEffect, useRef } from 'react'
import styles from './GoalProgress.module.css'

export default function GoalProgress({ name, current, target, deadline }) {
  const barRef = useRef(null)
  const pct = Math.min(100, Math.round((current / target) * 100))

  useEffect(() => {
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = pct + '%'
    }, 100)
    return () => clearTimeout(t)
  }, [pct])

  const fmt = n => '$' + n.toLocaleString()

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{name}</h3>
        <span className={styles.deadline}>Target: {fmt(target)} · {deadline}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} ref={barRef} />
      </div>
      <div className={styles.stats}>
        <span>{fmt(current)} saved</span>
        <span className={styles.pct}>{pct}%</span>
        <span>{fmt(target - current)} remaining</span>
      </div>
    </div>
  )
}
