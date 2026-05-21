// src/hooks/useToggle.js

import { useState, useCallback } from 'react'

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn(v => !v), [])
  return [on, toggle, setOn]
}