import { z } from 'zod';

export const taskSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(100, 'Máximo 100 caracteres'),
    description: z.string().max(500, 'Máximo 500 caracteres').optional(),
    categoryId: z.string().min(1, 'La categoría es requerida'),
    date: z.string().optional().nullable(),
});

export const categorySchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
});

export const accountSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    amount: z.coerce.number().min(0, 'El monto debe ser positivo').max(999999999, 'Monto demasiado grande'),
});

export const transactionSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    amount: z.string().min(1, 'El monto es requerido'),
    date: z.string().optional(),
    status: z.number().min(0).max(1),
});

export const spaceSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
});

export const checklistItemSchema = z.object({
    text: z.string().min(1, 'El texto es requerido').max(200, 'Máximo 200 caracteres'),
});

export function validateForm(schema, data) {
    const result = schema.safeParse(data);
    return {
        isValid: result.success,
        errors: result.success ? {} : result.error.flatten().fieldErrors,
        data: result.success ? result.data : data,
    };
}
