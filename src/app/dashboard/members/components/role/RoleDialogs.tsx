import { useRolesStore } from "@/lib/stores/useRolesStore"
import RoleActionDrawer from "@/app/dashboard/members/components/role/RoleActionDrawer"
import {ConfirmDialog} from "@/components/shared/confirmDialog";
import {useDeleteRole} from "@/lib/roles/useRolesAction";
export default function RoleDialogs() {
    const { open, setOpen, currentRow,setCurrentRow } = useRolesStore()
    const {mutate:deleteRole} = useDeleteRole()

    return (
        <>
            <RoleActionDrawer
                key='task-create'
                open={open === 'create'}
                onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
            />
            {currentRow && (<>
                <RoleActionDrawer
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
            title={`Delete this Role: ${currentRow.id} ?`}
            desc={
                <>
                    You are about to delete a role with the ID{' '}
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
