'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Member = {
    nama: string
    role: string
    nik: string
}

type OverviewData = {
    desc: string | null
    members: Member[]
    activities: string[] |null
}

type OverviewTabProps = {
    data: OverviewData
}

export default function OverviewTab({ data }: OverviewTabProps) {
    const { desc, members = [] } = data

    return (
        <div className="w-full mt-6 px-4 lg:px-6">
            <div className="bg-background w-full rounded-lg px-4 py-4">
                <Accordion type="multiple" className="w-full" defaultValue={['item-1', 'item-2']}>
                    {/* ===== Description ===== */}
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-xl font-medium no-underline hover:no-underline">
                            <h2 className="text-xl font-medium">Description Project</h2>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance px-2 lg:px-4">
                            {desc ? (
                                <p className="whitespace-pre-line leading-relaxed">{desc}</p>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    No description available for this project.
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* ===== Members ===== */}
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-xl font-medium no-underline hover:no-underline">
                            <h2 className="text-xl font-medium">Member</h2>
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 text-balance px-2 lg:px-4">
                            {members.length > 0 ? (
                                members.map((member, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Avatar className="size-8 sm:size-8 md:size-8 bg-white">

                                                <AvatarFallback>
                                                    {member.nama
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-1">
                                          <span className="font-semibold tracking-tight leading-none">
                                            {member.nama}
                                          </span>
                                            <span className="leading-none text-xs text-muted-foreground">
                                            {member.role}
                                          </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-muted-foreground italic">
                                    No members assigned yet.
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* ===== Activities / Resource ===== */}
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-xl font-medium no-underline hover:no-underline">
                            <h2 className="text-xl font-medium">Activities</h2>
                        </AccordionTrigger>
                        {/*<AccordionContent className="flex flex-col gap-3 text-balance px-2 lg:px-4">*/}
                        {/*    {activities.length > 0 ? (*/}
                        {/*        activities.map((a, i) => (*/}
                        {/*            <div key={i} className="border-l-2 border-muted pl-3 text-sm">*/}
                        {/*                {a}*/}
                        {/*            </div>*/}
                        {/*        ))*/}
                        {/*    ) : (*/}
                        {/*        <p className="text-muted-foreground italic">No recent activities.</p>*/}
                        {/*    )}*/}
                        {/*</AccordionContent>*/}
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
