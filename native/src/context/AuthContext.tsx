import { createContext } from "react"

export type User = {
    id: string
    name: string
    role: string
}

type AuthContextType = {
    user: User | null
    token: string | null
    login: (token: string, user: User) => Promise<void>
    logout: () => Promise<void>
    isAuthenticated: boolean
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)
