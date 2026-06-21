import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CURRENCIES, fmtUsd, fmtOrig } from '../utils/currency'
import { calcCorpus, annualExpenseAtRetirement, calcDeadline } from '../utils/retirement'
import styles from './Page.module.css'

const DEFAULT_FORM = {
  monthlyExpense: '',
  currency: 'INR',
  currentAge: '',
  retirementAge: '60',
  lifeExpectancy: '85',
  inflationRate: '6',
  postReturn: '7',
}

export default function Goals() {
  const [goal, setGoal]       = useState(null)
  const [loaded, setLoaded]   = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState(DEFAULT_FORM)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.getGoals().then(goals => {
      const g = goals[0] ?? null
      setGoal(g)
      if (!g) setEditing(true)
    }).finally(() => setLoaded(true))
  }, [])

  const openEdit = () => {
    setForm({
      monthlyExpense: goal.monthly_expense || '',
      currency:       goal.currency        || 'INR',
      currentAge:     goal.current_age     || '',
      retirementAge:  goal.retirement_age  || '60',
      lifeExpectancy: goal.life_expectancy || '85',
      inflationRate:  goal.inflation_rate  || '6',
      postReturn:     goal.post_return     || '7',
    })
    setError(''); setEditing(true)
  }

  // Live-computed values from form
  const corpus   = calcCorpus(formAsNumbers(form))
  const annual   = annualExpenseAtRetirement(formAsNumbers(form))
  const deadline = calcDeadline(form.currentAge, form.retirementAge)

  const save = async () => {
    if (!corpus) { setError('Please fill all fields with valid values to compute the corpus.'); return }
    setError('')
    const payload = {
      target:          corpus,
      currency:        form.currency,
      deadline,
      monthly_expense: parseFloat(form.monthlyExpense),
      current_age:     parseInt(form.currentAge),
      retirement_age:  parseInt(form.retirementAge),
      life_expectancy: parseInt(form.lifeExpectancy),
      inflation_rate:  parseFloat(form.inflationRate),
      pre_return:      12.0,
      post_return:     parseFloat(form.postReturn),
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
            {/* Monthly expense + currency on same row */}
            <label className={styles.formLabel} style={{ gridColumn: 'span 2' }}>
              Current Monthly Expenses *
              <div style={{ display: 'flex', gap: 6 }}>
                <input className={styles.editInput} type="number" placeholder="50000" style={{ flex: 1 }} {...f('monthlyExpense')} />
                <select className={styles.editSelect} style={{ width: 80 }} {...f('currency')}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </label>

            <label className={styles.formLabel}>
              Current Age *
              <input className={styles.editInput} type="number" placeholder="30" {...f('currentAge')} />
            </label>
            <label className={styles.formLabel}>
              Retirement Age
              <input className={styles.editInput} type="number" placeholder="60" {...f('retirementAge')} />
            </label>

            <label className={styles.formLabel}>
              Life Expectancy
              <input className={styles.editInput} type="number" placeholder="85" {...f('lifeExpectancy')} />
            </label>
            <label className={styles.formLabel}>
              Inflation Rate (%)
              <input className={styles.editInput} type="number" step="0.5" placeholder="6" {...f('inflationRate')} />
            </label>

            <label className={styles.formLabel}>
              Post-retirement Portfolio Return (%)
              <input className={styles.editInput} type="number" step="0.5" placeholder="7" {...f('postReturn')} />
            </label>
          </div>

          {/* Live corpus preview */}
          {corpus !== null ? (
            <div className={styles.corpusPreview}>
              <div className={styles.corpusPreviewLabel}>Corpus Required</div>
              <div className={styles.corpusPreviewAmount}>{fmtOrig(corpus, form.currency)}</div>
              <div className={styles.corpusPreviewSub}>
                Retire by {deadline}
                {annual !== null && (
                  <> · Annual expenses at retirement: {fmtOrig(annual, form.currency)}</>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.corpusPreviewEmpty}>
              Fill all fields to calculate the required corpus
            </div>
          )}

          <div className={styles.formActions}>
            <button className={styles.btnSave} onClick={save} disabled={!corpus}>Save</button>
            {goal && (
              <button className={styles.btnCancel} onClick={() => { setEditing(false); setError('') }}>Cancel</button>
            )}
          </div>
        </div>
      )}

      {!editing && goal && (
        <div className={styles.retirementCard}>
          <div className={styles.retirementTarget}>
            <span className={styles.retirementLabel}>Target Corpus</span>
            <span className={styles.retirementAmount}>{fmtOrig(goal.target, goal.currency)}</span>
            {goal.currency !== 'USD' && (
              <span className={styles.retirementOrig}>{fmtUsd(goal.target_usd)}</span>
            )}
          </div>
          <div className={styles.retirementMeta}>
            <span className={styles.retirementPill}>{goal.deadline}</span>
            {goal.monthly_expense > 0 && (
              <span className={styles.retirementSubtext}>
                {fmtOrig(goal.monthly_expense, goal.currency)}/mo expenses
                &nbsp;·&nbsp;{goal.inflation_rate}% inflation
                &nbsp;·&nbsp;{goal.post_return}% post-retirement return
              </span>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function formAsNumbers(form) {
  return {
    monthlyExpense: parseFloat(form.monthlyExpense),
    currentAge:     parseInt(form.currentAge),
    retirementAge:  parseInt(form.retirementAge),
    lifeExpectancy: parseInt(form.lifeExpectancy),
    inflationRate:  parseFloat(form.inflationRate),
    postReturn:     parseFloat(form.postReturn),
  }
}
