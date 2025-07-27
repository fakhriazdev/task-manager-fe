'use client';
import { DataTable } from '@/components/shared/dataTable';
import { userColumns } from './UserColumns';
import UserDialogs from './userDialogs';
import { useUserAction } from '@/lib/user/useUserAction';
import TabSkeleton from "@/app/dashboard/members/TabSkeleton";

export default function UserTabs() {
    const { data: userData,isLoading} = useUserAction();
    return (
        <>
            {isLoading ? (
                <TabSkeleton />
            ) : (
                <>
                    <DataTable columns={userColumns} data={userData ?? []} />
                    <UserDialogs />
                </>
            )}

        </>
    );
}
