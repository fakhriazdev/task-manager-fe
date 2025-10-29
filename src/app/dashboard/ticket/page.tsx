"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSummaryTicketByUser } from "@/lib/ticket/useTicketAction";
import TabSkeleton from "@/app/dashboard/members/TabSkeleton";
import TicketTable from "@/app/dashboard/ticket/components/TicketTable";
import { SummaryTicketByUser } from "@/lib/ticket/TicketTypes";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface UserInfo {
    nik: string;
    nama: string;
    roleId: string;
}

export default function Page() {
    const { data: summarys, isLoading } = useSummaryTicketByUser() as {
        data?: SummaryTicketByUser[];
        isLoading?: boolean;
    };

    const { user } = useAuthStore() as { user?: UserInfo };
    const items = summarys ?? [];
    const isSuper = user?.roleId === "SUPER";

    // Helper: tentukan tab awal yang valid berdasarkan role & data
    const computeFirstTab = React.useCallback((): string | undefined => {
        if (!items.length) return undefined;
        // if (isSuper) return "all";
        return user?.nik ?? undefined;
    }, [items.length, isSuper, user?.nik]);

    const [activeTab, setActiveTab] = React.useState<string | undefined>(undefined);

    // Re-init setiap kali data/role/user berubah
    React.useEffect(() => {
        const next = computeFirstTab();
        if (!activeTab && next) {
            setActiveTab(next);
            return;
        }
        // // Jika SUPER tapi bukan "all", kembalikan ke "all"
        // if (isSuper && activeTab !== "all" && items.length) {
        //     setActiveTab("all");
        // }
        // Jika Non-SUPER dan activeTab kosong tapi user punya nik
        if (!isSuper && !activeTab && user?.nik) {
            setActiveTab(user.nik);
        }
    }, [computeFirstTab, items.length, isSuper, user?.nik, activeTab]);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <TabSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
                            Belum ada data summary ticket.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const tabValue = activeTab ?? computeFirstTab() ?? (isSuper ? "all" : user?.nik) ?? items[0]?.nik;

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <Tabs
                        value={tabValue}
                        onValueChange={(val) => setActiveTab(val)}
                        className="w-full flex-col justify-start gap-6"
                    >
                        {/* Header Tabs */}
                        <div className="flex items-center justify-between px-4 lg:px-6">

                            <TabsList className="max-w-full overflow-x-auto scrollbar-none">
                                <div className="flex gap-2">
                                    {/* Tab All → hanya SUPER */}
                                    {isSuper && (
                                        <TabsTrigger key="all" value="all" className="whitespace-nowrap">
                                            All
                                        </TabsTrigger>
                                    )}

                                    {/* Tabs per user */}
                                    {items.map((it) => {
                                        const badgeVariant = it.uncompleted > 0 ? "destructive" : "secondary";
                                        return (
                                            <TabsTrigger key={it.nik} value={it.nik} className="whitespace-nowrap">
                                                {it.name}
                                                <Badge variant={badgeVariant} className="ml-2">
                                                    {it.uncompleted}
                                                </Badge>
                                            </TabsTrigger>
                                        );
                                    })}
                                </div>
                            </TabsList>
                        </div>

                        {/* Content Tab All → hanya SUPER */}
                        {isSuper && (
                            <TabsContent key="all" value="all" className="mt-4">
                                <TicketTable />
                            </TabsContent>
                        )}

                        {/* Content per Tab User */}
                        {items.map((it) => (
                            <TabsContent key={it.nik} value={it.nik} className="mt-4">
                                <TicketTable nik={it.nik} />
                            </TabsContent>
                        ))}

                        {/* Jika user login tidak ada di summary, tetap render tab kontennya */}
                        {user?.nik && !items.some((x) => x.nik === user.nik) && (
                            <TabsContent key={user.nik} value={user.nik} className="mt-4">
                                <TicketTable nik={user.nik} />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
