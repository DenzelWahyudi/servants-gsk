import {
    add,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isEqual,
    isSameMonth,
    isToday,
    parse,
    startOfDay,
    startOfToday,
    startOfWeek
} from "date-fns"
import { Feather } from "@expo/vector-icons"
import { capitalizeFirstLetter } from "@/utils/functions"
import React, { useState, useCallback } from "react"
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { API_URL } from "../../../api"
import { useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

interface Schedule {
    roleName: string
    serviceName: string
    date: Date
    time: string
}

export default function ScheduleTab() {
    const { token } = useAuth()
    const [schedule, setSchedule] = useState<Schedule[] | null>(null)
    const [roleInfo, setRoleInfo] = useState<Schedule | null>(null)
    const [chosenSchedule, setChosenSchedule] = useState<Schedule[] | null>(null)
    const [loading, setLoading] = useState(false)

    useFocusEffect(
        useCallback(() => {
            async function fetchSchedule() {
                setLoading(true)
                try {
                    const response = await fetch(`${API_URL}/api/assignments/schedule`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                    const data = await response.json()
                    setSchedule(Array.isArray(data) ? data : [])
                } catch (error) {
                    console.error("Failed to fetch schedule", error)
                } finally {
                    setLoading(false)
                }
            }
            if (token) {
                void fetchSchedule()
            }
            return () => {}
        }, [token])
    )

    const today = startOfToday()
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

    const [currMonth, setCurrMonth] = useState(() => format(today, "MMM-yyyy"))
    const firstDayOfMonth = parse(currMonth, "MMM-yyyy", new Date())

    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(firstDayOfMonth),
        end: endOfWeek(endOfMonth(firstDayOfMonth))
    })

    const getPrevMonth = () => {
        const firstDayOfPrevMonth = add(firstDayOfMonth, { months: -1 })
        setCurrMonth(format(firstDayOfPrevMonth, "MMM-yyyy"))
    }

    const getNextMonth = () => {
        const firstDayOfNextMonth = add(firstDayOfMonth, { months: 1 })
        setCurrMonth(format(firstDayOfNextMonth, "MMM-yyyy"))
    }

    const selectDay = (day: Date) => {
        const selected = schedule?.filter((s) =>
            isEqual(startOfDay(new Date(s.date)), startOfDay(day))
        )

        if (selected && selected.length > 0) {
            setChosenSchedule(selected)
        } else {
            setChosenSchedule(null)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-zinc-50" edges={["top"]}>
            <ScrollView className="flex-1" contentContainerClassName="pb-10">
                <View className="px-6 pb-6">
                    <Text className="text-3xl font-bold text-zinc-900">My Schedule</Text>
                    <Text className="mt-1 text-base font-medium text-zinc-500">
                        Keep track of your serving dates
                    </Text>
                </View>

                <View className="px-6">
                    <View className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
                        {/* Header */}
                        <View className="mb-6 flex-row items-center justify-between">
                            <Text className="text-xl font-bold text-zinc-900">
                                {format(firstDayOfMonth, "MMMM yyyy")}
                            </Text>
                            <View className="flex-row items-center gap-4">
                                <Pressable
                                    onPress={getPrevMonth}
                                    className="rounded-full bg-zinc-50 p-2 active:bg-zinc-100"
                                >
                                    <Feather name="chevron-left" size={20} color="#3f3f46" />
                                </Pressable>

                                <Pressable
                                    onPress={() => setCurrMonth(format(today, "MMM-yyyy"))}
                                    className={`rounded-full px-3 py-1.5 ${currMonth === format(today, "MMM-yyyy") ? "bg-amber-100" : "bg-zinc-50"}`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${currMonth === format(today, "MMM-yyyy") ? "text-amber-700" : "text-zinc-600"}`}
                                    >
                                        Today
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={getNextMonth}
                                    className="rounded-full bg-zinc-50 p-2 active:bg-zinc-100"
                                >
                                    <Feather name="chevron-right" size={20} color="#3f3f46" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Days of week */}
                        <View className="mb-2 flex-row justify-between">
                            {days.map((day, idx) => (
                                <View key={idx} className="flex-1 items-center">
                                    <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        {capitalizeFirstLetter(day)}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View className="mb-3 h-px bg-zinc-100" />

                        {/* Loading Indicator */}
                        {loading ? (
                            <View className="h-64 items-center justify-center">
                                <ActivityIndicator size="large" color="#fbbf24" />
                            </View>
                        ) : (
                            /* Calendar Grid */
                            <View className="flex-row flex-wrap">
                                {daysInMonth.map((day, idx) => {
                                    const isCurrentMonth = isSameMonth(day, firstDayOfMonth)
                                    const isCurrentToday = isToday(day)
                                    const daySchedules = schedule?.filter((s) =>
                                        isEqual(startOfDay(new Date(s.date)), startOfDay(day))
                                    )
                                    const hasSchedules = daySchedules && daySchedules.length > 0

                                    return (
                                        <View
                                            key={idx}
                                            style={{ width: "14.28%" }}
                                            className="aspect-square p-1"
                                        >
                                            <Pressable
                                                onPress={() => selectDay(day)}
                                                className={`flex-1 items-center justify-center rounded-2xl ${
                                                    isCurrentToday
                                                        ? "bg-amber-400"
                                                        : hasSchedules
                                                          ? "bg-amber-50"
                                                          : "bg-transparent"
                                                }`}
                                                style={({ pressed }) => ({
                                                    opacity: pressed ? 0.7 : 1
                                                })}
                                            >
                                                <Text
                                                    className={`text-base font-medium ${
                                                        isCurrentToday
                                                            ? "font-bold text-amber-950"
                                                            : !isCurrentMonth
                                                              ? "text-zinc-300"
                                                              : hasSchedules
                                                                ? "font-bold text-amber-700"
                                                                : "text-zinc-700"
                                                    }`}
                                                >
                                                    {format(day, "d")}
                                                </Text>
                                                {hasSchedules && !isCurrentToday && (
                                                    <View className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                )}
                                                {hasSchedules && isCurrentToday && (
                                                    <View className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-900" />
                                                )}
                                            </Pressable>
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                    </View>
                </View>

                {/* Selected Day Schedules */}
                {chosenSchedule && chosenSchedule.length > 0 && (
                    <View className="mt-6 px-6">
                        <Text className="mb-4 text-xl font-bold text-zinc-900">
                            {format(new Date(chosenSchedule[0].date), "EEEE, dd MMMM yyyy")}
                        </Text>
                        <View className="gap-4">
                            {chosenSchedule.map((s, idx) => (
                                <Pressable
                                    key={idx}
                                    className="flex-row items-center rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm"
                                    onPress={() => setRoleInfo(s)}
                                >
                                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                                        <Feather name="calendar" size={24} color="#d97706" />
                                    </View>
                                    <View className="mr-4 flex-1">
                                        <Text className="mb-1 text-lg font-bold leading-tight text-zinc-900">
                                            {s.serviceName}
                                        </Text>
                                        <Text className="font-medium text-zinc-500">
                                            {s.roleName}
                                        </Text>
                                    </View>
                                    <View className="rounded-xl bg-zinc-100 px-3 py-2">
                                        <Text className="text-xs font-bold text-zinc-700">
                                            {s.time}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Role Info Modal */}
                <Modal
                    visible={!!roleInfo}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setRoleInfo(null)}
                >
                    <View className="flex-1 items-center justify-center bg-black/60 px-6">
                        <Pressable className="absolute inset-0" onPress={() => setRoleInfo(null)} />
                        <View className="relative z-10 w-full overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
                            <View className="mb-6 flex-row items-start justify-between">
                                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                                    <Feather name="info" size={24} color="#d97706" />
                                </View>
                                <Pressable
                                    onPress={() => setRoleInfo(null)}
                                    className="rounded-full bg-zinc-100 p-2"
                                >
                                    <Feather name="x" size={20} color="#52525b" />
                                </Pressable>
                            </View>

                            <Text className="mb-2 text-2xl font-bold text-zinc-900">
                                {roleInfo?.serviceName}
                            </Text>
                            <Text className="mb-6 font-medium text-zinc-500">
                                {roleInfo && format(new Date(roleInfo.date), "EEEE, dd MMMM yyyy")}
                            </Text>

                            <View className="mb-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                                <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Role
                                </Text>
                                <Text className="text-lg font-semibold text-zinc-800">
                                    {roleInfo?.roleName}
                                </Text>
                            </View>

                            <View className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                                <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Time
                                </Text>
                                <Text className="text-lg font-semibold text-zinc-800">
                                    {roleInfo?.time}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}
