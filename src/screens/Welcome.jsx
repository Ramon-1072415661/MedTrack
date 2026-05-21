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
      <AuthHeader action={<Button size="sm" variant="ghost" onClick={() => onNavigate(SCREENS.LOGIN.id)}>Sign in</Button>} />
      <main className={s.authMain}>
        <div className={s.welcomeGrid}>

          {/* Value prop */}
          <section className={s.welcomeHero}>
            <div className={s.welcomeBadge}>
              <span className={s.welcomeBadgeDot} />
              <span>Your Health, Simplified</span>
            </div>

            <h1 className={s.welcomeTitle}>
              Stay on top of your{' '}
              <span style={{ color: 'var(--blue-600)' }}>medication</span>{' '}
              routine.
            </h1>

            <p className={s.welcomeDesc}>
              Never miss a dose again. Track prescriptions, get timely reminders,
              and share progress with your care team — in one secure platform.
            </p>

            <div className={s.welcomeFeatures}>
              {[
                { icon: '✓', title: 'Smart Reminders', desc: 'Personalized alerts that adapt to your schedule.' },
                { icon: '🛡', title: 'Secure & Private', desc: 'HIPAA compliant. Your data stays yours.' },
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
            <h2 className={s.authCardTitle}>Welcome Back</h2>
            <p className={s.authCardSubtitle}>Continue your wellness journey</p>
            <div className={s.formStack}>
              <Button size="lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigate(SCREENS.LOGIN.id)}>
                Continue with Email
              </Button>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                New to MedTrack?{' '}
                <a className={s.authLink} onClick={() => onNavigate(SCREENS.SIGNUP.id)}>
                  Create an account
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
