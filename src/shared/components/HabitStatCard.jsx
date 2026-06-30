import React from 'react';

// Card de resumen (estilo "glow") — distinta a StatCard del Dashboard/Billetera.
// Reutilizable: pásale label, value (parte de color), suffix (parte blanca), color e icon.
// Colores soportados: 'blue' | 'green' | 'red'. Fácil de extender abajo.
const COLORS = {
    blue:  { text: 'text-blue-500', iconBg: 'bg-blue-500/10', iconText: 'text-blue-500', glow: 'from-blue-500/20',  hover: 'glass-card-hover-blue' },
    green: { text: 'text-green-500', iconBg: 'bg-green-500/10', iconText: 'text-green-500', glow: 'from-green-500/25', hover: 'glass-card-hover-green' },
    red:   { text: 'text-red-500',  iconBg: 'bg-red-500/10',  iconText: 'text-red-500',   glow: 'from-red-500/20',   hover: 'glass-card-hover-red' },
};

export default function HabitStatCard({ label, value, suffix, color = 'blue', icon: Icon }) {
    const c = COLORS[color] || COLORS.blue;
    return (
        <div className={`glass-card ${c.hover} p-6 flex items-center justify-between gap-4 border border-white/5 bg-[#050505]/40 backdrop-blur-xl transition-colors relative overflow-hidden group`}>
            {/* Glow de color (consistente en las 3) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${c.glow} via-transparent to-transparent pointer-events-none`} />

            <div className="relative z-10 min-w-0 flex-1">
                <p className="text-text-muted text-[11px] uppercase tracking-wider font-bold leading-none mb-2.5">{label}</p>
                {/* leading-[1.15] + py para que la fuente no se recorte arriba/abajo */}
                <div className="flex items-baseline gap-2 min-w-0">
                    <span className={`text-[30px] font-bold ${c.text} tracking-tight leading-[1.15] shrink-0`}>{value}</span>
                    <span className="text-[30px] font-bold text-white tracking-tight leading-[1.15] truncate">{suffix}</span>
                </div>
            </div>

            <div className={`p-4 ${c.iconBg} rounded-2xl ${c.iconText} relative z-10 shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                {Icon && <Icon size={28} />}
            </div>
        </div>
    );
}
