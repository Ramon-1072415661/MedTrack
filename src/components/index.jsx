// src/components/index.jsx
import { forwardRef } from 'react'
export { PasswordInput } from './PasswordInput'
import s from './ui.module.css'

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ variant = 'default', size = 'md', children }) {
  return <span className={`${s.badge} ${s[`badge-${variant}`]} ${s[`badge-${size}`]}`}>{children}</span>
}

// ── Button ───────────────────────────────────────────────────────────────────
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, children, className = '', ...props }, ref
) {
  return (
    <button ref={ref} className={`${s.btn} ${s[`btn-${variant}`]} ${s[`btn-${size}`]} ${className}`} {...props}>
      {icon && <span className={s.btnIcon}>{icon}</span>}
      {children}
    </button>
  )
})

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', pad = true, ...props }) {
  return (
    <div className={`${s.card} ${pad ? s.cardPad : ''} ${className}`} {...props}>
      {children}
    </div>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, hint, error, id, ...props }) {
  return (
    <div className={s.field}>
      {label && <label htmlFor={id} className={s.label}>{label}</label>}
      <input id={id} className={`${s.input} ${error ? s.inputError : ''}`} {...props} />
      {hint  && <p className={s.hint}>{hint}</p>}
      {error && <p className={s.error}>{error}</p>}
    </div>
  )
}

// ── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className={s.toggleWrap}>
      <span className={`${s.toggle} ${checked ? s.toggleOn : ''}`} onClick={onChange}>
        <span className={s.toggleThumb} />
      </span>
      {label && <span className={s.toggleLabel}>{label}</span>}
    </label>
  )
}

// ── BarChart ─────────────────────────────────────────────────────────────────
export function BarChart({ data, height = 120, colorFn }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className={s.chart} style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        const color = colorFn ? colorFn(d.value) : 'var(--color-primary)'
        return (
          <div key={i} className={s.chartCol}>
            <span className={s.chartVal}>{d.label2 ?? d.value}{d.unit ?? ''}</span>
            <div className={s.chartTrack}>
              <div className={s.chartBar} style={{ height: `${pct}%`, background: color }} />
            </div>
            <span className={s.chartDay}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className={s.progressTrack}>
      <div className={s.progressFill} style={{ width: `${pct}%`, background: color ?? 'var(--color-primary)' }} />
    </div>
  )
}

// ── StatusDot ────────────────────────────────────────────────────────────────
const STATUS_VARS = {
  taken:    { label: 'Taken',   v: 'success' },
  pending:  { label: 'Pending', v: 'warning' },
  skipped:  { label: 'Skipped', v: 'danger'  },
  normal:   { label: 'Normal',  v: 'success' },
  elevated: { label: 'Elevated',v: 'warning' },
  high:     { label: 'High',    v: 'danger'  },
  ok:       { label: 'OK',      v: 'success' },
  warning:  { label: 'Warning', v: 'warning' },
  critical: { label: 'Critical',v: 'danger'  },
}

export function StatusBadge({ status }) {
  const cfg = STATUS_VARS[status] ?? { label: status, v: 'default' }
  return <Badge variant={cfg.v} size="sm">{cfg.label}</Badge>
}

// ── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className={s.sectionHeader}>
      <div>
        <h2 className={s.sectionTitle}>{title}</h2>
        {subtitle && <p className={s.sectionSubtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body }) {
  return (
    <div className={s.emptyState}>
      <div className={s.emptyIcon}>{icon}</div>
      <p className={s.emptyTitle}>{title}</p>
      {body && <p className={s.emptyBody}>{body}</p>}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalPanel} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h3 className={s.modalTitle}>{title}</h3>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFooter}>{footer}</div>}
      </div>
    </div>
  )
}
