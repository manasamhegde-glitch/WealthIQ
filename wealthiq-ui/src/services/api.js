const BASE = '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  getSummary:  () => get('/portfolio/summary'),
  getGrowth:   () => get('/portfolio/growth'),
  getGoals:    () => get('/goals'),
  getHoldings: () => get('/portfolio/holdings'),
}
