// src/services/profileService.js

import { supabase } from '../lib/supabaseClient'

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

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
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: values.full_name,
      phone: values.phone,
      date_of_birth: values.date_of_birth,
      blood_type: values.blood_type,
      allergies: values.allergies,
    })
    .select()
    .single()

  if (error) {
    console.error('updateProfile error:', error)
    throw error
  }
  return data
}