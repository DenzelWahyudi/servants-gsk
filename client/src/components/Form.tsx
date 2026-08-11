import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

type FormProps = {
    label: string
} & ComponentProps<"input">

export function Form({ label, className, id, ...props }: FormProps) {
    return (
        <div className="flex w-full flex-col gap-1">
            <label htmlFor={id} className="text-sm text-zinc-300">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className={twMerge(
                    "border border-slate-600 bg-slate-700 outline-none focus:border-amber-400",
                    "rounded-lg px-3 py-1 text-sm text-zinc-100 transition-colors sm:py-2",
                    className
                )}
            />
        </div>
    )
}
