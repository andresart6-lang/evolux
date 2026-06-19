import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/context/AuthContext'

const root = createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster position="bottom-right" theme="dark" />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)