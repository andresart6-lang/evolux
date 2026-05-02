import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskModal({ isOpen, onClose, initialData, defaultCategoryId }) {
    const { categories, spaces, tasks, addTask, updateTask, deleteTask, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useTasks();

    // Determine which space we're working in based on the default category
    const getSpaceForCategory = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat?.spaceId || '';
    };
    const activeSpaceId = defaultCategoryId ? getSpaceForCategory(defaultCategoryId) : (initialData ? getSpaceForCategory(initialData.categoryId) : '');
    const spaceCategories = categories.filter(c => c.spaceId === activeSpaceId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || '');
    const [date, setDate] = useState('');
    const [newChecklistText, setNewChecklistText] = useState('');

    // Get the LIVE task data from context (not stale initialData)
    const liveTask = initialData ? tasks.find(t => t.id === initialData.id) : null;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setDescription(initialData.description || '');
                setCategoryId(initialData.categoryId);
                setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
            } else {
                setTitle('');
                setDescription('');
                setCategoryId(defaultCategoryId || categories[0]?.id || '');
                setDate('');
                setNewChecklistText('');
            }
        }
    }, [isOpen, initialData, defaultCategoryId, categories]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim()) return;

        const taskData = {
            title,
            description,
            categoryId,
            date: date ? new Date(date).toISOString() : null
        };

        if (initialData) {
            updateTask(initialData.id, taskData);
        } else {
            addTask(categoryId, title, description, taskData.date);
        }
        onClose();
    };

    const handleDelete = () => {
        if (initialData && window.confirm('¿Seguro que deseas eliminar esta tarea?')) {
            deleteTask(initialData.id);
            onClose();
        }
    };

    const handleAddChecklist = (e) => {
        e.preventDefault();
        if (!newChecklistText.trim() || !initialData) return;
        addChecklistItem(initialData.id, newChecklistText);
        setNewChecklistText('');
    };

    const isNew = !initialData;
    // Use live checklist data so toggles update immediately
    const checklist = liveTask?.checklist || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                    <h2 className="text-xl font-bold text-white">{isNew ? 'Nueva Tarea' : 'Detalles de la Tarea'}</h2>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <button onClick={handleDelete} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors" title="Eliminar tarea">
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Title Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                            Título <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Escribe el nombre de la tarea..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-acid transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Clasificación</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-acid transition-colors cursor-pointer [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                            >
                                {spaceCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Fecha Límite</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-acid transition-colors color-scheme-dark"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Agrega notas, enlaces o detalles extra..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-acid transition-colors min-h-[100px] resize-y custom-scrollbar"
                        />
                    </div>

                    {/* Checklist Section */}
                    {!isNew ? (
                        <div>
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Checklist</label>
                            
                            <div className="space-y-1 mb-4">
                                {checklist.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 group px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <button 
                                            onClick={() => toggleChecklistItem(initialData.id, item.id)}
                                            className={`flex-shrink-0 transition-all duration-300 ${item.isCompleted ? 'text-acid' : 'text-white/20 hover:text-white/50'}`}
                                        >
                                            {item.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                        <span className={`text-sm flex-1 transition-all duration-300 ${item.isCompleted ? 'line-through text-white/30' : 'text-white/80'}`}>
                                            {item.text}
                                        </span>
                                        <button 
                                            onClick={() => deleteChecklistItem(initialData.id, item.id)}
                                            className="text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-all p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddChecklist} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Plus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="text"
                                        value={newChecklistText}
                                        onChange={(e) => setNewChecklistText(e.target.value)}
                                        placeholder="Añadir un elemento..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-acid transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newChecklistText.trim()}
                                    className="p-2.5 bg-acid/10 border border-acid/20 text-acid rounded-xl hover:bg-acid/20 transition-colors disabled:opacity-30 disabled:hover:bg-acid/10 shrink-0"
                                    title="Agregar elemento"
                                >
                                    <Plus size={18} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-acid/5 border border-acid/10 rounded-xl p-4 text-center">
                            <p className="text-xs text-acid/80 font-medium">Guarda la tarea primero para poder agregar elementos al checklist.</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 shrink-0 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-white/70 hover:bg-white/5 transition-colors font-bold text-sm"
                    >
                        CERRAR
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="px-6 py-2.5 bg-acid text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(190,242,100,0.2)]"
                    >
                        GUARDAR CAMBIOS
                    </button>
                </div>
            </div>
        </div>
    );
}
