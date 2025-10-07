"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import {
    IconDashboard,
    IconTicket,
    IconUsers,
} from "@tabler/icons-react"

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { useSidebar } from "@/components/ui/sidebar"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { useQueryClient } from "@tanstack/react-query"
import AuthService from "@/lib/auth/authService"
import { NavGroup } from "./nav-group"
import { useNavStore } from "@/lib/stores/useNavStore"
import { NavDialog } from "./nav-dialog"

const NavUser = React.lazy(() => import("./nav-user"))

type RoleId = "SUPER" | "ADMIN" | string

// ======================
// 🔸 Sidebar Data
// ======================
const sidebarData = {
    navGroups: [
        {
            title: "Main",
            items: [
                { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
                { title: "Ticket", url: "/dashboard/ticket", icon: IconTicket },
                { title: "Members", url: "/dashboard/members", icon: IconUsers },
            ],
        },
        {
            title: "Projects",
            items: [
                {
                    title: "Projects",
                    items: [
                        { title: "ACCOUNTING", color: "#FFA573", url: "/dashboard/projects/accounting" },
                        { title: "AMS WEB", color: "#EBA1E7", url: "/dashboard/projects/ams-web" },
                        { title: "APPROVAL", color: "#B99FFF", url: "/dashboard/projects/approval" },
                        { title: "BUDGETING", color: "#7EA9E3", url: "/dashboard/projects/budgeting" },
                        { title: "GENERAL AFFAIR", color: "#A4E37E", url: "/dashboard/projects/general-affair" },
                        { title: "MEMBERSHIP", color: "#E37E7E", url: "/dashboard/projects/membership" },
                        { title: "ONLINE SHOP", color: "#A37EE3", url: "/dashboard/projects/online-shop" },
                        { title: "POS", color: "#7EA9E3", url: "/dashboard/projects/pos" },
                        { title: "REALTIME STOCK", color: "#E3C67E", url: "/dashboard/projects/realtime-stock" },
                    ],
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const queryClient = useQueryClient()
    const { user, isAuthenticated } = useAuthStore()
    const setUser = useAuthStore((state) => state.setUser)
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { setOpen } = useNavStore()

    // 🔹 Fetch user data
    React.useEffect(() => {
        if (user && isAuthenticated) return
        queryClient
            .fetchQuery({
                queryKey: ["user-info"],
                queryFn: AuthService.userInfo,
            })
            .then((res) => {
                const data = res.data
                if (data) {
                    setUser(data)
                    queryClient.setQueryData(["user-info"], data)
                }
            })
            .catch((err) => console.error("Failed to fetch user info:", err))
    }, [user, isAuthenticated, queryClient, setUser])

    // 🔹 Role-based filtering
    const filteredSidebarData = React.useMemo(() => {
        const roleId = (user?.roleId as RoleId) || ""
        return {
            ...sidebarData,
            navGroups: sidebarData.navGroups.map((group) => ({
                ...group,
                items:
                    roleId === "ADMIN"
                        ? group.items.filter((i) => i.title !== "Members")
                        : group.items,
            })),
        }
    }, [user?.roleId])

    // ======================
    // 🔹 Render Sidebar
    // ======================
    return (
        <>
            <Sidebar collapsible="icon" {...props}>
                {/* HEADER */}
                <SidebarHeader className="px-3 py-3 border-b">
                    {!isCollapsed && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start rounded-full text-sm font-medium"
                            onClick={() => alert("Create clicked!")}
                        >
                            <Plus className="mr-2 size-4 text-red-500" /> Create
                        </Button>
                    )}
                </SidebarHeader>

                {/* CONTENT */}
                <SidebarContent>
                    {filteredSidebarData.navGroups.map((group) => (
                        <NavGroup
                            key={group.title}
                            title={group.title}
                            items={group.items}
                            onAdd={
                                group.title === "Projects"
                                    ? () => setOpen("projects")
                                    : undefined
                            }
                        />
                    ))}
                </SidebarContent>

                {/* FOOTER */}
                <SidebarFooter>
                    <React.Suspense fallback={<div className="h-10" />}>
                        <NavUser user={user} />
                    </React.Suspense>
                </SidebarFooter>
            </Sidebar>

            {/* 🔹 Centralized Modal */}
            <NavDialog />
        </>
    )
}
