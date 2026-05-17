import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext({
    user: { name: 'Guest', email: '', avatar: null, plan: 'Free' },
    updateName: () => { },
    updateAvatar: () => { }
});

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('app_user');
        if (saved) return JSON.parse(saved);
        return { name: 'Andres G.', email: 'andres@example.com', avatar: null, plan: 'Plan Maestro' };
    });

    useEffect(() => {
        localStorage.setItem('app_user', JSON.stringify(user));
    }, [user]);

    const updateName = (newName) => {
        setUser(prev => ({ ...prev, name: newName }));
    };

    const updateAvatar = (newAvatar) => {
        setUser(prev => ({ ...prev, avatar: newAvatar }));
    };

    return (
        <UserContext.Provider value={{ user, updateName, updateAvatar }}>
            {children}
        </UserContext.Provider>
    );
}
