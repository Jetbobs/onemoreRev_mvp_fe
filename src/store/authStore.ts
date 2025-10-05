import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  email: string
  name?: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        })
      },

      checkAuth: async () => {
        try {
          // 백엔드에 세션 유효성 검증
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/profile`, {
            credentials: 'include'
          })

          if (response.ok) {
            const userData = await response.json()
            set({
              user: userData,
              isAuthenticated: true
            })
            return true
          } else {
            // 세션 만료됨
            set({
              user: null,
              isAuthenticated: false
            })
            return false
          }
        } catch (error) {
          console.error('인증 확인 실패:', error)
          set({
            user: null,
            isAuthenticated: false
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
