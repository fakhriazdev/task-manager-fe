"use client";

import { TableBody, TableRow } from "@/components/ui/table";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskRow, type TaskTRProps } from "./TaskRow";

export function UnlocatedTBody({
                                   tasks,
                                   disableDrop,
                                   isDraggingTask,
                               }: {
    tasks: TaskTRProps["task"][];
    disableDrop?: boolean;
    isDraggingTask?: boolean;
}) {
    const droppableId = `droppable-section-unlocated`;
    const { setNodeRef, isOver } = useDroppable({
        id: droppableId,
        data: { type: "task-container" as const, sectionId: "unlocated" },
        disabled: !!disableDrop,
    });

    // const itemIds = tasks.map((t) => t.id);

    return (
        <TableBody ref={setNodeRef} className={isOver ? "bg-primary/5 transition-colors" : ""}>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {tasks.length > 0 ? (
                    tasks.map(task => <TaskRow key={task.id} task={task} />)
                ) : (
                    isDraggingTask ? (
                        <TableRow className="opacity-70 h-1">
                            {/*<TableCell colSpan={3} className="h-1 text-center text-sm text-muted-foreground">*/}
                            {/*    Lepaskan task di sini*/}
                            {/*</TableCell>*/}
                        </TableRow>
                    ) : null
                )}
            </SortableContext>
        </TableBody>
    );
}
