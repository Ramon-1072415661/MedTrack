// src/hooks/useTheme.js
import { useEffect, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggleTheme: () => setDark(v => !v) }
}