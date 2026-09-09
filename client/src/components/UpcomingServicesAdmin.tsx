import React, { useEffect, useState } from "react"
import { Copy, Trash2, Pencil } from "lucide-react"
import { API_URL } from "../api"
import { format } from "date-fns"
import { Form } from "./Form"
import { Heading } from "./Heading"
import { useAuth } from "../hooks/useAuth.ts"
import { LoadingState } from "./LoadingState"

type Role2 = {
    id: number
    name: string
    spotsTotal: number | string
}

type ServiceFormState = {
    id: string
    mode: "edit" | "duplicate"
}

type ServiceFormProps = ServiceFormState & {
    onClose: () => void
    onSave: () => void
    token: string | null
}

interface RoleInterface {
    name: string
    spotsTotal: string
}

interface Role {
    id: string
    serviceId: string
    name: string
}

interface Service {
    id: string
    name: string
    date: string
    time: string
    status: string
    roles?: Role[]
}

export function UpcomingServicesAdmin() {
    const [services, setServices] = useState<Service[] | null>(null)
    const [servicesLoading, setServicesLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [serviceForm, setServiceForm] = useState<ServiceFormState | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [toBeDelete, setToBeDelete] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { token } = useAuth()

    useEffect(() => {
        const controller = new AbortController()

        async function fetchServices() {
            setServicesLoading(true)
            setLoadError(null)
            try {
                const response = await fetch(`${API_URL}/api/services/with-roles`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    signal: controller.signal
                })
                if (!response.ok) {
                    throw new Error("Failed to load services")
                }
                const data: Service[] = await response.json()
                if (!Array.isArray(data)) throw new Error("Invalid services response")
                if (!controller.signal.aborted) setServices(data)
            } catch {
                if (!controller.signal.aborted) {
                    setLoadError("Could not load services. Please refresh the page to try again.")
                }
            } finally {
                if (!controller.signal.aborted) setServicesLoading(false)
            }
        }
        void fetchServices()
        return () => controller.abort()
    }, [refreshKey])

    async function handleDelete(serviceId: string) {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/api/services/delete/${serviceId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (!response.ok) {
                setError(data.message || "Deletion failed. Please try again")
                return
            }

            setServices((prev) => prev?.filter((s) => s.id !== serviceId) ?? null)
            setToBeDelete(null)
        } catch {
            setError("Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    function handleStatusChange(serviceId: string) {
        return async (e: React.ChangeEvent<HTMLSelectElement>) => {
            setError(null)
            const newStatus = e.target.value
            const response = await fetch(`${API_URL}/api/services/updatestatus/${serviceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })
            if (!response.ok) {
                setError("Failed to update service status")
                return
            }
            setServices(
                (prev) =>
                    prev?.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s)) ?? null
            )
        }
    }

    return (
        <section className="min-w-[900px] border-b border-zinc-200 bg-white py-4">
            <h2 className="mb-3 text-center text-3xl font-semibold text-slate-900">
                Upcoming Services
            </h2>
            {error && <p className="mb-3 px-3 text-sm text-red-600">{error}</p>}
            <table className="w-full table-fixed text-left text-sm text-zinc-300">
                <thead className="border-t-2 border-b-2 border-amber-400 text-zinc-950">
                    <tr>
                        <th className="w-[18%] py-2 pl-3">Upcoming Service</th>
                        <th className="w-[16%]">Date</th>
                        <th className="w-[13%] pr-3">Time</th>
                        <th>Roles Needed</th>
                        <th className="w-32 text-center">Status</th>
                        <th className="w-36 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {servicesLoading ? (
                        <tr>
                            <td colSpan={6} className="text-slate-900">
                                <LoadingState label="Loading services..." />
                            </td>
                        </tr>
                    ) : loadError ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-red-600">
                                <p role="alert">{loadError}</p>
                            </td>
                        </tr>
                    ) : services?.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-zinc-500">
                                No services found.
                            </td>
                        </tr>
                    ) : (
                        services?.map((s, index) => (
                            <tr key={s.id} className="border-b border-zinc-400 text-zinc-950">
                                <td className="pl-3 font-medium wrap-break-word">{s.name}</td>
                                <td className="pr-3">{format(new Date(s.date), "dd MMMM yyyy")}</td>
                                <td className="pr-3 wrap-break-word">{s.time}</td>
                                <td className="py-3 pr-4 wrap-break-word">
                                    {s.roles?.map((r) => r.name).join(", ") ?? "..."}
                                </td>
                                <td>
                                    <div className="flex items-center justify-center">
                                        <select
                                            value={s.status}
                                            onChange={handleStatusChange(s.id)}
                                            className={`inline-block w-27 rounded py-1 text-center text-[13.5px] font-semibold ${
                                                s.status === "Roles Closed"
                                                    ? "bg-red-200"
                                                    : "bg-green-200"
                                            }`}
                                        >
                                            <option value="Roles Open">Roles Open</option>
                                            <option value="Roles Closed">Roles Closed</option>
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() =>
                                                setServiceForm({ id: s.id, mode: "duplicate" })
                                            }
                                            aria-label={`Duplicate ${s.name}`}
                                            title="Duplicate service"
                                            className="shrink-0 rounded-lg border border-zinc-400 bg-zinc-100 px-2 py-1.5 transition-colors hover:bg-zinc-300"
                                        >
                                            <Copy size={15} className="text-slate-900" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setServiceForm({ id: s.id, mode: "edit" })
                                            }
                                            aria-label={`Edit ${s.name}`}
                                            title="Edit service"
                                            className="shrink-0 rounded-lg border border-zinc-400 bg-zinc-100 px-2 py-1.5 transition-colors hover:bg-zinc-300"
                                        >
                                            <Pencil size={15} className="text-slate-900" />
                                        </button>
                                        <div className="relative shrink-0">
                                            <button
                                                onClick={() => setToBeDelete(s.id)}
                                                aria-label={`Delete ${s.name}`}
                                                title="Delete service"
                                                className="rounded-lg border border-zinc-400 bg-red-100 px-2 py-1.5 transition-colors hover:bg-red-300"
                                            >
                                                <Trash2 size={15} className="text-red-900" />
                                            </button>
                                            {toBeDelete === s.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setToBeDelete(null)}
                                                    />
                                                    <div
                                                        className={`absolute ${index < services.length - 1 ? "top-full mt-1" : "bottom-full mb-1"} right-0 z-50 flex w-24 flex-col items-center gap-1 rounded-lg bg-slate-800 p-2 text-xs text-white shadow-lg`}
                                                    >
                                                        <span>Are you sure?</span>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                disabled={loading}
                                                                onClick={() =>
                                                                    handleDelete(toBeDelete)
                                                                }
                                                                className="hover:text-amber-400 disabled:text-amber-400"
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                onClick={() => setToBeDelete(null)}
                                                                className="hover:text-amber-400"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {serviceForm && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={
                        serviceForm.mode === "duplicate" ? "Duplicate Service" : "Update Service"
                    }
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] overflow-y-auto"
                    >
                        <ServiceForm
                            key={`${serviceForm.mode}-${serviceForm.id}`}
                            id={serviceForm.id}
                            mode={serviceForm.mode}
                            onClose={() => setServiceForm(null)}
                            onSave={() => {
                                setError(null)
                                setRefreshKey((prev) => prev + 1)
                            }}
                            token={token}
                        />
                    </div>
                </div>
            )}
        </section>
    )
}

function ServiceForm({ id, mode, onClose, onSave, token }: ServiceFormProps) {
    const isDuplicating = mode === "duplicate"

    const [formData, setFormData] = useState({
        name: "",
        date: "",
        time: "",
        status: "Roles Open"
    })

    const [roles, setRoles] = useState<Role2[]>(() => [
        { id: Date.now(), name: "", spotsTotal: "" }
    ])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [serviceLoaded, setServiceLoaded] = useState(false)
    const [serviceLoading, setServiceLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController()

        async function fetchService() {
            setServiceLoading(true)
            setServiceLoaded(false)
            setError(null)
            try {
                const response = await fetch(`${API_URL}/api/services/${id}/with-roles`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    signal: controller.signal
                })
                if (!response.ok) {
                    throw new Error("Failed to load service")
                }
                const service = await response.json()
                if (controller.signal.aborted) return

                setFormData({
                    name: service.name,
                    date: isDuplicating ? "" : service.date.split("T")[0],
                    time: service.time,
                    status: service.status
                })

                setRoles(
                    service.roles.map((r: RoleInterface, index: number) => ({
                        id: index,
                        name: r.name,
                        spotsTotal: r.spotsTotal
                    }))
                )
                setServiceLoaded(true)
            } catch {
                if (!controller.signal.aborted) {
                    setError("Could not load the service. Please close this form and try again.")
                }
            } finally {
                if (!controller.signal.aborted) setServiceLoading(false)
            }
        }
        void fetchService()
        return () => controller.abort()
    }, [id, token, isDuplicating])

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

    function handleRoleChange(id: number, field: keyof Omit<Role2, "id">, value: string) {
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
        if (loading || !serviceLoaded) return
        setError(null)
        if (isDuplicating && !formData.date) {
            setError("Please choose a date for the new service.")
            return
        }
        setLoading(true)

        try {
            const endpoint = isDuplicating ? "create" : `update/${id}`
            const response = await fetch(`${API_URL}/api/services/${endpoint}`, {
                method: isDuplicating ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    roles: roles.map((role) => ({
                        name: role.name,
                        spotsTotal: Number(role.spotsTotal)
                    }))
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(
                    data.message ||
                        `Failed to ${isDuplicating ? "create" : "update"} service. Please try again.`
                )
                return
            }

            onSave()
            onClose()
        } catch {
            setError("Could not connect to the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (serviceLoading || !serviceLoaded) {
        return (
            <div className="flex w-130 flex-col items-center gap-3 rounded-xl bg-slate-800 p-7">
                <Heading>{isDuplicating ? "Duplicate Service" : "Update Service"}</Heading>
                {serviceLoading ? (
                    <LoadingState label="Loading service details..." />
                ) : (
                    <p role="alert" className="py-8 text-center text-sm text-red-400">
                        {error}
                    </p>
                )}
                <button onClick={onClose} className="text-sm text-amber-400">
                    ← Back to Services
                </button>
            </div>
        )
    }

    return (
        <div className="flex w-130 flex-col items-center gap-3 rounded-xl bg-slate-800 p-7">
            <div className="mt-2 mr-auto">
                <Heading>{isDuplicating ? "Duplicate Service" : "Update Service"}</Heading>
            </div>
            <div className="-mt-2 mr-auto">
                <h2 className="text-sm text-zinc-400">
                    Fill out the details to define the service schedule and roles
                </h2>
            </div>
            <div className="-mt-2.5 mr-auto mb-3">
                <h2 className={`text-sm ${isDuplicating ? "text-zinc-400" : "text-red-400"}`}>
                    {isDuplicating
                        ? "Choose a new date. The new service will have no assigned users."
                        : "Updating this service will remove all current role assignments."}
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
                        aria-label="Date"
                        required={isDuplicating}
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
                disabled={loading || !serviceLoaded}
                className="mt-auto flex w-full justify-center rounded-lg bg-amber-400 py-1.5 text-base font-semibold text-blue-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? isDuplicating
                        ? "Creating..."
                        : "Updating..."
                    : isDuplicating
                      ? "Create Service"
                      : "Update Service"}
            </button>

            <div className="mt-1 flex items-center">
                <button onClick={onClose} className="text-sm text-amber-400">
                    ← Back to Services
                </button>
            </div>
        </div>
    )
}
