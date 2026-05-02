import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ColorPicker from './ColorPicker';

export default function CategoryModal({ isOpen, onClose, onSave, initialData }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#bef264'); // Default to acid

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setColor(initialData.color);
            } else {
                setName('');
                setColor('#bef264');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(name, color);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">{initialData ? 'Editar Categoría' : 'Nueva Categoría'}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Diseño, Desarrollo..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid transition-colors"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Color de Identificación
                        </label>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <ColorPicker selectedColor={color} onChange={setColor} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-white/70 hover:bg-white/5 transition-colors font-bold text-sm"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-6 py-2.5 bg-acid text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            GUARDAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
