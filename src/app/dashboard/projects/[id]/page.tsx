'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { GalleryHorizontal, Info, TableOfContents, Users, UserPlus } from 'lucide-react'

import OverviewTab from '@/app/dashboard/projects/[id]/overview/OverviewTab'
import ListTab from '@/app/dashboard/projects/[id]/list/ListTab'

import { useProjectDetailAction, useProjectTasksAction } from '@/lib/project/projectAction'

const TAB_KEYS = {
    OVERVIEW: 'overview',
    LIST: 'list',
    BOARD: 'board',
} as const
type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS]

export default function PageProjectDetail() {
    const { id } = useParams()
    const projectId = String(id)

    const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.BOARD)

    // Detail project
    const { data: project, isLoading: loadingProject, error: projectError } =
        useProjectDetailAction(projectId)

    // Tasks dengan polling yang smart - hanya aktif di tab LIST/BOARD
    const shouldPoll = activeTab === TAB_KEYS.LIST || activeTab === TAB_KEYS.BOARD

    const { data: taskList, isLoading: loadingTasks, error: tasksError } =
        useProjectTasksAction(projectId, shouldPoll)

    return (
        <div className="w-full px-4 lg:px-6 pt-4">
            {/* Header */}
            <div className="flex justify-between mb-3">
                <div>
                    {loadingProject ? (
                        <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
                    ) : projectError ? (
                        <h1 className="text-lg font-semibold text-red-500">
                            Failed to load project
                        </h1>
                    ) : (
                        <h1 className="text-lg font-semibold">{project?.name}</h1>
                    )}
                </div>

                <div className="flex gap-3 items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>People</span>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                        <UserPlus className="size-4" />
                        <span>Add Assignee</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as TabKey)}
                className="w-full flex-col justify-start gap-6"
            >
                {/* View Selector */}
                <div className="flex items-center justify-between">
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
                                    <Info strokeWidth={2} className="size-4" /> <span>Overview</span>
                                </div>
                            </SelectItem>
                            <SelectItem value={TAB_KEYS.LIST}>
                                <div className="flex items-center gap-2">
                                    <TableOfContents strokeWidth={2} className="size-4" /> <span>List</span>
                                </div>
                            </SelectItem>
                            <SelectItem value={TAB_KEYS.BOARD}>
                                <div className="flex items-center gap-2">
                                    <GalleryHorizontal strokeWidth={2} className="size-4" /> <span>Board</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Desktop */}
                    <TabsList className="hidden gap-2 md:flex">
                        <TabsTrigger value={TAB_KEYS.OVERVIEW}>
                            <Info strokeWidth={2} className="size-4 mr-1" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value={TAB_KEYS.LIST}>
                            <TableOfContents strokeWidth={2} className="size-4 mr-1" /> List
                        </TabsTrigger>
                        <TabsTrigger value={TAB_KEYS.BOARD}>
                            <GalleryHorizontal strokeWidth={2} className="size-4 mr-1" /> Board
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
                        <p className="text-sm text-red-500">Failed to load tasks</p>
                    ) : loadingTasks ? (
                        <div className="h-24 bg-muted animate-pulse rounded-md" />
                    ) : taskList ? (
                        <ListTab />
                    ) : null}
                </TabsContent>

                <TabsContent value={TAB_KEYS.BOARD}>
                    {tasksError ? (
                        <p className="text-sm text-red-500">Failed to load tasks</p>
                    ) : loadingTasks ? (
                        <div className="h-24 bg-muted animate-pulse rounded-md" />
                    ) : taskList ? (
                        <div>
                            <p className="mb-2">Board</p>
                            <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                                {JSON.stringify(taskList, null, 2)}
                            </pre>
                        </div>
                    ) : null}
                </TabsContent>
            </Tabs>
        </div>
    )
}