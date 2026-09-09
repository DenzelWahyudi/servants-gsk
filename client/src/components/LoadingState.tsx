import { LoaderCircle } from "lucide-react"

type LoadingStateProps = {
    label?: string
}

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center"
        >
            <LoaderCircle
                aria-hidden="true"
                className="h-7 w-7 animate-spin text-amber-500 motion-reduce:animate-none"
            />
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs opacity-70">The server may take a moment to respond.</p>
        </div>
    )
}
