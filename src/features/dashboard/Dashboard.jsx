import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Pencil, Plus, Trash2, Check, X, ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import DatePicker from '../../shared/components/DatePicker';
import CalendarInput from '../../shared/components/CalendarInput';
import { toast } from 'sonner';

// --- Shared Components ---

// Status Bulb Component (The "Bombillo")
const StatusBulb = ({ status, onClick, readOnly = false }) => {
    return (
        <button
            onClick={readOnly ? undefined : onClick}
            disabled={readOnly}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${status === 1 ? 'bg-acid' : (status === 2 ? 'bg-red-500' : 'bg-zinc-700 shadow-none')} ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            style={status === 1 ? { boxShadow: '0 0 15px var(--primary-glow)' } : (status === 2 ? { boxShadow: '0 0 15px rgba(239,68,68,0.6)' } : {})}
        />
    );
};

// Section Container with Floating Edit Pencil and Save Button
const DashboardSection = ({ title, children, onEdit, isEditing, onAdd, isComplete = false, onSave, hasPendingChanges }) => {
    return (
        <div className="relative group" style={{ overflow: 'visible' }}>
            <div
                className={`glass-card p-6 transition-all duration-500
                ${isComplete
                        ? 'glass-card-success'
                        : 'hover:border-white/20'
                    }`}
                style={{ overflow: 'visible' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3
                        className={`font-display font-bold text-lg tracking-wide uppercase transition-colors duration-300 ${isComplete ? 'text-acid' : 'text-white'}`}
                        style={isComplete ? { filter: 'drop-shadow(0 0 10px var(--primary-glow))' } : {}}
                    >
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {isEditing && hasPendingChanges && (
                            <button
                                onClick={onSave}
                                className="px-3 py-1.5 bg-acid text-black rounded-lg text-xs font-bold hover:bg-white transition-colors"
                            >
                                GUARDAR
                            </button>
                        )}
                        {isEditing && (
                            <button
                                onClick={onAdd}
                                className="p-1 rounded-full bg-acid/10 text-acid hover:bg-acid/20 transition-colors"
                                title="Agregar Item"
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-0">
                    {children}
                </div>
            </div>

            {/* Floating Edit Pencil (Top Right, on Border - Outside glass-card to avoid clip) */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                    onClick={isEditing ? onSave : onEdit}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all ${isEditing ? 'bg-acid text-black' : 'bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700'}`}
                >
                    {isEditing ? <Check size={12} /> : <Pencil size={10} />}
                </button>
            </div>
        </div>
    );
};

// Row Component
const TransactionRow = ({ item, isEditing, onChange, onDelete, onStatusToggle, canDelete, section, getItemValue }) => {
    return (
        <div
            className="flex items-center gap-4 py-0.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors min-h-[24px]"
            onClick={(e) => isEditing && e.stopPropagation()}
            style={{ overflow: 'visible' }}
        >
            {/* Status Bulb */}
            <div className="shrink-0 flex items-center justify-center h-full pt-0.5">
                <StatusBulb status={getItemValue(section, item, 'status')} onClick={onStatusToggle} readOnly={!isEditing} />
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center gap-4" style={{ overflow: 'visible' }}>

                {/* Name */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text"
                            value={getItemValue(section, item, 'name')}
                            onChange={(e) => onChange(item.id, 'name', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-acid cursor-text"
                        />
                    ) : (
                        <span className="font-medium text-white text-xs truncate block">{getItemValue(section, item, 'name')}</span>
                    )}
                </div>

                {/* Date */}
                <div className="w-24 flex-shrink-0" style={{ overflow: 'visible', position: 'relative' }}>
                    {isEditing ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                            <CalendarInput
                                value={getItemValue(section, item, 'date') || ''}
                                onChange={(dateStr) => {
                                    onChange(item.id, 'date', dateStr);
                                }}
                                placeholder="--"
                            />
                        </div>
                    ) : (
                        <span className="text-xs text-text-muted">{getItemValue(section, item, 'date')}</span>
                    )}
                </div>

                {/* Amount */}
                <div className="w-24 flex-shrink-0 text-right">
                    {isEditing ? (
                        <input
                            type="text"
                            value={getItemValue(section, item, 'amount')}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                if (!/^\d*$/.test(rawValue)) return; // Only allow numbers
                                const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                onChange(item.id, 'amount', formatted);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-acid text-right cursor-text"
                        />
                    ) : (
                        <span className="font-bold text-white text-sm tracking-wide font-number">{getItemValue(section, item, 'amount')}</span>
                    )}
                </div>

            </div>

            {/* Delete Action (Only in Edit Mode) */}
            {isEditing && (
                <button
                    onClick={() => canDelete && onDelete(item.id)}
                    disabled={!canDelete}
                    className={`p-1 rounded transition-colors ${canDelete ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' : 'text-zinc-700 cursor-not-allowed'}`}
                    title={canDelete ? "Eliminar" : "No se puede eliminar el último item"}
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

// ... (StatCard import remains)
import StatCard from '../../shared/components/StatCard';
import { useFinance } from '../finance/context/FinanceContext';

export default function Dashboard() {
    const { user } = useUser();
    const {
        data,
        currentDate,
        setCurrentDate,
        updateDb,
        totals,
        prevTotals,
        trends,
        formatCurrency,
        months
    } = useFinance();

    // Local UI State
    const [uiState, setUiState] = useState({ annual: false, fixedIncome: false, monthlyExpenses: false, variableExpenses: false });

    // Pending changes state (local edits before saving to DB)
    const [pendingChanges, setPendingChanges] = useState({
        annual: {},
        fixedIncome: {},
        monthlyExpenses: {},
        variableExpenses: {}
    });

    // Actions (Wrappers for Context Functions)
    const toggleEdit = (section) => {
        if (uiState[section]) {
            // Exiting edit mode - discard pending changes
            setPendingChanges(prev => ({ ...prev, [section]: {} }));
        }
        setUiState(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleDataChange = (section, id, field, value) => {
        // Store change locally, don't update DB yet
        setPendingChanges(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [id]: {
                    ...prev[section][id],
                    [field]: value
                }
            }
        }));
    };

    const saveSection = async (section) => {
        const changes = pendingChanges[section];

        // Save each pending change
        for (const [id, fields] of Object.entries(changes)) {
            for (const [field, value] of Object.entries(fields)) {
                await updateDb(section, 'update', { id, field, value });
            }
        }

        // Clear pending changes and exit edit mode
        setPendingChanges(prev => ({ ...prev, [section]: {} }));
        setUiState(prev => ({ ...prev, [section]: false }));
        toast.success('Cambios guardados');
    };

    const getItemValue = (section, item, field) => {
        const pending = pendingChanges[section][item.id];
        return pending?.[field] ?? item[field];
    };

    const toggleStatus = (section, id) => {
        const item = data[section].find(i => i.id === id);
        if (item) {
            const nextStatus = (item.status + 1) % 3;
            updateDb(section, 'update', { id, field: 'status', value: nextStatus });
        }
    };

    const addItem = (section) => {
        const newItem = { id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2), name: 'Nuevo Item', date: months[currentDate.getMonth()] + ' 01', amount: '0', status: 0 };
        updateDb(section, 'add', newItem);
        toast.success('Item agregado');
    };

    const deleteItem = (section, id) => {
        updateDb(section, 'delete', { id });
        toast.success('Item eliminado');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">

            {/* Greeting */}
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-0 tracking-tight leading-[0.95]">
                    Hola <span className="bg-gradient-to-r from-acid to-forest bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-text-muted text-lg -mt-1 font-medium opacity-80">Bienvenido a tu Dashboard</p>
            </div>

            {/* --- Stats Grid (Classic) --- */}
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-0">
                    <StatCard
                        title="Ingresos Totales"
                        amount={formatCurrency(totals.income)}
                        trend={trends.income}
                        icon={DollarSign}
                        variant="filled"
                        colorTheme="green"
                    />
                    <StatCard
                        title="Gastos Fijos"
                        amount={formatCurrency(totals.fixedExpenses)}
                        trend={trends.fixedExpenses}
                        icon={TrendingDown}
                        variant="filled"
                        colorTheme="red"
                    />
                    <StatCard
                        title="Gastos Variables"
                        amount={formatCurrency(totals.variableExpenses)}
                        trend={trends.variableExpenses}
                        icon={TrendingDown}
                        variant="filled"
                        colorTheme="orange"
                    />
                    <StatCard
                        title="Disponible"
                        amount={formatCurrency(totals.savings)}
                        trend={0}
                        icon={Wallet}
                        variant="filled"
                        colorTheme="blue"
                    />
                </div>
            </div>

            {/* Date Selector Bar (Floating between Stats and Content) */}
            <div className="flex justify-start relative z-50">
                <DatePicker selectedDate={currentDate} onChange={setCurrentDate} monthOnly={true} />
            </div>


            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column (4/12) - Annual & Income */}
                <div className="xl:col-span-5 space-y-8">

                    {/* Annual Expenses */}
                    <DashboardSection
                        title="Gastos Anuales"
                        isEditing={uiState.annual}
                        onEdit={() => toggleEdit('annual')}
                        onAdd={() => addItem('annual')}
                        onSave={() => saveSection('annual')}
                        hasPendingChanges={Object.keys(pendingChanges.annual).length > 0}
                        isComplete={data.annual.length > 0 && data.annual.every(item => item.status === 1)}
                    >
                        {/* Column Headers */}
                        <div className="flex items-center gap-4 px-2 text-[10px] text-text-muted uppercase tracking-wider mb-2 font-medium">
                            <span className="w-4"></span>
                            <span className="flex-1 min-w-0">Concepto</span>
                            <span className="w-24 flex-shrink-0 text-center">Fecha</span>
                            <span className="w-24 flex-shrink-0 text-right">Valor</span>
                        </div>
                        {data.annual.map(item => (
                            <TransactionRow
                                key={item.id}
                                item={item}
                                isEditing={uiState.annual}
                                onChange={(id, field, val) => handleDataChange('annual', id, field, val)}
                                onDelete={(id) => deleteItem('annual', id)}
                                onStatusToggle={() => toggleStatus('annual', item.id)}
                                canDelete={data.annual.length > 1}
                                section="annual"
                                getItemValue={getItemValue}
                            />
                        ))}
                    </DashboardSection>

                    {/* Fixed Incomes */}
                    <DashboardSection
                        title="Ingresos Fijos"
                        isEditing={uiState.fixedIncome}
                        onEdit={() => toggleEdit('fixedIncome')}
                        onAdd={() => addItem('fixedIncome')}
                        onSave={() => saveSection('fixedIncome')}
                        hasPendingChanges={Object.keys(pendingChanges.fixedIncome).length > 0}
                        isComplete={data.fixedIncome.length > 0 && data.fixedIncome.every(item => item.status === 1)}
                    >
                        {/* Column Headers */}
                        <div className="flex items-center gap-4 px-2 text-[10px] text-text-muted uppercase tracking-wider mb-2 font-medium">
                            <span className="w-4"></span>
                            <span className="flex-1 min-w-0">Concepto</span>
                            <span className="w-24 flex-shrink-0 text-center">Fecha</span>
                            <span className="w-24 flex-shrink-0 text-right">Valor</span>
                        </div>
                        {data.fixedIncome.map(item => (
                            <TransactionRow
                                key={item.id}
                                item={item}
                                isEditing={uiState.fixedIncome}
                                onChange={(id, field, val) => handleDataChange('fixedIncome', id, field, val)}
                                onDelete={(id) => deleteItem('fixedIncome', id)}
                                onStatusToggle={() => toggleStatus('fixedIncome', item.id)}
                                canDelete={data.fixedIncome.length > 1}
                                section="fixedIncome"
                                getItemValue={getItemValue}
                            />
                        ))}
                        {/* Total Footer */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                            <div>
                                <span className="text-text-muted">Total Ingresos</span>
                                <span className="text-text-muted/50 text-xs ml-2">(Mes anterior: {formatCurrency(prevTotals.income)})</span>
                            </div>
                            <span className="font-bold text-acid">{formatCurrency(totals.income)}</span>
                        </div>
                    </DashboardSection>

                </div>

                {/* Right Column (8/12) - Monthly Budget (Main Focus) */}
                <div className="xl:col-span-7 space-y-8">

                    {/* Fixed Monthly Expenses */}
                    <DashboardSection
                        title="Gastos Fijos Mensuales"
                        isEditing={uiState.monthlyExpenses}
                        onEdit={() => toggleEdit('monthlyExpenses')}
                        onAdd={() => addItem('monthlyExpenses')}
                        onSave={() => saveSection('monthlyExpenses')}
                        hasPendingChanges={Object.keys(pendingChanges.monthlyExpenses).length > 0}
                        isComplete={data.monthlyExpenses.length > 0 && data.monthlyExpenses.every(item => item.status === 1)}
                    >

                        {/* Column Headers */}
                        <div className="flex items-center gap-4 px-2 py-2 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider mb-2">
                            <div className="w-4"></div>
                            <span className="flex-1 min-w-0">Concepto</span>
                            <span className="w-24 flex-shrink-0 text-center text-text-muted/50">Fecha</span>
                            <span className="w-24 flex-shrink-0 text-right text-text-muted/50">Valor</span>
                            {uiState.monthlyExpenses && <div className="w-6"></div>}
                        </div>

                        {data.monthlyExpenses.map(item => (
                            <TransactionRow
                                key={item.id}
                                item={item}
                                isEditing={uiState.monthlyExpenses}
                                onChange={(id, field, val) => handleDataChange('monthlyExpenses', id, field, val)}
                                onDelete={(id) => deleteItem('monthlyExpenses', id)}
                                onStatusToggle={() => toggleStatus('monthlyExpenses', item.id)}
                                canDelete={data.monthlyExpenses.length > 1}
                                section="monthlyExpenses"
                                getItemValue={getItemValue}
                            />
                        ))}
                        {/* Total Footer */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                            <div>
                                <span className="text-text-muted">Total Fijos</span>
                                <span className="text-text-muted/50 text-xs ml-2">(Mes anterior: {formatCurrency(prevTotals.fixedExpenses)})</span>
                            </div>
                            <span className="font-bold text-white">{formatCurrency(totals.fixedExpenses)}</span>
                        </div>
                    </DashboardSection>

                    {/* Variable Monthly Expenses */}
                    <DashboardSection
                        title="Gastos Variables Mensuales"
                        isEditing={uiState.variableExpenses}
                        onEdit={() => toggleEdit('variableExpenses')}
                        onAdd={() => addItem('variableExpenses')}
                        onSave={() => saveSection('variableExpenses')}
                        hasPendingChanges={Object.keys(pendingChanges.variableExpenses).length > 0}
                        isComplete={data.variableExpenses.length > 0 && data.variableExpenses.every(item => item.status === 1)}
                    >
                        {/* Column Headers */}
                        <div className="flex items-center gap-4 px-2 py-2 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider mb-2">
                            <div className="w-4"></div>
                            <span className="flex-1 min-w-0">Concepto</span>
                            <span className="w-24 flex-shrink-0 text-center text-text-muted/50">Fecha</span>
                            <span className="w-24 flex-shrink-0 text-right text-text-muted/50">Valor</span>
                            {uiState.variableExpenses && <div className="w-6"></div>}
                        </div>

                        {data.variableExpenses.map(item => (
                            <TransactionRow
                                key={item.id}
                                item={item}
                                isEditing={uiState.variableExpenses}
                                onChange={(id, field, val) => handleDataChange('variableExpenses', id, field, val)}
                                onDelete={(id) => deleteItem('variableExpenses', id)}
                                onStatusToggle={() => toggleStatus('variableExpenses', item.id)}
                                canDelete={data.variableExpenses.length > 1}
                                section="variableExpenses"
                                getItemValue={getItemValue}
                            />
                        ))}
                        {/* Total Footer */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                            <div>
                                <span className="text-text-muted">Total Variables</span>
                                <span className="text-text-muted/50 text-xs ml-2">(Mes anterior: {formatCurrency(prevTotals.variableExpenses)})</span>
                            </div>
                            <span className="font-bold text-white">{formatCurrency(totals.variableExpenses)}</span>
                        </div>
                    </DashboardSection>

                </div>
            </div>

        </div>
    );
}
