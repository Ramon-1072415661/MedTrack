// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not found.\n' +
    'Create a .env file in the root of the project with these values.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

