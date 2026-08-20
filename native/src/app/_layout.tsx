import { Stack } from "expo-router"
import "../../global.css"
import { AuthProvider } from "@/context/AuthProvider"
import { useEffect, useRef } from "react"
import { AppState } from "react-native"
import { dismissAllNotifications } from "@/utils/notifications"
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite"

async function migrateDbAsync(db: SQLiteDatabase) {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
            color TEXT PRIMARY KEY NOT NULL,
            text TEXT NOT NULL DEFAULT ''
        );
    `)
}

export default function RootLayout() {
    const appState = useRef(AppState.currentState)

    useEffect(() => {
        // Clear notifications if the app is opened directly
        void dismissAllNotifications()

        // Listen for app state changes to clear notifications when returning from background
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === "active") {
                // User has entered the app, dismiss all notifications
                void dismissAllNotifications()
            }
            appState.current = nextAppState
        })

        return () => {
            subscription.remove()
        }
    }, [])

    return (
        <AuthProvider>
            <SQLiteProvider databaseName="notes.db" onInit={migrateDbAsync}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" options={{ title: "Login" }} />
                    <Stack.Screen name="register" options={{ title: "Register" }} />
                    <Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }} />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </SQLiteProvider>
        </AuthProvider>
    )
}
