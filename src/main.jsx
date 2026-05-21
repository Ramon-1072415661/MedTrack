// src/main.jsx
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AppShell from './components/AppShell.jsx'

import { Profile, Welcome, Login, SignUp, ForgotPassword } from './screens/index.js'
import { SCREENS, APP_SCREENS_SET } from './config/screens.js'

export default function App() {
  const { user } = useAuth()
  const [screen, setScreen] = useState(SCREENS.WELCOME.id)

  const navigate = (id) => setScreen(id)

  // If user is not authenticated, show auth screens
  if (!user) {
    const authScreens = {
      welcome: <Welcome onNavigate={navigate} />,
      login: <Login onNavigate={navigate} />,
      signup: <SignUp onNavigate={navigate} />,
      forgotPassword: <ForgotPassword onNavigate={navigate} />,
    }
    return authScreens[screen] ?? <Welcome onNavigate={navigate} />
  }

  // If user is authenticated — protected screens within the AppShell
  // Fallback screen must be changed to dashboard when it's implemented
  const activeScreen = APP_SCREENS_SET.has(screen) ? screen : SCREENS.PROFILE.id
  const appScreens = {
    profile: <Profile onNavigate={navigate} />,
  }

  return (
    <AppShell current={activeScreen} onNavigate={navigate} unreadCount={0}>
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
