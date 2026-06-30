import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const showToast = useCallback((message, type = 'default', options = {}) => {
        const toastFn = toast;
        switch (type) {
            case 'success':
                toast.success(message, options);
                break;
            case 'error':
                toast.error(message, options);
                break;
            case 'warning':
                toast.warning(message, options);
                break;
            case 'info':
                toast(message, { ...options, icon: 'ℹ️' });
                break;
            default:
                toast(message, options);
        }
    }, []);

    const value = { showToast };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
}
