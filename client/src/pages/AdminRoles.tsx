import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import { useEffect, useState } from "react"
import { Heading } from "../components/Heading"
import { RolesCard } from "../components/RolesCard"
import { API_URL } from "../api"
import { LoadingState } from "../components/LoadingState"

interface Service {
    id: string
    name: string
    date: string
    time: string
}

export function AdminRoles() {
    const [services, setServices] = useState<Service[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function fetchServices() {
            setLoading(true)
            setError(null)
            try {
                const response = await fetch(`${API_URL}/api/services`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Failed to load services")
                const data: Service[] = await response.json()
                const sorted = data.sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                if (!controller.signal.aborted) setServices(sorted)
            } catch {
                if (!controller.signal.aborted) {
                    setError("Could not load services. Please refresh the page to try again.")
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }
        void fetchServices()
        return () => controller.abort()
    }, [])

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex min-h-0 flex-1">
                <Sidebar variant="roles" />
                <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-zinc-100/2 px-10">
                    <div className="flex items-center justify-between py-7">
                        <Heading>Manage Roles</Heading>
                    </div>
                    {loading ? (
                        <LoadingState label="Loading services..." />
                    ) : error ? (
                        <p role="alert" className="text-sm text-red-400">
                            {error}
                        </p>
                    ) : services?.length === 0 ? (
                        <p className="py-8 text-center text-sm text-zinc-400">No services found.</p>
                    ) : (
                        services?.map((service) => (
                            <div className="pb-4.5" key={service.id}>
                                <RolesCard
                                    serviceId={service.id}
                                    serviceName={service.name}
                                    serviceDate={service.date}
                                    serviceTime={service.time}
                                />
                            </div>
                        ))
                    )}
                </main>
            </div>
        </div>
    )
}
