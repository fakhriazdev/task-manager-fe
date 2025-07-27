// app/dashboard/members/tabs/UserTab.tsx
'use client';
import { DataTable } from '@/components/shared/dataTable';
import { userColumns } from './UserColumns';
import UserDialogs from './userDialogs';
import { useUserAction } from '@/lib/user/useUserAction';

export default function UserTabs() {
    const { data: userData} = useUserAction();
    return (
        <>
            <DataTable columns={userColumns} data={userData ?? []} />
            <UserDialogs />
        </>
    );
}
