import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { EXPENSE_CATEGORIES_LIMITS } from '../../shared/lib/constants';

const { MIN: MIN_CATEGORIES, MAX: MAX_CATEGORIES } = EXPENSE_CATEGORIES_LIMITS;

// Pop-up para editar la lista de categorías. Reglas: mínimo 2, máximo 5.
export default function CategoryEditorModal({ isOpen, categories, onClose, onSave }) {
    const [list, setList] = useState(categories);

    useEffect(() => {
        if (isOpen) setList(categories);
    }, [isOpen, categories]);

    const updateAt = (i, value) => setList((prev) => prev.map((c, idx) => (idx === i ? value : c)));
    const removeAt = (i) => setList((prev) => prev.filter((_, idx) => idx !== i));
    const addOne = () => setList((prev) => [...prev, '']);

    const cleaned = list.map((c) => c.trim()).filter(Boolean);
    const hasEmpty = list.some((c) => !c.trim());
    const hasDuplicates = new Set(cleaned.map((c) => c.toLowerCase())).size !== cleaned.length;
    const validCount = cleaned.length >= MIN_CATEGORIES && cleaned.length <= MAX_CATEGORIES;
    const canSave = validCount && !hasEmpty && !hasDuplicates;

    const handleSave = () => {
        if (!canSave) return;
        onSave(cleaned);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl"
                        style={{ backgroundColor: 'var(--bg-card-solid)' }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold text-white">Editar categorías</h3>
                            <button onClick={onClose} className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mb-5">Mínimo {MIN_CATEGORIES}, máximo {MAX_CATEGORIES} categorías.</p>

                        <div className="space-y-2 mb-4">
                            {list.map((cat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={cat}
                                        onChange={(e) => updateAt(i, e.target.value)}
                                        placeholder="Nombre de la categoría"
                                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-acid transition-colors"
                                    />
                                    <button
                                        onClick={() => removeAt(i)}
                                        disabled={list.length <= MIN_CATEGORIES}
                                        className="p-2 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors shrink-0"
                                        title={list.length <= MIN_CATEGORIES ? `Mínimo ${MIN_CATEGORIES}` : 'Eliminar'}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addOne}
                            disabled={list.length >= MAX_CATEGORIES}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-text-muted hover:text-white hover:border-white/30 hover:bg-white/[0.03] disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-sm font-semibold mb-2"
                        >
                            <Plus size={16} /> Agregar categoría
                        </button>

                        {hasDuplicates && <p className="text-xs text-red-400 mb-2">Hay categorías repetidas.</p>}

                        <div className="flex gap-3 mt-4">
                            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm font-semibold">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!canSave}
                                className="flex-1 py-2.5 rounded-xl bg-acid text-black font-bold hover:bg-white disabled:opacity-30 disabled:hover:bg-acid transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <Check size={16} /> Guardar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
