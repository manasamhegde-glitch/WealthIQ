import { useState } from 'react'
import { niceTicks } from '../utils/projection'
import { convertCurrency, fmtCurrency, getCurrencySymbol } from '../utils/currency'
import styles from './WealthProjectionChart.module.css'

function fmtAxis(v, currency) {
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  const symbol = getCurrencySymbol(currency)
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}${symbol}${Math.round(abs / 1_000)}K`
  return `${sign}${symbol}${abs}`
}

export default function WealthProjectionChart({ data, retirementGoal, currency, currentYear }) {
  const [hover, setHover] = useState(null)

  if (!data || data.length < 2) return null

  const W = 820, H = 300
  const pad = { top: 16, right: 16, bottom: 40, left: 68 }
  const iW = W - pad.left - pad.right
  const iH = H - pad.top - pad.bottom

  // Y-axis range is based on nominal net worth only
  const allVals = data.map(d => d.netWorth)
  const ticks = niceTicks(Math.min(...allVals), Math.max(...allVals))
  const minY = ticks[0]
  const maxY = ticks[ticks.length - 1]
  const yRange = maxY - minY || 1

  const xS = i => pad.left + (i / (data.length - 1)) * iW
  const yS = v => pad.top + iH - ((v - minY) / yRange) * iH

  // Nominal net worth: dashed line + gradient area fill
  const nomD   = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(d.netWorth).toFixed(1)}`).join(' ')
  const floor  = (H - pad.bottom).toFixed(1)
  const areaD  = `${nomD} L${xS(data.length - 1).toFixed(1)},${floor} L${xS(0).toFixed(1)},${floor} Z`

  // X-axis tick indices
  const n = data.length
  const xStep = Math.max(1, Math.round(n / 6))
  const xIndices = [...new Set([
    ...Array.from({ length: Math.floor(n / xStep) + 1 }, (_, k) => k * xStep),
    n - 1,
  ])].filter(i => i < n)

  const showZero = minY < 0 && maxY > 0
  const todayIdx = data.findIndex(d => d.year >= currentYear)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) / rect.width * W
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mouseX - pad.left) / iW * (data.length - 1))))
    setHover({ idx, pct: xS(idx) / W })
  }

  const tipOnLeft = hover && hover.pct > 0.6
  const hoveredNW = hover ? data[hover.idx].netWorth : 0
  const goalAmount   = retirementGoal
    ? convertCurrency(
        retirementGoal.target_usd ?? retirementGoal.target,
        retirementGoal.target_usd ? 'USD' : retirementGoal.currency,
        currency
      )
    : 0
  const shortfall    = retirementGoal ? Math.max(0, goalAmount - hoveredNW) : null

  return (
    <div className={styles.wrap}>
      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendNom} />
          Nominal Networth
        </span>
      </div>

      <div className={styles.chartArea}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          aria-label="Net worth projection"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--accent-light)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent-light)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines + Y labels */}
          {ticks.map(v => (
            <g key={v}>
              <line x1={pad.left} y1={yS(v)} x2={W - pad.right} y2={yS(v)}
                stroke="var(--border)" strokeDasharray="4 4" />
              <text x={pad.left - 8} y={yS(v)} textAnchor="end" dominantBaseline="middle"
                className={styles.tick}>{fmtAxis(v, currency)}</text>
            </g>
          ))}

          {showZero && (
            <line x1={pad.left} y1={yS(0)} x2={W - pad.right} y2={yS(0)}
              stroke="var(--text-muted)" strokeWidth="1" />
          )}

          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom}
            stroke="var(--border)" />

          {/* X labels */}
          {xIndices.map(i => (
            <text key={data[i].year} x={xS(i)} y={H - pad.bottom + 16}
              textAnchor="middle" className={styles.tick}>{data[i].year}</text>
          ))}

          {/* Gradient area fill (nominal) */}
          <path d={areaD} fill="url(#nwGrad)" />

          {/* Nominal net worth — dashed */}
          <path d={nomD} fill="none"
            stroke="var(--accent-light)" strokeWidth="2.5"
            strokeDasharray="7 4"
            strokeLinejoin="round" strokeLinecap="round" />

          {/* Today dot */}
          {todayIdx >= 0 && (
            <circle
              cx={xS(todayIdx)} cy={yS(data[todayIdx].netWorth)}
              r="5" fill="var(--accent)" stroke="var(--bg-surface)" strokeWidth="2"
            />
          )}

          {/* Hover vertical line */}
          {hover && (
            <line
              x1={xS(hover.idx)} y1={pad.top}
              x2={xS(hover.idx)} y2={H - pad.bottom}
              stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3"
            />
          )}

          {/* Transparent overlay for mouse tracking */}
          <rect x={pad.left} y={pad.top} width={iW} height={iH}
            fill="transparent" onMouseMove={handleMouseMove} />

          {/* Hover dots — one per line */}
          {hover && <>
            <circle cx={xS(hover.idx)} cy={yS(data[hover.idx].netWorth)}
              r="4" fill="var(--accent-light)" stroke="var(--bg-surface)" strokeWidth="2" />
          </>}
        </svg>

        {/* Tooltip */}
        {hover && (
          <div
            className={styles.tooltip}
            style={tipOnLeft
              ? { right: `calc(${(1 - hover.pct) * 100}% + 14px)` }
              : { left:  `calc(${hover.pct * 100}% + 14px)` }
            }
          >
            <div className={styles.tooltipHeader}>Year {data[hover.idx].year}</div>

            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>Nominal Networth</span>
              <span className={styles.tooltipVal} style={{ color: 'var(--accent-light)' }}>
                {fmtCurrency(hoveredNW, currency)}
              </span>
            </div>
            {retirementGoal && (
              <>
                <div className={styles.tooltipDivider} />
                <div className={styles.tooltipSection}>Retirement Fund</div>
                <div className={styles.tooltipRow}>
                  <span className={styles.tooltipLabel}>Target amount</span>
                  <span className={styles.tooltipVal}>{fmtCurrency(goalAmount, currency)}</span>
                </div>
                <div className={styles.tooltipRow}>
                  <span className={styles.tooltipLabel}>Shortfall</span>
                  <span className={`${styles.tooltipVal} ${styles.tooltipRed}`}>
                    {shortfall === 0 ? 'On Track' : fmtCurrency(shortfall, currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
