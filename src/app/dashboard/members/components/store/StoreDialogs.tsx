import {ConfirmDialog} from "@/components/shared/confirmDialog";
import {useDeleteStore} from "@/lib/store/useStoreAction";
import StoreActionDrawer from "@/app/dashboard/members/components/store/StoreActionDrawer";
import {useStoreStore} from "@/lib/stores/useStoreStore";
export default function StoreDialogs() {
    const { open, setOpen, currentRow,setCurrentRow } = useStoreStore()
    const {mutate:deleteRole} = useDeleteStore()
    console.log(currentRow,open)
    return (
        <>
            <StoreActionDrawer
                key='task-create'
                open={open === 'create'}
                onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
            />
            {currentRow && (<>
                    <StoreActionDrawer
                        key={`task-update-${currentRow.id}`}
                        open={open === 'update'}
                        onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}
                        currentRow={currentRow}
                    />
                    <ConfirmDialog
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
                            deleteRole({ id: currentRow.id })
                            setOpen(null)
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        className='max-w-md'
                        title={`Delete this Store: ${currentRow.id} ?`}
                        desc={
                            <>
                                You are about to delete a store with the ID{' '}
                                <strong>{currentRow.id}</strong>. <br />
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
