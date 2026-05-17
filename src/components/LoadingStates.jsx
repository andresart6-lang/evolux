import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }) {
    return (
        <Loader2 
            size={size} 
            className={`animate-spin text-acid ${className}`}
        />
    );
}

export function LoadingCard({ className = '' }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="h-4 bg-white/5 rounded w-1/3 mb-4 skeleton-shimmer" />
            <div className="h-8 bg-white/5 rounded w-2/3 mb-2 skeleton-shimmer" />
            <div className="h-3 bg-white/5 rounded w-1/2 skeleton-shimmer" />
        </div>
    );
}

export function LoadingPage({ message = 'Cargando...' }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <LoadingSpinner size={48} />
            <p className="text-text-muted text-sm">{message}</p>
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 text-center p-8 animate-fade-in">
            {Icon && (
                <div className="relative">
                    <div className="absolute inset-0 bg-acid/20 blur-xl rounded-full"></div>
                    <div className="relative p-6 rounded-full bg-white/5 text-text-muted">
                        <Icon size={48} className="opacity-60" />
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <h3 className="text-lg font-display font-bold text-white">{title}</h3>
                {description && (
                    <p className="text-sm text-text-muted max-w-md leading-relaxed">{description}</p>
                )}
            </div>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-2 px-6 py-2.5 bg-acid text-black rounded-xl font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-acid/20 transition-all duration-200"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export function SkeletonRow({ className = '' }) {
    return (
        <div className={`flex items-center gap-4 p-4 ${className}`}>
            <div className="w-8 h-8 rounded bg-white/5 skeleton-shimmer" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4 skeleton-shimmer" />
                <div className="h-3 bg-white/5 rounded w-1/2 skeleton-shimmer" />
            </div>
            <div className="w-20 h-6 bg-white/5 rounded skeleton-shimmer" />
        </div>
    );
}
