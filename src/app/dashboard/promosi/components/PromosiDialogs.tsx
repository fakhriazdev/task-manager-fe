'use client'
import {usePromosiStore} from "@/lib/stores/usePromosiStore";
import PromosiImportModal from "@/app/dashboard/promosi/components/PromosiImportModal";
export default function PromosiDialogs() {
    const { open, setOpen } = usePromosiStore()
    return (
        <>

            <PromosiImportModal
                key='tasks-import'
                open={open === 'import'}
                onOpenChange={(val) => setOpen(val ? 'import' : null)}
            />
            {/*{currentRow && (<>*/}
            {/*        <RegionActionDrawer*/}
            {/*            key={`task-update-${currentRow.code}`}*/}
            {/*            open={open === 'update'}*/}
            {/*            onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}*/}
            {/*            currentRow={currentRow}*/}
            {/*        />*/}
            {/*        <RegionConfirmDialog*/}
            {/*            key='task-delete'*/}
            {/*            destructive*/}
            {/*            open={open === 'delete'}*/}
            {/*            onOpenChange={() => {*/}
            {/*                setOpen('delete')*/}
            {/*                setTimeout(() => {*/}
            {/*                    setCurrentRow(null)*/}
            {/*                }, 500)*/}
            {/*            }}*/}
            {/*            handleConfirm={() => {*/}
            {/*                setOpen(null)*/}
            {/*                setTimeout(() => {*/}
            {/*                    setCurrentRow(null)*/}
            {/*                }, 500)*/}
            {/*            }}*/}
            {/*            className='max-w-md'*/}
            {/*            title={`Delete this Role: ${currentRow.code} ?`}*/}
            {/*            desc={*/}
            {/*                <>*/}
            {/*                    You are about to delete a region with the Code{' '}*/}
            {/*                    <strong>{currentRow.code}</strong>. <br />*/}
            {/*                    This action cannot be undone.*/}
            {/*                </>*/}
            {/*            }*/}
            {/*            confirmText='Delete'*/}
            {/*        />*/}
            {/*    </>*/}

            {/*)}*/}
        </>
    )
}
