// src/screens/ForgotPassword.jsx
import { useState } from 'react'
import { Button, Input } from '../components/index.jsx'
import { useForm } from '../hooks/useForm.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { SCREENS } from '../config/screens.js'
import s from './screens.module.css'

export default function ForgotPassword({ onNavigate }) {
  const { bind, values } = useForm({ email: '' })
  const { resetPassword } = useAuth()

  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleReset() {
    setError(null)
    setLoading(true)

    const { error: err } = await resetPassword(values.email)

    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className={s.authPage}>
        <main className={s.authMain}>
          <div className={s.authCard} style={{ textAlign: 'center' }}>
            <div className={s.authCardIcon}>✅</div>
            <h1 className={s.authCardTitle}>E-mail enviado</h1>
            <p className={s.authCardSubtitle}>
              Confira seu e-mail em <strong>{values.email}</strong> e clique no link
              para redefinir sua senha.
            </p>
            <Button
              variant="ghost"
              style={{ marginTop: 16 }}
              onClick={() => onNavigate(SCREENS.LOGIN.id)}
            >
              Voltar ao Login
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={s.authPage}>
      <header className={s.authHeader}>
        <div className={s.authLogoRow}>
          <div className={s.authLogoMark}>
            <img
              src="/logo.png"
              alt="MedTrack logo"
              className={s.logoImage}
            />
          </div>
          <span className={s.authLogoText}>MedTrack</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => onNavigate(SCREENS.LOGIN.id)}>
          Voltar ao Login
        </Button>
      </header>

      <main className={s.authMain}>
        <div className={s.authCard}>
          <div className={s.authCardIcon}>🔒</div>
          <h1 className={s.authCardTitle}>Esqueceu sua senha?</h1>
          <p className={s.authCardSubtitle}>
            Insira seu e-mail e enviaremos um link para você criar uma nova senha.
          </p>

          <div className={s.formStack}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu_email@exemplo.com"
              {...bind('email')}
            />

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <Button
              size="lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
              onClick={handleReset}
            >
              {loading ? 'Enviando…' : 'Enviar link de recuperação →'}
            </Button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)' }}>
              Lembra da sua senha?{' '}
              <a className={s.authLink} onClick={() => onNavigate(SCREENS.LOGIN.id)}>
                Entrar
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
