import { NavLink } from 'react-router-dom'
import { useCurrency } from '../contexts/CurrencyContext'
import styles from './Navbar.module.css'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/goals',     label: 'Goals' },
]

export default function Navbar() {
  const { currency, setCurrency, options } = useCurrency()

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>WealthIQ</span>
      <div className={styles.links}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <select
        className={styles.currencySelect}
        value={currency}
        onChange={e => setCurrency(e.target.value)}
      >
        {options.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className={styles.user}>MH</div>
    </nav>
  )
}
