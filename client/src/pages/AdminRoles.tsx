import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import { useEffect, useState } from "react"
import { Heading } from "../components/Heading"
import { RolesCard } from "../components/RolesCard"
import { API_URL } from "../api"

interface Service {
    id: string
    name: string
    date: string
    time: string
}

export function AdminRoles() {
    const [services, setServices] = useState<Service[] | null>(null)

    useEffect(() => {
        async function fetchServices() {
            const response = await fetch(`${API_URL}/api/services`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            const data: Service[] = await response.json()
            const sorted = data.sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            setServices(sorted)
        }
        void fetchServices()
    }, [])

    return (
        <div className="flex h-screen flex-col overflow-y-auto">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex flex-1">
                <Sidebar variant="roles" />
                <div className="flex h-full w-full flex-col bg-zinc-100/2 px-10">
                    <div className="flex items-center justify-between py-7">
                        <Heading>Manage Roles</Heading>
                    </div>
                    {services?.map((service) => (
                        <div className="pb-4.5" key={service.id}>
                            <RolesCard
                                serviceId={service.id}
                                serviceName={service.name}
                                serviceDate={service.date}
                                serviceTime={service.time}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
