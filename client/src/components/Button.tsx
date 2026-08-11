import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

type Variant = "primary" | "secondary" | "card" | "sidebar"

type ButtonProps = {
    variant?: Variant
} & ComponentProps<"button">

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={twMerge(
                "rounded-lg px-2 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                getVariantStyles(variant),
                className
            )}
        />
    )
}

function getVariantStyles(variant: Variant) {
    switch (variant) {
        case "primary":
            return "bg-slate-900 hover:bg-amber-400 border border-amber-400 py-1.5 px-4"
        case "secondary":
            return "text-amber-400"
        case "card":
            return "bg-amber-400 text-blue-950 text-xs font-medium py-1 px-2 rounded w-full mt-auto hover:bg-amber-500"
        case "sidebar":
            return "flex bg-amber-400 text-blue-950 text-base font-medium py-2 pl-4 w-54 rounded-lg justify-start"
        default:
            throw new Error(`Invalid variant: ${variant satisfies never}`)
    }
}
