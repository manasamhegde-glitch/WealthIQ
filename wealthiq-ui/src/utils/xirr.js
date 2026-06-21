const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000

function parseMonthYear(str) {
  if (!str) return null
  const [mon, yr] = str.trim().split(' ')
  const m = MONTHS[mon]
  const y = parseInt(yr)
  if (m === undefined || isNaN(y)) return null
  return new Date(y, m, 1)
}

function npv(r, cashFlows, dates) {
  const t0 = dates[0].getTime()
  return cashFlows.reduce((sum, cf, i) => {
    const t = (dates[i].getTime() - t0) / MS_PER_YEAR
    return sum + cf / Math.pow(1 + r, t)
  }, 0)
}

function dnpv(r, cashFlows, dates) {
  const t0 = dates[0].getTime()
  return cashFlows.reduce((sum, cf, i) => {
    const t = (dates[i].getTime() - t0) / MS_PER_YEAR
    if (t === 0) return sum
    return sum - t * cf / Math.pow(1 + r, t + 1)
  }, 0)
}

// Newton-Raphson solver: find r such that NPV of cash flows = 0
function solveXIRR(cashFlows, dates) {
  let r = 0.1
  for (let i = 0; i < 200; i++) {
    const f  = npv(r, cashFlows, dates)
    const df = dnpv(r, cashFlows, dates)
    if (Math.abs(df) < 1e-14) break
    const rNew = Math.max(-0.99, r - f / df)
    if (Math.abs(rNew - r) < 1e-8) return rNew
    r = rNew
  }
  return r
}

/**
 * Compute XIRR (extended IRR) for a holding.
 * Treats cost_basis_usd as lumpsum outflow at start_date,
 * contribution_usd as periodic outflows, and value_usd as today's inflow.
 * Returns the annualised rate (decimal) or null if not computable.
 */
export function holdingXIRR(holding) {
  const start = parseMonthYear(holding.start_date)
  if (!start) return null

  const costUsd = holding.cost_basis_usd || 0
  const sipUsd  = holding.contribution_usd || 0
  const freq    = holding.contribution_freq || 'None'
  const today   = new Date()

  if (costUsd <= 0 && sipUsd <= 0) return null
  if (!holding.value_usd || holding.value_usd <= 0) return null

  const cashFlows = []
  const dates     = []

  if (costUsd > 0) {
    cashFlows.push(-costUsd)
    dates.push(new Date(start))
  }

  if (sipUsd > 0 && freq !== 'None') {
    const d = new Date(start)
    while (d <= today) {
      cashFlows.push(-sipUsd)
      dates.push(new Date(d))
      if (freq === 'Monthly') d.setMonth(d.getMonth() + 1)
      else                    d.setFullYear(d.getFullYear() + 1)
    }
  }

  cashFlows.push(holding.value_usd)
  dates.push(new Date(today))

  if (cashFlows.length < 2) return null

  try {
    const r = solveXIRR(cashFlows, dates)
    return isFinite(r) && r > -1 && r < 50 ? r : null
  } catch {
    return null
  }
}
