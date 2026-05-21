// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { fetchProfile, updateProfile as updateProfileService } from '../services/profileService'
import * as authService from '../services/authService'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    try {
      const data = await fetchProfile(userId)
      setProfile(data)
    } catch (err) {
      console.error('fetchProfile:', err)
      setProfile(null)

      // Permission Error — signout user to avoid unauthenticated access
      if (err?.code === '42501') {
        await authService.signOut()
      }
    }
  }

  useEffect(() => {
    authService.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)

      if (currentUser) loadProfile(currentUser.id)
    })

    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          loadProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, fullName) {
    return authService.signUp(email, password, fullName)
  }

  async function signIn(email, password) {
    return authService.signIn(email, password)
  }

  async function signOut() {
    return authService.signOut()
  }

  async function resetPassword(email) {
    return authService.resetPassword(email)
  }

  async function updatePassword(password) {
    return authService.updatePassword(password)
  }

  async function deleteAccount() {
    return authService.deleteAccount()
  }

  async function updateProfile(values) {
    if (!user) return
    const updated = await updateProfileService(user.id, values)
    setProfile(updated)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, setProfile, loading,
      signUp, signIn, signOut, deleteAccount,
      resetPassword, updatePassword, updateProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)