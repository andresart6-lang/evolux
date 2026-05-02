import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';

const Finance = () => {
    const { user } = useUser();
    const { accounts, updateAccount, addAccount, removeAccount, totals, trends, formatCurrency } = useFinance();
    const { isDark } = useTheme();

    // UI State for editing accounts
    const [editingAccount, setEditingAccount] = useState(null); // id of account being edited
    const [tempAmount, setTempAmount] = useState('');
    const [tempName, setTempName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountAmount, setNewAccountAmount] = useState('');

    const handleEditStart = (account) => {
        setEditingAccount(account.id);
        setTempAmount(account.amount.toString());
        setTempName(account.name);
    };

    const handleEditSave = (id) => {
        const cleanAmount = tempAmount.replace(/\D/g, '');
        updateAccount(id, cleanAmount, tempName);
        setEditingAccount(null);
        setTempName('');
    };

    const handleAddAccount = () => {
        if (!newAccountName || !newAccountAmount) return;
        const cleanAmount = newAccountAmount.replace(/\D/g, '');
        addAccount(newAccountName, cleanAmount);
        setIsAdding(false);
        setNewAccountName('');
        setNewAccountAmount('');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight leading-none">Billetera</h1>
                    <p className="text-text-muted text-lg mt-2 font-medium opacity-80">Gestión de Cuentas y Liquidez</p>
                </div>
            </div>

            {/* Wallet Overview Cards - SYNCED WITH DASHBOARD + ACCOUNTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* 1. Ingresos Mes (Synced) */}
                <StatCard
                    title="Ingresos Mes"
                    amount={formatCurrency(totals.income)}
                    trend={trends.income}
                    icon={TrendingUp}
                    variant="filled"
                    colorTheme="green"
                />

                {/* 2. Gastos Fijos (Synced) */}
                <StatCard
                    title="Gastos Fijos"
                    amount={formatCurrency(totals.fixedExpenses)}
                    trend={trends.fixedExpenses}
                    icon={TrendingDown}
                    variant="filled"
                    colorTheme="red"
                />

                {/* 3. Gastos Variables (Synced) */}
                <StatCard
                    title="Gastos Variables"
                    amount={formatCurrency(totals.variableExpenses)}
                    trend={trends.variableExpenses}
                    icon={TrendingDown}
                    variant="filled"
                    colorTheme="orange"
                />

                {/* 4. Cuentas Actuales (Blue - Manual Sum) */}
                <StatCard
                    title="Cuentas Actuales"
                    amount={formatCurrency(totals.accountsTotal)}
                    trend={0}
                    icon={Wallet}
                    variant="filled"
                    colorTheme="blue"
                />
            </div>

            {/* Manual Accounts Table */}
            <div className={`border rounded-3xl overflow-hidden p-6 space-y-6 ${isDark ? 'bg-[#050505] border-white/5' : 'bg-white/70 border-black/[0.06] backdrop-blur-md'}`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h2 className="text-xl font-bold text-white">Mis Cuentas</h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="btn-primary"
                    >
                        <Plus size={16} /> Agregar Cuenta
                    </button>
                </div>

                {/* Add New Account Row */}
                {isAdding && (
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in">
                        <input
                            type="text"
                            placeholder="Nombre (ej. Nequi)"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-acid focus:outline-none flex-1"
                        />
                        <input
                            type="text"
                            placeholder="Monto"
                            value={newAccountAmount}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setNewAccountAmount(Number(val).toLocaleString('es-CO'));
                            }}
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-acid focus:outline-none w-32 text-right"
                        />
                        <div className="flex items-center gap-2">
                            <button onClick={handleAddAccount} className="p-2 bg-acid text-black rounded-lg hover:scale-105 transition-transform"><Check size={18} /></button>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors"><X size={18} /></button>
                        </div>
                    </div>
                )}

                {/* Accounts List */}
                <div className="space-y-3">
                    {accounts.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors group">

                            {/* Name */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 shrink-0">
                                    <Wallet size={20} />
                                </div>
                                {editingAccount === acc.id ? (
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="bg-black/50 border border-white/10 rounded px-3 py-1 text-white text-lg font-medium w-full max-w-xs focus:outline-none focus:border-acid"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="font-medium text-white text-lg">{acc.name}</span>
                                )}
                            </div>

                            {/* Amount & Actions */}
                            <div className="flex items-center gap-6">
                                {editingAccount === acc.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={Number(tempAmount).toLocaleString('es-CO')}
                                            onChange={(e) => setTempAmount(e.target.value.replace(/\D/g, ''))}
                                            className="bg-black/50 border border-acid/50 rounded px-3 py-1 text-white text-right font-mono font-bold w-40 focus:outline-none"
                                        />
                                        <button onClick={() => handleEditSave(acc.id)} className="p-1.5 bg-acid text-black rounded hover:opacity-90"><Check size={16} /></button>
                                    </div>
                                ) : (
                                    <span className="font-bold text-white text-xl tracking-tight">{formatCurrency(acc.amount)}</span>
                                )}

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditStart(acc)}
                                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => removeAccount(acc.id)}
                                        className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Finance;
