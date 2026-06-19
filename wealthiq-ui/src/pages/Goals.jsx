import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CURRENCIES } from '../utils/currency'
import GoalProgress from '../components/GoalProgress'
import styles from './Page.module.css'

const BLANK = { name: '', currency: 'USD', target: '', deadline: '' }

export default function Goals() {
  const [goals, setGoals]     = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState({})
  const [adding, setAdding]   = useState(false)
  const [addForm, setAddForm] = useState(BLANK)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.getGoals().then(setGoals).finally(() => setLoading(false))
  }, [])

  const startEdit = (g) => {
    setAdding(false)
    setError('')
    setEditId(g.id)
    setForm({ name: g.name, currency: g.currency, target: g.target, deadline: g.deadline })
  }

  const cancelEdit = () => { setEditId(null); setError('') }

  const saveEdit = async (id) => {
    if (!form.name || !form.target) { setError('Name and Target are required.'); return }
    setError('')
    const updated = await api.updateGoal(id, {
      name: form.name,
      currency: form.currency,
      target: parseFloat(form.target),
      deadline: form.deadline,
    })
    setGoals(goals.map(g => g.id === id ? updated : g))
    setEditId(null)
  }

  const handleDelete = async (id) => {
    await api.deleteGoal(id)
    setGoals(goals.filter(g => g.id !== id))
  }

  const handleAdd = async () => {
    if (!addForm.name || !addForm.target) { setError('Name and Target are required.'); return }
    setError('')
    const created = await api.createGoal({
      name: addForm.name,
      currency: addForm.currency,
      target: parseFloat(addForm.target),
      deadline: addForm.deadline,
    })
    setGoals([...goals, created])
    setAdding(false)
    setAddForm(BLANK)
  }

  if (loading) return <div className={styles.state}>Loading...</div>

  return (
    <main className={styles.page}>
      <div className={styles.goalPageHeader}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Financial Goals</h1>
        <button className={styles.btnAdd} onClick={() => { setAdding(true); setEditId(null); setError('') }}>
          + Add Goal
        </button>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      {adding && (
        <div className={styles.goalForm}>
          <p className={styles.formTitle}>New Goal</p>
          <GoalFormFields form={addForm} onChange={setAddForm} />
          <div className={styles.formActions}>
            <button className={styles.btnSave}   onClick={handleAdd}>Save</button>
            <button className={styles.btnCancel} onClick={() => { setAdding(false); setError('') }}>Cancel</button>
          </div>
        </div>
      )}

      {goals.map(g => editId === g.id ? (
        <div key={g.id} className={styles.goalForm}>
          <p className={styles.formTitle}>Edit Goal</p>
          <GoalFormFields form={form} onChange={setForm} />
          <div className={styles.formActions}>
            <button className={styles.btnSave}   onClick={() => saveEdit(g.id)}>Save</button>
            <button className={styles.btnCancel} onClick={cancelEdit}>Cancel</button>
            <button className={styles.btnDelete} onClick={() => handleDelete(g.id)}>Delete</button>
          </div>
        </div>
      ) : (
        <div key={g.id} className={styles.goalWrap}>
          <GoalProgress
            name={g.name}
            currency={g.currency}
            target={g.target}
            targetUsd={g.target_usd}
            deadline={g.deadline}
          />
          <div className={styles.goalActions}>
            <button className={styles.btnEdit} onClick={() => startEdit(g)}>✎ Edit</button>
          </div>
        </div>
      ))}
    </main>
  )
}

function GoalFormFields({ form, onChange }) {
  const field = (key) => ({
    value: form[key] ?? '',
    onChange: e => onChange(f => ({ ...f, [key]: e.target.value })),
  })
  return (
    <div className={styles.formGrid}>
      <label className={styles.formLabel}>
        Goal Name *
        <input className={styles.editInput} placeholder="e.g. Emergency Fund" {...field('name')} />
      </label>
      <label className={styles.formLabel}>
        Currency
        <select className={styles.editSelect} {...field('currency')}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>
        Target Amount *
        <input className={styles.editInput} type="number" placeholder="5000000" {...field('target')} />
      </label>
      <label className={styles.formLabel}>
        Timeline
        <input className={styles.editInput} placeholder="Dec 2028" {...field('deadline')} />
      </label>
    </div>
  )
}
