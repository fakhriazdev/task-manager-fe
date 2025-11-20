'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Info, TableOfContents, UserPlus } from 'lucide-react'

import OverviewTab from '@/app/dashboard/projects/[id]/overview/components/OverviewTab'
import ListTab from '@/app/dashboard/projects/[id]/list/component/ui/ListTab'

import {
    useProjectDetailAction,
    useProjectTasksAction,
} from '@/lib/project/projectAction'
import InviteDialogDemo from '@/app/dashboard/projects/[id]/overview/components/DialogInvitation'
import {useProjectPermission} from "@/hooks/useProjectPermission";
import {AvatarList} from "@/components/ui/AvatarList";

const TAB_KEYS = {
    OVERVIEW: 'overview',
    LIST: 'list',
} as const
type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS]

export default function PageProjectDetail() {
    const { id } = useParams()
    const projectId = String(id)

    const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.LIST)

    const {
        data: project,
        isLoading: loadingProject,
        error: projectError,
    } = useProjectDetailAction(projectId)

    // 🔐 hanya OWNER & EDITOR yang boleh akses Invitation modal
    const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR',])

    const isListTab = activeTab === TAB_KEYS.LIST

    // ⬇️ hanya List tab yang boleh polling
    const shouldPoll = isListTab
    const shouldFetchTasks =
        !!projectId && !loadingProject && !projectError && isListTab

    const {
        data: taskList,
        isLoading: loadingTasks,
        error: tasksError,
    } = useProjectTasksAction(projectId, {
        enablePolling: shouldPoll,
        enabled: shouldFetchTasks,
    })
    return (
        <div className="relative w-full px-4 lg:px-6 pt-4">
            {/* Header */}
            <div className=" bg-background py-3 sticky top-13 z-30 flex justify-between">
                <div>
                    {loadingProject ? (
                        <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
                    ) : (
                        <h1 className="text-lg font-semibold">{project?.name}</h1>
                    )}
                </div>

                <div className="flex gap-3 items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <AvatarList items={project?.members} maxVisible={5} size="md" />
                    </div>

                    {/* Invite dialog hanya kalau user punya akses (OWNER/EDITOR) */}
                    {hasAccess && (
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                            <InviteDialogDemo
                                projectName={project?.name}
                                members={project?.members}
                                trigger={
                                    <div
                                        className="flex items-center gap-1"
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <UserPlus className="size-4" />
                                        <span>Add Member</span>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as TabKey)}
                className=" w-full flex-col justify-start gap-6"
            >
                {/* View Selector */}
                <div className="bg-background sticky py-3  top-25 z-30 flex items-center justify-between">
                    <Label htmlFor="view-selector" className="sr-only">
                        View
                    </Label>

                    {/* Mobile */}
                    <Select value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)}>
                        <SelectTrigger id="view-selector" className="flex w-fit md:hidden">
                            <SelectValue placeholder="View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TAB_KEYS.OVERVIEW}>
                                <div className="flex items-center gap-2">
                                    <Info strokeWidth={2} className="size-4" />{' '}
                                    <span>Overview</span>
                                </div>
                            </SelectItem>
                            <SelectItem value={TAB_KEYS.LIST}>
                                <div className="flex items-center gap-2">
                                    <TableOfContents
                                        strokeWidth={2}
                                        className="size-4"
                                    />{' '}
                                    <span>List</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Desktop */}
                    <TabsList className="hidden gap-2 md:flex">
                        <TabsTrigger value={TAB_KEYS.OVERVIEW}>
                            <Info strokeWidth={2} className="size-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value={TAB_KEYS.LIST}>
                            <TableOfContents
                                strokeWidth={2}
                                className="size-4"
                            />{' '}
                            List
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Contents */}
                <TabsContent value={TAB_KEYS.OVERVIEW}>
                    {project && (
                        <OverviewTab
                            data={{
                                desc: project.desc,
                                members: project.members,
                                activities: project.activities,
                            }}
                        />
                    )}
                </TabsContent>

                <TabsContent value={TAB_KEYS.LIST}>
                    {tasksError ? (
                        <></>
                    ) : !shouldFetchTasks ? null : loadingTasks ? (
                        <div className="h-24 bg-muted animate-pulse rounded-md" />
                    ) : taskList ? (
                        <ListTab />
                    ) : (
                        <p className="text-sm text-muted-foreground">No tasks yet.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
