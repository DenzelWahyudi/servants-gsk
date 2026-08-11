import React, { useRef, useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView } from "react-native"
import { API_URL } from "../../api"
import { router } from "expo-router"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirm_password: "",
        code: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState("form")
    const inputRef = useRef<TextInput>(null)
    const [focused, setFocused] = useState(false)
    const [timer, setTimer] = useState(600)

    // Track focus for premium input states
    const [focusedField, setFocusedField] = useState<string | null>(null)

    useEffect(() => {
        if (page !== "otp" || timer === 0) return
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [page, timer])

    function handleChange(field: keyof typeof formData) {
        return (text: string) => setFormData((prev) => ({ ...prev, [field]: text }))
    }

    function handleOTPChange(text: string) {
        if (error !== null) setError(null)
        const digits = text.replace(/\D/g, "")
        setFormData((prev) => ({ ...prev, code: digits }))
    }

    async function handleRegister() {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Registration failed. Please try again.")
                return
            }

            router.push("/login")
        } catch {
            setError("Please connect to a Wi-Fi network and try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleSendOTP() {
        setLoading(true)
        setError(null)

        try {
            const check = await fetch(`${API_URL}/api/users/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const checkData = await check.json()
            if (!check.ok) {
                setError(checkData.message || "Failed checks.")
                return
            }

            const response = await fetch(`${API_URL}/api/users/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: formData.phoneNumber })
            })
            const data = await response.json()
            if (!response.ok) {
                setError(
                    data.statusCode === 400
                        ? "Use international format eg: +62123456..."
                        : data.message || "Failed to send otp."
                )
                return
            }

            setPage("otp")
            setTimer(600)
        } catch {
            setError("Please connect to a Wi-Fi network and try again.")
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
                    {page === "form" ? (
                        <Animated.View
                            entering={FadeInUp.delay(100).duration(600)}
                            className="mt-4 w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl"
                        >
                            <Text className="mb-1 text-2xl font-semibold text-white">
                                Create Account
                            </Text>
                            <Text className="mb-6 text-sm text-zinc-400">
                                Join the servants team
                            </Text>

                            {/* Name Input */}
                            <View className="mb-4">
                                <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Full Name
                                </Text>
                                <View
                                    className={`flex-row items-center rounded-2xl border bg-slate-950 ${focusedField === "name" ? "border-amber-400 bg-slate-900" : "border-slate-800"} h-14 px-4`}
                                >
                                    <Feather
                                        name="user"
                                        size={18}
                                        color={focusedField === "name" ? "#fbbf24" : "#64748b"}
                                        className="mr-3"
                                    />
                                    <TextInput
                                        className="h-full flex-1 text-base text-white"
                                        value={formData.name}
                                        onChangeText={handleChange("name")}
                                        placeholder="John Doe"
                                        placeholderTextColor="#475569"
                                        onFocus={() => setFocusedField("name")}
                                        onBlur={() => setFocusedField(null)}
                                        selectionColor="#fbbf24"
                                    />
                                </View>
                            </View>

                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Email
                                </Text>
                                <View
                                    className={`flex-row items-center rounded-2xl border bg-slate-950 ${focusedField === "email" ? "border-amber-400 bg-slate-900" : "border-slate-800"} h-14 px-4`}
                                >
                                    <Feather
                                        name="mail"
                                        size={18}
                                        color={focusedField === "email" ? "#fbbf24" : "#64748b"}
                                        className="mr-3"
                                    />
                                    <TextInput
                                        className="h-full flex-1 text-base text-white"
                                        value={formData.email}
                                        onChangeText={handleChange("email")}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholder="john@example.com"
                                        placeholderTextColor="#475569"
                                        onFocus={() => setFocusedField("email")}
                                        onBlur={() => setFocusedField(null)}
                                        selectionColor="#fbbf24"
                                    />
                                </View>
                            </View>

                            {/* Phone Input */}
                            <View className="mb-4">
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
                            <View className="mb-4">
                                <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Password
                                </Text>
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

                            {/* Confirm Password Input */}
                            <View className="mb-6">
                                <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Confirm Password
                                </Text>
                                <View
                                    className={`flex-row items-center rounded-2xl border bg-slate-950 ${focusedField === "confirm" ? "border-amber-400 bg-slate-900" : "border-slate-800"} h-14 px-4`}
                                >
                                    <Feather
                                        name="check-circle"
                                        size={18}
                                        color={focusedField === "confirm" ? "#fbbf24" : "#64748b"}
                                        className="mr-3"
                                    />
                                    <TextInput
                                        className="h-full flex-1 text-base text-white"
                                        value={formData.confirm_password}
                                        onChangeText={handleChange("confirm_password")}
                                        secureTextEntry
                                        placeholder="••••••••"
                                        placeholderTextColor="#475569"
                                        onFocus={() => setFocusedField("confirm")}
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
                                onPress={handleSendOTP}
                                disabled={loading}
                                className={`h-14 items-center justify-center rounded-2xl bg-amber-400 active:scale-[0.98] active:opacity-90 ${loading ? "opacity-70" : "mt-2 opacity-100"}`}
                            >
                                <Text className="text-lg font-bold tracking-wide text-slate-950">
                                    {loading ? "Loading..." : "Register"}
                                </Text>
                            </Pressable>

                            <View className="mt-6 flex-row items-center justify-center gap-2">
                                <Text className="text-sm text-zinc-400">
                                    Already have an account?
                                </Text>
                                <Pressable onPress={() => router.push("/login")}>
                                    <Text className="text-sm font-semibold text-amber-400">
                                        Login
                                    </Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    ) : (
                        <Animated.View
                            entering={FadeInUp.delay(100).duration(600)}
                            className="mt-12 w-full max-w-sm items-center rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
                        >
                            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
                                <Feather name="shield" size={28} color="#fbbf24" />
                            </View>
                            <Text className="mb-2 text-2xl font-semibold text-white">
                                OTP Verification
                            </Text>
                            <Text className="mb-8 text-center text-sm text-zinc-400">
                                We just sent an SMS to{"\n"}
                                <Text className="font-medium text-white">
                                    {formData.phoneNumber}
                                </Text>
                            </Text>

                            <Pressable
                                className="mb-8 flex-row gap-2"
                                onPress={() => inputRef.current?.focus()}
                            >
                                <TextInput
                                    value={formData.code}
                                    onChangeText={handleOTPChange}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    ref={inputRef}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    className="absolute h-full w-full opacity-0"
                                />
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const isActive = focused && i === formData.code.length
                                    return (
                                        <View
                                            key={i}
                                            className={`h-14 w-11 items-center justify-center rounded-xl border ${isActive ? "border-amber-400 bg-slate-900" : error ? "border-red-500 bg-red-950/40" : "border-slate-800 bg-slate-950"}`}
                                            style={
                                                isActive
                                                    ? {
                                                          shadowColor: "#fbbf24",
                                                          shadowOffset: { width: 0, height: 0 },
                                                          shadowOpacity: 0.2,
                                                          shadowRadius: 8,
                                                          elevation: 4 // Android
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <Text className="text-2xl font-medium text-white">
                                                {formData.code[i]}
                                            </Text>
                                        </View>
                                    )
                                })}
                            </Pressable>

                            <Text className="mb-6 text-sm text-zinc-400">
                                Code expires in{" "}
                                <Text className="font-medium text-amber-400">
                                    {Math.floor(timer / 60)
                                        .toString()
                                        .padStart(2, "0")}
                                    :{(timer % 60).toString().padStart(2, "0")}
                                </Text>
                            </Text>

                            {error && (
                                <Animated.View
                                    entering={FadeInDown.duration(300)}
                                    className="mb-6 w-full flex-row items-center rounded-2xl border border-red-900/50 bg-red-950/40 p-4"
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

                            <Pressable
                                onPress={handleRegister}
                                disabled={loading}
                                className={`h-14 w-full items-center justify-center rounded-2xl bg-amber-400 active:scale-[0.98] active:opacity-90 ${loading ? "opacity-70" : "opacity-100"}`}
                            >
                                <Text className="text-lg font-bold tracking-wide text-slate-950">
                                    {loading ? "Verifying..." : "Verify Code"}
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => setPage("form")} className="mt-6 py-2">
                                <Text className="flex-row items-center font-medium text-zinc-400">
                                    <Feather
                                        name="arrow-left"
                                        size={14}
                                        color="#a1a1aa"
                                        className="mr-1"
                                    />{" "}
                                    Back to register
                                </Text>
                            </Pressable>
                        </Animated.View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
