import React, { useState, useCallback } from "react"
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native"
import { useFocusEffect, router, Href } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { startOfToday, isEqual, startOfDay, format } from "date-fns"
import { API_URL } from "../../../api"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

type StatsCardProps = {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    buttonLabel: string
    linkTo?: string
    onClick?: () => void
    onDisabled?: boolean
}

interface Schedule {
    roleName: string
    serviceName: string
    date: Date
    time: string
}

interface Role {
    id?: string
    serviceId?: string
    name?: string
    spotsTotal: number
    spotsFilled: number
}

interface Assignment {
    id: string
    serviceName: string
    roleName: string
    date: string
    time: string
    status: string
}

interface Service {
    id: string
    name: string
    date: string
    time: string
    status: string
    roles?: Role[]
}

export default function HomeTab() {
    const [userName, setUserName] = useState<string | null>(null)
    const [schedule, setSchedule] = useState<Schedule[] | null>(null)
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [assignments, setAssignments] = useState<Assignment[] | null>(null)
    const { token, logout } = useAuth()
    const [loading, setLoading] = useState(false)

    const todayServiceCount =
        schedule?.filter((s) => {
            const serviceDate = startOfDay(new Date(s.date))
            return isEqual(serviceDate, startOfToday())
        }).length ?? 0

    const openRoles =
        roles?.filter((r) => {
            return r.spotsFilled < r.spotsTotal
        }).length ?? null

    useFocusEffect(
        useCallback(() => {
            async function fetchUser() {
                const response = await fetch(`${API_URL}/api/users/name`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                const data = await response.json()
                setUserName(data)
            }
            async function fetchSchedule() {
                const response = await fetch(`${API_URL}/api/assignments/schedule`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                const data: Schedule[] = await response.json()
                setSchedule(Array.isArray(data) ? data : [])
            }
            async function fetchRoles() {
                const rolesResponse = await fetch(`${API_URL}/api/roles`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                const rolesData = await rolesResponse.json()
                setRoles(rolesData)
            }
            if (token) {
                void fetchUser()
                void fetchSchedule()
            }
            void fetchRoles()

            return () => {}
        }, [token])
    )

    async function getAssignments() {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/assignments/all`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        const data: Assignment[] = await response.json()
        setAssignments(data)
        setLoading(false)
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-50" edges={["top"]}>
            <ScrollView className="flex-1" contentContainerClassName="pb-10">
                <View className="flex-row items-center justify-between px-6 pb-6">
                    <View>
                        <Text className="text-3xl font-bold text-zinc-900">
                            Hello, <Text className="text-amber-500">{userName ?? "..."}</Text>
                        </Text>
                        <Text className="mt-1 text-base font-medium text-zinc-500">
                            Here is what's happening today
                        </Text>
                    </View>
                    <Pressable
                        onPress={async () => {
                            await logout()
                            router.push("/login")
                        }}
                        className="rounded-full bg-zinc-200/50 p-2"
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#71717a" />
                    </Pressable>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="px-6 pb-6 gap-4"
                >
                    <StatsCard
                        linkTo="/schedule"
                        icon="notifications"
                        title={`${todayServiceCount} Service Reminders Today`}
                        buttonLabel="View Schedule"
                    />
                    <StatsCard
                        onClick={getAssignments}
                        icon="person"
                        title="Pending Sign-ups"
                        buttonLabel={loading ? "Loading..." : "Review Now"}
                        onDisabled={loading}
                    />
                    <StatsCard
                        linkTo="/openings"
                        icon="calendar"
                        title={`Open Recruitment: ${openRoles ?? 0}`}
                        buttonLabel="Fill Remaining Roles"
                    />
                </ScrollView>

                <View className="mt-2 min-h-[500px] flex-1 rounded-t-3xl bg-white px-6 pt-8 shadow-sm">
                    <UpcomingServicesMobile />
                </View>

                <Modal
                    visible={!!assignments}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setAssignments(null)}
                >
                    <View className="flex-1 items-center justify-center bg-black/60 px-4 pb-12 pt-12">
                        <Pressable
                            className="absolute inset-0"
                            onPress={() => setAssignments(null)}
                        />
                        <View className="relative z-10 max-h-full w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
                            <View className="flex-row items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-5">
                                <Text className="text-xl font-bold text-zinc-50">
                                    Pending Assignments
                                </Text>
                                <Pressable
                                    onPress={() => setAssignments(null)}
                                    className="-mr-2 p-2"
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                >
                                    <Text className="text-lg font-bold text-zinc-400">✕</Text>
                                </Pressable>
                            </View>

                            <ScrollView className="p-4" contentContainerClassName="gap-4 pb-8">
                                {assignments?.map((a) => (
                                    <View
                                        key={a.id}
                                        className="rounded-2xl border border-slate-700 bg-slate-800 p-5"
                                    >
                                        <View className="mb-3 flex-row items-start justify-between">
                                            <Text className="mr-3 flex-1 text-lg font-bold leading-tight text-zinc-50">
                                                {a.serviceName}
                                            </Text>
                                            <View
                                                className={`rounded-lg px-3 py-1.5 ${
                                                    a.status === "confirmed"
                                                        ? "bg-emerald-500/20"
                                                        : a.status === "pending"
                                                          ? "bg-amber-500/20"
                                                          : "bg-rose-500/20"
                                                }`}
                                            >
                                                <Text
                                                    className={`text-xs font-bold uppercase tracking-wider ${
                                                        a.status === "confirmed"
                                                            ? "text-emerald-400"
                                                            : a.status === "pending"
                                                              ? "text-amber-400"
                                                              : "text-rose-400"
                                                    }`}
                                                >
                                                    {a.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="mb-4 flex-row items-center">
                                            <Text className="font-medium text-zinc-400">
                                                {format(new Date(a.date), "d MMM yyyy")}
                                            </Text>
                                            <Text className="mx-3 text-zinc-600">•</Text>
                                            <Text className="font-medium text-zinc-400">
                                                {a.time}
                                            </Text>
                                        </View>

                                        <View className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3.5">
                                            <Text className="mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                                                Role Assigned
                                            </Text>
                                            <Text className="font-semibold text-zinc-200">
                                                {a.roleName}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {assignments?.length === 0 && (
                                    <View className="items-center justify-center py-12">
                                        <Text className="text-lg font-medium text-zinc-500">
                                            No pending assignments
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

function StatsCard({ icon, title, buttonLabel, linkTo, onClick, onDisabled }: StatsCardProps) {
    const handlePress = () => {
        if (onDisabled) return
        if (linkTo) {
            router.push(linkTo as Href)
        } else if (onClick) {
            onClick()
        }
    }

    return (
        <View
            className="flex w-60 flex-col justify-between rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm"
            style={{ height: 180 }}
        >
            <View>
                <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/50">
                    <Ionicons name={icon} size={24} color="#d97706" />
                </View>
                <Text className="text-base font-bold leading-snug text-zinc-800">{title}</Text>
            </View>

            <Pressable
                onPress={handlePress}
                disabled={onDisabled}
                className={`mt-auto flex-row items-center justify-center rounded-xl px-4 py-3 ${
                    onDisabled ? "bg-zinc-100" : "bg-amber-400"
                }`}
                style={({ pressed }) => ({ opacity: pressed && !onDisabled ? 0.8 : 1 })}
            >
                {onDisabled && <ActivityIndicator size="small" color="#a1a1aa" className="mr-2" />}
                <Text
                    className={`text-sm font-bold ${onDisabled ? "text-zinc-400" : "text-amber-950"}`}
                >
                    {buttonLabel}
                </Text>
            </Pressable>
        </View>
    )
}

export function UpcomingServicesMobile() {
    const [services, setServices] = useState<Service[] | null>(null)

    useFocusEffect(
        useCallback(() => {
            async function fetchServices() {
                const response = await fetch(`${API_URL}/api/services/with-roles`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                const data: Service[] = await response.json()
                setServices(data)
            }
            void fetchServices()
        }, [])
    )

    return (
        <View className="pb-10">
            <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-zinc-900">Upcoming Services</Text>
                <View className="rounded-full bg-zinc-100 p-2">
                    <Ionicons name="filter" size={16} color="#71717a" />
                </View>
            </View>

            <View className="gap-6">
                {services?.map((s) => (
                    <View
                        key={s.id}
                        className="rounded-[28px] border border-zinc-200/60 bg-white p-6 shadow-sm"
                    >
                        <View className="mb-5 flex-row items-start justify-between">
                            <View className="mr-4 flex-1">
                                <Text className="mb-2 text-xl font-bold leading-tight text-zinc-900">
                                    {s.name}
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={14} color="#71717a" />
                                    <Text className="ml-1.5 text-sm font-medium text-zinc-500">
                                        {format(new Date(s.date), "EEEE, d MMMM yyyy")}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center rounded-2xl border border-amber-100/50 bg-amber-50 px-3 py-2 shadow-sm shadow-amber-100/20">
                                <Ionicons name="time-outline" size={14} color="#d97706" />
                                <Text className="ml-1.5 text-xs font-bold text-amber-700">
                                    {s.time}
                                </Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                Roles Overview
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {s.roles && s.roles.length > 0 ? (
                                    s.roles.map((r) => (
                                        <View
                                            key={r.id}
                                            className="flex-row items-center rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-1.5"
                                        >
                                            <View className="mr-2 h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                            <Text className="text-xs font-semibold text-zinc-600">
                                                {r.name}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="text-xs italic text-zinc-400">
                                        No roles specified
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between border-t border-zinc-100/80 pt-4">
                            <Text className="text-xs font-medium text-zinc-400">
                                Service Status
                            </Text>
                            <View
                                className={`flex-row items-center rounded-lg px-3 py-1.5 ${
                                    s.status === "Roles Closed"
                                        ? "border border-rose-100/50 bg-rose-50"
                                        : "border border-emerald-100/50 bg-emerald-50"
                                }`}
                            >
                                <View
                                    className={`mr-2 h-1.5 w-1.5 rounded-full ${
                                        s.status === "Roles Closed"
                                            ? "bg-rose-500"
                                            : "bg-emerald-500"
                                    }`}
                                />
                                <Text
                                    className={`text-[11px] font-bold uppercase tracking-wider ${
                                        s.status === "Roles Closed"
                                            ? "text-rose-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {s.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
                {(!services || services.length === 0) && (
                    <View className="items-center justify-center rounded-[28px] border border-dashed border-zinc-100 bg-zinc-50/50 py-12">
                        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                            <Ionicons name="calendar-clear-outline" size={28} color="#a1a1aa" />
                        </View>
                        <Text className="text-center text-base font-medium text-zinc-500">
                            No upcoming services
                        </Text>
                        <Text className="mt-1 text-center text-sm text-zinc-400">
                            Check back later for new schedules
                        </Text>
                    </View>
                )}
            </View>
        </View>
    )
}
