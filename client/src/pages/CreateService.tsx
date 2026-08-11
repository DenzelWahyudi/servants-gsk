import { Header } from "../components/Header"
import { useNavigate } from "react-router-dom"
import { ButtonLink } from "../components/ButtonLink"
import { Form } from "../components/Form"
import { Heading } from "../components/Heading"
import React, { useState } from "react"
import { Trash2 } from "lucide-react"
import { API_URL } from "../api"
import { useAuth } from "../hooks/useAuth.ts"

type Role = {
    id: number
    name: string
    spotsTotal: number | string
}

export function CreateService() {
    const navigate = useNavigate()
    const { token } = useAuth()

    const [formData, setFormData] = useState({
        name: "",
        date: "",
        time: "",
        status: "Roles Open"
    })

    const [roles, setRoles] = useState<Role[]>(() => [{ id: Date.now(), name: "", spotsTotal: "" }])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function handleChange(field: keyof typeof formData) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

    function handleNameChange(field: keyof typeof formData) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value.length > 20 ? prev[field] : e.target.value
            }))
    }

    function handleTimeChange(field: keyof typeof formData) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value.length > 13 ? prev[field] : e.target.value
            }))
    }

    function handleRoleChange(id: number, field: keyof Omit<Role, "id">, value: string) {
        setRoles((prev) =>
            prev.map((role) =>
                role.id === id
                    ? {
                          ...role,
                          [field]:
                              field === "spotsTotal"
                                  ? value === ""
                                      ? ""
                                      : Number(value) < 0
                                        ? 0
                                        : Number(value)
                                  : value
                      }
                    : role
            )
        )
    }

    function addRole() {
        setRoles((prev) => [...prev, { id: Date.now(), name: "", spotsTotal: "" }])
    }

    function removeRole(id: number) {
        setRoles((prev) => prev.filter((role) => role.id != id))
    }

    async function handleSubmit() {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/services/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    roles: roles.map((role) => ({
                        ...role,
                        spotsTotal: role.spotsTotal === "0" ? 0 : Number(role.spotsTotal)
                    }))
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Failed to create service. Please try again.")
                return
            }

            navigate("/admin/services")
        } catch {
            setError("Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="mx-auto flex flex-col items-center gap-15 px-12 py-5 select-none">
            <Header variant="admin" />
            <div className="flex w-130 flex-col items-center gap-3 rounded-xl bg-slate-800 p-7">
                <div className="mt-2 mr-auto">
                    <Heading>Create New Service</Heading>
                </div>
                <div className="-mt-2 mr-auto mb-3">
                    <h2 className="text-sm text-zinc-400">
                        Fill out the details to define the service schedule and roles
                    </h2>
                </div>

                <Form
                    label="Service Name"
                    value={formData.name}
                    onChange={handleNameChange("name")}
                    placeholder="e.g., Sunday Sevice (max 30 chars)"
                />
                <div className="flex w-full justify-between gap-10">
                    <div className="flex flex-1 flex-col gap-1">
                        <h3 className="text-sm text-zinc-300">Date</h3>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={handleChange("date")}
                            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-zinc-400 transition-colors outline-none focus:border-amber-400"
                        />
                    </div>
                    <div className="flex-1">
                        <Form
                            label="Time"
                            value={formData.time}
                            onChange={handleTimeChange("time")}
                            placeholder="🕖  09:00"
                        />
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2">
                    <h3 className="text-base text-zinc-300">Roles & Spots</h3>

                    <div className="flex w-full gap-3">
                        <h4 className="flex-1 text-sm text-zinc-400">Role Name</h4>
                        <h4 className="w-24 text-sm text-zinc-400">Total Spots</h4>
                        <div className="w-5" />
                    </div>

                    {roles.map((role) => (
                        <div key={role.id} className="flex w-full items-center gap-3">
                            <input
                                type="text"
                                placeholder="e.g., Worship Leader"
                                value={role.name}
                                onChange={(e) => handleRoleChange(role.id, "name", e.target.value)}
                                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-zinc-100 transition-colors outline-none focus:border-amber-400"
                            />
                            <input
                                type="number"
                                placeholder="0"
                                value={role.spotsTotal}
                                onChange={(e) =>
                                    handleRoleChange(role.id, "spotsTotal", e.target.value)
                                }
                                className="w-24 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-zinc-100 transition-colors outline-none focus:border-amber-400"
                            />
                            <button
                                onClick={() => removeRole(role.id)}
                                className="text-zinc-400 transition-colors hover:text-red-400"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addRole}
                        className="mt-1 w-full rounded-lg border border-dashed border-slate-600 py-2 text-sm text-zinc-400 transition-colors hover:border-amber-400 hover:text-amber-400"
                    >
                        + Add Role
                    </button>
                </div>

                <div className="mr-auto mb-3 flex flex-1 flex-col gap-1">
                    <h3 className="text-sm text-zinc-300">Status</h3>
                    <select
                        value={formData.status}
                        onChange={handleChange("status")}
                        className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-zinc-100 transition-colors outline-none focus:border-amber-400"
                    >
                        <option value="Roles Open">Roles Open</option>
                        <option value="Roles Closed">Roles Closed</option>
                    </select>
                </div>

                {error && <p className="w-full text-center text-sm text-red-400">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-auto flex w-full justify-center rounded-lg bg-amber-400 py-1.5 text-base font-semibold text-blue-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Service"}
                </button>

                <div className="mt-1 flex items-center">
                    <ButtonLink
                        to="/admin/services"
                        variant="secondary"
                        className="text-sm text-amber-400"
                    >
                        ← Back to Services
                    </ButtonLink>
                </div>
            </div>
        </div>
    )
}
