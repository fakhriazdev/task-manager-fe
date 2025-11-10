'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/shared/confirmDialog';
import { useProjectStore } from '@/lib/stores/useProjectStore';
import { useDeleteSectionAction } from '@/lib/project/projectAction';

type Props = {
    projectId: string;
};

export default function DeleteSectionConfirm({ projectId }: Props) {
    const open = useProjectStore(s => s.open);
    const setOpen = useProjectStore(s => s.setOpen);
    const currentSection = useProjectStore(s => s.currentSection);
    const setCurrentSection = useProjectStore(s => s.setCurrentSection);

    const delMutation = useDeleteSectionAction(projectId);
    const qc = useQueryClient();

    const [deleteWithTasks, setDeleteWithTasks] = React.useState(false);
    const isOpen = open === 'deleteSection';

    return currentSection ? (
        <ConfirmDialog
            className="bg-card"
            destructive
            open={isOpen}
            onOpenChange={(isOpenNow) => {
                setOpen(isOpenNow ? 'deleteSection' : null);
                if (!isOpenNow) {
                    setCurrentSection(null);
                    setDeleteWithTasks(false);
                }
            }}
            title={`Delete section "${currentSection.name}"?`}
            desc={
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Choose whether tasks inside this section should also be deleted, or kept as unassigned.
                    </p>
                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="include-task">Also delete tasks</Label>
                            <p className="text-xs text-muted-foreground">
                                When enabled, all tasks in this section will be permanently deleted. When disabled,
                                tasks will be kept and become unassigned.
                            </p>
                        </div>
                        <Switch
                            id="include-task"
                            checked={deleteWithTasks}
                            onCheckedChange={setDeleteWithTasks}
                            disabled={delMutation.isPending}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 focus-visible:ring-emerald-500"
                        />
                    </div>
                </div>
            }
            confirmText={delMutation.isPending ? 'Deleting...' : 'Delete'}
            handleConfirm={() => {
                if (!projectId || !currentSection) return;
                delMutation.mutate(
                    { sectionId: currentSection.id, includeTask: deleteWithTasks },
                    {
                        onSettled: () => {
                            setOpen(null);
                            setCurrentSection(null);
                            setDeleteWithTasks(false);
                            qc.invalidateQueries({ queryKey: ['tasks', projectId] });
                        },
                    }
                );
            }}
        />
    ) : null;
}
