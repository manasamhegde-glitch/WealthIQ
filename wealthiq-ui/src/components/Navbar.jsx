import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/goals',     label: 'Goals' },
]

export default function Navbar() {
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
      <div className={styles.user}>MH</div>
    </nav>
  )
}
