import { useEffect, useState } from "react"
import { Header } from "../components/Header"
import { Heading } from "../components/Heading"
import { Sidebar } from "../components/Sidebar"
import { API_URL } from "../api"
import { format } from "date-fns"
import { useAuth } from "../hooks/useAuth.ts"

type AdmitCardProps = {
    id: string
    roleId: string
    userName: string
    roleName: string
    serviceName: string
    date: string
    time: string
    onSave: () => void
    token: string | null
}

interface Assignment {
    id: string
    userName: string
    roleId: string
    roleName: string
    serviceName: string
    date: string
    time: string
}

export function AdminAdmissions() {
    const [assignments, setAssignments] = useState<Assignment[] | null>(null)
    const { token } = useAuth()

    useEffect(() => {
        async function fetchPendingAssignments() {
            const response = await fetch(`${API_URL}/api/assignments/pendingstatus`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data: Assignment[] = await response.json()
            setAssignments(Array.isArray(data) ? data : [])
        }
        void fetchPendingAssignments()
    }, [])

    async function fetchPendingAssignments() {
        const response = await fetch(`${API_URL}/api/assignments/pendingstatus`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data: Assignment[] = await response.json()
        setAssignments(Array.isArray(data) ? data : [])
    }

    return (
        <div className="flex h-screen flex-col overflow-y-auto">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex flex-1">
                <Sidebar variant="admissions" />
                <div className="flex h-full w-full flex-col bg-zinc-100/2 px-10">
                    <div className="flex items-center justify-between py-7">
                        <Heading>Manage Admissions</Heading>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {assignments?.map((a) => (
                            <div key={a.id}>
                                <AdmitCard
                                    id={a.id}
                                    userName={a.userName}
                                    roleId={a.roleId}
                                    roleName={a.roleName}
                                    serviceName={a.serviceName}
                                    date={a.date}
                                    time={a.time}
                                    onSave={() => {
                                        void fetchPendingAssignments()
                                    }}
                                    token={token}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AdmitCard({
    id,
    userName,
    roleId,
    roleName,
    serviceName,
    date,
    time,
    onSave,
    token
}: AdmitCardProps) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [declineLoading, setDeclineLoading] = useState(false)

    async function handleUpdateStatus(assigmentId: string, status: string) {
        if (status === "declined") setDeclineLoading(true)
        else setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/assignments/updatestatus/${assigmentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status, roleId })
        })
        const data = await response.json()

        if (!response.ok) {
            setError(data)
            setLoading(false)
            setDeclineLoading(false)
            return
        }

        setLoading(false)
        setDeclineLoading(false)

        onSave()
    }

    return (
        <div className="flex h-57 w-55 flex-col gap-2 rounded-lg bg-zinc-100 p-3.5 text-slate-900 select-none">
            <h2 className="font-semibold">{serviceName}</h2>
            <div className="flex flex-col gap-1">
                <h2>{format(date, "dd MMMM yyyy")}</h2>
                <h2>{time}</h2>
            </div>
            <h2 className="font-semibold">
                {roleName.length > 17 ? roleName.slice(0, 17) + "..." : roleName}
            </h2>
            <h2 className="font-semibold">
                {userName.length > 19 ? userName.slice(0, 17) + "..." : userName}
            </h2>
            <div className="mt-auto flex justify-between">
                <button
                    onClick={() => {
                        void handleUpdateStatus(id, "declined")
                        onSave()
                    }}
                    disabled={declineLoading}
                    className="font mt-auto flex w-22 justify-center rounded-lg bg-zinc-500 px-2 py-1 text-sm text-zinc-100 transition-colors hover:bg-zinc-600"
                >
                    {declineLoading ? "Loading" : "Decline"}
                </button>
                <button
                    onClick={() => {
                        void handleUpdateStatus(id, "confirmed")
                    }}
                    disabled={loading}
                    className="mt-auto flex w-22 justify-center rounded-lg bg-amber-400 px-2 py-1 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-500"
                >
                    {loading ? "Loading" : "Confirm"}
                </button>
            </div>
            {error && <p className="w-full text-center text-sm text-red-400">{error}</p>}
        </div>
    )
}
