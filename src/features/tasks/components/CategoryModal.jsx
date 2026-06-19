import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import ColorPicker from '../../../shared/components/ColorPicker';
import { categorySchema } from '../../../shared/lib/validation';
import { toast } from 'sonner';

export default function CategoryModal({ isOpen, onClose, onSave, initialData }) {
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            color: '#bef264',
        }
    });

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    color: initialData.color,
                });
            } else {
                reset({
                    name: '',
                    color: '#bef264',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const onFormSubmit = (data) => {
        onSave(data.name, data.color);
        toast.success(initialData ? 'Categoría actualizada' : 'Categoría creada');
        onClose();
    };

    const nameValue = watch('name');

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

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            {...register('name')}
                            placeholder="Ej. Diseño, Desarrollo..."
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid transition-colors ${errors.name ? 'border-red-500' : 'border-white/10'}`}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Color de Identificación
                        </label>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <ColorPicker 
                                selectedColor={watch('color') || '#bef264'} 
                                onChange={(color) => setValue('color', color)} 
                            />
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
                            disabled={!nameValue?.trim()}
                            className="px-6 py-2.5 bg-acid text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {initialData ? 'ACTUALIZAR' : 'CREAR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
