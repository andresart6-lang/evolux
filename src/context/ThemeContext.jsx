import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_COLORS = [
    { id: 'emerald', name: 'Emerald', value: '#10b981', label: 'Verde' },
    { id: 'blue', name: 'Blue', value: '#3b82f6', label: 'Azul' },
    { id: 'purple', name: 'Purple', value: '#8b5cf6', label: 'Morado' },
    { id: 'rose', name: 'Rose', value: '#f43f5e', label: 'Rosa' },
];

export function ThemeProvider({ children }) {
    const [accentColor, setAccentColor] = useState(THEME_COLORS[0]);
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('app_theme_mode') || 'dark';
    });

    const toggleMode = () => {
        setMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const isDark = mode === 'dark';

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', accentColor.value);
        document.documentElement.style.setProperty('--primary-glow', `${accentColor.value}40`);
        document.documentElement.style.setProperty('--secondary', `color-mix(in srgb, ${accentColor.value} 40%, black)`);
    }, [accentColor]);

    useEffect(() => {
        localStorage.setItem('app_theme_mode', mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ accentColor, setAccentColor, mode, setMode, toggleMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
