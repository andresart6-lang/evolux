import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const DatePicker = ({ selectedDate, onChange, monthOnly = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const [viewMode, setViewMode] = useState(monthOnly ? 'month' : 'day'); // 'day', 'month', 'year'
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setViewMode(monthOnly ? 'month' : 'day'); // Reset view on close
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Sync view with external selectedDate when opening
            setViewDate(new Date(selectedDate));
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, selectedDate, monthOnly]);

    // Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        // Adjust for Monday start (0=Monday, 6=Sunday)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: adjustedFirstDay };
    };

    const handleDayClick = (day) => {
        const newDate = new Date(viewDate);
        newDate.setDate(day);
        onChange(newDate);
        setIsOpen(false);
    };

    const handleMonthClick = (monthIndex) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(monthIndex);
        if (monthOnly) {
            onChange(newDate);
            setIsOpen(false);
        } else {
            setViewDate(newDate);
            setViewMode('day');
        }
    };

    const handleYearClick = (year) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(year);
        setViewDate(newDate);
        setViewMode('month');
    };

    const navigate = (direction) => {
        const newDate = new Date(viewDate);
        if (viewMode === 'day') {
            newDate.setMonth(viewDate.getMonth() + direction);
        } else if (viewMode === 'month') {
            newDate.setFullYear(viewDate.getFullYear() + direction);
        } else if (viewMode === 'year') {
            newDate.setFullYear(viewDate.getFullYear() + (direction * 12));
        }
        setViewDate(newDate);
    };

    const { days, firstDay } = getDaysInMonth(viewDate);
    const currentYear = viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;

    const handleYearChange = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(newDate.getFullYear() + direction);
        onChange(newDate);
        setViewDate(newDate); // Sync dropdown view
    };

    return (
        <div className="relative z-50 flex items-center bg-[#0c0c0e] border border-white/5 rounded-2xl shadow-lg p-1.5" ref={dropdownRef}>
            {/* Year Navigator */}
            <div className="flex items-center bg-[#1a1a1c] border border-white/5 rounded-xl px-2 py-1">
                <button onClick={(e) => { e.stopPropagation(); handleYearChange(-1); }} className="p-1 hover:text-white text-text-muted transition-colors"><ChevronLeft size={16} strokeWidth={2.5} /></button>
                <span className="font-bold text-white px-3 font-mono text-[15px]">{selectedDate.getFullYear()}</span>
                <button onClick={(e) => { e.stopPropagation(); handleYearChange(1); }} className="p-1 hover:text-white text-text-muted transition-colors"><ChevronRight size={16} strokeWidth={2.5} /></button>
            </div>

            <div className="w-[1px] h-5 bg-white/10 mx-3"></div>

            {/* Month Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pr-4 pl-1 py-1 hover:opacity-80 transition-opacity"
            >
                <span className="font-bold text-acid tracking-widest text-[15px]">{MONTHS[selectedDate.getMonth()]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-3 w-72 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 z-[100]"
                    >
                        {/* Header Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-2 py-1 rounded-md text-sm font-bold transition-colors ${viewMode === 'month' ? 'bg-acid text-black' : 'text-white hover:bg-white/5'}`}
                                >
                                    {MONTHS[viewDate.getMonth()]}
                                </button>
                                <button
                                    onClick={() => setViewMode('year')}
                                    className={`px-2 py-1 rounded-md text-sm font-bold transition-colors ${viewMode === 'year' ? 'bg-acid text-black' : 'text-white hover:bg-white/5'}`}
                                >
                                    {viewDate.getFullYear()}
                                </button>
                            </div>

                            <button onClick={() => navigate(1)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Content Views */}
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">

                            {/* DAY VIEW */}
                            {viewMode === 'day' && (
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {DAYS.map(d => (
                                        <div key={d} className="text-[10px] font-bold text-white/30 py-1">{d}</div>
                                    ))}
                                    {/* Empty Start Days */}
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {/* Days */}
                                    {Array.from({ length: days }).map((_, i) => {
                                        const day = i + 1;
                                        const isSelected =
                                            day === selectedDate.getDate() &&
                                            viewDate.getMonth() === selectedDate.getMonth() &&
                                            viewDate.getFullYear() === selectedDate.getFullYear();

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleDayClick(day)}
                                                className={`
                                                    h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
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
                            )}

                            {/* MONTH VIEW */}
                            {viewMode === 'month' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {MONTHS.map((m, i) => (
                                        <button
                                            key={m}
                                            onClick={() => handleMonthClick(i)}
                                            className={`
                                                py-2 rounded-lg text-xs font-bold transition-all
                                                ${i === viewDate.getMonth()
                                                    ? 'bg-acid text-black'
                                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                                }
                                            `}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* YEAR VIEW */}
                            {viewMode === 'year' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const year = startYear + i;
                                        return (
                                            <button
                                                key={year}
                                                onClick={() => handleYearClick(year)}
                                                className={`
                                                    py-2 rounded-lg text-xs font-bold transition-all
                                                    ${year === viewDate.getFullYear()
                                                        ? 'bg-acid text-black'
                                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                                    }
                                                `}
                                            >
                                                {year}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
