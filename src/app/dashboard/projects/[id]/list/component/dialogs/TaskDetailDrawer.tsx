'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
    Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {Calendar as CalendarIcon, CircleX, Ellipsis, Paperclip, Trash2} from 'lucide-react'
import { format } from 'date-fns'
import {useUpdateTask, useLiveTask, useProjectDetailAction} from '@/lib/project/projectAction'
import {AssigneeInput, Task} from '@/lib/project/projectTypes'
import SubtaskList from '@/app/dashboard/projects/[id]/list/component/subTaskDrawer/SubTaskList'
import AssigneePicker from '@/app/dashboard/projects/[id]/list/component/AssigneePicker'
import {useProjectPermission} from "@/hooks/useProjectPermission";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AttachmentForm from "@/components/shared/AttachmentForm";
import AttachmentList from "@/components/shared/AttachmentList";
import {Accordion, AccordionItem} from "@radix-ui/react-accordion";
import {AccordionContent, AccordionTrigger} from "@/components/ui/accordion";
import {useProjectStore} from "@/lib/stores/useProjectStore";

function isTask(x: unknown): x is Task {
    if (!x || typeof x !== 'object') return false
    const o = x as Record<string, unknown>
    return typeof o.id === 'string' && typeof o.name === 'string' && typeof o.status === 'boolean'
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-5 items-start gap-2">
            <div className="pt-2 text-sm text-muted-foreground">{label}</div>
            <div className="w-full space-y-1 col-span-4">{children}</div>
        </div>
    )
}

interface DrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    taskId: string | null
    projectId?: string
}

export default function TaskDetailDrawer({ open, onOpenChange, taskId, projectId }: DrawerProps) {
    const updateTask = useUpdateTask(projectId)
    const rawTask = useLiveTask(projectId, taskId ?? undefined)
    const task: Task | null = useMemo(() => (isTask(rawTask) ? rawTask : null), [rawTask])
    const { hasAccess } = useProjectPermission(projectId, ['OWNER', 'EDITOR',])
    const [desc, setDesc] = useState('')
    const [due, setDue] = useState<Date | null>(null)
    const openDialog = useProjectStore(s => s.openDialog);
    const {data: project} = useProjectDetailAction(projectId)

    useEffect(() => {
        if (!task) {
            setDesc('')
            setDue(null)
            return
        }
        setDesc(task.desc ?? '')
        setDue(task.dueDate ? new Date(task.dueDate) : null)
    }, [task])

    const hasTask = Boolean(task)
    const taskIdSafe = task?.id ?? 'pending'

    const toggleStatus = useCallback(() => {
        if (!hasTask) return
        updateTask.mutate({ type: 'setStatus', id: taskIdSafe, status: !task!.status })
    }, [hasTask, task, taskIdSafe, updateTask])

    const saveDescIfChanged = useCallback(() => {
        if (!hasTask) return
        const normalized: string | null = desc || null
        if (normalized !== (task!.desc ?? null)) {
            updateTask.mutate({ type: 'setDesc', id: taskIdSafe, desc: normalized })
        }
    }, [hasTask, desc, task, taskIdSafe, updateTask])

    const setDueAndSave = useCallback((d: Date | null) => {
        if (!hasTask) return
        setDue(d)
        updateTask.mutate({ type: 'setDueDate', id: taskIdSafe, dueDate: d ? d.toISOString() : null })
    }, [hasTask, taskIdSafe, updateTask])

    const onAssigneesChange = useCallback((next: { nik:string }[]) => {
        if (!hasTask) return
        const payload = next.map(a => ({
            nik: String(a.nik),
            name: String(''),
        }))
        updateTask.mutate({
            type: 'setAssignees',
            id: taskIdSafe,
            assignees: payload as AssigneeInput[],
        })
    }, [hasTask, taskIdSafe, updateTask])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full md:max-w-[50vw] lg:max-w-[50vw] sm:w-full md:w-[50vw] lg:w-[50vw] bg-card [&>button[data-radix-dialog-close]]:hidden"
            >
                <SheetHeader className="text-left border-b">
                    <SheetTitle className="flex items-center justify-between gap-3 text-lg font-medium">
                        {/* Kiri: judul + badge status */}
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{task?.name ?? 'Memuat…'}</span>

                            {hasTask && (
                                <Badge
                                    variant="outline"
                                    className={cn(`shrink-0 rounded-sm cursor-pointer px-2 py-1 text-xs,
                                    ${task!.status && 'text-green-600 border-green-600 bg-green-500/20'}
                                    hover:bg-green-500/30 hover:text-green-600 hover:border-green-500`
                                    )}
                                    onClick={toggleStatus}
                                >
                                    {task!.status ? 'Selesai' : 'Tandai Selesai'}
                                </Badge>
                            )}
                        </div>

                        {/* Kanan: action lain */}
                        <TooltipProvider>
                            <div className="flex items-center gap-2 pr-10">
                                {/* ============ PAPERCLIP ============ */}
                                <DropdownMenu>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                >
                                                    <Paperclip className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                        </TooltipTrigger>

                                        <TooltipContent side="bottom">
                                            Lampiran tugas
                                        </TooltipContent>
                                    </Tooltip>

                                    <DropdownMenuContent side="bottom" align="end" className="w-96">
                                        <DropdownMenuLabel>Unggah</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="bg-accent px-3 py-2">
                                            <p className="text-xs font-medium">
                                                Pilih atau tarik file dari komputer Anda
                                            </p>

                                            <div className="mt-2">
                                                <AttachmentForm taskId={taskIdSafe} />
                                            </div>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* ============ ELLIPSIS (MORE) ============ */}
                                <DropdownMenu>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                >
                                                    <Ellipsis className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                        </TooltipTrigger>

                                        <TooltipContent side="bottom">
                                            Aksi lain
                                        </TooltipContent>
                                    </Tooltip>

                                    <DropdownMenuContent side="bottom" align="end" className="w-48">
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant={"destructive"}
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => {
                                                if (!hasTask) return;
                                                openDialog('deleteTask', { rowId: taskIdSafe });
                                            }}
                                        >
                                            <Trash2 className="text-destructive focus:text-destructive" /><span>Hapus</span>
                                        </DropdownMenuItem>

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TooltipProvider>

                    </SheetTitle>

                </SheetHeader>

                <div className="mt-4 overflow-auto px-5 space-y-3 text-sm">
                    {/* ASSIGNEES */}
                    <Row label="Penerima tugas">
                        <AssigneePicker
                            hasAccess={hasAccess}
                            currentMembers={task?.assignees ?? []}
                            members={project?.members ?? []}
                            onChange={onAssigneesChange}
                            disabled={!hasTask}
                        />
                    </Row>

                    {/* DUE DATE */}
                    <Row label="Tenggat">
                        {hasAccess ? (
                            // 🔓 Punya akses → bisa edit (popover + clear)
                            <div className="relative inline-block align-middle">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className={cn(
                                                "justify-start gap-3 px-3 py-2 pr-10 text-muted-foreground hover:text-foreground",
                                                !due && "text-muted-foreground",
                                            )}
                                            disabled={!hasTask}
                                        >
                                            <div className="size-7 rounded-full border border-dashed border-primary text-primary inline-flex items-center justify-center">
                                                <CalendarIcon className="size-4" />
                                            </div>
                                            <span
                                                className={cn(
                                                    "truncate max-w-[14rem]",
                                                    due && "text-primary",
                                                )}
                                            >
              {due ? format(due, "dd MMM yyyy") : "Tidak ada tenggat"}
            </span>
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={due ?? undefined}
                                            onSelect={(d) => setDueAndSave(d ?? null)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {hasAccess && due && (
                                    <button
                                        type="button"
                                        aria-label="Clear due date"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7 rounded-md inline-flex items-center justify-center hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDueAndSave(null);
                                        }}
                                        disabled={!hasTask}
                                    >
                                        <CircleX className="size-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            // 🔒 Tidak punya akses → read-only, tanpa popover & tanpa clear
                            <div className="inline-flex items-center gap-3 px-1.5 py-1.5 text-sm text-muted-foreground">
                                <div className="size-7 rounded-full border border-dashed border-muted-foreground/40 inline-flex items-center justify-center">
                                    <CalendarIcon className="size-4" />
                                </div>
                                <span className="truncate max-w-[14rem]">
        {due ? format(due, "dd MMM yyyy") : "Tidak ada tenggat"}
      </span>
                            </div>
                        )}
                    </Row>

                    <section className="text-muted-foreground mt-5">
                        <p className="mb-2">Deskripsi</p>
                        <div className="relative w-full">
                            {hasTask && hasAccess ? (
                                <>
                                    <Textarea
                                        placeholder="Apa definisi tugas ini?"
                                        className="min-h-[150px] bg-card text-foreground border-transparent hover:border-muted-foreground/50 border-2 outline-none focus:border-transparent focus:shadow-none rounded-sm p-2 pr-10 resize-none"
                                        value={desc}
                                        onChange={(e) => setDesc(e.currentTarget.value.slice(0, 100))}
                                        onBlur={saveDescIfChanged}
                                        maxLength={100}
                                        disabled={!hasTask && hasAccess}
                                    />
                                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/80 bg-background/60 px-1 rounded">
                                        {desc.length}/100
                                    </div>
                                </>
                            ) : (
                                <div className="min-h-[150px] bg-card text-foreground border border-dashed border-muted-foreground/40 rounded-sm p-2 pr-10 text-sm">
                                    {desc?.trim() ? (
                                        <p className="whitespace-pre-wrap break-words">{desc}</p>
                                    ) : (
                                        <p className="italic text-muted-foreground/80">
                                            Belum ada deskripsi.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="attachments"
                        className="mt-5 border rounded-md bg-card"
                    >
                        <AccordionItem value="attachments">
                            <AccordionTrigger className="px-3 py-2 text-sm font-medium text-foreground">
                                Attachment
                            </AccordionTrigger>

                            <AccordionContent className="px-3 pb-3 pt-1 text-muted-foreground">
                                <AttachmentList taskId={taskIdSafe} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    {/* SUBTASKS */}
                    <section className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-foreground">Subtasks</h3>
                        </div>
                        {hasTask && <SubtaskList projectId={projectId!} taskId={taskIdSafe} />}
                    </section>
                </div>

                <SheetFooter className="gap-2 mt-auto pt-4 border-t">
                    <SheetClose asChild>
                        <Button variant="secondary">Tutup</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}


