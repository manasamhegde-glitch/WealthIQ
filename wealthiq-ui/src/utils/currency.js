export const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'SGD', 'AED', 'CAD', 'AUD']

const SYMBOLS = {
  USD: '$', INR: '₹', EUR: '€', GBP: '£',
  JPY: '¥', SGD: 'S$', AED: 'AED ', CAD: 'C$', AUD: 'A$',
}

export function fmtUsd(value) {
  return '$' + Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function fmtOrig(value, currency) {
  const sym = SYMBOLS[currency] ?? (currency + ' ')
  return sym + Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' ' + currency
}
