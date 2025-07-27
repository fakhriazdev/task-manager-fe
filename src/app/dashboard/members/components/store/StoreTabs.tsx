'use client';
import { DataTable } from '@/components/shared/dataTable';
import {useStoreAction} from "@/lib/store/useStoreAction";
import StoreDialogs from "@/app/dashboard/members/components/store/StoreDialogs";
import {storeColumns} from "@/app/dashboard/members/components/store/StoreColumns";
import TabSkeleton from "@/app/dashboard/members/TabSkeleton";

export default function StoreTabs() {
    const { data: storeData,isLoading } = useStoreAction();
    return (
        <>
            {isLoading ? (
                <TabSkeleton />
            ) : (
                <>
                    <DataTable columns={storeColumns} data={storeData ?? []} />
                    <StoreDialogs />
                </>
            )}
        </>

    );
}
