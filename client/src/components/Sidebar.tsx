import { Button } from "./Button"
import { ButtonLink } from "./ButtonLink"

type Variant = "services" | "roles" | "admissions" | "users"

type SidebarProps = {
    variant?: Variant
}

export function Sidebar({ variant = "services" }: SidebarProps) {
    return (
        <div className="flex h-full flex-col items-center gap-2 bg-slate-900 p-3.5 pt-7 select-none">
            <h2 className="flex w-full justify-start rounded-lg pl-4 text-lg font-normal text-zinc-100">
                <div className="flex gap-2">
                    <span>🏠︎</span>
                    <span>Menu</span>
                </div>
            </h2>
            {getVariantStyles(variant)}
        </div>
    )
}

function getVariantStyles(variant: Variant) {
    switch (variant) {
        case "services":
            return (
                <>
                    <Button variant="sidebar">
                        <div className="flex gap-2">
                            <span>🛠️</span>
                            <span>Services</span>
                        </div>
                    </Button>
                    <ButtonLink to="/admin/roles" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🗓️</span>
                            <span>Roles</span>
                        </div>
                    </ButtonLink>
                    <ButtonLink to="/admin/admissions" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🎟️</span>
                            <span>Admissions</span>
                        </div>
                    </ButtonLink>
                    <ButtonLink to="/admin/users" variant="sidebar">
                        <div className="flex gap-2">
                            <span>👥</span>
                            <span>Users</span>
                        </div>
                    </ButtonLink>
                </>
            )
        case "roles":
            return (
                <>
                    <ButtonLink to="/admin/services" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🛠️</span>
                            <span>Services</span>
                        </div>
                    </ButtonLink>
                    <Button variant="sidebar">
                        <div className="flex gap-2">
                            <span>🗓️</span>
                            <span>Roles</span>
                        </div>
                    </Button>
                    <ButtonLink to="/admin/admissions" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🎟️</span>
                            <span>Admissions</span>
                        </div>
                    </ButtonLink>
                    <ButtonLink to="/admin/users" variant="sidebar">
                        <div className="flex gap-2">
                            <span>👥</span>
                            <span>Users</span>
                        </div>
                    </ButtonLink>
                </>
            )
        case "admissions":
            return (
                <>
                    <ButtonLink to="/admin/services" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🛠️</span>
                            <span>Services</span>
                        </div>
                    </ButtonLink>
                    <ButtonLink to="/admin/roles" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🗓️</span>
                            <span>Roles</span>
                        </div>
                    </ButtonLink>
                    <Button variant="sidebar">
                        <div className="flex gap-2">
                            <span>🎟️</span>
                            <span>Admissions</span>
                        </div>
                    </Button>
                    <ButtonLink to="/admin/users" variant="sidebar">
                        <div className="flex gap-2">
                            <span>👥</span>
                            <span>Users</span>
                        </div>
                    </ButtonLink>
                </>
            )
        case "users":
            return (
                <>
                    <ButtonLink to="/admin/services" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🛠️</span>
                            <span>Services</span>
                        </div>
                    </ButtonLink>
                    <ButtonLink to="/admin/roles" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🗓️</span>
                            <span>Roles</span>
                        </div>
                    </ButtonLink>
                    <ButtonLink to="/admin/admissions" variant="sidebar">
                        <div className="flex gap-2">
                            <span>🎟️</span>
                            <span>Admissions</span>
                        </div>
                    </ButtonLink>
                    <Button variant="sidebar">
                        <div className="flex gap-2">
                            <span>👥</span>
                            <span>Users</span>
                        </div>
                    </Button>
                </>
            )
        default:
            throw new Error(`Invalid variant: ${variant satisfies never}`)
    }
}
