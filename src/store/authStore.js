import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (username, password) => {
        // Por ahora credenciales hardcodeadas
        // TODO: Implementar autenticación real con Supabase
        if (username === 'admin' && password === 'posgrado2026') {
          set({ isAuthenticated: true, user: { username } })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
