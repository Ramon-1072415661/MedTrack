// src/hooks/useSnackbar.js

import { useState, useCallback } from 'react'

export function useSnackbar(duration = 3000) {
    const [snackbar, setSnackbar] = useState({ message: '', type: 'success' })

    const show = useCallback((message, type = 'success') => {
        setSnackbar({ message, type })
        setTimeout(() => setSnackbar({ message: '', type: 'success' }), duration)
    }, [duration])

    return { snackbar, show }
}