import { createContext, useContext, useEffect, useState } from 'react'
import { CURRENCIES, refreshExchangeRates } from '../utils/currency'

const STORAGE_KEY = 'wealthiq.selectedCurrency'
const CurrencyContext = createContext({
  currency: 'USD',
  setCurrency: () => {},
  options: CURRENCIES,
})

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && CURRENCIES.includes(stored)) {
      setCurrency(stored)
    }
    refreshExchangeRates()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency)
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, options: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
