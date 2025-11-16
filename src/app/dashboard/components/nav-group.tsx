"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, EllipsisVertical, Package, Pencil, Plus, RotateCcw, Trash2} from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useNavStore } from "@/lib/stores/useNavStore"

export type NavItem = {
    id: string
    title: string
    url?: string
    isArchive: boolean
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    badge?: string | number
    items?: NavItem[]
    canManageArchive?: boolean
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
                    {item.icon && (
                        <item.icon className="size-4 text-black dark:text-white " />
                    )}
                    <span>{item.title}</span>
                    {item.badge && (
                        <Badge className="rounded-full px-1 py-0 text-xs">
                            {item.badge}
                        </Badge>
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
    return (
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
            <SidebarMenuItem key={`collapsible-${item.title}`}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2 cursor-pointer">
                            {item.icon && (
                                <item.icon className="size-4 text-black dark:text-white" />
                            )}
                            <span className="flex gap-2 items-center py-auto">
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
                                    className={cn(
                                        "rounded-md p-1",
                                        "bg-primary text-secondary cursor-pointer",
                                        "group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto",
                                        "group-focus-within/menu:opacity-100",
                                        "hover:bg-primary hover:text-secondary",
                                        "focus:bg-primary focus:text-secondary",
                                        "transition-colors",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        "active:scale-95",
                                    )}
                                >
                                    <Plus className="size-3 font-bold" />
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
                    <SidebarMenuSub className="mt-1 space-y-1 w-full">
                        {item.items?.map((sub, j) => {
                            const active = pathname === sub.url

                            return (
                                <SidebarMenuSubItem key={`${sub.url ?? sub.title}-${j}`}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={active}
                                        className={cn(
                                            "group/sub w-full rounded-md px-2.5 py-1.5",
                                            "flex items-center justify-between gap-2",
                                            "bg-transparent",
                                            active ? "bg-muted" : "hover:bg-muted/70",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        )}
                                    >
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <Link
                                                href={sub.url || "#"}
                                                aria-current={active ? "page" : undefined}
                                                className="flex min-w-0 items-center text-foreground/90"
                                            >
                                                {sub.color && (
                                                    <span
                                                        className="mr-2 inline-block size-2.5 rounded-full ring-1 ring-black/5"
                                                        style={{ backgroundColor: sub.color }}
                                                    />
                                                )}
                                                <span className="truncate">{sub.title}</span>
                                            </Link>

                                            <ProjectOption project={sub} />
                                        </div>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            )
                        })}
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
    const [parentOpen, setParentOpen] = React.useState(false)
    const [nestedOpenId, setNestedOpenId] = React.useState<string | null>(null)
    return (
        <SidebarMenuItem key={`dropdown-${item.title}`}>
            <DropdownMenu
                modal={false}
                open={parentOpen}
                onOpenChange={(open) => {
                    setParentOpen(open)
                    if (!open) setNestedOpenId(null)
                }}
            >
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton isActive={true} tooltip={item.title}>
                        {item.icon && <item.icon className="size-4 text-secondary" />}
                        <ChevronRight className="ms-auto size-4 opacity-60" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={4}
                    className="min-w-[220px] w-[260px] rounded-md border bg-popover text-popover-foreground shadow-md"
                >
                    <DropdownMenuLabel className="flex items-center justify-between gap-2 px-2">
                        <span className="truncate">{item.title}</span>

                        {onAdd && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAdd?.()
                                }}
                                className={cn(
                                    "rounded-md p-1",
                                    "bg-secondary text-primary",
                                    "hover:bg-primary hover:text-secondary",
                                    "transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    "active:scale-95",
                                )}
                                aria-label="Tambah item"
                            >
                                <Plus className="size-4 text-current" />
                            </button>
                        )}
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />
                    {item.items?.map((sub, k) => {
                        const href = sub.url ?? "#"
                        const active =
                            pathname === href || pathname.startsWith(`${href}/`)
                        const pid = String(sub.id ?? sub.url ?? sub.title)

                        return (
                            <div
                                key={`${sub.url ?? sub.title}-${k}`}
                                className={cn(
                                    "mx-1 flex items-center justify-between gap-2 rounded-lg",
                                )}
                            >
                                <Link
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 hover:bg-accent/50 rounded-lg transition-colors ${
                                        active && "bg-accent"
                                    }`}
                                >
                                    {sub.color && (
                                        <span
                                            className="inline-block size-3 rounded-full"
                                            style={{ backgroundColor: sub.color }}
                                        />
                                    )}
                                    <span className="truncate">{sub.title}</span>
                                </Link>

                                <div className="pr-2">
                                    <ProjectOption
                                        project={sub}
                                        isOpen={nestedOpenId === pid}
                                        onOpenChange={(open) => {
                                            setNestedOpenId(open ? pid : null)
                                        }}
                                        onAction={() => {
                                            setNestedOpenId(null)
                                            setParentOpen(false)
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}
// =======================================================
// 🔹 Project Option
// =======================================================
function ProjectOption({
                           project,
                           isOpen,
                           onOpenChange,
                           onAction,
                       }: {
    project: NavItem
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    onAction?: () => void
}) {
    const { setOpen, setCurrentProject } = useNavStore()
    const {
        id,
        title,
        color,
        isArchive,
        canManageArchive = false,
    } = project

    // kalau nggak ada color, skip
    if (!color) return null
    if (!canManageArchive) return null

    const archived = !!isArchive

    const openDialog = (
        dialog: "project" | "archive" | "restore" | "deleteProject",
    ) => {
        setCurrentProject({ id, name: title, color, isArchive: archived })
        setOpen(dialog)
        onOpenChange?.(false)
        onAction?.()
    }

    const handleDetailClick = () => {
        openDialog("project")
    }

    return (
        <DropdownMenu modal={false} open={isOpen} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={title ? `Opsi untuk ${title}` : "Opsi item"}
                >
                    <EllipsisVertical className="size-3.5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={1}
                className="w-[160px] z-[100]"
            >
                {/* Edit / Detail */}
                <DropdownMenuItem
                    onClick={handleDetailClick}
                    className="text-primary cursor-pointer flex items-center gap-2"
                >
                    <Pencil size={14} className="shrink-0 text-primary" />
                    <span>Edit</span>
                </DropdownMenuItem>

                {/* Archive / Restore / Delete */}
                {archived ? (
                    <>
                        <DropdownMenuItem
                            onClick={() => openDialog("restore")}
                            className="cursor-pointer"
                        >
                            <RotateCcw size={14} className="shrink-0 text-primary"/>
                            <span>Restore</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => openDialog("deleteProject")}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <Trash2 size={14} className="shrink-0 text-destructive"/>
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem
                        onClick={() => openDialog("archive")}
                        className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/80"
                    >
                        <Package  size={14} className="shrink-0 text-destructive" />
                        <span>Archive</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

