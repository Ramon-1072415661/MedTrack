// src/components/AppShell.jsx
import { useAuth } from '../contexts/AuthContext.jsx'
import { NAV_SCREENS } from '../config/screens.js'
import shell from './AppShell.module.css'

export default function AppShell({ current, onNavigate, children, unreadCount = 0 }) {
  const { user, signOut } = useAuth()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'
  const displayEmail = user?.email ?? ''

  return (
    <div className={shell.shell}>
      {/* Sidebar — desktop */}
      <aside className={shell.sidebar}>
        <div className={shell.logo}>
          <div className={shell.logoMark}>
            <img
              src="/logo_mono_light.png"
              alt="MedTrack logo"
              className={shell.logoImage}
            />
          </div>
          <span className={shell.logoText}>MedTrack</span>
        </div>

        <nav className={shell.nav}>
          {NAV_SCREENS.map(({ id, label, icon, badge }) => (
            <button
              key={id}
              className={`${shell.navItem} ${current === id ? shell.navActive : ''}`}
              onClick={() => onNavigate(id)}
            >
              <span className={shell.navIcon}>{icon}</span>
              <span className={shell.navLabel}>{label}</span>
              {badge && unreadCount > 0 && (
                <span className={shell.navBadge}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={shell.sidebarUser}>
          <div className={shell.avatar}>{initials}</div>
          <div className={shell.userInfo}>
            <span className={shell.userName} title={displayEmail}>
              {displayEmail.split('@')[0]}
            </span>
            <button onClick={signOut} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--slate-400)', padding: 0, textAlign: 'left',
            }}>
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Bottom bar — mobile */}
      <nav className={shell.bottomBar}>
        {NAV_SCREENS.map(({ id, label, icon, badge }) => (
          <button
            key={id}
            className={`${shell.bottomBarItem} ${current === id ? shell.bottomBarActive : ''}`}
            onClick={() => onNavigate(id)}
          >
            <span className={shell.bottomBarIcon}>{icon}</span>
            <span>{label}</span>
            {badge && unreadCount > 0 && (
              <span className={shell.bottomBarBadge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <main className={shell.main}>{children}</main>
    </div>
  )
}