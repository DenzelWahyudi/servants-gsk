import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import { ButtonLink } from "../components/ButtonLink"
import { Heading } from "../components/Heading"
import { UpcomingServicesAdmin } from "../components/UpcomingServicesAdmin"

export function AdminServices() {
    return (
        <div className="flex h-screen flex-col">
            <div className="px-6.5 py-4">
                <Header variant="admin" />
            </div>
            <div className="flex min-h-0 flex-1">
                <Sidebar variant="services" />
                <div className="flex h-full w-full flex-col bg-zinc-100/2 px-10">
                    <div className="flex items-center justify-between py-7">
                        <Heading>Manage Services</Heading>
                        <div className="w-47">
                            <ButtonLink
                                to="/admin/services/create"
                                variant="card"
                                className="text-semibold rounded-lg py-1.5 text-lg text-slate-900 select-none"
                            >
                                + Add New Service
                            </ButtonLink>
                        </div>
                    </div>
                    <div className="overflow-y-auto rounded-lg">
                        <UpcomingServicesAdmin />
                    </div>
                </div>
            </div>
        </div>
    )
}
