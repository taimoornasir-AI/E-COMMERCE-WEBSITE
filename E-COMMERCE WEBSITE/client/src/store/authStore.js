import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '../api/endpoints';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login({ email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          const error = err.response?.data?.error || 'Login failed';
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register({ name, email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          const error = err.response?.data?.error || 'Registration failed';
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await authApi.logout(refreshToken);
        } catch {}
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      refreshUser: async () => {
        try {
          const res = await authApi.me();
          set({ user: res.data.data.user });
        } catch {}
      },

      updateUser: (updates) => {
        set(state => ({ user: state.user ? { ...state.user, ...updates } : null }));
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isAuthenticated: () => !!get().user && !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
