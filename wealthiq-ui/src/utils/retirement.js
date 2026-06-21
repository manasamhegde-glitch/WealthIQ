/**
 * Present Value of Growing Annuity — inflation-adjusted retirement corpus.
 *
 * Accounts for:
 *  - Expense inflation from now until retirement
 *  - Portfolio outpacing inflation during retirement (post_return > inflation_rate)
 *
 * Returns corpus in the same currency as monthlyExpense, or null on bad inputs.
 */
export function calcCorpus({ monthlyExpense, currentAge, retirementAge, lifeExpectancy, inflationRate, postReturn }) {
  const me = parseFloat(monthlyExpense) || 0
  const ca = parseInt(currentAge)       || 0
  const ra = parseInt(retirementAge)    || 0
  const le = parseInt(lifeExpectancy)   || 0
  const ir = parseFloat(inflationRate)  || 0
  const pr = parseFloat(postReturn)     || 0

  if (me <= 0 || ra <= ca || le <= ra) return null

  const yearsToRetire    = ra - ca
  const yearsInRetire    = le - ra
  const annualAtRetire   = me * 12 * Math.pow(1 + ir / 100, yearsToRetire)

  const r = pr / 100
  const g = ir / 100

  const corpus = Math.abs(r - g) < 0.0001
    ? annualAtRetire * yearsInRetire
    : annualAtRetire * (1 - Math.pow((1 + g) / (1 + r), yearsInRetire)) / (r - g)

  return Math.round(corpus)
}

/** Annual expense in original currency at retirement, inflation-adjusted. */
export function annualExpenseAtRetirement({ monthlyExpense, currentAge, retirementAge, inflationRate }) {
  const me = parseFloat(monthlyExpense) || 0
  const ca = parseInt(currentAge)       || 0
  const ra = parseInt(retirementAge)    || 0
  const ir = parseFloat(inflationRate)  || 0
  if (me <= 0 || ra <= ca) return null
  return Math.round(me * 12 * Math.pow(1 + ir / 100, ra - ca))
}

/** "Dec 2056" string derived from ages + current year. */
export function calcDeadline(currentAge, retirementAge) {
  const yr = new Date().getFullYear() + (parseInt(retirementAge) - parseInt(currentAge))
  return isNaN(yr) ? '' : `Dec ${yr}`
}
