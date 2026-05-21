// src/services/authService.js

import { supabase } from '../lib/supabaseClient'
import { APP_URL } from '../config/env'
import { createProfile } from './profileService'

export async function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function signUp(
  email,
  password,
  fullName
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    })

  if (error) {
    throw error
  }

  const user = data.user

  if (user) {
    await createProfile({
      id: user.id,
      full_name: fullName,
    })
  }

  return data
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${APP_URL}/reset-password`,
    }
  )
}

export async function updatePassword(password) {
  return supabase.auth.updateUser({
    password,
  })
}

export async function deleteAccount() {
  const { error } = await supabase.functions.invoke('delete-account')

  if (error) throw error

  await supabase.auth.signOut()
}