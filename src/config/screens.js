// src/config/screens.js

export const SCREENS = {
  // Auth
  WELCOME:         { id: 'welcome',        label: 'Welcome',       auth: false },
  LOGIN:           { id: 'login',          label: 'Sign In',          auth: false },
  SIGNUP:          { id: 'signup',         label: 'Create Account',     auth: false },
  FORGOT_PASSWORD: { id: 'forgotPassword', label: 'Forgot Password', auth: false },

  // App
  DASHBOARD:       { id: 'dashboard',       label: 'Dashboard',      auth: true, icon: '◉' },
  HEALTH:          { id: 'healthDashboard', label: 'Health View',    auth: true, icon: '♡' },
  INVENTORY:       { id: 'inventory',       label: 'Inventory',      auth: true, icon: '⊡' },
  NOTIFICATIONS:   { id: 'notifications',   label: 'Notifications',  auth: true, icon: '◇', badge: true },
  PROFILE:         { id: 'profile',         label: 'Profile',        auth: true, icon: '⊙' },
}

// Screens that are displayed within the AppShell
export const APP_SCREENS = Object.values(SCREENS)
  .filter(s => s.auth)
  .map(s => s.id)

export const APP_SCREENS_SET = new Set(APP_SCREENS)

// Side navigation (with icon)
export const NAV_SCREENS = Object.values(SCREENS).filter(s => s.auth)