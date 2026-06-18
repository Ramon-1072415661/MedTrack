// src/screens/SignUp.jsx
import { useState } from 'react'
import { Button, Input, PasswordInput } from '../components/index.jsx'
import { useForm } from '../hooks/useForm.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { SCREENS } from '../config/screens.js'
import s from './screens.module.css'

export default function SignUp({ onNavigate }) {
  const { bind, values } = useForm({ email: '', password: '', confirm: '', fullName: '' })
  const { signUp } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSignUp() {
    setError(null)

    if (values.password !== values.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (values.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (values.password.length > 72) {
      setError('Password must be at most 72 characters.')
      return
    }

    setLoading(true)

    try {
      await signUp(values.email, values.password, values.fullName)
      setSuccess(true)
    } catch (err) {
      setError("Could not create account. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={s.authPage}>
        <main className={s.authMain}>
          <div className={s.authCard} style={{ textAlign: 'center' }}>
            <div className={s.authCardIcon}>📧</div>
            <h1 className={s.authCardTitle}>Check Your Email</h1>
            <p className={s.authCardSubtitle}>
              We've sent a confirmation link to <strong>{values.email}</strong>.
              Click it to activate your account.
            </p>
            <Button
              variant="ghost"
              style={{ marginTop: 16 }}
              onClick={() => onNavigate(SCREENS.LOGIN.id)}
            >
              Back to Login
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
          Already have an account?
        </Button>
      </header>

      <main className={s.authMain}>
        <div className={s.authCard}>
          <div className={s.authCardIcon}>✨</div>
          <h1 className={s.authCardTitle}>Create Account</h1>
          <p className={s.authCardSubtitle}>Start monitoring your medications</p>

          <div className={s.formStack}>
            <Input
              label="E-mail"
              type="email"
              placeholder="your-email@example.com"
              {...bind('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Minimum 6 characters"
              {...bind('password')}
            />

            <Input
              label="Full name"
              placeholder="Your full name"
              {...bind('fullName')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Repeat the password"
              {...bind('confirm')}
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
              onClick={handleSignUp}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </Button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)' }}>
              Already have an account?{' '}
              <a className={s.authLink} onClick={() => onNavigate(SCREENS.LOGIN.id)}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
