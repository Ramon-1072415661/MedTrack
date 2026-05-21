// src/components/Snackbar.jsx

import s from './Snackbar.module.css'

export function Snackbar({ message, type = 'success' }) {
  if (!message) return null
  return (
    <div className={`${s.snackbar} ${s[type]}`}>
      {message}
    </div>
  )
}