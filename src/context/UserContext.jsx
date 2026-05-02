import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext({
    user: { name: 'Guest', email: '', avatar: null, plan: 'Free' },
    updateName: () => { },
    updateAvatar: () => { }
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        name: 'Andres G.',
        email: 'andres@example.com',
        avatar: null, // null = show initial, string = url/path
        plan: 'Plan Maestro'
    });

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
};
