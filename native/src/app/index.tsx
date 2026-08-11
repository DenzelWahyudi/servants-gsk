import { Redirect } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { ActivityIndicator, View } from "react-native"

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-950">
                <ActivityIndicator size="large" color="#fbbf24" />
            </View>
        )
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />
    }

    return <Redirect href="/login" />
}
