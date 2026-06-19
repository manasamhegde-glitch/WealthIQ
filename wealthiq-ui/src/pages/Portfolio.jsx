import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CURRENCIES, fmtUsd, fmtOrig } from '../utils/currency'
import styles from './Page.module.css'

const SAVINGS_TYPES = ['NPS', 'FD', 'RD', 'Bonds', 'PF', 'PPF', 'EPF', 'Mutual Funds', 'Stocks', 'Others']
const BLANK = { name: '', type: 'Stocks', currency: 'USD', value: '', change: '' }

export default function Portfolio() {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({})
  const [adding, setAdding]     = useState(false)
  const [addForm, setAddForm]   = useState(BLANK)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.getHoldings()
      .then(setHoldings)
      .finally(() => setLoading(false))
  }, [])

  const startEdit = (h) => {
    setAdding(false)
    setError('')
    setEditId(h.id)
    setForm({ name: h.name, type: h.type, currency: h.currency,
              value: h.value, change: h.change })
  }

  const cancelEdit = () => { setEditId(null); setError('') }

  const saveEdit = async (id) => {
    if (!form.name || form.value === '') { setError('Name and Value are required.'); return }
    setError('')
    const updated = await api.updateHolding(id, {
      name: form.name,
      type: form.type,
      currency: form.currency,
      value: parseFloat(form.value),
      change: parseFloat(form.change) || 0,
    })
    // Re-fetch all so every row's allocation reflects the new totals
    const all = await api.getHoldings()
    setHoldings(all)
    setEditId(null)
  }

  const handleDelete = async (id) => {
    await api.deleteHolding(id)
    const all = await api.getHoldings()
    setHoldings(all)
  }

  const handleAdd = async () => {
    if (!addForm.name || !addForm.value) { setError('Name and Value are required.'); return }
    setError('')
    await api.createHolding({
      name: addForm.name,
      type: addForm.type,
      currency: addForm.currency,
      value: parseFloat(addForm.value),
      change: parseFloat(addForm.change) || 0,
    })
    const all = await api.getHoldings()
    setHoldings(all)
    setAdding(false)
    setAddForm(BLANK)
  }

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  if (loading) return <div className={styles.state}>Loading...</div>

  return (
    <main className={styles.page}>
      <div className={styles.goalPageHeader}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Portfolio Holdings</h1>
        <button className={styles.btnAdd} onClick={() => { setAdding(true); setEditId(null); setError('') }}>
          + Add Asset
        </button>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      {adding && (
        <div className={styles.goalForm}>
          <p className={styles.formTitle}>New Asset</p>
          <div className={styles.formGrid}>
            <AssetFormFields form={addForm} onChange={setAddForm} />
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnSave}   onClick={handleAdd}>Save</button>
            <button className={styles.btnCancel} onClick={() => { setAdding(false); setError('') }}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.rowWide} ${styles.thead}`}>
          <span>Asset</span>
          <span>Type</span>
          <span>Value (USD)</span>
          <span>Change</span>
          <span>Allocation</span>
          <span />
        </div>

        {holdings.map(h => editId === h.id ? (
          <div key={h.id} className={`${styles.row} ${styles.rowWide} ${styles.editRow}`}>
            <input  className={styles.editInput}  {...field('name')} placeholder="Asset name" />
            <select className={styles.editSelect} {...field('type')}>
              {SAVINGS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className={styles.valueEditGroup}>
              <input className={styles.editInput} type="number" {...field('value')}
                placeholder="Amount" style={{ flex: 1 }} />
              <select className={styles.editSelect} {...field('currency')} style={{ width: 72 }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input className={styles.editInput} type="number" step="0.1" {...field('change')} placeholder="%" />
            <span className={styles.allocComputed}>{h.allocation}%</span>
            <span className={styles.rowActions}>
              <button className={styles.btnSave}   onClick={() => saveEdit(h.id)}>✓</button>
              <button className={styles.btnCancel} onClick={cancelEdit}>✕</button>
            </span>
          </div>
        ) : (
          <div key={h.id} className={`${styles.row} ${styles.rowWide}`}>
            <span className={styles.assetName}>{h.name}</span>
            <span><span className={styles.badge}>{h.type}</span></span>
            <span>
              {fmtUsd(h.value_usd)}
              {h.currency !== 'USD' && (
                <span className={styles.origAmount}>{fmtOrig(h.value, h.currency)}</span>
              )}
            </span>
            <span className={h.change >= 0 ? styles.up : styles.down}>
              {h.change >= 0 ? '+' : ''}{h.change}%
            </span>
            <span>{h.allocation}%</span>
            <span className={styles.rowActions}>
              <button className={styles.btnEdit}   onClick={() => startEdit(h)} title="Edit">✎</button>
              <button className={styles.btnDelete} onClick={() => handleDelete(h.id)} title="Delete"
                style={{ padding: '3px 7px', marginLeft: 4, fontSize: 13 }}>✕</button>
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}

function AssetFormFields({ form, onChange }) {
  const field = (key) => ({
    value: form[key] ?? '',
    onChange: e => onChange(f => ({ ...f, [key]: e.target.value })),
  })
  return (
    <>
      <label className={styles.formLabel}>
        Asset Name *
        <input className={styles.editInput} placeholder="e.g. HDFC Bank" {...field('name')} />
      </label>
      <label className={styles.formLabel}>
        Savings Type
        <select className={styles.editSelect} {...field('type')}>
          {SAVINGS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>
        Currency
        <select className={styles.editSelect} {...field('currency')}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>
        Value *
        <input className={styles.editInput} type="number" placeholder="5000" {...field('value')} />
      </label>
      <label className={styles.formLabel}>
        Change (%)
        <input className={styles.editInput} type="number" step="0.1" placeholder="1.2" {...field('change')} />
      </label>
    </>
  )
}
