import React from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ColorPicker from '../components/ColorPicker';

export default function Personalization() {
    const { mode, toggleMode, isDark, accentColor, setAccentColor } = useTheme();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-acid/10 text-acid">
                    <Palette size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>Personalización</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Ajusta la apariencia de tu dashboard.</p>
                </div>
            </div>

            {/* Theme Mode Toggle */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-noise pointer-events-none" style={{ opacity: 'var(--noise-opacity)' }} />
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Modo de apariencia</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Elige entre modo claro y oscuro.</p>

                    <div className="flex gap-4">
                        {/* Dark Mode */}
                        <button
                            onClick={() => !isDark && toggleMode()}
                            className={`flex-1 flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 group ${
                                isDark 
                                    ? 'border-acid bg-acid/5' 
                                    : 'border-transparent hover:border-white/10'
                            }`}
                            style={{ backgroundColor: isDark ? undefined : 'var(--bg-input)' }}
                        >
                            {/* Mini preview - Dark */}
                            <div className="w-full aspect-video rounded-xl overflow-hidden border relative" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#0a0a0a' }}>
                                <div className="absolute top-2 left-2 w-8 h-full rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                <div className="absolute top-2 left-12 right-2 h-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                <div className="absolute top-7 left-12 right-2 bottom-2 grid grid-cols-3 gap-1 p-1">
                                    <div className="rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                    <div className="rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                    <div className="rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Moon size={18} className={isDark ? 'text-acid' : ''} style={{ color: isDark ? undefined : 'var(--text-muted)' }} />
                                <span className="font-bold text-sm" style={{ color: isDark ? 'var(--text-primary)' : 'var(--text-muted)' }}>Oscuro</span>
                            </div>
                            {isDark && (
                                <span className="text-[10px] font-bold text-acid uppercase tracking-widest">Activo</span>
                            )}
                        </button>

                        {/* Light Mode */}
                        <button
                            onClick={() => isDark && toggleMode()}
                            className={`flex-1 flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 group ${
                                !isDark 
                                    ? 'border-acid bg-acid/5' 
                                    : 'border-transparent hover:border-white/10'
                            }`}
                            style={{ backgroundColor: !isDark ? undefined : 'var(--bg-input)' }}
                        >
                            {/* Mini preview - Light */}
                            <div className="w-full aspect-video rounded-xl overflow-hidden border relative" style={{ borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#f5f5f7' }}>
                                <div className="absolute top-2 left-2 w-8 h-full bg-white rounded border" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                                <div className="absolute top-2 left-12 right-2 h-3 bg-white rounded border" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                                <div className="absolute top-7 left-12 right-2 bottom-2 grid grid-cols-3 gap-1 p-1">
                                    <div className="bg-white rounded border" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                                    <div className="bg-white rounded border" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                                    <div className="bg-white rounded border" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sun size={18} className={!isDark ? 'text-acid' : ''} style={{ color: !isDark ? undefined : 'var(--text-muted)' }} />
                                <span className="font-bold text-sm" style={{ color: !isDark ? 'var(--text-primary)' : 'var(--text-muted)' }}>Claro</span>
                            </div>
                            {!isDark && (
                                <span className="text-[10px] font-bold text-acid uppercase tracking-widest">Activo</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Accent Color */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-noise pointer-events-none" style={{ opacity: 'var(--noise-opacity)' }} />
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Color de acento</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Personaliza el color principal de la interfaz.</p>
                    
                    <div className="flex items-center gap-3">
                        <ColorPicker
                            selectedColor={accentColor.value}
                            onChange={(hex) => setAccentColor({ value: hex, name: 'Custom' })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
