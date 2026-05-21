// src/hooks/useForm.js

import { useState, useCallback } from 'react'

export function useForm(initial) {
  const [values, setValues] = useState(initial)
  const set = useCallback((key, value) => setValues(prev => ({ ...prev, [key]: value })), [])
  const bind = (key) => ({ value: values[key], onChange: e => set(key, e.target.value) })
  return { values, set, bind, setValues, reset: () => setValues(initial) }
}