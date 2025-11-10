"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2 } from "lucide-react"
import type { Section } from "@/app/dashboard/projects/[id]/list/types/task"
import { useProjectStore } from "@/lib/stores/useProjectStore"

interface SectionRowActionProps {
    currentSection: Pick<Section, "id" | "name">
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function SectionRowAction({ currentSection, open, onOpenChange }: SectionRowActionProps) {
    const setOpenDialog = useProjectStore(s => s.setOpen)
    const setCurrentSection = useProjectStore(s => s.setCurrentSection)

    return (
        <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-6 w-6 p-0"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-[160px] z-50"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <DropdownMenuItem
                    variant={"destructive"}
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                        setCurrentSection(currentSection as Section)
                        setOpenDialog("deleteSection")
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
