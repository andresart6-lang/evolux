import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

const DatePicker = ({ selectedDate, onChange, monthOnly = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setViewDate(new Date(selectedDate));
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, selectedDate]);

    const handleMonthClick = (monthIndex) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(monthIndex);
        newDate.setFullYear(viewDate.getFullYear());
        onChange(newDate);
        setIsOpen(false);
    };

    const handleYearChange = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(newDate.getFullYear() + direction);
        onChange(newDate);
    };

    const navigateYears = (direction) => {
        const newViewDate = new Date(viewDate);
        newViewDate.setFullYear(viewDate.getFullYear() + direction);
        setViewDate(newViewDate);
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
                        className="absolute top-full left-0 mt-3 w-72 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 z-[9999]"
                    >
                        {/* Header with Year Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => navigateYears(-1)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="px-3 py-1 text-sm font-bold text-white hover:bg-white/5 rounded-md">
                                {viewDate.getFullYear()}
                            </button>
                            <button onClick={() => navigateYears(1)} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => handleMonthClick(i)}
                                    className={`
                                        py-2.5 rounded-lg text-xs font-bold transition-all
                                        ${i === selectedDate.getMonth() && viewDate.getFullYear() === selectedDate.getFullYear()
                                            ? 'bg-acid text-black'
                                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }
                                    `}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
