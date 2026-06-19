import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function DatePickerInput({ value, onChange, placeholder = 'Seleccionar fecha' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(() => value ? new Date(value) : null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setViewDate(date);
            setSelectedDate(date);
        }
    }, [value]);

    const monthDays = () => {
        const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    const handleDayClick = (day) => {
        setSelectedDate(day);
        onChange(day.toISOString());
        setIsOpen(false);
    };

    const navigate = (direction) => {
        setViewDate(prev => direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const displayValue = selectedDate 
        ? format(selectedDate, "d MMM yyyy", { locale: es })
        : '';

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
            >
                <Calendar size={16} className="text-white/40 group-hover:text-acid transition-colors" />
                <span className={`text-sm ${displayValue ? 'text-white' : 'text-white/40'}`}>
                    {displayValue || placeholder}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute left-0 top-full mt-3 z-[9999] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-5 w-[320px]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-white capitalize">
                                    {format(viewDate, "MMMM yyyy", { locale: es })}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate(1)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(d => (
                                <div key={d} className="text-[10px] font-bold text-white/30 py-2 text-center uppercase tracking-wider">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {monthDays().map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, viewDate);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isDayToday = isToday(day);

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        disabled={!isCurrentMonth}
                                        className={`
                                            h-9 w-full rounded-xl text-sm font-medium transition-all duration-200
                                            flex items-center justify-center
                                            ${!isCurrentMonth ? 'text-white/10 cursor-default' : ''}
                                            ${isCurrentMonth && !isSelected ? 'text-white hover:bg-white/10 hover:text-acid' : ''}
                                            ${isSelected ? 'bg-acid text-black font-bold shadow-[0_0_15px_rgba(190,242,100,0.4)]' : ''}
                                            ${isDayToday && !isSelected ? 'ring-1 ring-white/20' : ''}
                                        `}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDate(new Date());
                                    onChange(new Date().toISOString());
                                    setIsOpen(false);
                                }}
                                className="px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                Hoy
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDate(null);
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                Limpiar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}