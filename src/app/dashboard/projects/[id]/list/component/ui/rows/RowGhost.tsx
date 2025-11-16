// TableRowGhost.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "../../../types/TaskTable.const";

type GhostAssignee = { nik: string };

export function TaskGhost({
                              name,
                              // assignees = [],
                              creator,
                              dueLabel = "",
                          }: {
    name: string;
    assignees?: GhostAssignee[];
    creator?: { nama: string };
    dueLabel?: string;
}) {
    // const top3 = assignees.slice(0, 3);
    // const extra = Math.max(assignees.length - 3, 0);

    return (
        <div
            className="pointer-events-none w-full rounded-md border bg-card/95 shadow-2xl opacity-95"
            aria-hidden
        >
            {/* Grid 4 kolom + pemisah vertikal agar match table body */}
            <div className="grid grid-cols-5 divide-x divide-border">
                {/* Kolom 1: Nama */}
                <div className="col-span-2 py-2 pr-3 pl-5 min-w-0">
                    <div className="text-sm font-medium truncate" title={name}>
                        {name}
                    </div>
                </div>

                {/* Kolom 2: Assignee */}
                <div className="py-2 px-2">
                    <div className="flex items-center -space-x-2">
                        {/*{top3.map((a) => (*/}
                        {/*    <Avatar key={a.nik} className="h-6 w-6 ring-2 ring-background" title={a.name}>*/}
                        {/*        <AvatarImage src="" alt={a.name} draggable={false} />*/}
                        {/*        <AvatarFallback className="text-[10px] font-semibold">*/}
                        {/*            {initials(a.name)}*/}
                        {/*        </AvatarFallback>*/}
                        {/*    </Avatar>*/}
                        {/*))}*/}
                        {/*{extra > 0 && (*/}
                        {/*    <Avatar className="h-6 w-6 ring-2 ring-background bg-muted" title={`+${extra} more`}>*/}
                        {/*        <AvatarFallback className="text-[10px]">+{extra}</AvatarFallback>*/}
                        {/*    </Avatar>*/}
                        {/*)}*/}
                    </div>
                </div>

                {/* Kolom 3: Tenggat (ghost label sederhana, center) */}
                <div className="py-2 px-2">
                    <div className="text-xs h-full flex items-center justify-center text-center">
                        {dueLabel}
                    </div>
                </div>

                {/* Kolom 4: Creator */}
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
        <div className="pointer-events-none rounded-md border bg-card/95 px-3 py-2 shadow-2xl opacity-95" aria-hidden>
            <div className="text-sm font-semibold truncate max-w-[420px]">{title}</div>
            <div className="text-xs text-muted-foreground">{count} tasks</div>
        </div>
    );
}
