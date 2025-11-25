'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import ProjectDialogs from '@/app/dashboard/projects/[id]/list/component/dialogs/ProjectDialogs'
import TaskTableView from '@/app/dashboard/projects/[id]/list/component/ui/TaskTableView'



export default function ListTab() {
    const { id } = useParams()
    const projectId = useMemo(
        () => (Array.isArray(id) ? id[0] : id) ?? '',
        [id],
    )
    return (
        <main className="relative h-auto bg-background text-foreground pb-5 px-4 lg:px-6.5">
            <TaskTableView projectId={projectId} />
            <ProjectDialogs projectId={projectId} />
        </main>
    )
}
