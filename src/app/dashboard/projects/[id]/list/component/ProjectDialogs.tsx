import { useProjectStore } from "@/lib/stores/useProjectStore";
import TaskDetailDrawer from "@/app/dashboard/projects/[id]/list/component/TaskDetailDrawer";

interface ProjectDialogsProps {
    projectId?: string
}

export default function ProjectDialogs({ projectId }: ProjectDialogsProps) {
    const open = useProjectStore((s) => s.open);
    const currentRowId = useProjectStore((s) => s.currentRowId);
    const setOpen = useProjectStore((s) => s.setOpen);
    const setCurrentRow = useProjectStore((s) => s.setCurrentRow);

    return (
        <>
            <TaskDetailDrawer
                open={open === "detail"}
                projectId={projectId}
                taskId={currentRowId}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setOpen(null);
                        setCurrentRow(null);
                    } else {
                        setOpen("detail");
                    }
                }}
            />
        </>
    );
}