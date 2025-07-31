"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
  IconRosetteDiscount,
  IconTicket,
  IconUrgent,
} from "@tabler/icons-react"
import { NavMain } from "@/app/dashboard/components/nav-main"
const NavUser = React.lazy(() => import('./nav-user'))

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import AuthService from "@/lib/auth/authService"
import { useAuthStore } from "@/lib/stores/useAuthStore"
import { useRouter } from "next/navigation"

const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Promosi", url: "/dashboard/promosi", icon: IconRosetteDiscount },
    { title: "Ticket", url: "/dashboard/ticket", icon: IconTicket },
    { title: "My Report", url: "/dashboard/myreport", icon: IconUrgent },
    { title: "Members", url: "/dashboard/members", icon: IconUsers },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const setUser = useAuthStore((state) => state.setUser)
  const router = useRouter()

  useEffect(() => {
    if (user && isAuthenticated) return
    queryClient.fetchQuery({
      queryKey: ['user-info'],
      queryFn: AuthService.userInfo,
    })
        .then((res) => {
          const data = res.data
          if (data) {
            setUser(data)
            queryClient.setQueryData(['user-info'], data)
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user info:", err)
        })
  }, [user, isAuthenticated, queryClient, setUser])

  return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/dashboard")}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">AMS.</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <React.Suspense fallback={null}>
            <NavUser user={user} />
          </React.Suspense>
        </SidebarFooter>
      </Sidebar>
  )
}
