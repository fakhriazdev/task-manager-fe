'use client'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PillIndicator } from "@/components/ui/shadcn-io/pill";
import {
    IconTicket,
    IconUsers
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
    const router = useRouter();
    const roleId = useAuthStore((s) => s.user?.roleId);

    // 🔹 Aturan visibilitas card
    const canSeeCard = (cardId: "ticket" | "members") => {
        switch (roleId) {
            case "STAFF":
                // STAFF: hide ticket & members
                return false;
            case "ADMIN":
                // ADMIN: hide members saja
                return cardId !== "members";
            default:
                return true;
        }
    };

    return (
        <div className="flex flex-1 flex-col w-5xl mx-auto my-5">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="grid grid-cols-2 gap-4 lg:px-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
                    {/* 🔹 Card Ticket – hide untuk STAFF */}
                        <Card  className="@container/card col-span-2">
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='font-medium'>
                                    <div className="flex items-center gap-2">
                                        <IconTicket size={"26"} />
                                        {/*<h1 className="text-xl letter tracking-wide">Muhamad Fakhri Aziz</h1>*/}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                    <Tabs defaultValue="task">
                                        <TabsList>
                                            <TabsTrigger value="task" className="cursor-pointer">Tasks</TabsTrigger>
                                            {canSeeCard("ticket") && <TabsTrigger value="ticket" className="cursor-pointer">Tickets</TabsTrigger>}

                                        </TabsList>
                                        <TabsContent value="task">
                                            <p>a</p>
                                        </TabsContent>
                                        {canSeeCard("ticket") &&    <TabsContent value="ticket">
                                            <p>p</p>
                                        </TabsContent>}

                                    </Tabs>
                            </CardContent>
                        </Card>
                    <Card  className="@container/card">
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='font-medium'>
                                <div className="flex items-center gap-2">
                                    <IconTicket size={"24"} /> Projects
                                </div>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    {canSeeCard("ticket") && (
                        <Card className="@container/card cursor-pointer"
                              onClick={() => router.push("/dashboard/ticket")}>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='font-medium'>
                                    <div className="flex items-center gap-2">
                                        <IconTicket size={"24"} /> Tickets
                                    </div>
                                </CardTitle>
                                <PillIndicator variant="warning" pulse />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>5 High-priority</div>
                                <p className='text-muted-foreground text-xs'>
                                    Among 15 remaining tickets
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    Out of 100 total tickets
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* 🔹 Card Members – hide untuk ADMIN & STAFF */}
                    {canSeeCard("members") && (
                        <Card className="@container/card">
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    <div className="flex items-center gap-2">
                                        <IconUsers size={"16"} /> Members
                                    </div>
                                </CardTitle>
                                <Link
                                    href="/dashboard/members"
                                    className="text-xs rounded-full bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted px-3 py-1 "
                                >
                                    Manage
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className='w-full rounded-full flex justify-between bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted text-sm mb-2'>
                                    <p className="my-1 mx-3"> Total Members</p>
                                    <p className="my-1 mx-3">1</p>
                                </div>
                                <div className='w-full rounded-full flex justify-between bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted text-sm mb-2'>
                                    <p className="my-1 mx-3"> Total Roles</p>
                                    <p className="my-1 mx-3">5</p>
                                </div>
                                <div className='w-full rounded-full flex justify-between bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted text-sm'>
                                    <p className="my-1 mx-3"> Total Stores</p>
                                    <p className="my-1 mx-3">5</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    );
}
