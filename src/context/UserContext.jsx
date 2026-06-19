import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const UserContext = createContext({
    user: { name: 'Guest', email: '', avatar: null, plan: 'Free' },
    updateName: () => { },
    updateAvatar: () => { }
});

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const { profile, user: authUser, updateProfile } = useAuth();
    
    const user = profile ? {
        name: profile.name || authUser?.user_metadata?.name || 'Guest',
        email: authUser?.email || '',
        avatar: profile.avatar || null,
        plan: profile.plan || 'Free'
    } : {
        name: 'Guest',
        email: '',
        avatar: null,
        plan: 'Free'
    };

    const updateName = async (newName) => {
        try {
            await updateProfile({ name: newName });
        } catch (err) {
            console.error('Error updating name:', err);
        }
    };

    const updateAvatar = async (newAvatar) => {
        try {
            await updateProfile({ avatar: newAvatar });
        } catch (err) {
            console.error('Error updating avatar:', err);
        }
    };

    return (
        <UserContext.Provider value={{ user, updateName, updateAvatar }}>
            {children}
        </UserContext.Provider>
    );
}