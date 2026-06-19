import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Pencil, Trophy, X, ChevronDown, Check } from 'lucide-react';
import ColorPicker from '../../shared/components/ColorPicker';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { getGoals, createGoal, updateGoal, deleteGoal, addGoalHistory } from './services/goals';

const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
};

const formatDateShort = (date) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
};

export default function Goals() {
    const { userId, isAuthenticated } = useAuth();
    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('app_goals');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [modalTitle, setModalTitle] = useState('');
    const [modalTarget, setModalTarget] = useState('');
    const [modalAmount, setModalAmount] = useState('');
    const [modalColor, setModalColor] = useState('#4ade80');

    const loadGoals = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await getGoals(userId);
            if (data && data.length > 0) {
                const formattedGoals = data.map(g => ({
                    id: g.id,
                    title: g.title,
                    target: g.target,
                    current: g.current,
                    color: g.color,
                    history: (g.goal_history || []).map(h => ({
                        id: h.id,
                        date: h.date,
                        amount: h.amount,
                        type: h.type
                    }))
                }));
                setGoals(formattedGoals);
                localStorage.setItem('app_goals', JSON.stringify(formattedGoals));
            }
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isAuthenticated && userId) {
            loadGoals();
        }
    }, [isAuthenticated, userId, loadGoals]);

    useEffect(() => {
        localStorage.setItem('app_goals', JSON.stringify(goals));
    }, [goals]);

    const openModal = (goal = null) => {
        if (!goal && goals.length >= 6) {
            toast.error('¡Máximo 6 metas permitidas!');
            return;
        }

        setEditingGoal(goal);
        if (goal) {
            setModalTitle(goal.title);
            setModalTarget(goal.target.toString());
            setModalAmount(goal.current.toString());
            setModalColor(goal.color);
        } else {
            setModalTitle('');
            setModalTarget('');
            setModalAmount('');
            setModalColor('#4ade80');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    const handleSaveGoal = async () => {
        if (!modalTitle || !modalTarget) {
            toast.error('Por favor completa los campos requeridos');
            return;
        }

        const targetVal = parseInt(modalTarget.replace(/\D/g, '')) || 0;

        if (targetVal <= 0) {
            toast.error('La meta debe ser mayor a 0');
            return;
        }

        const currentVal = parseInt(modalAmount.replace(/\D/g, '')) || 0;

        try {
            if (editingGoal) {
                const updatedGoal = {
                    title: modalTitle,
                    target: targetVal,
                    current: currentVal,
                    color: modalColor
                };
                await updateGoal(editingGoal.id, userId, updatedGoal);

                setGoals(goals.map(g => g.id === editingGoal.id ? {
                    ...g,
                    ...updatedGoal
                } : g));
                toast.success('Meta actualizada');
            } else {
                const newGoalData = {
                    title: modalTitle,
                    target: targetVal,
                    current: currentVal,
                    color: modalColor
                };
                const createdGoal = await createGoal(userId, newGoalData);

                const newGoal = {
                    id: createdGoal.id,
                    ...newGoalData,
                    history: currentVal > 0 ? [{
                        id: Date.now(),
                        date: new Date().toLocaleDateString(),
                        amount: currentVal,
                        type: 'add'
                    }] : []
                };
                setGoals([newGoal, ...goals]);

                if (currentVal > 0) {
                    await addGoalHistory(userId, {
                        goal_id: createdGoal.id,
                        amount: currentVal,
                        type: 'add',
                        date: new Date().toISOString()
                    });
                }
                toast.success('Meta creada');
            }
            closeModal();
        } catch (error) {
            console.error('Error saving goal:', error);
            toast.error('Error al guardar la meta');
        }
    };

    const handleTransaction = async (id, amount, type) => {
        const val = Math.abs(parseInt(String(amount).replace(/\D/g, ''))) || 0;
        if (val <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        const goal = goals.find(g => g.id === id);
        if (!goal) return;

        const newCurrent = Math.max(0, type === 'add' ? goal.current + val : goal.current - val);

        try {
            await updateGoal(id, userId, { current: newCurrent });
            await addGoalHistory(userId, {
                goal_id: id,
                amount: val,
                type,
                date: new Date().toISOString()
            });

            const newHistory = [{
                id: Date.now(),
                date: formatDateShort(new Date()),
                amount: val,
                type
            }, ...goal.history];

            setGoals(goals.map(g => g.id === id ? { ...g, current: newCurrent, history: newHistory } : g));
            toast.success(type === 'add' ? 'Monto agregado' : 'Monto restado');
        } catch (error) {
            console.error('Error in transaction:', error);
            toast.error('Error al procesar la transacción');
        }
    };

    const handleDeleteGoal = async (id) => {
        try {
            await deleteGoal(id, userId);
            setGoals(goals.filter(g => g.id !== id));
            toast.success('Meta eliminada');
        } catch (error) {
            console.error('Error deleting goal:', error);
            toast.error('Error al eliminar la meta');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 relative">

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Mis Metas</h2>
                    <p className="text-text-muted text-sm mt-1">Sigue tu progreso y alcanza tus metas de ahorro.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn-primary"
                    disabled={isLoading}
                >
                    <Plus size={18} /> Crear Meta
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {goals.map(goal => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        onEdit={() => openModal(goal)}
                        onTransaction={handleTransaction}
                        onDelete={() => handleDeleteGoal(goal.id)}
                    />
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="border rounded-3xl w-full max-w-md p-6 shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden backdrop-blur-xl"
                            style={{ backgroundColor: 'var(--bg-card-solid)', borderColor: 'var(--border-card)' }}
                        >
                            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-bold text-white mb-6">{editingGoal ? 'Editar Meta' : 'Nueva Meta'}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-text-muted mb-1 block">Nombre de la Meta</label>
                                    <input
                                        type="text"
                                        value={modalTitle}
                                        onChange={(e) => setModalTitle(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-acid focus:outline-none placeholder-white/20"
                                        placeholder="Ej. Viaje a Bali"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-text-muted mb-1 block">Meta Total</label>
                                        <input
                                            type="text"
                                            value={Number(modalTarget).toLocaleString('es-CO')}
                                            onChange={(e) => setModalTarget(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-acid focus:outline-none text-right font-mono"
                                            placeholder="$0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-text-muted mb-1 block">Monto Inicial</label>
                                        <input
                                            type="text"
                                            value={Number(modalAmount).toLocaleString('es-CO')}
                                            onChange={(e) => setModalAmount(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-acid focus:outline-none text-right font-mono"
                                            placeholder="$0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-bold text-text-muted mb-2 block">Color Identificativo</label>
                                    <div className="p-4 bg-black/50 border border-white/5 rounded-xl flex justify-center">
                                        <ColorPicker selectedColor={modalColor} onChange={setModalColor} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={handleSaveGoal} className="flex-1 py-3 rounded-xl bg-acid text-black font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(190,242,100,0.2)]">
                                    {editingGoal ? 'Actualizar' : 'Crear Meta'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const GoalCard = ({ goal, onEdit, onTransaction, onDelete }) => {
    const [amountInput, setAmountInput] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const progress = Math.min(100, (goal.current / goal.target) * 100);

    const customStyle = {
        '--goal-color': goal.color,
        borderColor: `${goal.color}33`,
    };

    const handleAction = (type) => {
        const val = parseInt(amountInput.replace(/\D/g, '')) || 0;
        if (val <= 0) return;
        onTransaction(goal.id, val, type);
        setAmountInput('');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group w-full"
        >
            <div className="glass-card p-6 border transition-all hover:bg-white/[0.02]" style={customStyle}>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={onEdit} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Editar">
                        <Pencil size={14} />
                    </button>
                </div>

                <div className="flex items-start gap-4 mb-2">
                    <div
                        className="p-3 rounded-2xl shadow-lg"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                    >
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight">{goal.title}</h3>
                        <p className="text-sm text-text-muted mt-1 font-mono">{formatMoney(goal.target)}</p>
                    </div>
                </div>

                <div className="mt-4 mb-2 h-4 w-full bg-black/40 rounded-full border border-white/5 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full relative overflow-hidden rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${goal.color}22 0%, ${goal.color} 100%)`,
                            boxShadow: `0 0 15px 1px ${goal.color}80`
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -skew-x-12 opacity-50" />
                    </motion.div>
                </div>

                <div className="flex justify-between items-center mb-6 px-1">
                    <span className="text-white font-mono font-bold text-lg">{formatMoney(goal.current)}</span>
                    <span className="text-2xl font-bold" style={{ color: goal.color }}>{Math.round(progress)}%</span>
                </div>

                <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 relative z-20">
                    <button onClick={() => handleAction('subtract')} className="p-3 hover:bg-red-500/20 text-text-muted hover:text-red-400 rounded-lg transition-colors">
                        <Minus size={18} />
                    </button>
                    <input
                        type="text"
                        placeholder="Monto..."
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="flex-1 bg-transparent text-center text-white font-mono focus:outline-none placeholder-white/20 text-sm"
                    />
                    <button onClick={() => handleAction('add')} className="p-3 hover:bg-green-500/20 text-text-muted hover:text-green-400 rounded-lg transition-colors">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="mt-4 border-t border-white/5 pt-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex justify-between items-center text-xs text-text-muted hover:text-white py-1 uppercase font-bold tracking-wider group/hist"
                    >
                        <span>Historial</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showHistory && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-1 mt-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                    {goal.history && goal.history.length > 0 ? (
                                        goal.history.map((h, i) => (
                                            <div key={i} className="flex justify-between items-center text-[10px] font-mono p-1.5 rounded hover:bg-white/5 transition-colors">
                                                <span className="text-white/40">{h.date}</span>
                                                <span className={h.type === 'add' ? 'text-green-400' : 'text-red-400'}>
                                                    {h.type === 'add' ? '+' : '-'}{formatMoney(h.amount)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-xs text-text-muted italic py-2">Sin movimientos</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </motion.div>
    );
};
