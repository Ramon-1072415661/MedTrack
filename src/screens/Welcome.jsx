// src/screens/Welcome.jsx
import { Button } from '../components/index.jsx'
import { SCREENS } from '../config/screens.js'
import s from './screens.module.css'

function AuthHeader({ action }) {
  return (
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
      {action}
    </header>
  )
}

export function Welcome({ onNavigate }) {
  return (
    <div className={s.authPage}>
      <AuthHeader action={<Button size="sm" variant="ghost" onClick={() => onNavigate(SCREENS.LOGIN.id)}>Entrar</Button>} />
      <main className={s.authMain}>
        <div className={s.welcomeGrid}>

          {/* Value prop */}
          <section className={s.welcomeHero}>
            <div className={s.welcomeBadge}>
              <span className={s.welcomeBadgeDot} />
              <span>Sua saúde, simplificada</span>
            </div>

            <h1 className={s.welcomeTitle}>
              Mantenha sua rotina de{' '}
              <span style={{ color: 'var(--blue-600)' }}>medicação</span>{' '}
              em dia.
            </h1>

            <p className={s.welcomeDesc}>
              Nunca mais perca uma dose. Monitore suas prescrições,
              receba lembretes oportunos e compartilhe seu progresso com sua equipe de saúde — tudo em uma plataforma segura.
            </p>

            <div className={s.welcomeFeatures}>
              {[
                { icon: '✓', title: 'Lembretes inteligentes', desc: 'Alertas personalizados que se adaptam à sua rotina.' },
                { icon: '🛡', title: 'Seguro e privado', desc: 'Em conformidade com a HIPAA. Seus dados permanecem seus.' },
              ].map(f => (
                <div key={f.title} className={s.welcomeFeatureRow}>
                  <div className={s.welcomeFeatureIcon}>{f.icon}</div>
                  <div>
                    <p className={s.welcomeFeatureTitle}>{f.title}</p>
                    <p className={s.welcomeFeatureDesc}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Auth card */}
          <div className={s.authCard}>
            <div className={s.authCardIcon}>💊</div>
            <h2 className={s.authCardTitle}>Bem vindo de volta</h2>
            <p className={s.authCardSubtitle}>Continue sua jornada de bem-estar.</p>
            <div className={s.formStack}>
              <Button size="lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigate(SCREENS.LOGIN.id)}>
                Continuar com o E-mail
              </Button>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                É novo no MedTrack?{' '}
                <a className={s.authLink} onClick={() => onNavigate(SCREENS.SIGNUP.id)}>
                  Crie uma conta.
                </a>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Welcome
