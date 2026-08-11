import { useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { registerForPushNotificationsAsync } from "@/utils/notifications"
import { useAuth } from "@/hooks/useAuth"
import { API_URL } from "../../../api"

export default function TabLayout() {
    // const { token } = useAuth()

    // useEffect(() => {
    //     if (!token) return

    //     registerForPushNotificationsAsync().then(async (pushToken) => {
    //         if (pushToken) {
    //             try {
    //                 await fetch(`${API_URL}/api/users/push-token`, {
    //                     method: "PUT",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Authorization: `Bearer ${token}`
    //                     },
    //                     body: JSON.stringify({ pushToken })
    //                 })
    //             } catch (error) {
    //                 console.error("Failed to save push token to DB", error)
    //             }
    //         }
    //     })
    // }, [token])

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.surface
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="schedule"
                options={{
                    title: "Schedule",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="openings"
                options={{
                    title: "Openings",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="menu" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="chats"
                options={{
                    title: "Chat",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbox" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    title: "Notes",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

const colors = {
    background: "#1a1a2e",
    surface: "#2a2a4a",
    primary: "#4fc3f7",
    textSecondary: "#a0a0b0"
}
