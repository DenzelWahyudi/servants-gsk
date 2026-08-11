import React, { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { API_URL } from "../../api"
import { router } from "expo-router"
import { Pressable, Text, TextInput, View, KeyboardAvoidingView, ScrollView } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export default function LoginScreen() {
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        phoneNumber: "",
        password: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Track focus for premium input states
    const [focusedField, setFocusedField] = useState<string | null>(null)

    function handleChange(field: keyof typeof formData) {
        return (text: string) => setFormData((prev) => ({ ...prev, [field]: text }))
    }

    async function handleLogin() {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Login failed. Please try again.")
                return
            }

            await login(data.token, data.user)
            router.push("/(tabs)/home")
        } catch {
            setError("Please connect to a Wi-Fi network.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <KeyboardAvoidingView behavior="padding" className="flex-1">
                <ScrollView
                    contentContainerClassName="flex-grow items-center px-6 pb-6"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Header Section with Entrance Animation ── */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(600)}
                        className="mb-6 mt-5 items-center"
                    >
                        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 shadow-xl shadow-amber-400/20">
                            <Text className="text-2xl font-extrabold text-slate-900">S</Text>
                        </View>
                        <Text className="mb-2 text-3xl font-bold tracking-tight text-white">
                            Servants
                        </Text>
                        <View className="max-w-xs items-center">
                            <Text className="text-center text-sm italic leading-relaxed text-zinc-400">
                                "No one comes to help, no one comes to contribute, everybody comes
                                to learn and to serve"
                            </Text>
                            <Text className="mt-2 text-xs font-medium text-zinc-500">
                                — Stephen Tong
                            </Text>
                        </View>
                    </Animated.View>

                    {/* ── Login Form Card with Slide-up Animation ── */}
                    <Animated.View
                        entering={FadeInUp.delay(300).duration(600)}
                        className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl"
                    >
                        <Text className="mb-5 text-2xl font-semibold text-white">Welcome Back</Text>

                        {/* Phone Input */}
                        <View className="mb-5">
                            <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                Phone Number
                            </Text>
                            <View
                                className={`flex-row items-center rounded-2xl border bg-slate-950 ${focusedField === "phone" ? "border-amber-400 bg-slate-900" : "border-slate-800"} h-14 px-4`}
                            >
                                <Feather
                                    name="phone"
                                    size={18}
                                    color={focusedField === "phone" ? "#fbbf24" : "#64748b"}
                                    className="mr-3"
                                />
                                <TextInput
                                    className="h-full flex-1 text-base text-white"
                                    value={formData.phoneNumber}
                                    onChangeText={handleChange("phoneNumber")}
                                    keyboardType="phone-pad"
                                    placeholder="+6281234567890"
                                    placeholderTextColor="#475569"
                                    onFocus={() => setFocusedField("phone")}
                                    onBlur={() => setFocusedField(null)}
                                    selectionColor="#fbbf24"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-6">
                            <View className="mb-2 flex-row items-center justify-between px-1">
                                <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Password
                                </Text>
                                <Pressable onPress={() => router.push("/forgot-password")}>
                                    <Text className="text-xs font-semibold text-amber-400">
                                        Forgot?
                                    </Text>
                                </Pressable>
                            </View>
                            <View
                                className={`flex-row items-center rounded-2xl border bg-slate-950 ${focusedField === "password" ? "border-amber-400 bg-slate-900" : "border-slate-800"} h-14 px-4`}
                            >
                                <Feather
                                    name="lock"
                                    size={18}
                                    color={focusedField === "password" ? "#fbbf24" : "#64748b"}
                                    className="mr-3"
                                />
                                <TextInput
                                    className="h-full flex-1 text-base text-white"
                                    value={formData.password}
                                    onChangeText={handleChange("password")}
                                    secureTextEntry
                                    placeholder="••••••••"
                                    placeholderTextColor="#475569"
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    selectionColor="#fbbf24"
                                />
                            </View>
                        </View>

                        {/* Error Message */}
                        {error && (
                            <Animated.View
                                entering={FadeInDown.duration(300)}
                                className="mb-6 flex-row items-center rounded-2xl border border-red-900/50 bg-red-950/40 p-4"
                            >
                                <Feather
                                    name="alert-circle"
                                    size={18}
                                    color="#f87171"
                                    className="mr-3"
                                />
                                <Text className="flex-1 text-sm font-medium text-red-400">
                                    {error}
                                </Text>
                            </Animated.View>
                        )}

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleLogin}
                            disabled={loading}
                            className={`h-12 items-center justify-center rounded-2xl bg-amber-400 active:scale-[0.98] active:opacity-90 ${loading ? "opacity-70" : "mt-2 opacity-100"}`}
                        >
                            <Text className="text-lg font-bold tracking-wide text-slate-950">
                                {loading ? "Signing in..." : "Sign In"}
                            </Text>
                        </Pressable>

                        <View className="mt-6 flex-row items-center justify-center gap-2">
                            <Text className="text-sm text-zinc-400">Don't have an account?</Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text className="text-sm font-semibold text-amber-400">
                                    Register
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
