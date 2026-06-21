import { useState } from 'react'
import { niceTicks } from '../utils/projection'
import { fmtUsd } from '../utils/currency'
import styles from './WealthProjectionChart.module.css'

const NET_WORTH_COLOR = 'var(--accent-light)'

function fmtAxis(v) {
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${abs}`
}

export default function WealthProjectionChart({ data, retirementGoal }) {
  const [hover, setHover] = useState(null)

  if (!data || data.length < 2) return null

  const W = 820, H = 320
  const pad = { top: 20, right: 20, bottom: 44, left: 72 }
  const iW = W - pad.left - pad.right
  const iH = H - pad.top - pad.bottom

  const allVals = data.map(d => d.netWorth)
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

  const n = data.length
  const xStep = Math.max(1, Math.round(n / 6))
  const xIndices = [...new Set([
    ...Array.from({ length: Math.floor(n / xStep) + 1 }, (_, k) => k * xStep),
    n - 1,
  ])].filter(i => i < n)

  const zeroY = yS(0)
  const showZero = minY < 0 && maxY > 0

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const mouseX = relX * W
    const raw = (mouseX - pad.left) / iW * (data.length - 1)
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(raw)))
    setHover({ idx, pct: xS(idx) / W })
  }

  // Flip tooltip left when near the right edge
  const tipOnLeft = hover && hover.pct > 0.6

  return (
    <div className={styles.wrap}>
      <div className={styles.chartArea}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          aria-label="Wealth trajectory projection"
          onMouseLeave={() => setHover(null)}
        >
          {/* Y grid + labels */}
          {ticks.map(v => (
            <g key={v}>
              <line x1={pad.left} y1={yS(v)} x2={W - pad.right} y2={yS(v)}
                stroke="var(--border)" strokeDasharray="4 4" />
              <text x={pad.left - 8} y={yS(v)} textAnchor="end" dominantBaseline="middle"
                className={styles.tick}>{fmtAxis(v)}</text>
            </g>
          ))}

          {showZero && (
            <line x1={pad.left} y1={zeroY} x2={W - pad.right} y2={zeroY}
              stroke="var(--text-muted)" strokeWidth="1" />
          )}

          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom}
            stroke="var(--border)" />

          {/* X labels */}
          {xIndices.map(i => (
            <text key={data[i].year} x={xS(i)} y={H - pad.bottom + 16}
              textAnchor="middle" className={styles.tick}>{data[i].year}</text>
          ))}

          {/* Net Worth line */}
          <path d={linePath('netWorth')} fill="none"
            stroke={NET_WORTH_COLOR} strokeWidth="2.8"
            strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover indicator line */}
          {hover && (
            <line
              x1={xS(hover.idx)} y1={pad.top}
              x2={xS(hover.idx)} y2={H - pad.bottom}
              stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3"
            />
          )}

          {/* Transparent overlay — captures mouse events across full chart area */}
          <rect
            x={pad.left} y={pad.top} width={iW} height={iH}
            fill="transparent"
            onMouseMove={handleMouseMove}
          />

          {/* Dot on net worth line at hover position */}
          {hover && (
            <circle
              cx={xS(hover.idx)} cy={yS(data[hover.idx].netWorth)}
              r="4" fill={NET_WORTH_COLOR} stroke="var(--bg-surface)" strokeWidth="2"
            />
          )}
        </svg>

        {/* Tooltip */}
        {hover && (
          <div
            className={styles.tooltip}
            style={tipOnLeft
              ? { right: `calc(${(1 - hover.pct) * 100}% + 14px)` }
              : { left: `calc(${hover.pct * 100}% + 14px)` }
            }
          >
            <div className={styles.tooltipYear}>{data[hover.idx].year}</div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Projected Fund</span>
              <span className={styles.tooltipVal} style={{ color: 'var(--accent-light)' }}>
                {fmtUsd(data[hover.idx].netWorth)}
              </span>
            </div>
            {retirementGoal && (
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>Retirement Goal</span>
                <span className={styles.tooltipVal}>{fmtUsd(retirementGoal.target_usd)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
