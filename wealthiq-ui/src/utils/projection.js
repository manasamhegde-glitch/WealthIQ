function parseYear(dateStr) {
  if (!dateStr) return null
  const m = dateStr.match(/\d{4}/)
  return m ? parseInt(m[0]) : null
}

function niceTicks(dataMin, dataMax) {
  const range = dataMax - dataMin || 1
  const rough = range / 5
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 5, 10].map(f => f * mag).find(s => s >= rough) || mag * 10
  const lo = Math.floor(dataMin / step) * step
  const hi = Math.ceil(dataMax / step) * step
  const ticks = []
  for (let v = lo; v <= hi + step * 0.5; v += step) ticks.push(Math.round(v))
  return ticks
}

export { niceTicks }

export function getHorizon(holdings, liabilities) {
  const years = [
    ...holdings.map(h => parseYear(h.maturity_date)),
    ...liabilities.map(l => parseYear(l.end_date)),
  ].filter(Boolean)
  const cur = new Date().getFullYear()
  return Math.max(cur + 15, ...(years.length ? years : [cur + 15]))
}

export function projectWealth(holdings, liabilities, currentYear, horizonYear) {
  return Array.from({ length: horizonYear - currentYear + 1 }, (_, t) => {
    const year = currentYear + t

    const assets = holdings.reduce((sum, h) => {
      const matY = parseYear(h.maturity_date)
      if (matY && year > matY) return sum

      const r      = (h.change || 0) / 100
      const c      = h.contribution_usd || 0
      const freq   = h.contribution_freq || 'None'

      if (c > 0 && freq === 'Monthly') {
        const rm = r / 12
        const nm = t * 12
        if (rm === 0) return sum + h.value_usd + c * nm
        const powM = Math.pow(1 + rm, nm)
        return sum + h.value_usd * powM + c * (powM - 1) / rm
      }

      if (c > 0 && freq === 'Yearly') {
        if (r === 0) return sum + h.value_usd + c * t
        const pow = Math.pow(1 + r, t)
        return sum + h.value_usd * pow + c * (pow - 1) / r
      }

      // Lump-sum: simple compound growth
      return sum + h.value_usd * Math.pow(1 + r, t)
    }, 0)

    const liabs = liabilities.reduce((sum, l) => {
      const endY = parseYear(l.end_date)
      if (!endY || year >= endY) return sum

      const startY = parseYear(l.start_date) || currentYear
      if (year <= startY) return sum + l.balance_usd

      const remainingYears = endY - currentYear
      if (remainingYears <= 0) return sum

      const r = (l.interest_rate || 0) / 100
      if (r === 0) {
        return sum + Math.max(0, l.balance_usd * (1 - t / remainingYears))
      }

      // Amortization: outstanding balance after t annual payments
      const pow = Math.pow(1 + r, remainingYears)
      const annualPmt = l.balance_usd * r * pow / (pow - 1)
      const powT = Math.pow(1 + r, t)
      const remaining = l.balance_usd * powT - annualPmt * (powT - 1) / r

      return sum + Math.max(0, remaining)
    }, 0)

    return {
      year,
      assets: Math.round(assets),
      liabilities: Math.round(liabs),
      netWorth: Math.round(assets - liabs),
    }
  })
}
