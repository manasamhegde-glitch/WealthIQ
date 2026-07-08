import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useCurrency } from '../contexts/CurrencyContext'
import { CURRENCIES, fmtCurrency, fmtOrig, convertCurrency } from '../utils/currency'
import { holdingXIRR } from '../utils/xirr'
import styles from './Page.module.css'

const SAVINGS_TYPES       = ['NPS', 'FD', 'RD', 'Bonds', 'PF', 'PPF', 'EPF', 'Mutual Funds', 'Stocks', 'Others']
const LIABILITY_TYPES     = ['Mortgage', 'Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card EMI', 'Business Loan', 'Others']
const CONTRIBUTION_FREQS  = ['None', 'Monthly', 'Yearly']

const BLANK_ASSET = {
  name: '', type: 'Stocks', currency: 'USD', value: '', change: '',
  start_date: '', maturity_date: '',
  contribution: '', contribution_freq: 'None',
  cost_basis: '',
}
const BLANK_LIAB = {
  name: '', type: 'Mortgage', currency: 'USD',
  balance: '', interest_rate: '', start_date: '', end_date: '',
}

export default function Portfolio() {
  const [holdings,    setHoldings]    = useState([])
  const [liabilities, setLiabilities] = useState([])
  const [loading,     setLoading]     = useState(true)

  const [assetEditId,  setAssetEditId]  = useState(null)
  const [assetForm,    setAssetForm]    = useState({})
  const [addingAsset,  setAddingAsset]  = useState(false)
  const [addAssetForm, setAddAssetForm] = useState(BLANK_ASSET)

  const [liabEditId,  setLiabEditId]  = useState(null)
  const [liabForm,    setLiabForm]    = useState({})
  const [addingLiab,  setAddingLiab]  = useState(false)
  const [addLiabForm, setAddLiabForm] = useState(BLANK_LIAB)

  const [error, setError] = useState('')
  const { currency } = useCurrency()

  useEffect(() => {
    Promise.all([api.getHoldings(), api.getLiabilities()])
      .then(([h, l]) => { setHoldings(h); setLiabilities(l) })
      .finally(() => setLoading(false))
  }, [])

  // ── derived totals ──────────────────────────────────────────────────────────
  const totalAssets = holdings.reduce((s, h) => s + convertCurrency(h.value, h.currency, currency), 0)
  const totalLiab   = liabilities.reduce((s, l) => s + convertCurrency(l.balance, l.currency, currency), 0)
  const netWorth    = totalAssets - totalLiab

  // XIRR per holding (computed from cost_basis + SIPs + current value)
  const xirrMap = {}
  holdings.forEach(h => { xirrMap[h.id] = holdingXIRR(h) })

  // ── asset handlers ──────────────────────────────────────────────────────────
  const startAssetEdit = (h) => {
    setAddingAsset(false); setError('')
    setAssetEditId(h.id)
    setAssetForm({
      name: h.name, type: h.type, currency: h.currency,
      value: h.value, change: h.change,
      start_date: h.start_date, maturity_date: h.maturity_date,
      contribution: h.contribution ?? 0,
      contribution_freq: h.contribution_freq ?? 'None',
      cost_basis: h.cost_basis ?? 0,
    })
  }
  const cancelAssetEdit = () => { setAssetEditId(null); setError('') }

  const saveAsset = async (id) => {
    if (!assetForm.name || !assetForm.value) { setError('Name and Value are required.'); return }
    setError('')
    await api.updateHolding(id, {
      name: assetForm.name, type: assetForm.type, currency: assetForm.currency,
      value: parseFloat(assetForm.value), change: parseFloat(assetForm.change) || 0,
      start_date: assetForm.start_date, maturity_date: assetForm.maturity_date,
      contribution: parseFloat(assetForm.contribution) || 0,
      contribution_freq: assetForm.contribution_freq || 'None',
      cost_basis: parseFloat(assetForm.cost_basis) || 0,
    })
    setHoldings(await api.getHoldings())
    setAssetEditId(null)
  }

  const deleteAsset = async (id) => {
    await api.deleteHolding(id)
    setHoldings(await api.getHoldings())
  }

  const addAsset = async () => {
    if (!addAssetForm.name || !addAssetForm.value) { setError('Name and Value are required.'); return }
    setError('')
    await api.createHolding({
      name: addAssetForm.name, type: addAssetForm.type, currency: addAssetForm.currency,
      value: parseFloat(addAssetForm.value), change: parseFloat(addAssetForm.change) || 0,
      start_date: addAssetForm.start_date, maturity_date: addAssetForm.maturity_date,
      contribution: parseFloat(addAssetForm.contribution) || 0,
      contribution_freq: addAssetForm.contribution_freq || 'None',
      cost_basis: parseFloat(addAssetForm.cost_basis) || 0,
    })
    setHoldings(await api.getHoldings())
    setAddingAsset(false); setAddAssetForm(BLANK_ASSET)
  }

  const aField = (key) => ({
    value: assetForm[key] ?? '',
    onChange: e => setAssetForm(f => ({ ...f, [key]: e.target.value })),
  })

  // ── liability handlers ──────────────────────────────────────────────────────
  const startLiabEdit = (l) => {
    setAddingLiab(false); setError('')
    setLiabEditId(l.id)
    setLiabForm({
      name: l.name, type: l.type, currency: l.currency,
      balance: l.balance, interest_rate: l.interest_rate,
      start_date: l.start_date, end_date: l.end_date,
    })
  }
  const cancelLiabEdit = () => { setLiabEditId(null); setError('') }

  const saveLiab = async (id) => {
    if (!liabForm.name || !liabForm.balance) { setError('Name and Balance are required.'); return }
    setError('')
    const updated = await api.updateLiability(id, {
      name: liabForm.name, type: liabForm.type, currency: liabForm.currency,
      balance: parseFloat(liabForm.balance),
      interest_rate: parseFloat(liabForm.interest_rate) || 0,
      start_date: liabForm.start_date, end_date: liabForm.end_date,
    })
    setLiabilities(liabilities.map(l => l.id === id ? updated : l))
    setLiabEditId(null)
  }

  const deleteLiab = async (id) => {
    await api.deleteLiability(id)
    setLiabilities(liabilities.filter(l => l.id !== id))
  }

  const addLiab = async () => {
    if (!addLiabForm.name || !addLiabForm.balance) { setError('Name and Balance are required.'); return }
    setError('')
    const created = await api.createLiability({
      name: addLiabForm.name, type: addLiabForm.type, currency: addLiabForm.currency,
      balance: parseFloat(addLiabForm.balance),
      interest_rate: parseFloat(addLiabForm.interest_rate) || 0,
      start_date: addLiabForm.start_date, end_date: addLiabForm.end_date,
    })
    setLiabilities([...liabilities, created])
    setAddingLiab(false); setAddLiabForm(BLANK_LIAB)
  }

  const lField = (key) => ({
    value: liabForm[key] ?? '',
    onChange: e => setLiabForm(f => ({ ...f, [key]: e.target.value })),
  })

  if (loading) return <div className={styles.state}>Loading...</div>

  return (
    <main className={styles.page}>

      {/* ── Net Worth Bar ── */}
      <div className={styles.netBar}>
        <div className={styles.netCard}>
          <span className={styles.netLabel}>Total Assets</span>
          <span className={`${styles.netValue} ${styles.up}`}>{fmtCurrency(totalAssets, currency)}</span>
        </div>
        <div className={styles.netDivider} />
        <div className={styles.netCard}>
          <span className={styles.netLabel}>Total Liabilities</span>
          <span className={`${styles.netValue} ${styles.down}`}>{fmtCurrency(totalLiab, currency)}</span>
        </div>
        <div className={styles.netDivider} />
        <div className={styles.netCard}>
          <span className={styles.netLabel}>Net Worth</span>
          <span className={`${styles.netValue} ${netWorth >= 0 ? styles.up : styles.down}`}>
            {netWorth < 0 ? '−' : ''}{fmtCurrency(Math.abs(netWorth), currency)}
          </span>
        </div>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      {/* ── Assets ── */}
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Assets</h2>
        <button className={styles.btnAdd}
          onClick={() => { setAddingAsset(true); setAssetEditId(null); setError('') }}>
          + Add Asset
        </button>
      </div>

      {addingAsset && (
        <div className={styles.goalForm}>
          <p className={styles.formTitle}>New Asset</p>
          <div className={styles.formGrid}>
            <AssetFields form={addAssetForm} onChange={setAddAssetForm} />
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnSave}   onClick={addAsset}>Save</button>
            <button className={styles.btnCancel} onClick={() => { setAddingAsset(false); setError('') }}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.rowWide} ${styles.thead}`}>
          <span>Asset</span><span>Type</span><span>Value ({currency})</span>
          <span>Change</span><span>Allocation</span><span />
        </div>

        {holdings.map(h => assetEditId === h.id ? (
          <React.Fragment key={h.id}>
            {/* Main edit row */}
            <div className={`${styles.row} ${styles.rowWide} ${styles.editRow}`}>
              <input  className={styles.editInput}  {...aField('name')} placeholder="Name" />
              <select className={styles.editSelect} {...aField('type')}>
                {SAVINGS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className={styles.valueEditGroup}>
                <input className={styles.editInput} type="number" {...aField('value')} style={{ flex: 1 }} />
                <select className={styles.editSelect} {...aField('currency')} style={{ width: 72 }}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input className={styles.editInput} type="number" step="0.1" {...aField('change')} />
              <span className={styles.allocComputed}>{h.allocation}%</span>
              <span className={styles.rowActions}>
                <button className={styles.btnSave}   onClick={() => saveAsset(h.id)}>✓</button>
                <button className={styles.btnCancel} onClick={cancelAssetEdit}>✕</button>
              </span>
            </div>

            {/* Sub-row: dates + contribution + cost basis */}
            <div className={`${styles.dateSubRow} ${styles.editRow}`}>
              <label className={styles.formLabel}>
                Start Date
                <input className={styles.editInput} {...aField('start_date')} placeholder="Jan 2022" />
              </label>
              <label className={styles.formLabel}>
                Maturity Date
                <input className={styles.editInput} {...aField('maturity_date')} placeholder="Dec 2031" />
              </label>
              <label className={styles.formLabel}>
                Contribution
                <select className={styles.editSelect} {...aField('contribution_freq')}>
                  {CONTRIBUTION_FREQS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              {assetForm.contribution_freq !== 'None' && (
                <label className={styles.formLabel}>
                  Amount / {assetForm.contribution_freq === 'Monthly' ? 'Month' : 'Year'}
                  <input className={styles.editInput} type="number" {...aField('contribution')} placeholder="10000" />
                </label>
              )}
              <label className={styles.formLabel}>
                Initial Investment
                <input className={styles.editInput} type="number" {...aField('cost_basis')} placeholder="0" />
              </label>
            </div>
          </React.Fragment>
        ) : (
          <div key={h.id} className={`${styles.row} ${styles.rowWide}`}>
            <span>
              <span className={styles.assetName}>{h.name}</span>
              {(h.start_date || h.maturity_date) && (
                <span className={styles.dateLine}>
                  {h.start_date}{h.start_date && h.maturity_date && ' → '}{h.maturity_date}
                </span>
              )}
              {h.contribution > 0 && h.contribution_freq !== 'None' && (
                <span className={styles.contribLine}>
                  {fmtCurrency(convertCurrency(h.contribution, h.currency, currency), currency)}/{h.contribution_freq === 'Monthly' ? 'mo' : 'yr'}
                </span>
              )}
            </span>
            <span><span className={styles.badge}>{h.type}</span></span>
            <span>
              {fmtCurrency(convertCurrency(h.value, h.currency, currency), currency)}
              {h.currency !== currency && <span className={styles.origAmount}>{fmtOrig(h.value, h.currency)}</span>}
            </span>
            <span>
              <span className={h.change >= 0 ? styles.up : styles.down}>
                {h.change >= 0 ? '+' : ''}{h.change}%
              </span>
              {xirrMap[h.id] !== null && xirrMap[h.id] !== undefined && (
                <span className={styles.xirrLine}>
                  XIRR {(xirrMap[h.id] * 100) >= 0 ? '+' : ''}{(xirrMap[h.id] * 100).toFixed(1)}%
                </span>
              )}
            </span>
            <span>{h.allocation}%</span>
            <span className={styles.rowActions}>
              <button className={styles.btnEdit}   onClick={() => startAssetEdit(h)} title="Edit">✎</button>
              <button className={styles.btnDelete} onClick={() => deleteAsset(h.id)} title="Delete"
                style={{ padding: '3px 7px', marginLeft: 4, fontSize: 13 }}>✕</button>
            </span>
          </div>
        ))}
      </div>

      {/* ── Liabilities ── */}
      <div className={styles.sectionHead} style={{ marginTop: 32 }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Liabilities</h2>
        <button className={styles.btnAdd}
          onClick={() => { setAddingLiab(true); setLiabEditId(null); setError('') }}>
          + Add Liability
        </button>
      </div>

      {addingLiab && (
        <div className={styles.goalForm}>
          <p className={styles.formTitle}>New Liability</p>
          <div className={styles.formGrid}>
            <LiabFields form={addLiabForm} onChange={setAddLiabForm} />
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnSave}   onClick={addLiab}>Save</button>
            <button className={styles.btnCancel} onClick={() => { setAddingLiab(false); setError('') }}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.rowLiab} ${styles.thead}`}>
          <span>Name</span><span>Type</span><span>Balance ({currency})</span>
          <span>Rate</span><span>Period</span><span />
        </div>
        {liabilities.map(l => liabEditId === l.id ? (
          <div key={l.id} className={`${styles.row} ${styles.rowLiab} ${styles.editRow}`}>
            <input className={styles.editInput} {...lField('name')} placeholder="Name" />
            <select className={styles.editSelect} {...lField('type')}>
              {LIABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className={styles.valueEditGroup}>
              <input className={styles.editInput} type="number" {...lField('balance')} style={{ flex: 1 }} />
              <select className={styles.editSelect} {...lField('currency')} style={{ width: 72 }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input className={styles.editInput} type="number" step="0.1" {...lField('interest_rate')} placeholder="%" />
            <div className={styles.periodEdit}>
              <input className={styles.editInput} {...lField('start_date')} placeholder="Jan 2022" />
              <input className={styles.editInput} {...lField('end_date')}   placeholder="Dec 2032" />
            </div>
            <span className={styles.rowActions}>
              <button className={styles.btnSave}   onClick={() => saveLiab(l.id)}>✓</button>
              <button className={styles.btnCancel} onClick={cancelLiabEdit}>✕</button>
            </span>
          </div>
        ) : (
          <div key={l.id} className={`${styles.row} ${styles.rowLiab}`}>
            <span className={styles.assetName}>{l.name}</span>
            <span><span className={`${styles.badge} ${styles.liabBadge}`}>{l.type}</span></span>
            <span>
              <span className={styles.down}>{fmtCurrency(convertCurrency(l.balance, l.currency, currency), currency)}</span>
              {l.currency !== currency && <span className={styles.origAmount}>{fmtOrig(l.balance, l.currency)}</span>}
            </span>
            <span className={styles.rateCell}>{l.interest_rate}%</span>
            <span className={styles.periodCell}>
              {l.start_date && <span>{l.start_date}</span>}
              {l.start_date && l.end_date && <span className={styles.periodArrow}>→</span>}
              {l.end_date   && <span>{l.end_date}</span>}
            </span>
            <span className={styles.rowActions}>
              <button className={styles.btnEdit}   onClick={() => startLiabEdit(l)} title="Edit">✎</button>
              <button className={styles.btnDelete} onClick={() => deleteLiab(l.id)} title="Delete"
                style={{ padding: '3px 7px', marginLeft: 4, fontSize: 13 }}>✕</button>
            </span>
          </div>
        ))}
      </div>

    </main>
  )
}

function AssetFields({ form, onChange }) {
  const f = (key) => ({ value: form[key] ?? '', onChange: e => onChange(p => ({ ...p, [key]: e.target.value })) })
  return (
    <>
      <label className={styles.formLabel}>Asset Name *
        <input className={styles.editInput} placeholder="e.g. HDFC Bank" {...f('name')} />
      </label>
      <label className={styles.formLabel}>Savings Type
        <select className={styles.editSelect} {...f('type')}>
          {SAVINGS_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>Currency
        <select className={styles.editSelect} {...f('currency')}>
          {CURRENCIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>Current Value *
        <input className={styles.editInput} type="number" placeholder="500000" {...f('value')} />
      </label>
      <label className={styles.formLabel}>Annual Return (%)
        <input className={styles.editInput} type="number" step="0.1" placeholder="8.0" {...f('change')} />
      </label>
      <label className={styles.formLabel}>Contribution Frequency
        <select className={styles.editSelect} {...f('contribution_freq')}>
          {CONTRIBUTION_FREQS.map(freq => <option key={freq}>{freq}</option>)}
        </select>
      </label>
      {form.contribution_freq !== 'None' && (
        <label className={styles.formLabel}>
          Amount / {form.contribution_freq === 'Monthly' ? 'Month' : 'Year'}
          <input className={styles.editInput} type="number" placeholder="10000" {...f('contribution')} />
        </label>
      )}
      <label className={styles.formLabel}>Start Date
        <input className={styles.editInput} placeholder="Jan 2022" {...f('start_date')} />
      </label>
      <label className={styles.formLabel}>Maturity Date
        <input className={styles.editInput} placeholder="Dec 2031" {...f('maturity_date')} />
      </label>
      <label className={styles.formLabel}>Initial Investment
        <input className={styles.editInput} type="number" placeholder="0" {...f('cost_basis')} />
      </label>
    </>
  )
}

function LiabFields({ form, onChange }) {
  const f = (key) => ({ value: form[key] ?? '', onChange: e => onChange(p => ({ ...p, [key]: e.target.value })) })
  return (
    <>
      <label className={styles.formLabel}>Name *
        <input className={styles.editInput} placeholder="e.g. Home Loan – HDFC" {...f('name')} />
      </label>
      <label className={styles.formLabel}>Type
        <select className={styles.editSelect} {...f('type')}>
          {LIABILITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>Currency
        <select className={styles.editSelect} {...f('currency')}>
          {CURRENCIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className={styles.formLabel}>Balance *
        <input className={styles.editInput} type="number" placeholder="5000000" {...f('balance')} />
      </label>
      <label className={styles.formLabel}>Interest Rate (%)
        <input className={styles.editInput} type="number" step="0.1" placeholder="8.5" {...f('interest_rate')} />
      </label>
      <label className={styles.formLabel}>Start Date
        <input className={styles.editInput} placeholder="Jan 2022" {...f('start_date')} />
      </label>
      <label className={styles.formLabel}>End Date
        <input className={styles.editInput} placeholder="Dec 2032" {...f('end_date')} />
      </label>
    </>
  )
}
