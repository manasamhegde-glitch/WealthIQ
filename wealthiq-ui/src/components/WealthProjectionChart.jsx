import { niceTicks } from '../utils/projection'
import styles from './WealthProjectionChart.module.css'

const LINES = [
  { key: 'assets',      label: 'Assets',      color: 'var(--green)' },
  { key: 'liabilities', label: 'Liabilities', color: 'var(--red)' },
  { key: 'netWorth',    label: 'Net Worth',   color: 'var(--accent-light)' },
]

function fmtAxis(v) {
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${abs}`
}

export default function WealthProjectionChart({ data }) {
  if (!data || data.length < 2) return null

  const W = 820, H = 320
  const pad = { top: 20, right: 20, bottom: 44, left: 72 }
  const iW = W - pad.left - pad.right
  const iH = H - pad.top - pad.bottom

  const allVals = data.flatMap(d => [d.assets, d.liabilities, d.netWorth])
  const ticks = niceTicks(Math.min(...allVals), Math.max(...allVals))
  const minY = ticks[0]
  const maxY = ticks[ticks.length - 1]
  const yRange = maxY - minY || 1

  const xS = i => pad.left + (i / (data.length - 1)) * iW
  const yS = v => pad.top + iH - ((v - minY) / yRange) * iH

  const linePath = key =>
    data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(d[key]).toFixed(1)}`)
      .join(' ')

  // ~6 x-axis labels spaced evenly
  const n = data.length
  const xStep = Math.max(1, Math.round(n / 6))
  const xIndices = [...new Set([
    ...Array.from({ length: Math.floor(n / xStep) + 1 }, (_, k) => k * xStep),
    n - 1,
  ])].filter(i => i < n)

  const zeroY = yS(0)
  const showZero = minY < 0 && maxY > 0

  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        {LINES.map(l => (
          <span key={l.key} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} aria-label="Wealth trajectory projection">

        {/* Y axis grid lines + labels */}
        {ticks.map(v => (
          <g key={v}>
            <line
              x1={pad.left} y1={yS(v)} x2={W - pad.right} y2={yS(v)}
              stroke="var(--border)" strokeDasharray="4 4"
            />
            <text
              x={pad.left - 8} y={yS(v)}
              textAnchor="end" dominantBaseline="middle"
              className={styles.tick}
            >
              {fmtAxis(v)}
            </text>
          </g>
        ))}

        {/* Zero line (when chart spans negative values) */}
        {showZero && (
          <line
            x1={pad.left} y1={zeroY} x2={W - pad.right} y2={zeroY}
            stroke="var(--text-muted)" strokeWidth="1"
          />
        )}

        {/* Left axis border */}
        <line
          x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom}
          stroke="var(--border)"
        />

        {/* X axis labels */}
        {xIndices.map(i => (
          <text
            key={data[i].year}
            x={xS(i)} y={H - pad.bottom + 16}
            textAnchor="middle"
            className={styles.tick}
          >
            {data[i].year}
          </text>
        ))}

        {/* Data lines — liabilities first so net worth draws on top */}
        {LINES.slice().reverse().map(l => (
          <path
            key={l.key}
            d={linePath(l.key)}
            fill="none"
            style={{ stroke: l.color }}
            strokeWidth={l.key === 'netWorth' ? 2.8 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  )
}
