'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => {},
})

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null
        if (stored === 'light' || stored === 'dark') {
            setTheme(stored)
            document.documentElement.setAttribute('data-theme', stored)
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const initial: Theme = prefersDark ? 'dark' : 'light'
            setTheme(initial)
            document.documentElement.setAttribute('data-theme', initial)
        }
    }, [])

    const toggleTheme = () => {
        setTheme((prev) => {
            const next: Theme = prev === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', next)
            document.documentElement.setAttribute('data-theme', next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
