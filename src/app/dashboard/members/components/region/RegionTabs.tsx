// app/dashboard/members/tabs/UserTab.tsx
'use client';
import { DataTable } from '@/components/shared/dataTable';
import {useRegionAction} from "@/lib/region/useRegionAction";
import {regionColumns} from "@/app/dashboard/members/components/region/RegionColumns";
import RegionDialogs from "@/app/dashboard/members/components/region/regionDialogs";

export default function RegionTabs() {
    const { data: regionData } = useRegionAction();
    return (
        <>
            <DataTable columns={regionColumns} data={regionData ?? []} />
            <RegionDialogs />
        </>
    );
}
