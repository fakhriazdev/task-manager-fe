import { create } from 'zustand';
import { UserInfo } from '@/lib/auth/authTypes';

interface AuthState {
    user: UserInfo | null;
    isAuthenticated: boolean;
    setUser: (user: UserInfo | null) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
        }),

    clearUser: () =>
        set({
            user: null,
            isAuthenticated: false,
        }),
}));
