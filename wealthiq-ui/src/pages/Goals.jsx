import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CURRENCIES, fmtUsd, fmtOrig } from '../utils/currency'
import styles from './Page.module.css'

export default function Goals() {
  const [goal, setGoal]       = useState(null)
  const [loaded, setLoaded]   = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ target: '', currency: 'INR', deadline: '' })
  const [error, setError]     = useState('')

  useEffect(() => {
    api.getGoals().then(goals => {
      const g = goals[0] ?? null
      setGoal(g)
      if (!g) setEditing(true)
    }).finally(() => setLoaded(true))
  }, [])

  const openEdit = () => {
    setForm({ target: goal.target, currency: goal.currency, deadline: goal.deadline })
    setError(''); setEditing(true)
  }

  const save = async () => {
    if (!form.target || !form.deadline) { setError('Target amount and deadline are required.'); return }
    setError('')
    const payload = {
      target: parseFloat(form.target),
      currency: form.currency,
      deadline: form.deadline,
    }
    if (goal) {
      setGoal(await api.updateGoal(goal.id, payload))
    } else {
      setGoal(await api.createGoal({ name: 'Retirement Fund', ...payload }))
    }
    setEditing(false)
  }

  const f = key => ({
    value: form[key] ?? '',
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  })

  if (!loaded) return <div className={styles.state}>Loading...</div>

  return (
    <main className={styles.page}>
      <div className={styles.goalPageHeader}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>Retirement Fund</h1>
        {!editing && goal && (
          <button className={styles.btnAdd} onClick={openEdit}>Edit Goal</button>
        )}
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      {editing && (
        <div className={styles.goalForm}>
          <p className={styles.formTitle}>{goal ? 'Edit' : 'Set'} Retirement Goal</p>
          <div className={styles.formGrid}>
            <label className={styles.formLabel}>Target Amount *
              <input className={styles.editInput} type="number" placeholder="165000000" {...f('target')} />
            </label>
            <label className={styles.formLabel}>Currency
              <select className={styles.editSelect} {...f('currency')}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className={styles.formLabel}>Target Year
              <input className={styles.editInput} placeholder="Dec 2045" {...f('deadline')} />
            </label>
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnSave} onClick={save}>Save</button>
            {goal && (
              <button className={styles.btnCancel}
                onClick={() => { setEditing(false); setError('') }}>Cancel</button>
            )}
          </div>
        </div>
      )}

      {!editing && goal && (
        <div className={styles.retirementCard}>
          <div className={styles.retirementTarget}>
            <span className={styles.retirementLabel}>Target Corpus</span>
            <span className={styles.retirementAmount}>{fmtUsd(goal.target_usd)}</span>
            {goal.currency !== 'USD' && (
              <span className={styles.retirementOrig}>{fmtOrig(goal.target, goal.currency)}</span>
            )}
          </div>
          <div className={styles.retirementMeta}>
            <span className={styles.retirementPill}>{goal.deadline}</span>
          </div>
        </div>
      )}
    </main>
  )
}
