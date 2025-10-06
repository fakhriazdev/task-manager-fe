"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 🔹 Types
export type NavItem = {
    title: string
    url?: string
    icon?: React.ComponentType<{ className?: string }>
    badge?: string | number
    color?: string
    items?: NavItem[]
}

export type NavCollapsible = NavItem & {
    items: NavItem[]
}

export type NavLink = NavItem & {
    url: string
    items?: never
}

export type NavGroupProps = {
    title: string
    items: (NavCollapsible | NavLink)[]
}

// 🔹 Main Component
export function NavGroup({ items }: NavGroupProps) {
    const { state, isMobile } = useSidebar()
    const pathname = usePathname()

    return (
        <SidebarGroup>
            {/*<SidebarGroupLabel>{title}</SidebarGroupLabel>*/}
            <SidebarMenu>
                {items.map((item) => {
                    const key = `${item.title}-${item.url}`

                    if (!item.items)
                        return <SidebarMenuLink key={key} item={item} pathname={pathname} />

                    if (state === "collapsed" && !isMobile)
                        return (
                            <SidebarMenuCollapsedDropdown
                                key={key}
                                item={item}
                                pathname={pathname}
                            />
                        )

                    return (
                        <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

// 🔹 Badge helper
function NavBadge({ children }: { children: React.ReactNode }) {
    return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
}

// 🔹 Single link
function SidebarMenuLink({item, pathname,}: { item: NavLink, pathname: string }) {
    const { setOpenMobile } = useSidebar()
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={checkIsActive(pathname, item)}
                tooltip={item.title}
            >
                <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                    {item.color && (
                        <span
                            className="inline-block size-2.5 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                        />
                    )}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

// 🔹 Collapsible Section
function SidebarMenuCollapsible({item, pathname,}: { item: NavCollapsible, pathname: string }) {
    const { setOpenMobile } = useSidebar()

    return (
        <Collapsible
            asChild
            defaultOpen={checkIsActive(pathname, item, true)}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.title}
                        className="w-full justify-between text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            {item.icon && (
                                <item.icon className="size-4 text-muted-foreground" />
                            )}
                            <span>{item.title}</span>
                            {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        </div>
                        <ChevronRight className="size-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* Smooth animation */}
                <CollapsibleContent
                    className="
            overflow-hidden transition-all duration-400 ease-in-out
            data-[state=closed]:max-h-0 data-[state=open]:max-h-[500px]
            data-[state=closed]:opacity-0 data-[state=open]:opacity-100
          "
                >
                    <SidebarMenuSub className="mt-1 space-y-1 pl-3">
                        {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={checkIsActive(pathname, subItem)}
                                >
                                    <Link
                                        href={subItem.url ?? "#"}
                                        onClick={() => setOpenMobile(false)}
                                        className="flex items-center gap-2 text-[14px]"
                                    >
                                        {subItem.color && (
                                            <span
                                                className="inline-block size-2.5 rounded-full"
                                                style={{ backgroundColor: subItem.color }}
                                            />
                                        )}
                                        <span>{subItem.title}</span>
                                        {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
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

// 🔹 Dropdown for collapsed sidebar
function SidebarMenuCollapsedDropdown({item, pathname,}: { item: NavCollapsible, pathname: string }) {
    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.title}
                        isActive={checkIsActive(pathname, item)}
                    >
                        {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className="ms-auto size-4 transition-transform duration-200" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="right" align="start" sideOffset={4}>
                    <DropdownMenuLabel>
                        {item.title} {item.badge ? `(${item.badge})` : ""}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items.map((sub) => (
                        <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                            <Link
                                href={sub.url ?? "#"}
                                className={`flex w-full items-center gap-2 ${
                                    checkIsActive(pathname, sub) ? "bg-secondary" : ""
                                }`}
                            >
                                {sub.color && (
                                    <span
                                        className="inline-block size-2.5 rounded-full"
                                        style={{ backgroundColor: sub.color }}
                                    />
                                )}
                                <span className="max-w-52 text-wrap">{sub.title}</span>
                                {sub.badge && (
                                    <span className="ms-auto text-xs">{sub.badge}</span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}

// 🔹 Active check helper
function checkIsActive(href: string, item: NavItem, mainNav = false) {
    if (!item.url) return false
    return (
        href === item.url ||
        href.split("?")[0] === item.url ||
        !!item?.items?.some((i) => href.startsWith(i.url ?? "")) ||
        (mainNav &&
            href.split("/")[1] !== "" &&
            href.split("/")[1] === item?.url?.split("/")[1])
    )
}
