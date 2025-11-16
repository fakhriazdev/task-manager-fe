'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import type { MemberProjects } from '@/lib/auth/authTypes'

type ProjectRole = MemberProjects['roleProject']

type UseProjectPermissionResult = {
    hasAccess: boolean
    role: ProjectRole | null
    membership: MemberProjects | null
}

export function useProjectPermission(
    projectId?: string,
    allowedRoles?: ProjectRole[],
): UseProjectPermissionResult {
    const { user } = useAuthStore()

    return useMemo(() => {
        if (!projectId || !user?.memberProjects?.length) {
            return { hasAccess: false, role: null, membership: null }
        }

        const membership =
            user.memberProjects.find(
                (mp: MemberProjects) => String(mp.projectId) === String(projectId),
            ) ?? null

        if (!membership) {
            return { hasAccess: false, role: null, membership: null }
        }

        const role = membership.roleProject as ProjectRole

        const hasAccess = allowedRoles
            ? allowedRoles.includes(role)
            : true // kalau allowedRoles gak dikirim, dianggap bebas access selama dia member

        return { hasAccess, role, membership }
    }, [projectId, user?.memberProjects, allowedRoles])
}
