export const DEFAULT_CURRENCY = 'USD'

const FALLBACK_EXCHANGE_RATES = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
}

let activeExchangeRates = { ...FALLBACK_EXCHANGE_RATES }
let refreshPromise = null
const STORAGE_KEY = 'wealthiq.exchangeRates'
const RATE_TTL_MS = 1000 * 60 * 60

export const EXCHANGE_RATES = { ...FALLBACK_EXCHANGE_RATES }
export const CURRENCIES = Object.keys(EXCHANGE_RATES)
export const CURRENCY_SYMBOLS = {
  USD: '$', INR: '₹', EUR: '€',
}

export function getCurrencySymbol(currency = DEFAULT_CURRENCY) {
  return CURRENCY_SYMBOLS[currency] ?? `${currency} `
}

function readStoredRates() {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > RATE_TTL_MS) return null
    return parsed.rates
  } catch {
    return null
  }
}

export function setExchangeRates(rates = {}) {
  activeExchangeRates = {
    ...FALLBACK_EXCHANGE_RATES,
    ...rates,
    USD: 1.0,
  }
  return activeExchangeRates
}

export function getExchangeRates() {
  return activeExchangeRates
}

export async function refreshExchangeRates() {
  if (refreshPromise) return refreshPromise

  const cachedRates = readStoredRates()
  if (cachedRates) {
    setExchangeRates(cachedRates)
  }

  refreshPromise = fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=INR,EUR')
    .then(async (response) => {
      if (!response.ok) throw new Error('Failed to load exchange rates')
      const data = await response.json()
      const nextRates = {
        USD: 1.0,
        INR: Number(data?.rates?.INR ?? FALLBACK_EXCHANGE_RATES.INR),
        EUR: Number(data?.rates?.EUR ?? FALLBACK_EXCHANGE_RATES.EUR),
      }
      setExchangeRates(nextRates)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          timestamp: Date.now(),
          rates: nextRates,
        }))
      }
      return nextRates
    })
    .catch((error) => {
      console.warn('Using fallback exchange rates because the live rates request failed.', error)
      return getExchangeRates()
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export function convertCurrency(value, fromCurrency = 'USD', toCurrency = 'USD') {
  const fromRate = getExchangeRates()[fromCurrency] ?? 1
  const toRate = getExchangeRates()[toCurrency] ?? 1
  return Number((Number(value) / fromRate) * toRate)
}

export function toCurrency(value, currency = 'USD') {
  return convertCurrency(value, 'USD', currency)
}

export function fmtCurrency(value, currency = DEFAULT_CURRENCY) {
  const sym = getCurrencySymbol(currency)
  const formatted = Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })
  return currency === DEFAULT_CURRENCY ? `${sym}${formatted}` : `${sym}${formatted} ${currency}`
}

export function fmtUsd(value) {
  return fmtCurrency(value, DEFAULT_CURRENCY)
}

export function fmtOrig(value, currency) {
  const sym = getCurrencySymbol(currency)
  return `${sym}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`
}
