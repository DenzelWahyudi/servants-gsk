import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { UpcomingServices } from "../components/UpcomingServices"
import bell from "../assets/icons/bell.svg"
import calendar from "../assets/icons/calendar.svg"
import user from "../assets/icons/user.svg"
import React, { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { startOfToday, isEqual, startOfDay, format } from "date-fns"
import { API_URL } from "../api"
import { UpcomingServicesMobile } from "../components/UpcomingServicesMobile"
import { ButtonLink } from "../components/ButtonLink"

type StatsCardProps = {
    icon: React.ReactNode
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

export function Home() {
    const [userName, setUserName] = useState<string | null>(null)
    const [schedule, setSchedule] = useState<Schedule[] | null>(null)
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [assignments, setAssignments] = useState<Assignment[] | null>(null)
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)

    const todayServiceCount =
        schedule?.filter((s) => {
            const serviceDate = startOfDay(new Date(s.date))
            return isEqual(serviceDate, startOfToday())
        }).length ?? 0

    const openRoles =
        roles?.filter((r) => {
            if (r.spotsFilled < r.spotsTotal) return true
        }).length ?? null

    useEffect(() => {
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
            const roles = await fetch(`${API_URL}/api/roles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const rolesData = await roles.json()
            setRoles(rolesData)
        }
        if (token) {
            void fetchUser()
            void fetchSchedule()
        }
        void fetchRoles()
    }, [token])

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
        <div className="mx-auto flex flex-col gap-15 px-4 py-5 select-none sm:px-12">
            <Header variant="home" />

            <header className="hidden w-full flex-col items-center justify-center gap-5 sm:flex">
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Home</h1>
                    <h1 className="text-4xl font-semibold"> - </h1>
                    <h1 className="text-4xl font-bold text-amber-400">
                        Welcome Back, {userName ?? "..."}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <StatsCard
                        linkTo="/schedule"
                        icon={<img src={bell} width={40} alt="" />}
                        title={`${todayServiceCount} Service Reminders Sent Today`}
                        buttonLabel="View Schedule"
                    ></StatsCard>
                    <StatsCard
                        onClick={getAssignments}
                        icon={<img src={user} width={40} alt="" />}
                        title="Pending Sign-ups"
                        buttonLabel="Review Now"
                    ></StatsCard>
                    <StatsCard
                        linkTo="/openings"
                        icon={<img src={calendar} width={40} alt="" />}
                        title={`Open Recruitment: ${openRoles}`}
                        buttonLabel="Fill Remaining Roles"
                    ></StatsCard>
                </div>
            </header>

            <div className="flex flex-col items-center gap-6 sm:hidden">
                <h1 className="text-3xl font-semibold text-amber-400">
                    Hello, <span className="text-zinc-100">{userName ?? "..."}</span>
                </h1>
                <div className="flex gap-2">
                    <StatsCard
                        linkTo="/schedule"
                        icon={<img src={bell} width={40} alt="" />}
                        title={`${todayServiceCount} Service Reminders Today`}
                        buttonLabel="View Schedule"
                    ></StatsCard>
                    <StatsCard
                        onClick={getAssignments}
                        icon={<img src={user} width={40} alt="" />}
                        title="Pending Sign-ups"
                        buttonLabel="Review Now"
                        onDisabled={loading}
                    ></StatsCard>
                </div>
                <div className="min-h-130 w-screen bg-white">
                    <UpcomingServicesMobile />
                </div>
            </div>

            <div className="-mx-12 -my-8 hidden min-h-130 bg-white sm:block lg:hidden">
                <UpcomingServicesMobile />
            </div>

            <div className="-mx-12 -my-8 hidden min-h-90 bg-white px-12 pb-10 lg:block">
                <UpcomingServices />
            </div>
            <Footer />
            {assignments && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setAssignments(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] overflow-y-auto"
                    >
                        <div className="overflow-hidden rounded-lg border border-slate-900 shadow-lg">
                            <table className="hidden w-150 table-fixed bg-slate-800 text-left text-sm text-zinc-200 sm:table">
                                <thead className="border-t-2 border-b-2 border-amber-400 text-zinc-100">
                                    <tr>
                                        <th className="w-[23%] px-3 py-3">Service</th>
                                        <th className="w-[18%] px-3">Date</th>
                                        <th className="w-[13%] px-3">Time</th>
                                        <th className="w-[26%] px-3">Role</th>
                                        <th className="w-[20%] px-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments?.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-zinc-500 text-zinc-100"
                                        >
                                            <td className="px-3 py-3 font-medium wrap-break-word">
                                                {a.serviceName}
                                            </td>
                                            <td className="px-3">
                                                {format(new Date(a.date), "d MMM yyyy")}
                                            </td>
                                            <td className="px-3 wrap-break-word">{a.time}</td>
                                            <td className="px-3 py-2 wrap-break-word">
                                                {a.roleName}
                                            </td>
                                            <td className="px-3 text-center">
                                                <span
                                                    className={`inline-block w-23 rounded px-3 py-0.5 font-semibold text-zinc-950 ${
                                                        a.status === "confirmed"
                                                            ? "bg-green-200"
                                                            : a.status === "pending"
                                                              ? "bg-zinc-300"
                                                              : "bg-red-200"
                                                    }`}
                                                >
                                                    {a.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <table className="w-85 table-fixed bg-slate-800 text-left text-xs text-zinc-200 sm:hidden">
                                <thead className="bg-slate-900/60 text-zinc-100">
                                    <tr>
                                        <th className="w-[23%] px-1 py-3">Service</th>
                                        <th className="w-[23%] px-1">Date</th>
                                        <th className="w-[15%] px-1">Time</th>
                                        <th className="w-[25%] px-1">Role</th>
                                        <th className="w-[14%] px-1 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments?.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-zinc-500 text-zinc-100"
                                        >
                                            <td className="px-1 py-2 font-medium wrap-break-word">
                                                {a.serviceName}
                                            </td>
                                            <td className="px-1">
                                                {format(new Date(a.date), "d MMM yyyy")}
                                            </td>
                                            <td className="px-1 wrap-break-word">{a.time}</td>
                                            <td className="px-1 py-2 wrap-break-word">
                                                {a.roleName}
                                            </td>
                                            <td className="px-1 text-center">
                                                <span
                                                    className={`py-1.7 inline-block rounded px-1.5 font-semibold text-zinc-950 ${
                                                        a.status === "confirmed"
                                                            ? "bg-green-200"
                                                            : a.status === "pending"
                                                              ? "bg-zinc-300"
                                                              : "bg-red-200"
                                                    }`}
                                                >
                                                    {a.status === "confirmed"
                                                        ? "OK"
                                                        : a.status === "pending"
                                                          ? "..."
                                                          : "NO"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatsCard({ icon, title, buttonLabel, linkTo, onClick, onDisabled }: StatsCardProps) {
    return (
        <div className="flex h-35 w-45.5 flex-col rounded-lg bg-zinc-100 p-3 sm:w-50">
            <div>{icon}</div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {linkTo ? (
                <ButtonLink to={linkTo} variant="card">
                    {buttonLabel}
                </ButtonLink>
            ) : (
                <button
                    onClick={() => onClick?.()}
                    disabled={onDisabled}
                    className="mt-auto flex w-full justify-center rounded bg-amber-400 px-2 py-1 text-xs font-medium text-blue-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-amber-500"
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    )
}
