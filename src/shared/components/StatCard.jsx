import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, amount, trend, icon: Icon, variant = 'glass', colorTheme = 'green', trendColor, trendBg }) => {
    // Theme Colors (Restored Original Gradients)
    const themes = {
        green: {
            bg: 'bg-gradient-to-br from-[#bef264] to-[#022c22]',
            text: 'text-[#bef264]',
            glowColor: 'bg-[#bef264]', // Specific color for the hover glow
            darkShadow: 'rgba(2, 44, 34, 0.9)', // emerald-950
            border: 'border-[#bef264]/50',
            hover: 'glass-card-hover-green'
        },
        red: {
            bg: 'bg-gradient-to-br from-red-500/80 to-red-950',
            text: 'text-red-400',
            glowColor: 'bg-red-500',
            darkShadow: 'rgba(69, 10, 10, 0.9)', // red-950
            border: 'border-red-400/50',
            hover: 'glass-card-hover-red'
        },
        blue: {
            bg: 'bg-gradient-to-br from-blue-400/80 to-blue-950',
            text: 'text-blue-400',
            glowColor: 'bg-blue-400',
            darkShadow: 'rgba(23, 37, 84, 0.9)', // blue-950
            border: 'border-blue-400/50',
            hover: 'glass-card-hover-blue'
        },
        orange: {
            bg: 'bg-gradient-to-br from-orange-400/80 to-orange-950',
            text: 'text-orange-400',
            glowColor: 'bg-orange-400', // Matches the reference image style
            darkShadow: 'rgba(67, 20, 7, 0.9)', // orange-950
            border: 'border-orange-400/50',
            hover: 'glass-card-hover-orange'
        }
    };

    const theme = themes[colorTheme] || themes.green;
    const isFilled = variant === 'filled';

    return (
        <div
            className={`relative overflow-hidden group transition-all duration-300 p-6 rounded-2xl hover:scale-[0.96] isolate
            ${isFilled
                    ? `${theme.bg} shadow-lg text-white keep-white`
                    : `glass-card border border-white/5 hover:border-white/10 ${theme.hover}`
                }
            `}
            style={{ WebkitMaskImage: 'radial-gradient(white, black)', maskImage: 'radial-gradient(white, black)' }}
        >

            {/* HOVER GLOW EFFECT (Left Side + Top/Bottom Spread) */}
            <div className={`absolute -left-20 -top-20 -bottom-20 w-40 ${theme.glowColor} blur-[50px] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none mix-blend-screen rounded-l-3xl`}></div>

            {/* INNER DARK SHADOW (On Hover - Short Spread) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ boxShadow: `inset 0 0 40px 10px ${theme.darkShadow}` }}
            ></div>

            {/* Background Icon (Common) */}
            <div className={`absolute top-0 right-0 p-6 transition-opacity ${isFilled ? 'opacity-10 group-hover:opacity-20 text-black mix-blend-overlay' : 'opacity-5 group-hover:opacity-10 text-white'}`}>
                <Icon size={80} />
            </div>

            {/* Mesh / Noise texture for Filled variant only (Visual Polish) */}
            {isFilled && (
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            )}

            <div className="relative z-10 p-2">
                <h3 className={`text-sm font-medium uppercase tracking-widest mb-1 ${isFilled ? 'text-white/80' : 'text-text-muted'}`}>{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl lg:text-4xl font-bold font-number ${isFilled ? 'text-white drop-shadow-md' : 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'}`}>{amount}</span>
                </div>

                {/* Trend Section */}
                <div className={`flex items-center gap-2 text-sm mt-4 font-medium ${isFilled ? 'text-white/90' : (trendColor || (trend > 0 ? 'text-acid' : 'text-red-400'))}`}>
                    <div className={`p-1 rounded-full ${isFilled ? 'bg-white/20 backdrop-blur-sm' : (trendBg || (trend > 0 ? 'bg-acid/10' : 'bg-red-400/10'))}`}>
                        {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <span>{Math.abs(trend)}% vs mes anterior</span>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
