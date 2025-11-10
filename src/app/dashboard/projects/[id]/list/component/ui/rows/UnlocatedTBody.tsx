"use client";

import { TableBody, TableRow } from "@/components/ui/table";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskRow, type TaskTRProps } from "./TaskRow";

type UnlocatedTBodyProps = {
    tasks: TaskTRProps["task"][];
    projectId: TaskTRProps["projectId"]; // ⬅️ tambahkan prop ini
    disableDrop?: boolean;
    isDraggingTask?: boolean;
};

export function UnlocatedTBody({
                                   tasks,
                                   projectId,
                                   disableDrop,
                                   isDraggingTask,
                               }: UnlocatedTBodyProps) {
    const droppableId = `droppable-section-unlocated`;

    const { setNodeRef, isOver } = useDroppable({
        id: droppableId,
        data: { type: "task-container" as const, sectionId: "unlocated" },
        disabled: !!disableDrop,
    });

    // Dnd-kit senang dengan id yang konsisten & unik
    const itemIds = tasks.map((t) => String(t.id));

    return (
        <TableBody
            ref={setNodeRef}
            className={isOver ? "bg-primary/5 transition-colors" : ""}
        >
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            projectId={projectId} // ⬅️ pass ke TaskRow
                        />
                    ))
                ) : isDraggingTask ? (
                    <TableRow className="opacity-70 h-1" />
                ) : null}
            </SortableContext>
        </TableBody>
    );
}
