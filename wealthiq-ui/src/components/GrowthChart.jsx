import { useEffect, useRef } from 'react'
import styles from './GrowthChart.module.css'

export default function GrowthChart({ data = [] }) {
  const barsRef = useRef([])
  const max = Math.max(...data.map(d => d.value), 1)

  useEffect(() => {
    const t = setTimeout(() => {
      barsRef.current.forEach((el, i) => {
        if (el) el.style.height = Math.round((data[i].value / max) * 140) + 'px'
      })
    }, 150)
    return () => clearTimeout(t)
  }, [data, max])

  return (
    <div className={styles.wrap}>
      {data.map((d, i) => (
        <div key={d.month} className={styles.col}>
          <div
            className={`${styles.bar} ${d.highlight ? styles.highlight : ''}`}
            ref={el => (barsRef.current[i] = el)}
          />
          <span className={styles.label}>{d.month}</span>
        </div>
      ))}
    </div>
  )
}
