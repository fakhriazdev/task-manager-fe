import type { LinkProps } from "@tanstack/react-router"

// 🧍‍♂️ User info di footer sidebar
type User = {
    name: string
    email: string
    avatar: string
}

// 👥 Teams list di sidebar (kalau multi-org)
type Team = {
    name: string
    logo: React.ElementType
    plan: string
}

// 🧩 Base type untuk semua item
type BaseNavItem = {
    title: string
    badge?: string | number
    icon?: React.ElementType
    color?: string // ✅ tambahan agar bisa punya dot warna
}

// 🔗 Single link item
type NavLink = BaseNavItem & {
    url: LinkProps["to"] | string
    items?: never
}

// 📂 Collapsible section (punya child items)
type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: LinkProps["to"] | string })[]
    url?: never
}

// 🔸 Gabungan dari dua tipe di atas
type NavItem = NavLink | NavCollapsible

// 📦 Satu group di sidebar
type NavGroup = {
    title: string
    items: NavItem[]
}

// 📊 Struktur data sidebar lengkap
type SidebarData = {
    user?: User
    teams?: Team[]
    navGroups: NavGroup[]
}

export type {
    SidebarData,
    NavGroup,
    NavItem,
    NavCollapsible,
    NavLink,
    BaseNavItem,
    User,
    Team,
}
