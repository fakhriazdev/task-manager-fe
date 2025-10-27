// TableRowGhost.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, COLS_GRID, COL_SEP } from "../types/TaskTable.const";

type GhostAssignee = { nik: string; name: string };

export function TaskGhost({
                              name,
                              assignees = [],
                              creator,
                          }: {
    name: string;
    assignees?: GhostAssignee[];
    creator?: { nama: string };
}) {
    const top3 = assignees.slice(0, 3);
    const extra = Math.max(assignees.length - 3, 0);

    return (
        <div
            className="pointer-events-none rounded-md border bg-card/95 shadow-2xl opacity-95"
            style={{ width: "w-full" }}
        >
            {/* Pakai grid global + separator vertikal biar sejajar dengan row */}
            <div className={`${COLS_GRID} ${COL_SEP}`}>
                {/* Kolom 1: Nama */}
                <div className="py-2 pr-3 pl-2">
                    <div className="text-sm font-medium truncate" title={name}>
                        {name}
                    </div>
                </div>

                {/* Kolom 2: Assignee */}
                <div className="py-2 px-2">
                    <div className="flex items-center -space-x-2">
                        {top3.map((a) => (
                            <Avatar key={a.nik} className="h-6 w-6 ring-2 ring-background" title={a.name}>
                                <AvatarImage src="" alt={a.name} draggable={false} />
                                <AvatarFallback className="text-[10px] font-semibold">
                                    {initials(a.name)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {extra > 0 && (
                            <Avatar className="h-6 w-6 ring-2 ring-background bg-muted" title={`+${extra} more`}>
                                <AvatarFallback className="text-[10px]">+{extra}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>

                {/* Kolom 3: Creator */}
                <div className="py-2 pl-2">
                    {creator?.nama && (
                        <Avatar className="h-6 w-6 ring-2 ring-background" title={`Creator ${creator.nama}`}>
                            <AvatarImage src="" alt={creator.nama} draggable={false} />
                            <AvatarFallback className="text-[10px] font-semibold">
                                {initials(creator.nama)}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>
        </div>
    );
}

export function SectionGhost({
                                 title,
                                 count,
                             }: {
    title: string;
    count: number;
}) {
    return (
        <div className="pointer-events-none rounded-md border bg-card/95 px-3 py-2 shadow-2xl opacity-95">
            <div className="text-sm font-semibold truncate max-w-[420px]">{title}</div>
            <div className="text-xs text-muted-foreground">{count} tasks</div>
        </div>
    );
}
