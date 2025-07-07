'use client'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PillIndicator } from "@/components/ui/shadcn-io/pill";
import {
    IconCopyPlusFilled,
    IconRosetteDiscount,
    IconTicket,
    IconUrgent, IconUsers
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
    const router = useRouter();
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
                        <Card className="@container/card cursor-pointer" onClick={()=>router.push("/dashboard/discount")}>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        <div className="flex items-center gap-2">
                                            <IconRosetteDiscount size={"16"}/>Total Actives
                                        </div>

                                    </CardTitle>
                                    <PillIndicator variant="warning" pulse />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>10</div>
                                    <p className='text-muted-foreground text-xs'>
                                        3 discounts expiring this week
                                    </p>
                                    <p className='text-muted-foreground text-xs'>
                                        Out of 100 total tickets
                                    </p>
                                </CardContent>
                        </Card>
                        <Card className="@container/card cursor-pointer" onClick={()=>router.push("/dashboard/ticket")}>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    <div className="flex items-center gap-2">
                                        <IconTicket size={"16"}/> Tickets
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
                        <Card className="@container/card cursor-pointer" onClick={()=>router.push("/dashboard/myreport")}>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    <div className="flex items-center gap-2">
                                        <IconUrgent size={"16"}/> My Report
                                    </div>

                                </CardTitle>
                                <PillIndicator variant="warning" pulse />
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold'>15</div>
                                <p className='text-muted-foreground text-xs'>
                                    Reports in the waiting list.
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    Out of 100 total tickets
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <CardTitle className='text-sm font-medium'>
                                    <div className="flex items-center gap-2">
                                        <IconUsers size={"16"}/> Members
                                    </div>

                                </CardTitle>
                                <Link href="/dashboard/members" className="text-xs rounded-full bg-primary text-primary-foreground dark:text-muted-foreground dark:bg-muted px-3 py-1 ">Manage</Link>
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
                        <Card className="@container/card cursor-pointer" onClick={()=>router.push("/dashboard/myreport/new-report")}>
                            <CardContent className="justify-center m-auto">
                                <div className="flex justify-center items-center mb-3"><IconCopyPlusFilled size={"48"} /></div>

                                <div className='text-2xl font-bold'>Quick Add Report</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
