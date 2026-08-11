import React from "react"

export function Heading({ children }: { children: React.ReactNode }) {
    return <h1 className="text-4xl font-bold select-none">{children}</h1>
}
