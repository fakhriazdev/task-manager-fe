"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function TableProject({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div
            data-slot="table-container"
            className="relative"
        >
            <table
                data-slot="table"
                className={cn(
                    "w-full caption-bottom text-sm",
                    "table-fixed",
                    className
                )}
                {...props}
            />
        </div>
    )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                "sticky top-43.5 z-30",
                "bg-background",
                // ✅ Border atas untuk seluruh header
                "before:content-[''] before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-muted-foreground/20",
                className
            )}
            {...props}
        />
    )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("[&_tr:last-child]:border-0 overflow-x-auto", className)}
            {...props}
        />
    )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
                className
            )}
            {...props}
        />
    )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
                className
            )}
            {...props}
        />
    )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                "bg-background",
                "border border-muted-foreground/15",
                "first:border-x-0",
                "last:border-x-0",
                "text-foreground h-10 px-2 text-left align-middle font-normal text-sm whitespace-nowrap",
                "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                // ✅ Pastikan border tidak hilang saat sticky dengan outline sebagai backup
                "relative",
                className
            )}
            {...props}
        />
    )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                "first:border-x-0",
                "last:border-x-0",
                "py-1 px-0 text-xs leading-tight align-middle whitespace-nowrap",
                "first:[&>div]:-ml-4",
                className,
            )}
            {...props}
        >
            <div>
                {props.children}
            </div>
        </td>
    )
}

function TableCaption({
                          className,
                          ...props
                      }: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("text-muted-foreground mt-4 text-sm", className)}
            {...props}
        />
    )
}

export {
    TableProject,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}