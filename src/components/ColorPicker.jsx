import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'green', value: '#4ade80', class: 'bg-green-400' },
    { name: 'orange', value: '#fb923c', class: 'bg-orange-400' },
    { name: 'purple', value: '#c084fc', class: 'bg-purple-400' },
    { name: 'blue', value: '#60a5fa', class: 'bg-blue-400' },
    { name: 'red', value: '#f87171', class: 'bg-red-400' },
];

const ColorPicker = ({ selectedColor, onChange }) => {
    const isPreset = PRESET_COLORS.some(c => c.value === selectedColor);

    return (
        <div className="flex items-center gap-3">
            {PRESET_COLORS.map((color) => (
                <button
                    key={color.name}
                    onClick={() => onChange(color.value)}
                    className={`w-8 h-8 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 border-2 ${selectedColor === color.value ? 'border-white' : 'border-transparent'}`}
                >
                    {selectedColor === color.value && <Check size={14} className="text-black/50" />}
                </button>
            ))}

            {/* Custom Color Trigger */}
            <div className="relative">
                <input
                    type="color"
                    value={isPreset ? '#ffffff' : selectedColor}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <button
                    className={`w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center transition-transform hover:scale-110 border-2 ${!isPreset ? 'border-white' : 'border-transparent'}`}
                >
                    {!isPreset && <Check size={14} className="text-white drop-shadow-md" />}
                    {isPreset && <Plus size={14} className="text-white/80" />}
                </button>
            </div>
        </div>
    );
};

export default ColorPicker;
