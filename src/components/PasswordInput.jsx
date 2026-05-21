// src/components/PasswordInput.jsx

import { useState } from 'react'
import s from './PasswordInput.module.css'

export function PasswordInput({ label, hint, error, id, forgotPassword, ...props }) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className={s.field}>
      {(label || forgotPassword) && (
        <div className={s.header}>
          {label && <label htmlFor={id} className={s.label}>{label}</label>}
          {forgotPassword && (
            <a className={s.authLink} onClick={forgotPassword.onClick}>
              {forgotPassword.label ?? 'Forgot password?'}
            </a>
          )}
        </div>
      )}
      <div className={s.wrapper}>
        <input
          id={id}
          type={showPw ? 'text' : 'password'}
          className={`${s.input} ${error ? s.inputError : ''}`}
          {...props}
        />
        <button type="button" className={s.toggle} onClick={() => setShowPw(v => !v)}>
          {showPw ? '🙈' : '👁'}
        </button>
      </div>
      {hint  && <p className={s.hint}>{hint}</p>}
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
}