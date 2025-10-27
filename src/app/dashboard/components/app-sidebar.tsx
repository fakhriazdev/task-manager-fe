'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { IconDashboard, IconTicket, IconUsers } from '@tabler/icons-react'
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { useQueryClient } from '@tanstack/react-query'
import AuthService from '@/lib/auth/authService'
import { NavGroup } from './nav-group'
import { useNavStore } from '@/lib/stores/useNavStore'
import { NavDialog } from './nav-dialog'
import {useProjectAction} from "@/lib/project/projectAction";

const NavUser = React.lazy(() => import('./nav-user'))

type RoleId = 'SUPER' | 'ADMIN' | string

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const queryClient = useQueryClient()
    const { user, isAuthenticated } = useAuthStore()
    const setUser = useAuthStore((state) => state.setUser)
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'
    const { setOpen } = useNavStore()

    // 🔹 Fetch user info (once)
    React.useEffect(() => {
        if (user && isAuthenticated) return
        queryClient
            .fetchQuery({
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
            .catch((err) => console.error('Failed to fetch user info:', err))
    }, [user, isAuthenticated, queryClient, setUser])

    // 🔹 Ambil project list dari React Query
    const { data: projects = [], isLoading, refetch } = useProjectAction()

    // 🔹 Role-based filter
    const filteredSidebarData = React.useMemo(() => {
        const roleId = (user?.roleId as RoleId) || ''

        const navGroups = [
            {
                title: 'Main',
                items: [
                    { title: 'Dashboard', url: '/dashboard', icon: IconDashboard },
                    { title: 'Ticket', url: '/dashboard/ticket', icon: IconTicket },
                    { title: 'Members', url: '/dashboard/members', icon: IconUsers },
                ].filter((i) => !(roleId === 'ADMIN' && i.title === 'Members')),
            },
            {
                title: 'Projects',
                items: [
                    {
                        title: 'Projects',
                        items: isLoading
                            ? [] // sementara kosong
                            : projects.map((p) => ({
                                title: p.name,
                                color: p.color,
                                url: `/dashboard/projects/${p.id}`,
                            })),
                    },
                ],
            },
        ]

        return { navGroups }
    }, [user?.roleId, projects, isLoading])

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
                            onClick={() => refetch()} // refresh project list
                        >
                            <Plus className="mr-2 size-4 text-red-500" /> Refresh
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
                                group.title === 'Projects' ? () => setOpen('projects') : undefined
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
