'use client'

import * as React from 'react'
import { Blocks, FolderArchive, Plus} from 'lucide-react'
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
import {Project} from "@/lib/project/projectTypes";

const NavUser = React.lazy(() => import('./nav-user'))

type RoleId = 'SUPER' | 'ADMIN' | string
type NavSection = {
    title: string;
    items: NavItem[];
};
type NavItem = {
    id: string
    title: string
    url?: string
    isArchive:boolean
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    badge?: string | number
    items?: NavItem[]
    canManageArchive?: boolean
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const queryClient = useQueryClient()
    const { user, isAuthenticated } = useAuthStore()
    console.log(user?.memberProjects)
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

    // 🔹 Ambil project ui dari React Query
    const { data: projects = [], isLoading, refetch } = useProjectAction()

    // 🔹 Role-based filter
// 🔹 Role-based filter
    const filteredSidebarData = React.useMemo(() => {
        const roleId = (user?.roleId as RoleId) || ''
        const isSuper = roleId === 'SUPER'

        // ambil daftar project yang user punya role di dalamnya
        type MemberProject = { projectId: string; roleProject: string }
        const memberProjects: MemberProject[] = (user?.memberProjects as MemberProject[]) ?? []

        const isArchivedFlag = (p: Project) => p.isArchive
        const activeProjects   = isLoading ? [] : projects.filter((p) => !isArchivedFlag(p))
        const archivedProjects = isLoading ? [] : projects.filter((p) =>  isArchivedFlag(p))

        // 🔹 apakah user boleh manage (archive/restore) project ini?
        const canManageProject = (p: Project): boolean => {
            if (isSuper) return true

            const projectIdStr = String(p.id)

            return memberProjects.some(
                (mp) =>
                    mp.projectId === projectIdStr &&
                    mp.roleProject === 'OWNER' || mp.roleProject === 'EDITOR'
            )
        }

        const canSeeMainItem = (itemId: string) => {
            switch (roleId) {
                case 'STAFF':
                    // STAFF: sembunyikan ticket & members
                    return !['ticket', 'members'].includes(itemId)
                case 'ADMIN':
                    // ADMIN: sembunyikan members saja
                    return itemId !== 'members'
                default:
                    // SUPER / role lain: bebas
                    return true
            }
        }

        const navGroups = [
            {
                title: "Main",
                items: [
                    { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: IconDashboard, isArchive:false },
                    { id: "ticket",    title: "Ticket",    url: "/dashboard/ticket",   icon: IconTicket, isArchive:false },
                    { id: "members",   title: "Members",   url: "/dashboard/members",  icon: IconUsers,  isArchive:false },
                ].filter(i => canSeeMainItem(i.id)),
            },
            {
                title: "Projects",
                items: [
                    {
                        id: "projects-group",
                        title: "Projects",
                        isArchive:false,
                        icon: Blocks,
                        items: isLoading
                            ? []
                            : activeProjects.map((p) => ({
                                id: String(p.id),
                                title: p.name,
                                color: p.color,
                                url: `/dashboard/projects/${p.id}`,
                                isArchive: p.isArchive,
                                canManageArchive: canManageProject(p),   // ⬅️ di sini
                            })),
                    },
                ],
            },
            {
                title: "Archives",
                items: [
                    {
                        id: "archives-group",
                        title: "Archives",
                        isArchive:false,
                        icon: FolderArchive,
                        items: isLoading
                            ? []
                            : archivedProjects.map((p) => ({
                                id: String(p.id),
                                title: p.name,
                                color: p.color,
                                isArchive: p.isArchive,
                                canManageArchive: canManageProject(p),   // ⬅️ dan di sini
                            })),
                    },
                ],
            },
        ] satisfies NavSection[];

        return { navGroups }
    }, [user?.roleId, user?.memberProjects, projects, isLoading])


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
                            onClick={() => refetch()} // refresh project ui
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
                                group.title === 'Projects' ? () => setOpen('project') : undefined
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
