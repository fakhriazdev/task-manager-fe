'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon, CircleX, User2 } from 'lucide-react'
import {useUpdateTask, useLiveTask} from "@/lib/project/projectAction"



/* ==== Row Component ==== */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-5 items-start gap-2">
            <div className="pt-2 text-sm text-muted-foreground">{label}</div>
            <div className="w-full space-y-1 col-span-4">{children}</div>
        </div>
    )
}

/* ==== Drawer Component ==== */
interface DrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    taskId: string | null  // ✅ Hanya perlu ID!
    projectId?: string
}

export default function TaskDetailDrawer({ open, onOpenChange, taskId, projectId }: DrawerProps) {
    const { mutate: updateTask } = useUpdateTask(projectId)

    // Ambil data task langsung dari cache menggunakan ID
    const task = useLiveTask(projectId, taskId ?? undefined)

    // --- Local UI state untuk kontrol input ---
    const [desc, setDesc] = useState('')
    const [due, setDue] = useState<Date | null>(null)

    const firstAssignee = useMemo(
        () => (task?.assignees?.length
            ? { nik: task.assignees[0].nik, name: task.assignees[0].name }
            : null),
        [task?.assignees]
    )
    const [assignee, setAssignee] = useState<{ nik: string; name: string } | null>(null)

    // Sinkronkan saat task berubah
    useEffect(() => {
        if (!task) return

        setDesc(task.desc ?? '')
        setDue(task.dueDate ? new Date(task.dueDate) : null)
        setAssignee(firstAssignee)
    }, [task, firstAssignee])

    // Jika task tidak ditemukan, jangan render
    if (!task) return null

    // --- Actions ---
    const toggleStatus = () => {
        updateTask({ type: 'setStatus', id: task.id, status: !task.status })
    }

    const saveDescIfChanged = () => {
        const normalized = desc || null
        if (normalized !== (task.desc ?? null)) {
            updateTask({ type: 'setDesc', id: task.id, desc: normalized })
        }
    }

    const setDueAndSave = (d: Date | null) => {
        setDue(d)
        updateTask({ type: 'setDueDate', id: task.id, dueDate: d ? d.toISOString() : null })
    }

    const clearAssignee = () => {
        setAssignee(null)
        updateTask({ type: 'setAssignees', id: task.id, assignees: [] })
    }

    const pickAssignee = () => {
        // TODO: ganti dengan picker asli
        const pick = { nik: '123456789', name: 'John Doe' }
        setAssignee(pick)
        updateTask({ type: 'setAssignees', id: task.id, assignees: [pick] })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full max-w-none sm:w-[95vw] sm:max-w-[95vw] md:w-[80vw] md:max-w-[80vw] lg:w-[50vw] lg:max-w-[50vw] xl:w-[50vw] xl:max-w-[50vw]"
            >
                <SheetHeader className="text-left border-b">
                    <SheetTitle className="flex gap-2 text-lg font-medium items-center">
                        <span className="truncate">{task.name}</span>

                        {task.status ? (
                            <Badge variant="outline" className="h-6 rounded-sm">Selesai</Badge>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-6 w-28 text-xs rounded-sm"
                                onClick={toggleStatus}
                            >
                                Tandai Selesai
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* BODY */}
                <div className="mt-4 overflow-auto px-5 max-h-[calc(100vh-200px)] space-y-3 text-sm">
                    {/* ASSIGNEE */}
                    <Row label="Penerima tugas">
                        {assignee ? (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage />
                                    <AvatarFallback>{assignee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="leading-tight">
                                    <div className="font-medium">{assignee.name}</div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={clearAssignee}>
                                    <CircleX className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="h-8 w-8 rounded-full border border-dashed" />
                                <span>Tidak ada penerima tugas</span>
                                <Button type="button" variant="secondary" size="sm" onClick={pickAssignee}>
                                    <User2 className="mr-2 h-4 w-4" /> Pilih orang
                                </Button>
                            </div>
                        )}
                    </Row>

                    {/* DUE DATE */}
                    <Row label="Tenggat">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn('w-[220px] justify-start text-left font-normal', !due && 'text-muted-foreground')}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {due ? due.toLocaleDateString() : 'Tidak ada tenggat'}
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
                    </Row>

                    {/* DESCRIPTION */}
                    <Row label="Deskripsi">
                        <Textarea
                            placeholder="Apa definisi tugas ini?"
                            className="min-h-[120px]"
                            value={desc}
                            onChange={(e) => {
                                const v = e.currentTarget.value
                                setDesc(v.length > 100 ? v.slice(0, 100) : v)
                            }}
                            onBlur={saveDescIfChanged}
                            maxLength={100}
                        />
                        <div className="text-xs text-muted-foreground">{desc.length}/100</div>
                    </Row>

                    {/* Dependensi (placeholder) */}
                    <Row label="Dependensi">
                        <button type="button" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                            Tambahkan dependensi
                        </button>
                    </Row>
                </div>

                <SheetFooter className="gap-2 mt-auto pt-4 border-t">
                    <SheetClose asChild>{/* tombol Close opsional */}</SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}