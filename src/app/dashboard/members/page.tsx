'use client';

import { JSX, useState, lazy, Suspense } from 'react';
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import ButtonAdds from '@/app/dashboard/members/components/ButtonAdds';
import TabSkeleton from './TabSkeleton';

import { useUserAction } from '@/lib/user/useUserAction';
import { useStoreAction } from '@/lib/store/useStoreAction';
import { useRegionAction } from '@/lib/region/useRegionAction';

// Lazy load tab content
const UserTabs = lazy(() => import('./components/user/UserTabs'));
const StoreTabs = lazy(() => import('./components/store/StoreTabs'));
const RegionTabs = lazy(() => import('./components/region/RegionTabs'));

const TAB_KEYS = {
    USER: 'user',
    STORE: 'store',
    REGION: 'region',
} as const;

type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS];

export default function MembersClient(): JSX.Element {
    const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.USER);

    // Only needed for badge counts
    const { data: userData } = useUserAction();
    const { data: storeData } = useStoreAction();
    const { data: regionData } = useRegionAction();

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
                            <Label htmlFor="view-selector" className="sr-only">View</Label>

                            {/* Mobile Select */}
                            <Select value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)}>
                                <SelectTrigger id="view-selector" className="flex w-fit md:hidden">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TAB_KEYS.USER}>Users</SelectItem>
                                    <SelectItem value={TAB_KEYS.STORE}>Store</SelectItem>
                                    <SelectItem value={TAB_KEYS.REGION}>Region</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Desktop Tabs */}
                            <TabsList className="hidden gap-2 md:flex">
                                <TabsTrigger value={TAB_KEYS.USER}>
                                    Users<Badge variant="secondary">{userData?.length ?? 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value={TAB_KEYS.STORE}>
                                    Store<Badge variant="secondary">{storeData?.length ?? 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value={TAB_KEYS.REGION}>
                                    Region<Badge variant="secondary">{regionData?.length ?? 0}</Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* Add New Button */}
                            <ButtonAdds type={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
                        </div>

                        {/* Lazy Loaded TabsContent */}
                        <TabsContent value={TAB_KEYS.USER}>
                            <Suspense fallback={<TabSkeleton/>}>
                                <UserTabs />
                            </Suspense>
                        </TabsContent>
                        <TabsContent value={TAB_KEYS.STORE}>
                            <Suspense fallback={<TabSkeleton/>}>
                                <StoreTabs />
                            </Suspense>
                        </TabsContent>
                        <TabsContent value={TAB_KEYS.REGION}>
                            <Suspense fallback={<TabSkeleton/>}>
                                <RegionTabs />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
