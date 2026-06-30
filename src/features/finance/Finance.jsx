import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, Clock, CreditCard, Scale, Plus, Trash2, Pencil, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../shared/components/StatCard';
import DatePicker from '../../shared/components/DatePicker';
import PageHeader from '../../shared/components/PageHeader';
import { getWalletMonth, addWalletItem, updateWalletItem, deleteWalletItem, emptyMonth } from './services/wallet';

// Las 3 columnas de la Billetera. El orden y los colores los definió Andrés:
// Dinero Actual (verde) · Pendiente por Recibir (naranja) · Deudas (rojo).
const COLUMNS = [
    { key: 'actual',  title: 'Dinero Actual',         color: 'green',  icon: Wallet,     placeholder: 'Ej. Davibank' },
    { key: 'pending', title: 'Pendiente por Recibir',  color: 'orange', icon: Clock,      placeholder: 'Ej. Kapital Sushi' },
    { key: 'debt',    title: 'Deudas',                 color: 'red',    icon: CreditCard, placeholder: 'Ej. Tarjeta de crédito' },
];

const ACCENTS = { green: '#22c55e', orange: '#f97316', red: '#ef4444' };

const fmt = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n || 0).toLocaleString('es-CO');
const fmtInput = (n) => (n ? Number(n).toLocaleString('es-CO') : '');
const monthKeyOf = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const Finance = () => {
    const { isDark } = useTheme();
    const { userId } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState(emptyMonth());
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState({ actual: false, pending: false, debt: false });

    const monthKey = monthKeyOf(currentDate);

    // Cargar los datos del mes desde Supabase (cada mes es independiente).
    useEffect(() => {
        let active = true;
        if (!userId) return;
        setLoading(true);
        getWalletMonth(userId, monthKey)
            .then((d) => { if (active) setData(d); })
            .catch((e) => { console.error(e); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [userId, monthKey]);

    const toggleEdit = (colKey) => setEditing((prev) => ({ ...prev, [colKey]: !prev[colKey] }));

    // Edición local inmediata (sin tocar la nube en cada tecla).
    const updateLocal = (colKey, id, field, value) => {
        setData((prev) => ({
            ...prev,
            [colKey]: prev[colKey].map((it) => (it.id === id ? { ...it, [field]: value } : it)),
        }));
    };

    // Persistir un item al salir del campo (onBlur).
    const persistItem = async (colKey, id) => {
        const item = data[colKey].find((it) => it.id === id);
        if (!item || !userId) return;
        try {
            await updateWalletItem(id, userId, { name: item.name, value: item.value });
        } catch (e) {
            console.error('Error guardando item:', e);
        }
    };

    const addItem = async (colKey) => {
        if (!userId) return;
        try {
            const created = await addWalletItem(userId, monthKey, colKey, data[colKey].length);
            setData((prev) => ({ ...prev, [colKey]: [...prev[colKey], created] }));
        } catch (e) {
            console.error('Error agregando item:', e);
        }
    };

    const removeItem = async (colKey, id) => {
        if (!userId) return;
        setData((prev) => ({ ...prev, [colKey]: prev[colKey].filter((it) => it.id !== id) }));
        try {
            await deleteWalletItem(id, userId);
        } catch (e) {
            console.error('Error eliminando item:', e);
        }
    };

    // Reordenar con flechas (intercambia posiciones) y persiste sort_order.
    const moveItem = (colKey, id, direction) => {
        const arr = [...data[colKey]];
        const idx = arr.findIndex((i) => i.id === id);
        const swap = direction === 'up' ? idx - 1 : idx + 1;
        if (idx === -1 || swap < 0 || swap >= arr.length) return;
        [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
        setData((prev) => ({ ...prev, [colKey]: arr }));
        if (userId) arr.forEach((it, i) => updateWalletItem(it.id, userId, { sort_order: i }).catch(() => {}));
    };

    // Sumas por columna + total de liquidez (Actual + Pendiente - Deudas).
    const totals = useMemo(() => {
        const sum = (arr) => arr.reduce((acc, it) => acc + (Number(it.value) || 0), 0);
        const actual = sum(data.actual);
        const pending = sum(data.pending);
        const debt = sum(data.debt);
        return { actual, pending, debt, liquidez: actual + pending - debt };
    }, [data]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <PageHeader
                title="Mi Billetera"
                subtitle="Tu liquidez real, mes a mes."
                right={<DatePicker selectedDate={currentDate} onChange={setCurrentDate} monthOnly={true} />}
            />

            {/* Cards resumen (verde / naranja / rojo / azul) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Dinero Actual"        amount={fmt(totals.actual)}   icon={Wallet}     colorTheme="green"  subtitle="Este mes" />
                <StatCard title="Pendiente por Recibir" amount={fmt(totals.pending)}  icon={Clock}      colorTheme="orange" subtitle="Por cobrar" />
                <StatCard title="Deudas"               amount={fmt(totals.debt)}     icon={CreditCard} colorTheme="red"    subtitle="Por pagar" />
                <StatCard title="Total"                amount={fmt(totals.liquidez)} icon={Scale}      colorTheme="blue"   subtitle="Liquidez real" />
            </div>

            {/* Bloques tipo calculadora — 3 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {COLUMNS.map((col) => {
                    const accent = ACCENTS[col.color];
                    const items = data[col.key];
                    const isEditingCol = editing[col.key];
                    const colTotal = items.reduce((acc, it) => acc + (Number(it.value) || 0), 0);
                    const ColIcon = col.icon;

                    return (
                        <div key={col.key} className="glass-card p-6" style={{ overflow: 'visible' }}>
                            {/* Header del bloque (con lápiz de editar) */}
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: `${accent}1a`, color: accent }}>
                                        <ColIcon size={18} />
                                    </div>
                                    <h3 className="font-bold text-white text-base truncate">{col.title}</h3>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-sm font-number" style={{ color: accent }}>{fmt(colTotal)}</span>
                                    <button
                                        onClick={() => toggleEdit(col.key)}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isEditingCol ? 'bg-acid text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                                        title={isEditingCol ? 'Listo' : 'Editar'}
                                    >
                                        {isEditingCol ? <Check size={14} /> : <Pencil size={12} />}
                                    </button>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-1.5">
                                {items.length === 0 && (
                                    <p className="text-center text-text-muted/50 text-xs italic py-1.5">
                                        {loading ? 'Cargando…' : 'Sin items aún'}
                                    </p>
                                )}

                                <AnimatePresence initial={false}>
                                    {items.map((it, idx) => (
                                        <motion.div
                                            key={it.id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            {isEditingCol ? (
                                                /* --- MODO EDICIÓN --- */
                                                <div className="flex items-center gap-2 group">
                                                    <div className="flex flex-col items-center -my-1 shrink-0">
                                                        <button onClick={() => moveItem(col.key, it.id, 'up')} disabled={idx === 0}
                                                            className="text-text-muted/50 hover:text-white disabled:opacity-20 transition-colors leading-none" title="Subir">
                                                            <ChevronUp size={13} />
                                                        </button>
                                                        <button onClick={() => moveItem(col.key, it.id, 'down')} disabled={idx === items.length - 1}
                                                            className="text-text-muted/50 hover:text-white disabled:opacity-20 transition-colors leading-none" title="Bajar">
                                                            <ChevronDown size={13} />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={it.name}
                                                        onChange={(e) => updateLocal(col.key, it.id, 'name', e.target.value)}
                                                        onBlur={() => persistItem(col.key, it.id)}
                                                        placeholder={col.placeholder}
                                                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-acid transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={fmtInput(it.value)}
                                                        onChange={(e) => updateLocal(col.key, it.id, 'value', Number(e.target.value.replace(/\D/g, '')) || 0)}
                                                        onBlur={() => persistItem(col.key, it.id)}
                                                        placeholder="$0"
                                                        className="w-24 shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-right font-number placeholder:text-white/25 focus:outline-none focus:border-acid transition-colors"
                                                    />
                                                    <button
                                                        onClick={() => removeItem(col.key, it.id)}
                                                        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            ) : (
                                                /* --- MODO VISTA (limpio) --- */
                                                <div className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
                                                    <span className="text-sm text-white truncate">{it.name || <span className="text-white/30 italic">Sin nombre</span>}</span>
                                                    <span className="text-sm text-white font-number shrink-0">{fmt(it.value)}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Agregar (solo en edición) */}
                            {isEditingCol && (
                                <button
                                    onClick={() => addItem(col.key)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-text-muted hover:text-white hover:border-white/30 hover:bg-white/[0.03] transition-colors text-sm font-semibold"
                                >
                                    <Plus size={16} /> Agregar
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Finance;
