import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import React, { useEffect, useState } from "react"
import { Heading } from "../components/Heading"
import { API_URL } from "../api"
import { Check, Pencil, Trash2 } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

interface User {
    id: string
    name: string
    email: string
    phoneNumber: string
    createdAt?: string
}

interface Chosen {
    id: string
    name: string
}

export function AdminUsers() {
    const [users, setUsers] = useState<User[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [chosenName, setChosenName] = useState<Chosen | null>(null)
    const [chosenEmail, setChosenEmail] = useState<Chosen | null>(null)
    const [chosenPhoneNumber, setChosenPhoneNumber] = useState<Chosen | null>(null)
    const [toBeDelete, setToBeDelete] = useState<string | null>(null)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams({ q: "newest" })
    const q = searchParams.get("q")
    const [refreshKey, setRefreshKey] = useState(0)
    const { token } = useAuth()

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true)

            const response = await fetch(`${API_URL}/api/users`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })

            const data: User[] = await response.json()

            if (q === "newest") {
                const sorted = data.sort(
                    (a, b) =>
                        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
                )
                setUsers(sorted)
            } else if (q === "oldest") {
                const sorted = data.sort(
                    (a, b) =>
                        new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
                )
                setUsers(sorted)
            } else if (q === "name") {
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
                setUsers(sorted)
            } else if (q === "email") {
                const sorted = data.sort((a, b) => a.email.localeCompare(b.email))
                setUsers(sorted)
            } else if (q === "number") {
                const sorted = data.sort((a, b) => a.phoneNumber.localeCompare(b.phoneNumber))
                setUsers(sorted)
            } else {
                setUsers(data)
            }
            setLoading(false)
        }
        void fetchUsers()
    }, [q, refreshKey])

    function handleNameChange(field: keyof Chosen) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setChosenName((prev) => (prev ? { ...prev, [field]: e.target.value } : prev))
    }

    function handleEmailChange(field: keyof Chosen) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setChosenEmail((prev) => (prev ? { ...prev, [field]: e.target.value } : prev))
    }

    function handlePhoneNumberChange(field: keyof Chosen) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setChosenPhoneNumber((prev) => (prev ? { ...prev, [field]: e.target.value } : prev))
    }

    async function handleNameSubmit() {
        if (!chosenName) return

        setSubmitLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/users/update/name/${chosenName.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newName: chosenName.name })
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.message || "Failed to update.")
            setSubmitLoading(false)
            return
        }

        setChosenName(null)
        setSubmitLoading(false)
        setRefreshKey((k) => k + 1)
    }

    async function handleEmailSubmit() {
        if (!chosenEmail) return

        setSubmitLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/users/update/email/${chosenEmail.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newEmail: chosenEmail.name })
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.message || "Failed to update.")
            setSubmitLoading(false)
            return
        }

        setChosenEmail(null)
        setSubmitLoading(false)
        setRefreshKey((k) => k + 1)
    }

    async function handlePhoneNumberSubmit() {
        if (!chosenPhoneNumber) return

        setSubmitLoading(true)
        setError(null)

        const response = await fetch(
            `${API_URL}/api/users/update/phonenumber/${chosenPhoneNumber.id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ newPhoneNumber: chosenPhoneNumber.name })
            }
        )

        const data = await response.json()

        if (!response.ok) {
            setError(data.message || "Failed to update.")
            setSubmitLoading(false)
            return
        }

        setChosenPhoneNumber(null)
        setSubmitLoading(false)
        setRefreshKey((k) => k + 1)
    }

    async function handleDelete(userId: string) {
        setDeleteLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        const data = await response.json()

        if (!response.ok) {
            setError(data.message || "Failed to update.")
            setDeleteLoading(false)
            return
        }

        setDeleteLoading(false)
        setRefreshKey((k) => k + 1)
    }

    return (
        <div className="flex h-screen flex-col">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex flex-1">
                <Sidebar variant="users" />
                <div className="flex h-full w-full flex-col bg-zinc-100/2 px-10">
                    <div className="flex items-end justify-between py-7">
                        <Heading>Manage Users</Heading>
                        <select
                            value={q ?? "newest"}
                            className="rounded border border-zinc-400 px-1 py-0.5 outline-none select-none"
                            onChange={(e) =>
                                setSearchParams(
                                    (prev) => {
                                        prev.set("q", e.target.value)
                                        return prev
                                    },
                                    { replace: true }
                                )
                            }
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="number">Phone Number</option>
                        </select>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto rounded-lg bg-zinc-100 px-3 py-1">
                        <table className="h-full w-full table-fixed text-left text-zinc-950">
                            <thead className="border-b border-amber-400">
                                <tr>
                                    <th className="py-2 pl-2">Full Name</th>
                                    <th className="">Email</th>
                                    <th className="">Phone Number</th>
                                    <th className="w-[7%] text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td>Loading...</td>
                                    </tr>
                                ) : (
                                    users?.map((u, index) => (
                                        <tr
                                            key={u.id}
                                            className={`${users.length - 1 > index ? "border-b border-zinc-300" : ""} bg-zinc-100 text-sm transition-colors hover:bg-amber-400/10`}
                                        >
                                            <td className="py-2 pl-2">
                                                <div className="flex items-center justify-between">
                                                    {chosenName && chosenName.id === u.id ? (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-50"
                                                                onClick={() => setChosenName(null)}
                                                            />
                                                            <input
                                                                className="relative z-60 -ml-0.5 h-full w-full rounded border-2 border-zinc-400 bg-zinc-100"
                                                                value={chosenName.name}
                                                                onChange={handleNameChange("name")}
                                                            />
                                                        </>
                                                    ) : (
                                                        <span className="wrap-break-word">
                                                            {u.name}
                                                        </span>
                                                    )}

                                                    <div className="relative pr-3 pl-2">
                                                        {chosenName && chosenName.id === u.id ? (
                                                            <button
                                                                className="relative z-60 rounded-lg border border-zinc-400 bg-green-300 px-1 py-1 text-right transition-colors hover:bg-green-500 disabled:bg-green-500"
                                                                disabled={submitLoading}
                                                                onClick={() => handleNameSubmit()}
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="rounded-lg border border-zinc-400 bg-zinc-100 px-1 py-1 text-right transition-colors hover:bg-zinc-300"
                                                                onClick={() =>
                                                                    setChosenName({
                                                                        id: u.id,
                                                                        name: u.name
                                                                    })
                                                                }
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <div className="flex items-center justify-between">
                                                    {chosenEmail && chosenEmail.id === u.id ? (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-50"
                                                                onClick={() => setChosenEmail(null)}
                                                            />
                                                            <input
                                                                className="relative z-60 -ml-0.5 h-full w-full rounded border-2 border-zinc-400 bg-zinc-100"
                                                                value={chosenEmail.name}
                                                                onChange={handleEmailChange("name")}
                                                            />
                                                        </>
                                                    ) : (
                                                        <span className="wrap-break-word">
                                                            {u.email}
                                                        </span>
                                                    )}

                                                    <div className="relative pr-3 pl-2">
                                                        {chosenEmail && chosenEmail.id === u.id ? (
                                                            <button
                                                                className="relative z-60 rounded-lg border border-zinc-400 bg-green-300 px-1 py-1 text-right transition-colors hover:bg-green-500 disabled:bg-green-500"
                                                                disabled={submitLoading}
                                                                onClick={() => handleEmailSubmit()}
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="rounded-lg border border-zinc-400 bg-zinc-100 px-1 py-1 text-right transition-colors hover:bg-zinc-300"
                                                                onClick={() =>
                                                                    setChosenEmail({
                                                                        id: u.id,
                                                                        name: u.email
                                                                    })
                                                                }
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <div className="flex items-center justify-between">
                                                    {chosenPhoneNumber &&
                                                    chosenPhoneNumber.id === u.id ? (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-50"
                                                                onClick={() =>
                                                                    setChosenPhoneNumber(null)
                                                                }
                                                            />
                                                            <input
                                                                className="relative z-60 -ml-0.5 h-full w-full rounded border-2 border-zinc-400 bg-zinc-100"
                                                                value={chosenPhoneNumber.name}
                                                                onChange={handlePhoneNumberChange(
                                                                    "name"
                                                                )}
                                                            />
                                                        </>
                                                    ) : (
                                                        <span className="wrap-break-word">
                                                            {u.phoneNumber}
                                                        </span>
                                                    )}

                                                    <div className="relative pr-3 pl-2">
                                                        {chosenPhoneNumber &&
                                                        chosenPhoneNumber.id === u.id ? (
                                                            <button
                                                                className="relative z-60 rounded-lg border border-zinc-400 bg-green-300 px-1 py-1 text-right transition-colors hover:bg-green-500 disabled:bg-green-500"
                                                                disabled={submitLoading}
                                                                onClick={() =>
                                                                    handlePhoneNumberSubmit()
                                                                }
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="rounded-lg border border-zinc-400 bg-zinc-100 px-1 py-1 text-right transition-colors hover:bg-zinc-300"
                                                                onClick={() =>
                                                                    setChosenPhoneNumber({
                                                                        id: u.id,
                                                                        name: u.phoneNumber
                                                                    })
                                                                }
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="flex items-center justify-center gap-2 py-2">
                                                <div className="relative">
                                                    <button
                                                        className="rounded-lg border border-zinc-400 bg-zinc-100 px-1.5 py-1.5 transition-colors hover:bg-red-300"
                                                        onClick={() => setToBeDelete(u.id)}
                                                    >
                                                        <Trash2
                                                            size={15}
                                                            className="text-slate-900"
                                                        />
                                                    </button>
                                                    {toBeDelete === u.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-40"
                                                                onClick={() => setToBeDelete(null)}
                                                            />
                                                            <div
                                                                className={`absolute ${index < users.length - 1 ? "top-full mt-1" : "bottom-full mb-1"} right-0 z-50 flex w-24 flex-col items-center gap-1 rounded-lg bg-slate-800 p-2 text-xs text-white shadow-lg`}
                                                            >
                                                                <span>Are you sure?</span>
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        disabled={deleteLoading}
                                                                        onClick={() =>
                                                                            handleDelete(toBeDelete)
                                                                        }
                                                                        className="hover:text-amber-400 disabled:text-amber-400"
                                                                    >
                                                                        Yes
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setToBeDelete(null)
                                                                        }
                                                                        className="hover:text-amber-400"
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {error && <span className="mt-3 text-center text-red-500">{error}</span>}
                </div>
            </div>
        </div>
    )
}
