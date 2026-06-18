// src/config/screens.js

export const SCREENS = {
  // Auth
  WELCOME:         { id: 'welcome',        label: 'Welcome',       auth: false },
  LOGIN:           { id: 'login',          label: 'Entrar',          auth: false },
  SIGNUP:          { id: 'signup',         label: 'Criar Conta',     auth: false },
  FORGOT_PASSWORD: { id: 'forgotPassword', label: 'Esqueceu a Senha', auth: false },

  // App
  DASHBOARD:       { id: 'dashboard',       label: 'Dashboard',      auth: true, icon: '◉' },
  INVENTORY:       { id: 'inventory',       label: 'Inventário',      auth: true, icon: '⊡' },
  NOTIFICATIONS:   { id: 'notifications',   label: 'Notificações',  auth: true, icon: '◇', badge: true },
  PROFILE:         { id: 'profile',         label: 'Perfil',        auth: true, icon: '⊙' },
}

// Screens that are displayed within the AppShell
export const APP_SCREENS = Object.values(SCREENS)
  .filter(s => s.auth)
  .map(s => s.id)

export const APP_SCREENS_SET = new Set(APP_SCREENS)

// Side navigation (with icon)
export const NAV_SCREENS = Object.values(SCREENS).filter(s => s.auth)