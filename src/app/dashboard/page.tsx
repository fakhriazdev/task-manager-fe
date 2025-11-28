"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IconUsers } from "@tabler/icons-react";
import Link from "next/link";

import { useAuthStore } from "@/lib/stores/useAuthStore";
import {
    TabProject,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/project/tabs-project";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useGetOwnTaskAction,
    useUpdateTask,
} from "@/lib/project/projectAction";
import type { OwnTaskList } from "@/lib/project/projectTypes";
import { cn, formatDateTime2 } from "@/lib/utils";
import { Blocks, Check, Plus, Users } from "lucide-react";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import ProjectDialogs from "@/app/dashboard/projects/[id]/list/component/dialogs/ProjectDialogs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavStore } from "@/lib/stores/useNavStore";

export default function Page() {
    // === Hooks SELALU di top-level, tanpa kondisi / return di atasnya ===
    const roleId = useAuthStore((s) => s.user?.roleId);
    const { user } = useAuthStore();

    const { data, isLoading, isError } = useGetOwnTaskAction();
    const { mutate: updateTask } = useUpdateTask();

    const { setOpen, setCurrentRow, currentRowId } = useProjectStore();
    const { setOpen: setOpenNav } = useNavStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const ownTaskList = useMemo(
        () => (data?.data ?? []) as OwnTaskList[],
        [data],
    );

    const handleToggleStatus = useCallback(
        (task: OwnTaskList) => {
            updateTask({
                type: "setStatus",
                id: task.id,
                status: !task.status,
            });
        },
        [updateTask],
    );

    const handleToggleAdd = useCallback(() => {
        setOpenNav("project");
    }, [setOpenNav]);

    const openDetail = useCallback(
        (taskId: string) => {
            setCurrentRow(taskId);
            setOpen("detail");
        },
        [setCurrentRow, setOpen],
    );

    const canSeeTicket = mounted && roleId !== "STAFF";
    const canSeeMembers = mounted && roleId !== "STAFF" && roleId !== "ADMIN";

    // Cari projectId untuk row yang sedang aktif (dipakai di dialog)
    const selectedProjectId = useMemo(() => {
        if (!currentRowId) return undefined;
        return ownTaskList.find((t) => t.id === currentRowId)?.project.id;
    }, [currentRowId, ownTaskList]);

    const displayName = user?.nama ?? "User";
    const initials =
        user?.nama
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "CN";

    // 🔹 Tanggal hari ini (format Indonesia)
    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            }).format(new Date()),
        [],
    );

    // 🔹 Hydration guard — diletakkan SETELAH semua hooks
    if (!mounted) {
        return (
            <div className="flex-1 w-full bg-gradient-to-b from-primary/5 to-card dark:to-card">
                <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
                    <Card className="@container/card w-full flex">
                        <CardContent className="flex items-center gap-2 py-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-6 w-40" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 w-full bg-gradient-to-b from-primary/5 to-card dark:to-card">
                <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
                    <div className="@container/main grid grid-cols-1 gap-4 lg:grid-cols-2 *:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
                        {/* 🔹 Greeting + tanggal */}
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-primary mb-2">
                                {todayLabel}
                            </span>
                            <h1 className="text-2xl sm:text-2xl tracking-wide truncate">
                                Holla, {displayName}
                            </h1>
                        </div>

                        {/* 🔹 Card utama (Tugas Saya) */}
                        <Card className="@container/card w-full flex col-span-1 lg:col-span-2">
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Avatar className="h-10 w-10 rounded-lg">
                                        {/* <AvatarImage src="#" alt={displayName} /> */}
                                        <AvatarFallback className="rounded-full">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-lg tracking-wide truncate">
                                        Tugas Saya.
                                    </p>
                                </div>
                                <TabProject defaultValue="task">
                                    <TabsList className="gap-2 tracking-wide flex-wrap ml-12">
                                        <TabsTrigger
                                            value="task"
                                            className="cursor-pointer text-sm"
                                        >
                                            Tasks
                                        </TabsTrigger>
                                        {canSeeTicket && (
                                            <TabsTrigger
                                                value="ticket"
                                                className="cursor-pointer text-sm"
                                            >
                                                Tickets
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    {/* ===== TAB TASKS ===== */}
                                    <TabsContent value="task">
                                        <div className="overflow-x-auto">
                                            {isLoading && <TaskTableSkeleton />}

                                            {!isLoading && isError && (
                                                <div className="py-4 text-sm text-destructive">
                                                    Gagal memuat tasks. Silakan coba lagi nanti.
                                                </div>
                                            )}

                                            {!isLoading && !isError && ownTaskList.length === 0 && (
                                                <div className="py-4 text-sm text-muted-foreground">
                                                    Belum ada task yang assign ke kamu.
                                                </div>
                                            )}

                                            {!isLoading && !isError && ownTaskList.length > 0 && (
                                                <Table>
                                                    <TableBody>
                                                        {ownTaskList.map((task) => (
                                                            <TableRow
                                                                key={task.id}
                                                                className="hover:bg-muted/40 cursor-pointer"
                                                                onClick={() => openDetail(task.id)}
                                                            >
                                                                <TableCell className="font-medium max-w-[180px] sm:max-w-none tracking-wide">
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleToggleStatus(task);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (
                                                                                    e.key === "Enter" ||
                                                                                    e.key === " "
                                                                                ) {
                                                                                    e.preventDefault();
                                                                                    handleToggleStatus(task);
                                                                                }
                                                                            }}
                                                                            aria-pressed={!!task.status}
                                                                            aria-label={
                                                                                task.status
                                                                                    ? "Tandai belum selesai"
                                                                                    : "Tandai selesai"
                                                                            }
                                                                            className={cn(
                                                                                "group flex items-center justify-center p-0.5 transition-colors rounded-full",
                                                                                task.status
                                                                                    ? "bg-emerald-500 hover:bg-emerald-600 border-2 border-transparent"
                                                                                    : "bg-transparent hover:bg-emerald-500 border-2 border-emerald-600",
                                                                            )}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "w-2.5 h-2.5 transition-colors",
                                                                                    task.status
                                                                                        ? "text-white"
                                                                                        : "text-emerald-500 group-hover:text-white",
                                                                                )}
                                                                                aria-hidden
                                                                            />
                                                                        </button>

                                                                        <span className="truncate">
                                                                            {task.name}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="inline-flex items-center gap-2 max-w-[180px] sm:max-w-none justify-end"
                                                                        >
                                                                            <div
                                                                                className="h-3 w-3 rounded"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        task.project.color ?? "#30812E",
                                                                                }}
                                                                            />
                                                                            <span className="tracking-wider truncate">
                                                                                {task.project.name}
                                                                            </span>
                                                                        </Badge>

                                                                        {task.dueDate && (
                                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                                {formatDateTime2(task.dueDate)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* ===== TAB TICKETS ===== */}
                                    {canSeeTicket && (
                                        <TabsContent value="ticket" className="mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Ticket overview coming soon.
                                            </p>
                                        </TabsContent>
                                    )}
                                </TabProject>
                            </CardContent>
                        </Card>

                        {/* 🔹 Card Projects */}
                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium">
                                    <div className="flex items-center gap-2 tracking-wider text-sm sm:text-base">
                                        <Blocks size={24} /> Projects
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                {user?.memberProjects && user.memberProjects.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-4">
                                            {user.memberProjects.map((project) => (
                                                <Link
                                                    key={project.projectId}
                                                    href={`/dashboard/projects/${project.projectId}`}
                                                    className="inline-flex items-center gap-2 rounded-lg pl-2 pr-4 py-2 text-xs sm:text-sm hover:bg-muted/60 transition-colors"
                                                >
                                                    <div
                                                        className="h-10 w-10 rounded-xl"
                                                        style={{ backgroundColor: project.color }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium tracking-wide max-w-[140px] truncate">
                                                            {project.name}
                                                        </span>
                                                        {project.roleProject && (
                                                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                                                {project.roleProject}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={handleToggleAdd}
                                                className="inline-flex items-center gap-2 pl-2 pr-4 py-1 text-xs sm:text-sm cursor-pointer group"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 text-primary/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary">
                                                    <Plus className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="font-medium tracking-wide max-w-[140px] truncate text-primary/40 transition-colors group-hover:text-primary">
                                                        Buat Project
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada Project yang di-assign ke kamu.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* 🔹 Card Teams */}
                        <Card className="@container/card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium">
                                    <div className="flex items-center gap-2 tracking-wider text-sm sm:text-base">
                                        <Users size={24} /> Teams
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Team&apos;s Project coming soon
                                </p>
                            </CardContent>
                        </Card>

                        {/* 🔹 Card Members – hide untuk ADMIN & STAFF */}
                        {canSeeMembers && (
                            <Card className="@container/card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        <div className="flex items-center gap-2 tracking-wider text-sm sm:text-base">
                                            <IconUsers size={16} /> Members
                                        </div>
                                    </CardTitle>
                                    <Link
                                        href="/dashboard/members"
                                        className="text-xs rounded-full bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted px-3 py-1"
                                    >
                                        Manage
                                    </Link>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <InfoPill label="Total Members" value="1" />
                                    <InfoPill label="Total Roles" value="5" />
                                    <InfoPill label="Total Stores" value="5" />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Dialogs ditempatkan di root level halaman */}
            {selectedProjectId && <ProjectDialogs projectId={selectedProjectId} />}
        </>
    );
}

/* ========== Skeleton untuk tabel task ========== */

function TaskTableSkeleton() {
    return (
        <Table>
            <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <Skeleton className="h-4 w-[160px]" />
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-4 w-[120px]" />
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-4 w-[80px] ml-auto" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

/* ========== Komponen kecil untuk pill di card members ========== */

function InfoPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="w-full rounded-full flex justify-between bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted text-xs sm:text-sm">
            <p className="my-1 mx-3">{label}</p>
            <p className="my-1 mx-3">{value}</p>
        </div>
    );
}
