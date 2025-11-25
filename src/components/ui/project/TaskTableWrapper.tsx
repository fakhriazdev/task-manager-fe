"use client"

import { cn } from "@/lib/utils"

export function TaskTableWrapper({
                                     children,
                                     className
                                 }: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("relative w-full overflow-x-auto", className)}>
            <div className="min-w-[800px]">
                {children}
            </div>
        </div>
    )
}