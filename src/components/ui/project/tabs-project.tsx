"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function TabProject({
                  className,
                  ...props
              }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    )
}

function TabsList({
                      className,
                      ...props
                  }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                "text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
                className
            )}
            {...props}
        />
    )
}

function TabsTrigger({
                         className,
                         ...props
                     }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                // STATE: active
                "data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary",
                // BASE
                "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center text-start gap-1.5",
                "border-b-[3px] border-transparent",
                "py-3 text-sm font-medium whitespace-nowrap",
                "text-muted-foreground", // <- base abu2, bukan text-foreground
                // TRANSITION: lebih smooth
                "transition-[color,border-color,border-width,background-color,transform] duration-200 ease-out",
                "focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "disabled:pointer-events-none disabled:opacity-50",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />



    )
}

function TabsContent({
                         className,
                         ...props
                     }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn("flex-1 outline-none", className)}
            {...props}
        />
    )
}

export { TabProject, TabsList, TabsTrigger, TabsContent }
