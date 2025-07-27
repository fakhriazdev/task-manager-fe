'use client';
import { DataTable } from '@/components/shared/dataTable';
import {useRegionAction} from "@/lib/region/useRegionAction";
import {regionColumns} from "@/app/dashboard/members/components/region/RegionColumns";
import RegionDialogs from "@/app/dashboard/members/components/region/regionDialogs";
import TabSkeleton from "@/app/dashboard/members/TabSkeleton";

export default function RegionTabs() {
    const { data: regionData,isLoading } = useRegionAction();
    return (
        <>
            {isLoading ? (
                <TabSkeleton />
            ) : (
                <>
                    <DataTable columns={regionColumns} data={regionData ?? []} />
                    <RegionDialogs />
                </>

            )
            }

        </>
    );
}
