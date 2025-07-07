import {ConfirmDialog as RegionConfirmDialog} from "@/components/shared/confirmDialog";
import RegionActionDrawer from "@/app/dashboard/members/components/region/RegionActionDrawer";
import {useRegionStore} from "@/lib/stores/useRegionStore";
export default function RegionDialogs() {
    const { open, setOpen, currentRow,setCurrentRow } = useRegionStore()
    return (
        <>
            <RegionActionDrawer
                key='task-create'
                open={open === 'create'}
                onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
            />
            {currentRow && (<>
                    <RegionActionDrawer
                        key={`task-update-${currentRow.code}`}
                        open={open === 'update'}
                        onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}
                        currentRow={currentRow}
                    />
                    <RegionConfirmDialog
                        key='task-delete'
                        destructive
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        handleConfirm={() => {
                            setOpen(null)
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        className='max-w-md'
                        title={`Delete this Role: ${currentRow.code} ?`}
                        desc={
                            <>
                                You are about to delete a region with the Code{' '}
                                <strong>{currentRow.code}</strong>. <br />
                                This action cannot be undone.
                            </>
                        }
                        confirmText='Delete'
                    />
                </>

            )}
        </>
    )
}
