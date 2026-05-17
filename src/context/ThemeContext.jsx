import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_COLORS = [
    { id: 'emerald', name: 'Emerald', value: '#10b981', label: 'Verde' },
    { id: 'blue', name: 'Blue', value: '#3b82f6', label: 'Azul' },
    { id: 'purple', name: 'Purple', value: '#8b5cf6', label: 'Morado' },
    { id: 'rose', name: 'Rose', value: '#f43f5e', label: 'Rosa' },
];

const ThemeContext = createContext();

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
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        document.documentElement.style.setProperty('--primary', accentColor.value);
        document.documentElement.style.setProperty('--primary-glow', hexToRgba(accentColor.value, 0.4));
        const r = parseInt(accentColor.value.slice(1, 3), 16);
        const g = parseInt(accentColor.value.slice(3, 5), 16);
        const b = parseInt(accentColor.value.slice(5, 7), 16);
        document.documentElement.style.setProperty('--secondary', `rgba(${Math.round(r * 0.4)}, ${Math.round(g * 0.4)}, ${Math.round(b * 0.4)}, 1)`);
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
