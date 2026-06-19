const BASE = '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

async function mutate(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok && res.status !== 204) throw new Error(`API error ${res.status}: ${path}`)
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getCurrencies: () => get('/portfolio/currencies'),
  getSummary:    () => get('/portfolio/summary'),
  getGrowth:     () => get('/portfolio/growth'),
  getGoals:      () => get('/goals'),
  getHoldings:   () => get('/portfolio/holdings'),
  createHolding: (data)     => mutate('POST', '/portfolio/holdings', data),
  updateHolding: (id, data) => mutate('PUT', `/portfolio/holdings/${id}`, data),
  deleteHolding: (id)       => mutate('DELETE', `/portfolio/holdings/${id}`),
  createGoal:    (data)     => mutate('POST', '/goals', data),
  updateGoal:    (id, data) => mutate('PUT', `/goals/${id}`, data),
  deleteGoal:    (id)       => mutate('DELETE', `/goals/${id}`),
}
