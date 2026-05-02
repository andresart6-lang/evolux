import React, { useState } from 'react';
import { User, Settings, Bell, Pencil, X, Check, Ban } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder avatars - User should add images to public/assets/avatars/
const AVAILABLE_AVATARS = [
    '/assets/avatars/avatar1.png',
    '/assets/avatars/avatar2.png',
    '/assets/avatars/avatar3.png',
    '/assets/avatars/avatar4.png',
    '/assets/avatars/avatar5.png',
    '/assets/avatars/avatar6.png',
];

export default function Profile() {
    const { user, updateName, updateAvatar } = useUser();
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [nameInput, setNameInput] = useState(user.name);

    const handleNameChange = (e) => {
        setNameInput(e.target.value);
        updateName(e.target.value);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                {/* Avatar with Hover Effect */}
                <div
                    className="relative group cursor-pointer"
                    onClick={() => setIsEditingAvatar(true)}
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-acid to-forest flex items-center justify-center shadow-lg shadow-acid/20 overflow-hidden transition-all duration-300 group-hover:grayscale">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover transition-all duration-300 group-hover:grayscale" />
                        ) : (
                            <span className="text-5xl font-bold text-black font-display">{user.name.charAt(0)}</span>
                        )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        {/* Pencil Icon with Gradient - Cleaned up */}
                        <svg width="0" height="0">
                            <linearGradient id="pencilGradient" x1="100%" y1="100%" x2="0%" y2="0%">
                                <stop stopColor="#bef264" offset="0%" />
                                <stop stopColor="#10b981" offset="100%" />
                            </linearGradient>
                        </svg>
                        <Pencil size={32} style={{ stroke: 'url(#pencilGradient)' }} strokeWidth={2.5} />
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-white font-display">Perfil de Usuario</h1>
                    <p className="text-text-muted">Gestiona tu identidad y preferencias.</p>
                </div>
            </div>

            {/* Avatar Selection Modal */}
            <AnimatePresence>
                {isEditingAvatar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditingAvatar(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl glass-card"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Elige tu Avatar</h3>
                                <button onClick={() => setIsEditingAvatar(false)} className="text-text-muted hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {/* Option: No Image (Ban Icon) */}
                                <button
                                    onClick={() => { updateAvatar(null); setIsEditingAvatar(false); }}
                                    className={`aspect-square rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all group ${!user.avatar ? 'ring-4 ring-white border-transparent' : ''}`}
                                    title="Sin imagen (Usar inicial)"
                                >
                                    <Ban size={32} className="transition-transform group-hover:scale-110" />
                                </button>

                                {/* Placeholder Image Options */}
                                {/* In a real app, we would map over scanned files. For now, showing placeholders. */}
                                {AVAILABLE_AVATARS.map((src, index) => (
                                    <button
                                        key={index}
                                        onClick={() => { updateAvatar(src); setIsEditingAvatar(false); }}
                                        className={`aspect-square rounded-full bg-white/5 overflow-hidden hover:scale-105 transition-transform relative ${user.avatar === src ? 'ring-4 ring-acid' : ''}`}
                                    >
                                        <div className="w-full h-full flex items-center justify-center text-xs text-text-muted bg-neutral-800">
                                            {/* Placeholder UI if image fails */}
                                            IMG {index + 1}
                                            <img src={src} alt={`Avatar ${index}`} className="absolute inset-0 w-full h-full object-cover opacity-100" onError={(e) => e.target.style.display = 'none'} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-center text-text-muted">
                                Coloca tus imágenes en <code className="bg-white/10 px-1 rounded">public/assets/avatars/</code>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Grid */}
            <div className="grid gap-6">

                {/* Personal Info */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="text-acid" size={24} />
                        <h2 className="text-xl font-bold text-white">Información Personal</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Nombre Completo</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={handleNameChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/50 transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-acid pointer-events-none opacity-50">
                                    <Pencil size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Correo Electrónico</label>
                            <input type="email" value={user.email} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-muted focus:outline-none focus:border-white/20 transition-colors cursor-not-allowed" readOnly />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Plan Actual</label>
                            <div className="w-full bg-gradient-to-r from-acid/10 to-transparent border border-acid/20 rounded-xl px-4 py-3 text-acid font-bold flex items-center justify-between">
                                <span>{user.plan}</span>
                                <span className="text-xs bg-acid text-black px-2 py-1 rounded-lg">ACTIVO</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-acid/20 text-white group-hover:text-acid transition-colors">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Configuración General</h3>
                                <p className="text-sm text-text-muted">Idioma, región y moneda.</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-acid/20 text-white group-hover:text-acid transition-colors">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Notificaciones</h3>
                                <p className="text-sm text-text-muted">Alertas de gastos y metas.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
