// src/screens/Login.jsx
import { useState } from 'react'
import { Button, Input, PasswordInput } from '../components/index.jsx'
import { useForm } from '../hooks/useForm.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { SCREENS } from '../config/screens.js'
import s from './screens.module.css'

export default function Login({ onNavigate }) {
  const { bind, values } = useForm({ email: '', password: '' })
  const { signIn } = useAuth()

  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSignIn() {
    setError(null)
    setLoading(true)

    const { error: err } = await signIn(values.email, values.password)

    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'E-mail or password is incorrect.'
        : err.message
      )
      setLoading(false)
    }
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
        <Button size="sm" variant="ghost" onClick={() => onNavigate(SCREENS.SIGNUP.id)}>
          Criar uma conta
        </Button>
      </header>

      <main className={s.authMain}>
        <div className={s.authCard}>
          <div className={s.authCardIcon}>🔑</div>
          <h1 className={s.authCardTitle}>Bem vindo de volta</h1>
          <p className={s.authCardSubtitle}>Faça login na sua conta MedTrack.</p>

          <div className={s.formStack}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu_email@exemplo.com"
              {...bind('email')}
            />

            <PasswordInput
              label="Senha"
              placeholder="Sua senha"
              forgotPassword={{
                onClick: () => onNavigate(SCREENS.FORGOT_PASSWORD.id),
                label: 'Esqueceu a senha?',
              }}
              {...bind('password')}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--blue-600)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: 'var(--slate-600)' }}>
                Manter-me conectado
              </span>
            </label>

            {/* Error message */}
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
              onClick={handleSignIn}
            >
              {loading ? 'Signing in…' : 'Entrar →'}
            </Button>

            <div className={s.divider}>or</div>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)' }}>
              Não tem uma conta?{' '}
              <a className={s.authLink} onClick={() => onNavigate(SCREENS.SIGNUP.id)}>
                Crie uma conta.
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
