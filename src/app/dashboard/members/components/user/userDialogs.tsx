import {useUserStore} from "@/lib/stores/useUserStore";
import UserAddDrawer from "@/app/dashboard/members/components/user/UserAddDrawer";
import UserUpdateDrawer from "@/app/dashboard/members/components/user/UserUpdateDrawer";
import {ConfirmDialog} from "@/components/shared/confirmDialog";
import {useResetPasswordUser} from "@/lib/user/useUserAction";
export default function UserDialogs() {
    const { open, setOpen, currentRow,setCurrentRow } = useUserStore()
    const {mutate:resetPassword,isPending} = useResetPasswordUser()


    return (
        <>
            <UserAddDrawer
                key='task-create'
                open={open === 'create'}
                onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
            />
            {currentRow && (<>
                    <UserUpdateDrawer
                        key={`task-update-${currentRow.nik}`}
                        open={open === 'update'}
                        onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}
                        currentRow={currentRow}
                    />
                    <ConfirmDialog
                        key='task-reset'
                        destructive
                        open={open === 'reset'}
                        onOpenChange={() => {
                            setOpen('reset')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        handleConfirm={() => {
                            resetPassword({nik:currentRow?.nik})
                            isPending && setOpen(null)
                        }}
                        className='max-w-md'
                        title={`Reset Password for User: ${currentRow.nama} ?`}
                        desc={
                            <>
                                You are about to reset the password for the user with NIK{' '}
                                <strong>{currentRow.nik}</strong>. <br />
                                This action cannot be undone.
                            </>
                        }
                        confirmText='Reset'
                    />
                </>

            )}
        </>
    )
}
