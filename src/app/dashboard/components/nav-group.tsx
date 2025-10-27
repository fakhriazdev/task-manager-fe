"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Plus, Target } from "lucide-react"
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type NavItem = {
    title: string
    url?: string
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    badge?: string | number
    items?: NavItem[]
}

export type NavGroupProps = {
    title: string
    items: NavItem[]
    onAdd?: () => void
}

export function NavGroup({ items, onAdd }: NavGroupProps) {
    const pathname = usePathname()
    const { state, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item, i) => {
                    // gunakan kombinasi index + title/url agar benar-benar unik
                    const key = `${item.title}-${item.url ?? i}`

                    if (!item.items)
                        return (
                            <SidebarMenuLink
                                key={key}
                                item={item}
                                pathname={pathname}
                            />
                        )

                    if (isCollapsed && !isMobile)
                        return (
                            <SidebarMenuCollapsedDropdown
                                key={key}
                                item={item}
                                pathname={pathname}
                                onAdd={onAdd}
                            />
                        )

                    return (
                        <SidebarMenuCollapsible
                            key={key}
                            item={item}
                            pathname={pathname}
                            onAdd={onAdd}
                            isCollapsed={isCollapsed}
                        />
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

// =======================================================
// 🔹 Sidebar Link
// =======================================================
function SidebarMenuLink({
                             item,
                             pathname,
                         }: {
    item: NavItem
    pathname: string
}) {
    const isActive = pathname === item.url
    return (
        <SidebarMenuItem key={item.url ?? item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url || "#"} className="flex items-center gap-2">
                    {item.color && (
                        <span
                            className="inline-block size-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                    )}
                    {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                    <span>{item.title}</span>
                    {item.badge && (
                        <Badge className="rounded-full px-1 py-0 text-xs">{item.badge}</Badge>
                    )}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

// =======================================================
// 🔹 Collapsible (expanded mode)
// =======================================================
function SidebarMenuCollapsible({
                                    item,
                                    pathname,
                                    onAdd,
                                    isCollapsed,
                                }: {
    item: NavItem
    pathname: string
    onAdd?: () => void
    isCollapsed: boolean
}) {
    const isActive = !!item.items?.some((i) => pathname.startsWith(i.url || ""))

    return (
        <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
            <SidebarMenuItem key={`collapsible-${item.title}`}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between" isActive={isActive}>
                        <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                            <span className="flex gap-2 items-center py-auto">
                <Target className="size-4" />
                                {item.title}
              </span>
                            <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                        <div className="flex items-center gap-1">
                            {!isCollapsed && onAdd && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAdd?.()
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && onAdd?.()}
                                    className="cursor-pointer rounded-md p-1 hover:bg-accent transition bg-primary dark:bg-primary"
                                >
                                    <Plus className="size-3 font-bold text-secondary dark:text-secondary" />
                                </div>
                            )}
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent
                    className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          data-[state=closed]:max-h-0 data-[state=open]:max-h-[600px]
          data-[state=closed]:opacity-0 data-[state=open]:opacity-100
          data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-2"
                >
                    <SidebarMenuSub className="mt-1 space-y-1">
                        {item.items?.map((sub, j) => (
                            <SidebarMenuSubItem key={`${sub.url ?? sub.title}-${j}`}>
                                <SidebarMenuSubButton asChild isActive={pathname === sub.url}>
                                    <Link href={sub.url || "#"} className="flex items-center gap-2 pl-2">
                                        {sub.color && (
                                            <span
                                                className="inline-block size-3 rounded-full"
                                                style={{ backgroundColor: sub.color }}
                                            />
                                        )}
                                        <span>{sub.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

// =======================================================
// 🔹 Collapsed Dropdown Mode
// =======================================================
function SidebarMenuCollapsedDropdown({
                                          item,
                                          pathname,
                                          onAdd,
                                      }: {
    item: NavItem
    pathname: string
    onAdd?: () => void
}) {
    const isActive = !!item.items?.some((i) => pathname.startsWith(i.url || ""))

    return (
        <SidebarMenuItem key={`dropdown-${item.title}`}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                        {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                        <Target className="size-4" />
                        <ChevronRight className="ms-auto size-4 opacity-60" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={4}
                    className="min-w-[220px] w-[260px] rounded-md border bg-popover text-popover-foreground shadow-md"
                >
                    <DropdownMenuLabel className="flex items-center justify-between px-2">
                        <span>{item.title}</span>
                        {onAdd && (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAdd?.()
                                }}
                                onKeyDown={(e) => e.key === "Enter" && onAdd?.()}
                                className="cursor-pointer rounded-md p-1 hover:bg-accent transition"
                            >
                                <Plus className="size-4 text-muted-foreground" />
                            </div>
                        )}
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {item.items?.map((sub, k) => (
                        <DropdownMenuItem key={`${sub.url ?? sub.title}-${k}`} asChild>
                            <Link
                                href={sub.url || "#"}
                                className={`flex items-center gap-2 ${
                                    pathname === sub.url ? "bg-accent" : ""
                                }`}
                            >
                                {sub.color && (
                                    <span
                                        className="inline-block size-3 rounded-full"
                                        style={{ backgroundColor: sub.color }}
                                    />
                                )}
                                <span>{sub.title}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}
