'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import TaskDetailDrawer from '@/app/dashboard/projects/[id]/list/component/dialogs/TaskDetailDrawer';
import { useProjectStore } from '@/lib/stores/useProjectStore';
import DeleteSectionConfirm from './DeleteSectionConfirm';
import CreateTaskDialog from "@/app/dashboard/projects/[id]/list/component/dialogs/creatTaskDialog";
import CreateSectionDialog from "@/app/dashboard/projects/[id]/list/component/dialogs/createSectionDialog";
import {ConfirmDialog} from "@/components/shared/confirmDialog";
import {useDeleteTaskAction} from "@/lib/project/projectAction";

export default function ProjectDialogs({ projectId }: { projectId?: string }) {
    const params = useParams<{ id?: string }>();
    const effectiveProjectId = React.useMemo(
        () => (projectId ?? (params?.id as string)) || '',
        [projectId, params?.id]
    );
    const deleteTaskMutation = useDeleteTaskAction();

    const open = useProjectStore(s => s.open);
    const setOpen = useProjectStore(s => s.setOpen);
    const currentRowId = useProjectStore(s => s.currentRowId);
    const setCurrentRow = useProjectStore(s => s.setCurrentRow);

    const safeCloseDetail = React.useCallback(() => {
        setOpen(null);
        setCurrentRow(null);
    }, [setOpen, setCurrentRow]);

    const handleDeleteTaskConfirm = React.useCallback(() => {
        if (!currentRowId) return;

        deleteTaskMutation.mutate(
            {
                taskId: currentRowId,
                projectId: effectiveProjectId,
            },
            {
                onSuccess: () => {
                    // tutup dialog + bersihin selection
                    setOpen(null);
                    setCurrentRow(null);
                },
            }
        );
    }, [currentRowId, effectiveProjectId, deleteTaskMutation, setOpen, setCurrentRow]);

    const handleDeleteTaskOpenChange = React.useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                // kalau user cancel / dialog ditutup
                setOpen(null);
            } else {
                setOpen('deleteTask');
            }
        },
        [setOpen]
    );

    return (
        <>
            {/* Drawer Detail tetap terpisah */}
            <TaskDetailDrawer
                open={open === 'detail'}
                projectId={effectiveProjectId}
                taskId={currentRowId}
                onOpenChange={(isOpen) => (isOpen ? setOpen('detail') : safeCloseDetail())}
            />

            {/* Dialog terpisah */}
            {effectiveProjectId && (
                <>
                    <CreateTaskDialog projectId={effectiveProjectId} />
                    <CreateSectionDialog projectId={effectiveProjectId} />
                    <DeleteSectionConfirm projectId={effectiveProjectId} />
                </>
            )}
            <ConfirmDialog
                open={open === 'deleteTask'}
                onOpenChange={handleDeleteTaskOpenChange}
                title="Hapus tugas?"
                desc="Tindakan ini tidak bisa dibatalkan. Semua subtasks dan lampiran yang terkait dengan tugas ini juga akan dihapus."
                handleConfirm={handleDeleteTaskConfirm}
                confirmText="Hapus"
                destructive
            />

        </>
    );
}
