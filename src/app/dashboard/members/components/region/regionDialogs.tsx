import {ConfirmDialog as RegionConfirmDialog} from "@/components/shared/confirmDialog";
import RegionActionDrawer from "@/app/dashboard/members/components/region/RegionActionDrawer";
import {useRegionStore} from "@/lib/stores/useRegionStore";
import {useDeleteRegion} from "@/lib/region/useRegionAction";
export default function RegionDialogs() {
    const { open, setOpen, currentRow,setCurrentRow } = useRegionStore()
    const deleteRegion = useDeleteRegion();
    return (
        <>
            <RegionActionDrawer
                key='task-create'
                open={open === 'create'}
                onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
            />
            {currentRow && (<>
                    <RegionActionDrawer
                        key={`task-update-${currentRow.id}`}
                        open={open === 'update'}
                        onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}
                        currentRow={currentRow}
                    />
                    <RegionConfirmDialog
                        key="task-delete"
                        destructive
                        open={open === "delete"}
                        onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setOpen(null);
                                setTimeout(() => {
                                    setCurrentRow(null);
                                }, 300);
                            } else {
                                setOpen("delete");
                            }
                        }}
                        handleConfirm={() => {
                            if (currentRow) {
                                deleteRegion.mutate({ id: currentRow.id });
                            }
                            setOpen(null);
                            setTimeout(() => {
                                setCurrentRow(null);
                            }, 300);
                        }}
                        className="max-w-md"
                        title={`Delete this Region: ${currentRow.id}?`}
                        desc={
                            <>
                                You are about to delete a region with the Code{" "}
                                <strong>{currentRow.id}</strong>. <br />
                                This action cannot be undone.
                            </>
                        }
                        confirmText="Delete"
                    />
                </>

            )}
        </>
    )
}
