'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import TaskDetailDrawer from '@/app/dashboard/projects/[id]/list/component/dialogs/TaskDetailDrawer';
import { useProjectStore } from '@/lib/stores/useProjectStore';
import DeleteSectionConfirm from './DeleteSectionConfirm';
import CreateTaskDialog from "@/app/dashboard/projects/[id]/list/component/dialogs/creatTaskDialog";
import CreateSectionDialog from "@/app/dashboard/projects/[id]/list/component/dialogs/createSectionDialog";

export default function ProjectDialogs({ projectId }: { projectId?: string }) {
    const params = useParams<{ id?: string }>();
    const effectiveProjectId = React.useMemo(
        () => (projectId ?? (params?.id as string)) || '',
        [projectId, params?.id]
    );

    const open = useProjectStore(s => s.open);
    const setOpen = useProjectStore(s => s.setOpen);
    const currentRowId = useProjectStore(s => s.currentRowId);
    const setCurrentRow = useProjectStore(s => s.setCurrentRow);

    const safeCloseDetail = React.useCallback(() => {
        setOpen(null);
        setCurrentRow(null);
    }, [setOpen, setCurrentRow]);

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
        </>
    );
}
