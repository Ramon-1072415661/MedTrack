import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AppShell from './components/AppShell.jsx'

import { Profile, Welcome, Login, SignUp, ForgotPassword, Inventory, Notifications, Dashboard } from './screens/index.js'
import { SCREENS, APP_SCREENS_SET } from './config/screens.js'
import { fetchMedicamentos, fetchTodayLogs } from './services/medicamentoService.js'

// Verifica se um horário já passou
function hourPassed(timeStr) {
  if (!timeStr) return false
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
}

// Gera IDs de notificações com a mesma lógica do Notifications.jsx
function buildNotifications(medications, todayLogs) {
  const notifications = []
  const now = new Date()
  for (const med of medications) {
    if (!med.active) continue
    const taken = todayLogs.some(l => l.med_id === med.id && l.was_taken)
    if (!taken) {
      if (med.frequency === 'daily') {
        const times = med.scheduleTimes ?? ['08:00']
        for (const t of times) {
          if (hourPassed(t)) notifications.push({ id: `reminder-${med.id}-${t}`, unread: true })
        }
      } else if (med.frequency === 'hourly') {
        notifications.push({ id: `reminder-${med.id}-hourly`, unread: true })
      }
      if (now.getHours() >= 12) {
        const hasReminder = notifications.some(n => n.id.startsWith(`reminder-${med.id}`))
        if (!hasReminder) notifications.push({ id: `missed-${med.id}`, unread: true })
      }
    }
    if (med.quantity && parseInt(med.quantity) === 0) {
      notifications.push({ id: `out-of-stock-${med.id}`, unread: true })
    } else if (med.quantity && parseInt(med.quantity) <= 5) {
      notifications.push({ id: `stock-${med.id}`, unread: true })
    }
  }
  return notifications
}

export default function App() {
  const { user, profile } = useAuth()
  const [screen, setScreen] = useState(SCREENS.WELCOME.id)
  const [unreadCount, setUnreadCount] = useState(0)

  const profileId = profile?.id ?? user?.id

  // Atualiza badge de notificações a cada minuto
  const refreshUnread = useCallback(async () => {
    if (!profileId) return
    try {
      const [meds, logs] = await Promise.all([
        fetchMedicamentos(profileId),
        fetchTodayLogs(profileId).catch(() => []),
      ])
      // Desconta notificações já lidas pelo usuário
      let readIds = new Set()
      try {
        const saved = localStorage.getItem('notif_read_ids')
        if (saved) readIds = new Set(JSON.parse(saved))
      } catch {}
      const allNotifs = buildNotifications(meds, logs)
      const unread = allNotifs.filter(n => n.unread && !readIds.has(n.id))
      setUnreadCount(unread.length)
    } catch {}
  }, [profileId])

  useEffect(() => {
    if (!user) {
      setScreen(SCREENS.WELCOME.id)
      setUnreadCount(0)
      return
    }
    setScreen(SCREENS.DASHBOARD.id)
  }, [user])

  useEffect(() => {
    if (!profileId) return
    refreshUnread()
    const interval = setInterval(refreshUnread, 60_000) // checa a cada 1 min
    return () => clearInterval(interval)
  }, [refreshUnread])

  const navigate = (id) => setScreen(id)

  if (!user) {
    const authScreens = {
      welcome: <Welcome onNavigate={navigate} />,
      login: <Login onNavigate={navigate} />,
      signup: <SignUp onNavigate={navigate} />,
      forgotPassword: <ForgotPassword onNavigate={navigate} />,
    }
    return authScreens[screen] ?? <Welcome onNavigate={navigate} />
  }

  const activeScreen = APP_SCREENS_SET.has(screen) ? screen : SCREENS.DASHBOARD.id
  const appScreens = {
    profile: <Profile onNavigate={navigate} />,
    inventory: <Inventory onNavigate={navigate} />,
    notifications: <Notifications onNavigate={navigate} onAllRead={() => setUnreadCount(0)} />,
    dashboard: <Dashboard onNavigate={navigate} />,
  }

  return (
    <AppShell current={activeScreen} onNavigate={navigate} unreadCount={unreadCount}>
      {appScreens[activeScreen]}
    </AppShell>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)