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
      setError('As senhas não coincidem.')
      return
    }
    if (values.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (values.password.length > 72) {
      setError('A senha deve ter no máximo 72 caracteres.')
      return
    }

    setLoading(true)

    try {
      await signUp(values.email, values.password, values.fullName)
      setSuccess(true)
    } catch (err) {
      setError("Não foi possível criar a conta. Tente novamente.")
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
            <h1 className={s.authCardTitle}>Verifique seu Email</h1>
            <p className={s.authCardSubtitle}>
              Enviamos um link de confirmação para <strong>{values.email}</strong>.
              Clique nele para ativar sua conta.
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
          Já tem uma conta?
        </Button>
      </header>

      <main className={s.authMain}>
        <div className={s.authCard}>
          <div className={s.authCardIcon}>✨</div>
          <h1 className={s.authCardTitle}>Criar Conta</h1>
          <p className={s.authCardSubtitle}>Comece a monitorar seus medicamentos.</p>

          <div className={s.formStack}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu-email@exemplo.com"
              {...bind('email')}
            />

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              {...bind('password')}
            />

            <Input
              label="Nome completo"
              placeholder="Seu nome completo"
              {...bind('fullName')}
            />

            <PasswordInput
              label="Confirme sua senha"
              placeholder="Repita a senha"
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
              {loading ? 'Criando conta…' : 'Criar conta →'}
            </Button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)' }}>
              Já tem uma conta?{' '}
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
