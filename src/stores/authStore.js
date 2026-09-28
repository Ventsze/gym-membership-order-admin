import { create } from 'zustand'

const TOKEN_KEY = 'gym_admin_token'
const USER_KEY = 'gym_admin_user'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  username: localStorage.getItem(USER_KEY) || '',
  login: (username) => {
    const token = `mock-token-${Date.now()}`
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, username)
    set({ token, username })
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, username: '' })
  },
}))

export { TOKEN_KEY }
