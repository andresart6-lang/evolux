import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr !== 'string') return null;
    const parts = dateStr.split(' ');
    if (parts.length !== 2) return null;
    const monthIndex = MONTHS.findIndex(m => m.toUpperCase() === parts[0].toUpperCase());
    if (monthIndex === -1) return null;
    const day = parseInt(parts[1], 10);
    if (isNaN(day)) return null;
    const year = new Date().getFullYear();
    return new Date(year, monthIndex, day);
};

const formatDateForStorage = (date) => {
    return `${MONTHS[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
};

export default function CalendarInput({ value, onChange, placeholder = 'Ene 15' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        const parsed = parseDateString(value);
        return parsed || new Date();
    });
    const [selectedDate, setSelectedDate] = useState(() => {
        const parsed = parseDateString(value);
        return parsed || new Date();
    });
    const containerRef = useRef(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

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
        if (value && typeof value === 'string') {
            const parsed = parseDateString(value);
            if (parsed) {
                setViewDate(parsed);
                setSelectedDate(parsed);
            }
        }
    }, [value]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPopupPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX
            });
        }
    }, [isOpen]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: adjustedFirstDay };
    };

    const { days, firstDay } = getDaysInMonth(viewDate);

    const handleDayClick = (day) => {
        const newDate = new Date(viewDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
        onChange(formatDateForStorage(newDate));
        setIsOpen(false);
    };

    const navigate = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(viewDate.getMonth() + direction);
        setViewDate(newDate);
    };

    const calendarContent = (
        <div
            className="fixed z-[99999] bg-[#121212] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4 w-64"
            style={{
                top: popupPosition.top,
                left: popupPosition.left
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-white">
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                    type="button"
                    onClick={() => navigate(1)}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {DAYS.map(d => (
                    <div key={d} className="text-[10px] font-bold text-white/30 py-1">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const isSelected =
                        day === selectedDate.getDate() &&
                        viewDate.getMonth() === selectedDate.getMonth() &&
                        viewDate.getFullYear() === selectedDate.getFullYear();

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDayClick(day)}
                            className={`
                                h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                                ${isSelected
                                    ? 'bg-acid text-black font-bold shadow-[0_0_10px_rgba(190,242,100,0.4)]'
                                    : 'text-white hover:bg-white/10 hover:text-acid'
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="relative inline-block">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded hover:border-white/20 transition-colors text-center cursor-pointer"
            >
                <Calendar size={12} className="text-white/40" />
                <span className="text-[11px] text-white">{value || placeholder}</span>
            </button>

            {isOpen && createPortal(calendarContent, document.body)}
        </div>
    );
}
