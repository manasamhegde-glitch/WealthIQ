import { useState, useEffect } from 'react'
import { api } from '../services/api'
import styles from './Page.module.css'

export default function Portfolio() {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.getHoldings()
      .then(setHoldings)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.state}>Loading...</div>

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Portfolio Holdings</h1>
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.thead}`}>
          <span>Asset</span>
          <span>Type</span>
          <span>Value</span>
          <span>Change</span>
          <span>Allocation</span>
        </div>
        {holdings.map(h => (
          <div key={h.id} className={styles.row}>
            <span className={styles.assetName}>{h.name}</span>
            <span className={styles.badge}>{h.type}</span>
            <span>${h.value.toLocaleString()}</span>
            <span className={h.change >= 0 ? styles.up : styles.down}>
              {h.change >= 0 ? '+' : ''}{h.change}%
            </span>
            <span>{h.allocation}%</span>
          </div>
        ))}
      </div>
    </main>
  )
}
