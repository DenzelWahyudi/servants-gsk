import React, { useEffect, useState } from "react"
import { UserPlus, UserMinus } from "lucide-react"
import { API_URL } from "../api"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { Heading } from "./Heading"
import { useAuth } from "../hooks/useAuth.ts"

type RoleFormProps = {
    userId?: string
    roleId: string
    serviceName: string
    roleName: string
    onClose: () => void
    token: string | null
}

type RolesCardProps = {
    serviceId: string
    serviceName: string
    serviceTime: string
    serviceDate: string
}

interface Assign {
    roleId: string
    serviceName: string
    roleName: string
}

interface RelieveUser {
    userId: string
    name: string
}

interface User {
    id: string
    name: string
}

interface Role {
    id: string
    name: string
    spotsTotal: number
    spotsFilled: number
    userNames: string[]
}

export function RolesCard({ serviceId, serviceName, serviceTime, serviceDate }: RolesCardProps) {
    const [roles, setRoles] = useState<Role[] | null>(null)
    const [assignData, setAssignData] = useState<Assign | null>(null)
    const [relieveData, setRelieveData] = useState<Assign | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const { token } = useAuth()

    useEffect(() => {
        async function fetchService() {
            const response = await fetch(
                `${API_URL}/api/roles/assignedusersforroles/${serviceId}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "applicaton/json" }
                }
            )
            const data: Role[] = await response.json()

            const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
            setRoles(sorted)
        }
        void fetchService()
    }, [serviceId, refreshKey])

    if (!roles) return <div>Loading...</div>

    return (
        <div className="rounded-lg bg-white p-2.5">
            <table className="w-full table-fixed overflow-hidden rounded-lg text-left text-sm text-zinc-300">
                <caption className="bg-slate-900 px-2.5 py-1.5 text-left text-lg font-semibold text-zinc-100">
                    {serviceName} - {format(new Date(serviceDate), "d MMMM yyyy")}, {serviceTime}
                </caption>
                <thead className="bg-zinc-200 font-medium text-zinc-950">
                    <tr>
                        <th className="w-[25%] px-2.5 py-2">Role</th>
                        <th className="w-[48%]">Assigned To</th>
                        <th className="w-[11%] text-center">Slots Filled</th>
                        <th className="w-[7%] text-center">Status</th>
                        <th className="w-[9%] text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {roles?.map((r) => (
                        <tr key={r.id} className="border-b border-zinc-200 text-zinc-900">
                            <td className="px-2.5 py-2 wrap-break-word">{r.name}</td>
                            <td className="py-2 wrap-break-word">
                                {r.userNames?.join(", ") ?? "..."}
                            </td>
                            <td className="text-center">
                                {r.spotsFilled}/{r.spotsTotal}
                            </td>
                            <td className="text-center">
                                <span
                                    className={`rounded-xl px-2.5 py-1 text-xs font-light text-zinc-100 shadow ${r.spotsFilled >= r.spotsTotal ? "bg-red-600" : "bg-green-600"}`}
                                >
                                    {r.spotsFilled >= r.spotsTotal ? "Filled" : "Open"}
                                </span>
                            </td>
                            <td>
                                <div className="flex items-center justify-center gap-1 py-2">
                                    <button
                                        onClick={() =>
                                            setRelieveData({
                                                roleId: r.id,
                                                serviceName: serviceName,
                                                roleName: r.name
                                            })
                                        }
                                        className="trasition-colors rounded-lg border border-zinc-400 bg-zinc-100 px-1.5 py-1 hover:bg-zinc-300 disabled:bg-red-300"
                                    >
                                        <UserMinus size={16} className="text-slate-900" />
                                    </button>
                                    <button
                                        disabled={r.spotsFilled >= r.spotsTotal}
                                        onClick={() =>
                                            setAssignData({
                                                roleId: r.id,
                                                serviceName: serviceName,
                                                roleName: r.name
                                            })
                                        }
                                        className="trasition-colors rounded-lg border border-zinc-400 bg-zinc-100 px-1.5 py-1 hover:bg-zinc-300 disabled:bg-red-300"
                                    >
                                        <UserPlus size={16} className="text-slate-900" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {assignData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setAssignData(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] overflow-y-auto"
                    >
                        <AssignRoleForm
                            roleId={assignData.roleId}
                            serviceName={assignData.serviceName}
                            roleName={assignData.roleName}
                            onClose={() => {
                                setAssignData(null)
                                setRefreshKey((k) => k + 1)
                            }}
                            token={token}
                        />
                    </div>
                </div>
            )}
            {relieveData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setRelieveData(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] overflow-y-auto"
                    >
                        <RelieveRoleForm
                            roleId={relieveData.roleId}
                            serviceName={relieveData.serviceName}
                            roleName={relieveData.roleName}
                            onClose={() => {
                                setRelieveData(null)
                                setRefreshKey((k) => k + 1)
                            }}
                            token={token}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function RelieveRoleForm({ roleId, serviceName, roleName, onClose, token }: RoleFormProps) {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<RelieveUser[] | null>(null)
    const [user, setUser] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchUsers() {
            const usersRes = await fetch(`${API_URL}/api/assignments/relieve/${roleId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const usersData: RelieveUser[] = await usersRes.json()
            setUsers(usersData)
        }
        void fetchUsers()
    }, [roleId])

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setUser(e.target.value)
    }

    async function handleRemove(userId: string, roleId: string) {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/assignments/relieve`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userId, roleId })
        })
        const data = await response.json()
        if (!response.ok) {
            setError(data.message || "Failed to relieve user")
            setLoading(false)
            return
        }

        setLoading(false)
        if (onClose) onClose()
    }

    return (
        <div className="flex w-110 flex-col gap-3 rounded-lg bg-slate-900 p-4.5 select-none">
            <div className="pb-2.5">
                <h1 className="text-4xl font-bold text-red-400">Relieve Role</h1>
            </div>
            <hr className="-mx-4.5 h-0.5 border-0 bg-amber-400" />
            <div className="flex flex-col gap-1">
                <h3 className="mt-3.5 text-sm font-light text-zinc-100">Service</h3>
                <span className="w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {serviceName}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-light text-zinc-100">Role</h3>
                <span className="w-full overflow-x-auto rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {roleName}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-light text-zinc-100">Remove Assignment</h3>
                <select
                    value={user}
                    onChange={handleChange}
                    className={`w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base transition-colors outline-none focus:border-amber-400 ${user ? "" : "font-medium text-zinc-500"}`}
                >
                    <option value="" disabled>
                        Select a user
                    </option>
                    {users?.map((user) => (
                        <option key={user.userId} value={user.userId}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>
            {error && <p className="-mb-6.5 pl-1 text-sm text-red-600">{error}</p>}
            <div className="mt-10 flex justify-end gap-2">
                <button
                    onClick={() => (onClose ? onClose() : navigate("/admin/roles"))}
                    className="rounded-lg bg-zinc-600 px-3 py-1.5 text-base text-zinc-200 hover:bg-zinc-700"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleRemove(user!, roleId)}
                    disabled={!user || loading}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-base text-slate-900 hover:bg-amber-500 disabled:bg-zinc-500"
                >
                    {loading ? "Removing..." : "Remove"}
                </button>
            </div>
        </div>
    )
}

function AssignRoleForm({ roleId, serviceName, roleName, onClose, token }: RoleFormProps) {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<User[] | null>(null)
    const [user, setUser] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchUsers() {
            const response = await fetch(`${API_URL}/api/users`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const data: User[] = await response.json()
            setUsers(data)
        }
        void fetchUsers()
    }, [])

    async function handleAssign(userId: string, roleId: string) {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/api/assignments/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    roleId,
                    status: "confirmed"
                })
            })

            const data = await response.json()
            if (!response.ok) {
                setError(data.message || "Assigning failed!")
                setLoading(false)
                return
            }

            setLoading(false)

            if (onClose) onClose()
            else navigate("/admin/roles")
        } catch {
            setError("Could not connect to server")
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setUser(e.target.value)
    }

    return (
        <div className="flex w-110 flex-col gap-3 rounded-lg bg-slate-900 p-4.5 select-none">
            <div className="pb-2.5">
                <Heading>Assign Role</Heading>
            </div>
            <hr className="-mx-4.5 h-0.5 border-0 bg-amber-400" />
            <div className="flex flex-col gap-1">
                <h3 className="mt-3.5 text-sm font-light text-zinc-100">Service</h3>
                <span className="w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {serviceName}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-light text-zinc-100">Role</h3>
                <span className="w-full overflow-x-auto rounded border border-zinc-600 p-1 pl-2 text-left text-base">
                    {roleName}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-light text-zinc-100">Assign To</h3>
                <select
                    value={user}
                    onChange={handleChange}
                    className={`w-full rounded border border-zinc-600 p-1 pl-2 text-left text-base transition-colors outline-none focus:border-amber-400 ${user ? "" : "font-medium text-zinc-500"}`}
                >
                    <option value="" disabled>
                        Select a user
                    </option>
                    {users?.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>
            {error && <p className="-mb-6.5 pl-1 text-sm text-red-600">{error}</p>}
            <div className="mt-10 flex justify-end gap-2">
                <button
                    onClick={() => (onClose ? onClose() : navigate("/admin/roles"))}
                    className="rounded-lg bg-zinc-600 px-3 py-1.5 text-base text-zinc-200 hover:bg-zinc-700"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleAssign(user!, roleId)}
                    disabled={!user || loading}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-base text-slate-900 hover:bg-amber-500 disabled:bg-zinc-500"
                >
                    {loading ? "Assigning..." : "Assign"}
                </button>
            </div>
        </div>
    )
}
