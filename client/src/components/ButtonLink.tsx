import { twMerge } from "tailwind-merge"
import { Link, type LinkProps } from "react-router-dom"

type Variant = "primary" | "secondary" | "card" | "sidebar"

type ButtonLinkProps = {
    variant?: Variant
} & LinkProps

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
    return (
        <Link
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
            return "hover:text-amber-400"
        case "card":
            return "bg-amber-400 text-blue-950 text-xs font-medium py-1 px-2 rounded w-full mt-auto hover:bg-amber-500 flex justify-center"
        case "sidebar":
            return "flex text-zinc-100 text-base font-medium py-2.5 pl-4 w-54 rounded-lg hover:bg-amber-400/30 justify-start"
        default:
            throw new Error(`Invalid variant: ${variant satisfies never}`)
    }
}
