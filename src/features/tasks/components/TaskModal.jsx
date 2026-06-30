import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { taskSchema } from '../../../shared/lib/validation';
import { toast } from 'sonner';
import DatePickerInput from '../../../shared/components/DatePickerInput';

export default function TaskModal({ isOpen, onClose, initialData, defaultCategoryId }) {
    const { categories, tasks, addTask, updateTask, deleteTask, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useTasks();

    const getSpaceForCategory = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat?.space_id || '';
    };
    const activeSpaceId = defaultCategoryId ? getSpaceForCategory(defaultCategoryId) : (initialData ? getSpaceForCategory(initialData.category_id) : '');
    const spaceCategories = categories.filter(c => c.space_id === activeSpaceId);

    const liveTask = initialData ? tasks.find(t => t.id === initialData.id) : null;
    const isNew = !initialData;

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            categoryId: defaultCategoryId || categories[0]?.id || '',
            date: '',
        }
    });

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    categoryId: initialData.category_id,
                    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
                });
            } else {
                reset({
                    title: '',
                    description: '',
                    categoryId: defaultCategoryId || categories[0]?.id || '',
                    date: '',
                });
            }
        }
    }, [isOpen, initialData, defaultCategoryId, categories, reset]);

    if (!isOpen) return null;

    const onSubmit = (data) => {
        const taskData = {
            title: data.title,
            description: data.description || '',
            categoryId: data.categoryId,
            date: data.date ? new Date(data.date).toISOString() : null
        };

        if (isNew) {
            addTask(data.categoryId, data.title, data.description || '', taskData.date);
            toast.success('Tarea creada exitosamente');
        } else {
            updateTask(initialData.id, taskData);
            toast.success('Tarea actualizada');
        }
        onClose();
    };

    const handleDelete = () => {
        if (initialData && window.confirm('¿Seguro que deseas eliminar esta tarea?')) {
            deleteTask(initialData.id);
            toast.success('Tarea eliminada');
            onClose();
        }
    };

    const handleAddChecklist = (e) => {
        e.preventDefault();
        const text = watch('checklistText');
        if (!text?.trim() || !initialData) return;
        addChecklistItem(initialData.id, text);
        setValue('checklistText', '');
    };

    const checklist = liveTask?.checklist || [];
    const titleValue = watch('title');
    const checklistText = watch('checklistText');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
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

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                            Título <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('title')}
                            placeholder="Escribe el nombre de la tarea..."
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-lg font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-acid transition-colors ${errors.title ? 'border-red-500' : 'border-white/10'}`}
                            autoFocus
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Clasificación</label>
                            <select
                                {...register('categoryId')}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-acid transition-colors cursor-pointer [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                            >
                                {spaceCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Fecha Límite</label>
                            <DatePickerInput
                                value={watch('date')}
                                onChange={(date) => setValue('date', date)}
                                placeholder="Sin fecha"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Descripción</label>
                        <textarea
                            {...register('description')}
                            placeholder="Agrega notas, enlaces o detalles extra..."
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-acid transition-colors min-h-[100px] resize-y custom-scrollbar ${errors.description ? 'border-red-500' : 'border-white/10'}`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {!isNew ? (
                        <div>
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Checklist</label>

                            <div className="space-y-1 mb-4">
                                {checklist.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 group px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                                        <button
                                            type="button"
                                            onClick={() => toggleChecklistItem(initialData.id, item.id)}
                                            className={`flex-shrink-0 transition-all duration-300 ${item.is_completed ? 'text-acid' : 'text-white/20 hover:text-white/50'}`}
                                        >
                                            {item.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                        <span className={`text-sm flex-1 transition-all duration-300 ${item.is_completed ? 'line-through text-white/30' : 'text-white/80'}`}>
                                            {item.text}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => deleteChecklistItem(initialData.id, item.id)}
                                            className="text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-all p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div onSubmit={handleAddChecklist} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Plus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input
                                        type="text"
                                        value={checklistText || ''}
                                        onChange={(e) => setValue('checklistText', e.target.value)}
                                        placeholder="Añadir un elemento..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-acid transition-colors"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddChecklist}
                                    disabled={!checklistText?.trim()}
                                    className="p-2.5 bg-acid/10 border border-acid/20 text-acid rounded-xl hover:bg-acid/20 transition-colors disabled:opacity-30 disabled:hover:bg-acid/10 shrink-0"
                                    title="Agregar elemento"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-acid/5 border border-acid/10 rounded-xl p-4 text-center">
                            <p className="text-xs text-acid/80 font-medium">Guarda la tarea primero para poder agregar elementos al checklist.</p>
                        </div>
                    )}

                    <div className="p-6 border-t border-white/5 shrink-0 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-white/70 hover:bg-white/5 transition-colors font-bold text-sm"
                        >
                            CERRAR
                        </button>
                        <button
                            type="submit"
                            disabled={!titleValue?.trim()}
                            className="px-6 py-2.5 bg-acid text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(190,242,100,0.2)]"
                        >
                            {isNew ? 'CREAR TAREA' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
