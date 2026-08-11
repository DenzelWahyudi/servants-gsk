import React, { useState, useCallback } from "react"
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { API_URL } from "../../../api"
import { format } from "date-fns"
import { useFocusEffect } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

interface Service {
    id: string
    name: string
    date: string
    time: string
    status: string
}

interface Role {
    id: string
    serviceId: string
    name: string
    spotsTotal: number
    spotsFilled: number
}

interface SignUp {
    roleId: string
    serviceName: string
    roleName: string
    date: string
    time: string
}

export default function OpeningsTab() {
    const [services, setServices] = useState<Service[] | null>(null)
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [userId, setUserId] = useState("")
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)

    const [signUpData, setSignUpData] = useState<SignUp | null>(null)
    const [signUpLoading, setSignUpLoading] = useState(false)
    const [signUpError, setSignUpError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            const rolesRes = await fetch(`${API_URL}/api/roles`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const rolesData = await rolesRes.json()
            setRoles(rolesData)

            const servicesRes = await fetch(`${API_URL}/api/services`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const servicesData = await servicesRes.json()
            setServices(servicesData)

            if (token) {
                const userRes = await fetch(`${API_URL}/api/users/id`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                const userData = await userRes.json()
                setUserId(userData)
            }
        } catch (error) {
            console.error("Failed to fetch openings", error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            setLoading(true)
            fetchData().finally(() => setLoading(false))
            return () => {}
        }, [token])
    )

    async function handleAssign() {
        if (!signUpData || !userId) return
        setSignUpError(null)
        setSignUpLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    roleId: signUpData.roleId,
                    status: "pending"
                })
            })

            const data = await response.json()
            if (!response.ok) {
                setSignUpError(data.message || "Sign Up failed!")
                return
            }

            setSignUpData(null)
            fetchData()
        } catch {
            setSignUpError("Could not connect to server")
        } finally {
            setSignUpLoading(false)
        }
    }

    const openRoles =
        roles?.filter((role) => {
            if (role.spotsFilled >= role.spotsTotal) return false
            const service = services?.find(
                (s) => s.id === role.serviceId && s.status === "Roles Open"
            )
            return !!service
        }) || []

    return (
        <SafeAreaView className="flex-1 bg-zinc-50" edges={["top"]}>
            <View className="flex-1">
                <ScrollView className="flex-1" contentContainerClassName="pb-10">
                    <View className="px-6 pb-6">
                        <Text className="text-3xl font-bold text-zinc-900">Open Roles</Text>
                        <Text className="mt-1 text-base font-medium text-zinc-500">
                            Find a place to serve
                        </Text>
                    </View>

                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#d97706" />
                        </View>
                    ) : (
                        <View className="gap-4 px-6">
                            {openRoles.length === 0 ? (
                                <View className="mt-4 items-center justify-center rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
                                    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                                        <Feather name="check-circle" size={32} color="#a1a1aa" />
                                    </View>
                                    <Text className="text-center text-lg font-medium text-zinc-500">
                                        All roles are filled!
                                    </Text>
                                </View>
                            ) : (
                                openRoles.map((role) => {
                                    const service = services?.find((s) => s.id === role.serviceId)
                                    if (!service) return null

                                    return (
                                        <View
                                            key={role.id}
                                            className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm"
                                        >
                                            <View className="mb-4 flex-row items-start justify-between">
                                                <View className="mr-4 flex-1">
                                                    <Text className="mb-1 text-lg font-bold leading-tight text-zinc-900">
                                                        {service.name}
                                                    </Text>
                                                    <Text className="font-medium text-zinc-500">
                                                        {format(
                                                            new Date(service.date),
                                                            "EEEE, d MMMM yyyy"
                                                        )}
                                                    </Text>
                                                </View>
                                                <View className="rounded-xl bg-zinc-100/80 px-3 py-2">
                                                    <Text className="text-xs font-bold text-zinc-700">
                                                        {service.time}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                                                <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-900/60">
                                                    Role Needed
                                                </Text>
                                                <Text className="text-base font-bold text-amber-900">
                                                    {role.name}
                                                </Text>
                                            </View>

                                            <Pressable
                                                onPress={() =>
                                                    setSignUpData({
                                                        roleId: role.id,
                                                        serviceName: service.name,
                                                        roleName: role.name,
                                                        date: format(
                                                            new Date(service.date),
                                                            "d MMMM yyyy"
                                                        ),
                                                        time: service.time
                                                    })
                                                }
                                                className="flex-row items-center justify-center rounded-xl bg-amber-400 py-2.5"
                                                style={({ pressed }) => ({
                                                    opacity: pressed ? 0.8 : 1
                                                })}
                                            >
                                                <Text className="text-base font-bold text-amber-950">
                                                    Sign Up
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )
                                })
                            )}
                        </View>
                    )}
                </ScrollView>

                <Modal
                    visible={!!signUpData}
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                        if (!signUpLoading) setSignUpData(null)
                    }}
                >
                    <View className="flex-1 items-center justify-center bg-black/60 px-6 pb-32">
                        <Pressable
                            className="absolute inset-0"
                            onPress={() => {
                                if (!signUpLoading) setSignUpData(null)
                            }}
                        />
                        <View className="relative z-10 w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                            <View className="mb-6 flex-row items-center justify-between">
                                <Text className="text-2xl font-bold text-zinc-50">Sign Up</Text>
                                <Pressable
                                    onPress={() => {
                                        if (!signUpLoading) setSignUpData(null)
                                    }}
                                    className="rounded-full bg-slate-800 p-2"
                                >
                                    <Feather name="x" size={20} color="#a1a1aa" />
                                </Pressable>
                            </View>

                            <View className="mb-8 gap-4">
                                <View>
                                    <Text className="mb-1.5 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        Service
                                    </Text>
                                    <View className="rounded-xl border border-slate-700 bg-slate-800/80 p-3.5">
                                        <Text className="text-base font-medium text-zinc-100">
                                            {signUpData?.serviceName}
                                        </Text>
                                    </View>
                                </View>
                                <View>
                                    <Text className="mb-1.5 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        Role
                                    </Text>
                                    <View className="rounded-xl border border-slate-700 bg-slate-800/80 p-3.5">
                                        <Text className="text-base font-medium text-zinc-100">
                                            {signUpData?.roleName}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Text className="mb-1.5 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                            Date
                                        </Text>
                                        <View className="rounded-xl border border-slate-700 bg-slate-800/80 p-3.5">
                                            <Text className="text-base font-medium text-zinc-100">
                                                {signUpData?.date}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="mb-1.5 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                            Time
                                        </Text>
                                        <View className="rounded-xl border border-slate-700 bg-slate-800/80 p-3.5">
                                            <Text className="text-base font-medium text-zinc-100">
                                                {signUpData?.time}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {signUpError && (
                                <View className="mb-6 flex-row items-center rounded-xl border border-rose-500/30 bg-rose-500/20 p-3">
                                    <Feather
                                        name="alert-circle"
                                        size={16}
                                        color="#fb7185"
                                        className="mr-2"
                                    />
                                    <Text className="ml-2 flex-1 text-sm font-medium text-rose-400">
                                        {signUpError}
                                    </Text>
                                </View>
                            )}

                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={() => setSignUpData(null)}
                                    disabled={signUpLoading}
                                    className="flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 py-3"
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                >
                                    <Text className="text-lg font-bold text-zinc-300">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleAssign}
                                    disabled={signUpLoading}
                                    className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                                        signUpLoading ? "bg-amber-500/50" : "bg-amber-400"
                                    }`}
                                    style={({ pressed }) => ({
                                        opacity: pressed && !signUpLoading ? 0.8 : 1
                                    })}
                                >
                                    {signUpLoading && (
                                        <ActivityIndicator
                                            size="small"
                                            color="#451a03"
                                            className="mr-2"
                                        />
                                    )}
                                    <Text
                                        className={`text-lg font-bold ${signUpLoading ? "text-amber-900/50" : "text-amber-950"}`}
                                    >
                                        {signUpLoading ? "Signing Up..." : "Confirm"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    )
}
