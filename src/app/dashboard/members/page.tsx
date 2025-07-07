'use client';

import { JSX, useEffect, useState } from 'react';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';


import { useRolesAction } from '@/lib/roles/useRolesAction';
import { DataTable } from '@/components/shared/dataTable';
import {roleColumns} from "@/app/dashboard/members/components/role/RoleColumns";
import RoleDialogs from "@/app/dashboard/members/components/role/RoleDialogs";
import ButtonAdds from "@/app/dashboard/members/components/ButtonAdds";
import {useStoreAction} from "@/lib/store/useStoreAction";
import {storeColumns} from "@/app/dashboard/members/components/store/StoreColumns";
import StoreDialogs from "@/app/dashboard/members/components/store/StoreDialogs";
import {useUserAction} from "@/lib/user/useUserAction";
import {userColumns} from "@/app/dashboard/members/components/user/UserColumns";
import UserDialogs from "@/app/dashboard/members/components/user/userDialogs";
import {regionColumns} from "@/app/dashboard/members/components/region/RegionColumns";
import {useRegionAction} from "@/lib/region/useRegionAction";
import RegionDialogs from "@/app/dashboard/members/components/region/regionDialogs";


const TAB_KEYS = {
    USER: 'user',
    ROLES: 'roles',
    STORE: 'store',
    REGION:'region',
} as const;

type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS];

export default function MembersPage(): JSX.Element {
    const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.USER);
    const { data: rolesData, refetch: refetchRoles } = useRolesAction();
    const { data: storeData, refetch: refetchStore } = useStoreAction();
    const { data: userData, refetch: refetchUser } = useUserAction();
    const { data: regionData, refetch: refetchRegion } = useRegionAction();

    useEffect(() => {
        if (activeTab === TAB_KEYS.USER && !userData) {
            refetchUser();
        }
        if (activeTab === TAB_KEYS.ROLES && !rolesData) {
            refetchRoles();
        }
        if (activeTab === TAB_KEYS.STORE && !storeData) {
            refetchStore();
        }
        if (activeTab === TAB_KEYS.REGION && !regionData) {
            refetchRegion();
        }
    }, [activeTab]);


    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <Tabs
                        defaultValue={TAB_KEYS.USER}
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as TabKey)}
                        className="w-full flex-col justify-start gap-6"
                    >
                        <div className="flex items-center justify-between px-4 lg:px-6">
                            <Label htmlFor="view-selector" className="sr-only">
                                View
                            </Label>

                            {/* Mobile Select */}
                            <Select
                                value={activeTab}
                                onValueChange={(val) => setActiveTab(val as TabKey)}
                            >
                                <SelectTrigger
                                    id="view-selector"
                                    className="flex w-fit md:hidden"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TAB_KEYS.USER}>Users</SelectItem>
                                    <SelectItem value={TAB_KEYS.ROLES}>Roles</SelectItem>
                                    <SelectItem value={TAB_KEYS.STORE}>Store</SelectItem>
                                    <SelectItem value={TAB_KEYS.REGION}>Region</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Desktop Tabs */}
                            <TabsList className="hidden gap-2 md:flex">
                                <TabsTrigger value={TAB_KEYS.USER}>
                                    Users<Badge variant="secondary">{userData?.length ?? 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value={TAB_KEYS.ROLES}>
                                    Roles<Badge variant="secondary">{rolesData?.length ?? 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value={TAB_KEYS.STORE}>
                                    Store<Badge variant="secondary">{storeData?.length ?? 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value={TAB_KEYS.REGION}>
                                    Region<Badge variant="secondary">{regionData?.length ?? 0}</Badge>
                                </TabsTrigger>

                            </TabsList>

                            {/* Add New Button + Modal */}
                            <ButtonAdds type={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
                        </div>

                        {/* Tab Contents */}
                        <TabsContent value={TAB_KEYS.USER} className="relative flex flex-col gap-4">
                            <DataTable  columns={userColumns} data={userData ?? []}/>
                            <UserDialogs/>
                        </TabsContent>
                        <TabsContent value={TAB_KEYS.ROLES} className="flex flex-col">
                            <DataTable columns={roleColumns} data={rolesData ?? []}/>
                            <RoleDialogs/>
                        </TabsContent>
                        <TabsContent value={TAB_KEYS.STORE} className="flex flex-col">
                            <DataTable columns={storeColumns} data={storeData ?? []}/>
                            <StoreDialogs/>
                        </TabsContent>
                        <TabsContent value={TAB_KEYS.REGION} className="flex flex-col">
                            <DataTable columns={regionColumns} data={regionData ?? []}/>
                            <RegionDialogs/>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
