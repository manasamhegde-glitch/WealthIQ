import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function usePortfolio() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    Promise.all([api.getSummary(), api.getGrowth()])
      .then(([summary, growth]) => setData({ summary, growth }))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function useGoals() {
  const [goals, setGoals]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    api.getGoals()
      .then(setGoals)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { goals, loading, error }
}

export function useHoldings() {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    api.getHoldings()
      .then(setHoldings)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { holdings, loading, error }
}

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  useEffect(() => {
    api.getLiabilities()
      .then(setLiabilities)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { liabilities, loading, error }
}
