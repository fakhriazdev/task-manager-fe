// filteredTable.ts
import { useMemo, useState } from "react"
import type { Task, Assignees } from "@/lib/project/projectTypes"
import type { SectionVM } from "./ui/section/SectionTBody"

/* =========================
   Constants & Types
   ========================= */

export const UNLOCATED_ID = "unlocated" as const

export type DueFilterMode = "any" | "this_week" | "next_week" | "this_month"

export type FilterState = {
    status: "all" | "done" | "not_done"
    onlyMine: boolean
    due: DueFilterMode
}

/* Helper: ambil task per section */
function tasksOfSection(all: Task[], sectionId: string) {
    return all.filter((t) => t.section === sectionId)
}

/* =========================
   Hook utama: useFilteredTable
   ========================= */

type UseFilteredTableArgs = {
    tasks: Task[]
    sections: SectionVM[]
    currentUserId: string // di sini kita anggap = NIK user
}

export function useFilteredTable({
                                     tasks,
                                     sections,
                                     currentUserId,
                                 }: UseFilteredTableArgs) {
    const [filter, setFilter] = useState<FilterState>({
        status: "all",
        onlyMine: false,
        due: "any",
    })

    const { status, onlyMine, due } = filter

    const toggleFilter = (key: keyof FilterState, value?: FilterState[typeof key]) => {
        setFilter((prev) => {
            const { status, onlyMine } = prev

            if (key === "status") {
                if (status === value) {
                    return { ...prev, status: "all" }
                }
                return { ...prev, status: value as FilterState["status"] }
            }

            if (key === "onlyMine") {
                return { ...prev, onlyMine: !onlyMine }
            }

            // "due" diubah langsung lewat setFilter di dropdown
            return prev
        })
    }

    /* ========== FILTERED TASKS ========== */

    const filteredTasks = useMemo(() => {
        const now = new Date()

        let rangeStart: Date | null = null
        let rangeEnd: Date | null = null

        // 🎯 tentukan range tanggal berdasarkan dropdown "due"
        if (due !== "any") {
            if (due === "this_week" || due === "next_week") {
                const today = new Date(now)
                today.setHours(0, 0, 0, 0)

                // minggu mulai Senin
                let day = today.getDay()
                if (day === 0) day = 7 // Sunday -> 7

                const mondayThisWeek = new Date(today)
                mondayThisWeek.setDate(today.getDate() - (day - 1))

                const sundayThisWeek = new Date(mondayThisWeek)
                sundayThisWeek.setDate(mondayThisWeek.getDate() + 6)
                sundayThisWeek.setHours(23, 59, 59, 999)

                if (due === "this_week") {
                    rangeStart = mondayThisWeek
                    rangeEnd = sundayThisWeek
                } else {
                    const mondayNext = new Date(mondayThisWeek)
                    mondayNext.setDate(mondayThisWeek.getDate() + 7)

                    const sundayNext = new Date(sundayThisWeek)
                    sundayNext.setDate(sundayThisWeek.getDate() + 7)

                    rangeStart = mondayNext
                    rangeEnd = sundayNext
                }
            }

            if (due === "this_month") {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                firstDay.setHours(0, 0, 0, 0)
                lastDay.setHours(23, 59, 59, 999)
                rangeStart = firstDay
                rangeEnd = lastDay
            }
        }

        return tasks.filter((t) => {
            const { status: taskStatus, assignees, dueDate } = t

            // ✅ di data kamu: true = selesai, false = belum selesai
            const isDone = Boolean(taskStatus)

            // 1) Filter status
            if (status === "done" && !isDone) return false
            if (status === "not_done" && isDone) return false

            // 2) Filter "Hanya tugas saya" (pakai NIK)
            if (onlyMine) {
                const list: Assignees[] = Array.isArray(assignees) ? assignees : []
                const currentNik = String(currentUserId)

                const isMine = list.some((a) => a.nik === currentNik)
                if (!isMine) return false
            }

            // 3) Filter rentang due date (dari dropdown)
            if (rangeStart && rangeEnd) {
                if (!dueDate) return false // kalau due filter aktif, tapi dueDate null → exclude
                const dueAt = new Date(dueDate)
                if (isNaN(dueAt.getTime())) return false
                if (dueAt < rangeStart || dueAt > rangeEnd) return false
            }

            return true
        })
    }, [tasks, status, onlyMine, due, currentUserId])

    /* ========== Derived dari filteredTasks ========== */

    const grouped = useMemo(
        () =>
            sections.reduce<Record<string, Task[]>>((acc, s) => {
                acc[s.id] = tasksOfSection(filteredTasks, s.id)
                return acc
            }, {}),
        [sections, filteredTasks],
    )

    const unlocatedTasks = useMemo(
        () => filteredTasks.filter((t) => t.section === UNLOCATED_ID),
        [filteredTasks],
    )

    return {
        // state filter
        filter,
        setFilter,
        status,
        onlyMine,
        due,
        toggleFilter,

        // data hasil filter
        filteredTasks,
        grouped,
        unlocatedTasks,
    }
}
