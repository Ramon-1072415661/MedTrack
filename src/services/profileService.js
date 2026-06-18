// src/services/profileService.js
import { supabase } from '../lib/supabaseClient'

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // Fallback: tenta por id se user_id não encontrar
  if (!error && !data) {
    const { data: d2, error: e2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (e2) throw e2
    return d2
  }

  if (error) throw error
  return data
}

export async function createProfile({ id, full_name }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id, full_name })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId, values) {
  // Primeiro busca o perfil para pegar o id correto da linha
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const profileId = existing?.id ?? userId

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name:         values.full_name,
      phone:             values.phone,
      date_of_birth:     values.date_of_birth,
      blood_type:        values.blood_type,
      allergies:         values.allergies,
      emergency_contact: values.emergency_contact ?? null,
    })
    .eq('id', profileId)
    .select()
    .single()

  if (error) {
    console.error('updateProfile error:', error)
    throw error
  }
  return data
}