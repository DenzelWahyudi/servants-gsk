import { useState, useEffect, type ReactNode } from "react"
import { AuthContext, type User } from "./AuthContext"
import { isTokenExpired } from "@/utils/tokenUtils"
import AsyncStorage from "@react-native-async-storage/async-storage"

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Hydrate auth state from AsyncStorage on mount
    useEffect(() => {
        async function loadStoredAuth() {
            try {
                const storedToken = await AsyncStorage.getItem("token")

                if (!storedToken || isTokenExpired(storedToken)) {
                    await AsyncStorage.multiRemove(["token", "user"])
                    return
                }

                const storedUser = await AsyncStorage.getItem("user")
                setToken(storedToken)
                setUser(storedUser ? JSON.parse(storedUser) : null)
            } catch (e) {
                console.error("Failed to load auth from storage:", e)
            } finally {
                setIsLoading(false)
            }
        }

        void loadStoredAuth()
    }, [])

    async function login(token: string, user: User) {
        await AsyncStorage.setItem("token", token)
        await AsyncStorage.setItem("user", JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    async function logout() {
        await AsyncStorage.multiRemove(["token", "user"])
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    )
}
