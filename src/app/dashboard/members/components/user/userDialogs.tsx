
import UserActionDrawer from "@/app/dashboard/members/components/user/UserActionDrawer";
import {useUserStore} from "@/lib/stores/useUserStore";
export default function UserDialogs() {
    const { open, setOpen, currentRow } = useUserStore()


    return (
        <>
            <UserActionDrawer
                key='task-create'
                open={open === 'create'}
                onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
            />
            {currentRow && (<>
                    <UserActionDrawer
                        key={`task-update-${currentRow.nik}`}
                        open={open === 'update'}
                        onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}
                        currentRow={currentRow}
                    />
                    {/*<ConfirmDialog*/}
                    {/*    key='task-delete'*/}
                    {/*    destructive*/}
                    {/*    open={open === 'delete'}*/}
                    {/*    onOpenChange={() => {*/}
                    {/*        setOpen('delete')*/}
                    {/*        setTimeout(() => {*/}
                    {/*            setCurrentRow(null)*/}
                    {/*        }, 500)*/}
                    {/*    }}*/}
                    {/*    handleConfirm={() => {*/}
                    {/*        //deleteRole({ id: currentRow.id })*/}
                    {/*        setOpen(null)*/}
                    {/*        setTimeout(() => {*/}
                    {/*            setCurrentRow(null)*/}
                    {/*        }, 500)*/}
                    {/*    }}*/}
                    {/*    className='max-w-md'*/}

                    {/*    desc={*/}
                    {/*        <>*/}
                    {/*            You are about to delete a store with the ID{' '}*/}
                    {/*           . <br />*/}
                    {/*            This action cannot be undone.*/}
                    {/*        </>*/}
                    {/*    }*/}
                    {/*    confirmText='Delete'*/}
                    {/*/>*/}
                </>

            )}
        </>
    )
}
