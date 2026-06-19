import { fmtUsd, fmtOrig } from '../utils/currency'
import styles from './GoalProgress.module.css'

export default function GoalProgress({ name, currency = 'USD', target, targetUsd, deadline }) {
  const usd = targetUsd ?? target
  const showOrig = currency && currency !== 'USD'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{name}</h3>
        {deadline && <span className={styles.deadline}>{deadline}</span>}
      </div>
      <div className={styles.targetRow}>
        <span className={styles.targetLabel}>Target</span>
        <div>
          <span className={styles.targetAmount}>{fmtUsd(usd)}</span>
          {showOrig && (
            <span className={styles.targetOrig}>{fmtOrig(target, currency)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
