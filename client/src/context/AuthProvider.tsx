import { useState, type ReactNode } from "react"
import { AuthContext, type User } from "./AuthContext"
import { isTokenExpired } from "../utils/tokenUtils"

function getStoredToken(): string | null {
    const token = localStorage.getItem("token")
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return null
    }
    return token
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(getStoredToken)

    const [user, setUser] = useState<User | null>(() => {
        if (!getStoredToken()) return null
        const stored = localStorage.getItem("user")
        return stored ? JSON.parse(stored) : null
    })

    function login(token: string, user: User) {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    function logout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}
