import { Link } from 'react-router-dom'
import WealthProjectionChart from '../components/WealthProjectionChart'
import { usePortfolio, useGoals, useHoldings, useLiabilities } from '../hooks/usePortfolio'
import { fmtCurrency, toCurrency, convertCurrency } from '../utils/currency'
import { projectWealth, getHorizon, parseYear } from '../utils/projection'
import { useCurrency } from '../contexts/CurrencyContext'
import styles from './Page.module.css'

export default function Dashboard() {
  const { data, loading, error } = usePortfolio()
  const { goals }                = useGoals()
  const { holdings }             = useHoldings()
  const { liabilities }          = useLiabilities()
  const { currency }             = useCurrency()

  if (loading) return <div className={styles.state}>Loading...</div>
  if (error)   return <div className={styles.state}>Failed to load data.</div>

  const { summary } = data

  // ── financials ──────────────────────────────────────────────────────────────
  const normalizedHoldings = holdings.map(h => ({
    ...h,
    value_usd: convertCurrency(h.value, h.currency, 'USD'),
    contribution_usd: convertCurrency(h.contribution ?? 0, h.currency, 'USD'),
    cost_basis_usd: convertCurrency(h.cost_basis ?? 0, h.currency, 'USD'),
  }))
  const normalizedLiabilities = liabilities.map(l => ({
    ...l,
    balance_usd: convertCurrency(l.balance, l.currency, 'USD'),
  }))

  const totalAssetsUsd = normalizedHoldings.reduce((s, h) => s + h.value_usd, 0)
  const totalLiabUsd   = normalizedLiabilities.reduce((s, l) => s + l.balance_usd, 0)
  const netWorthUsd    = totalAssetsUsd - totalLiabUsd
  const totalAssets    = toCurrency(totalAssetsUsd, currency)
  const totalLiab      = toCurrency(totalLiabUsd, currency)
  const netWorth       = toCurrency(netWorthUsd, currency)
  const weightedReturn = normalizedHoldings.length > 0
    ? normalizedHoldings.reduce((s, h) => s + h.change * h.allocation / 100, 0)
    : 0

  // Estimated 1-day change from annualised return
  const dailyPct  = weightedReturn / 365
  const dailyGain = toCurrency(totalAssetsUsd * weightedReturn / 100 / 365, currency)

  // ── projection data ────────────────────────────────────────────────────────
  const retirementGoal = goals.length > 0 ? goals[0] : null
  const currentYear    = new Date().getFullYear()
  const retireYear     = retirementGoal ? (parseYear(retirementGoal.deadline) ?? currentYear + 30) : currentYear + 30
  const horizonYear    = Math.max(getHorizon(normalizedHoldings, normalizedLiabilities), retireYear + 2)
  const inflationRate  = retirementGoal?.inflation_rate ?? 6   // % — used for Fisher deflation
  const projDataUsd    = projectWealth(normalizedHoldings, normalizedLiabilities, currentYear, horizonYear, inflationRate)
  const projData       = projDataUsd.map(d => ({
    ...d,
    assets: toCurrency(d.assets, currency),
    liabilities: toCurrency(d.liabilities, currency),
    netWorth: toCurrency(d.netWorth, currency),
  }))

  // ── retirement stats ───────────────────────────────────────────────────────
  let retireStats = null
  if (retirementGoal) {
    const projPt         = projData.find(d => d.year === retireYear)
    const projected      = Math.max(0, projPt?.netWorth ?? 0)
    const requiredUsd    = retirementGoal.target_usd
    const required       = toCurrency(requiredUsd, currency)
    const gap            = Math.max(0, required - projected)
    const pct            = required > 0 ? Math.min(100, projected / required * 100) : 0
    retireStats          = { projected, required, gap, pct }
  }

  return (
    <main className={styles.page}>

      {/* ── Identity header ── */}
      <header className={styles.dashHeader}>
        <div className={styles.avatar}>{summary.initials}</div>
        <div>
          <span className={styles.name}>{summary.user_name}</span>
          <span className={styles.sub}>Personal Finance</span>
        </div>
      </header>

      {/* ── Hero: current net worth + projected subtext ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroLabel}>My Networth</div>
        <div className={`${styles.heroAmount} ${netWorth >= 0 ? styles.up : styles.down}`}>
          {netWorth < 0 ? '−' : ''}{fmtCurrency(Math.abs(netWorth), currency)}
        </div>
        {retireStats && (
          <div className={styles.heroSub}>
            Projected by {retireYear}:&nbsp;
            <strong>{fmtCurrency(retireStats.projected, currency)}</strong>
          </div>
        )}
      </section>

      {/* ── Wealth Trajectory (area chart) ── */}
      <section className={styles.section}>
        <WealthProjectionChart
          data={projData}
          retirementGoal={retirementGoal}
          currency={currency}
          currentYear={currentYear}
        />
      </section>

      {/* ── Retirement Fund card ── */}
      {retireStats && (
        <section className={styles.section}>
          <div className={styles.rfCard}>
            <div className={styles.rfCardHeader}>
              <div>
                <span className={styles.rfTitle}>Retirement Fund</span>
                <span className={styles.rfDeadline}>by {retirementGoal.deadline}</span>
              </div>
              <span className={styles.rfPctBadge}>
                <span className={styles.rfPctDot} />
                {Math.round(retireStats.pct)}%
              </span>
            </div>

            <div className={styles.rfStats}>
              <div className={styles.rfStat}>
                <span className={styles.rfStatLabel}>Goal Amt</span>
                <span className={styles.rfStatValue}>{fmtCurrency(retireStats.required, currency)}</span>
              </div>
              <div className={styles.rfDivider} />
              <div className={styles.rfStat}>
                <span className={styles.rfStatLabel}>Projected by {retireYear}</span>
                <span className={styles.rfStatValue}>{fmtCurrency(retireStats.projected, currency)}</span>
              </div>
              <div className={styles.rfDivider} />
              <div className={styles.rfStat}>
                <span className={styles.rfStatLabel}>Shortfall</span>
                <span className={`${styles.rfStatValue} ${retireStats.gap === 0 ? styles.up : styles.down}`}>
                  {retireStats.gap === 0 ? 'On Track' : fmtCurrency(retireStats.gap, currency)}
                </span>
              </div>
            </div>

            <div className={styles.rfCta}>
              <span>Cover your shortfall</span>
              <Link to="/goals" className={styles.rfCtaLink}>View Goals →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Summary rows ── */}
      <section className={styles.section}>
        <div className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Assets</span>
            <span className={`${styles.summaryValue} ${styles.up}`}>{fmtCurrency(totalAssets, currency)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Liabilities</span>
            <span className={`${styles.summaryValue} ${styles.down}`}>{fmtCurrency(totalLiab, currency)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>1D Change</span>
            <span className={`${styles.summaryValue} ${dailyGain >= 0 ? styles.up : styles.down}`}>
              {dailyGain >= 0 ? '▲' : '▼'}&nbsp;
              {Math.abs(dailyPct).toFixed(2)}%&nbsp;&nbsp;
              {dailyGain >= 0 ? '+' : '−'}{fmtCurrency(Math.abs(dailyGain), currency)}
            </span>
          </div>
        </div>
      </section>

    </main>
  )
}
