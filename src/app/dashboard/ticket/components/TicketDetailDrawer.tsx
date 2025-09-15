'use client'

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TicketList, EStatus } from '@/lib/ticket/TicketTypes'
import { formatDateTime } from '@/lib/utils'
import { Check, Clock, XCircle } from 'lucide-react'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import Image from "next/image";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: TicketList
}

export default function TicketDetailDrawer({
                                               open,
                                               onOpenChange,
                                               currentRow,
                                           }: Props) {
    if (!currentRow) return null

    const renderStatus = (status: EStatus) => {
        let label = ''
        let style = ''
        let icon = null

        switch (status) {
            case EStatus.COMPLETED:
                label = 'Completed'
                style = 'text-green-600 border-green-600 bg-green-50'
                icon = <Check className="h-4 w-4" />
                break
            case EStatus.ONPROCESS:
                label = 'On Process'
                style = 'text-yellow-600 border-yellow-600 bg-yellow-50'
                icon = <Clock className="h-4 w-4" />
                break
            case EStatus.QUEUED:
                label = 'Queued'
                style = 'text-blue-600 border-blue-600 bg-blue-50'
                icon = <Clock className="h-4 w-4" />
                break
            case EStatus.FAILED:
                label = 'Failed'
                style = 'text-red-600 border-red-600 bg-red-50'
                icon = <XCircle className="h-4 w-4" />
                break
            default:
                label = status
                style = 'text-gray-600 border-gray-600 bg-gray-50'
                icon = <Clock className="h-4 w-4" />
                break
        }

        return (
            <Badge
                variant="outline"
                className={`flex items-center gap-2 font-semibold text-xs ${style}`}
            >
                {icon}
                {label}
            </Badge>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col max-w-3xl">
                <SheetHeader className="text-left border-b pb-3">
                    <SheetTitle className="text-lg font-bold">
                        Ticket Detail - {currentRow.id}
                    </SheetTitle>
                    <SheetDescription asChild>
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Store:</span>{" "}
                                <b>{currentRow.idStore}</b>
                            </div>
                            <div className="flex justify-end">
                                {renderStatus(currentRow.status)}
                            </div>
                        </div>
                    </SheetDescription>
                </SheetHeader>

                {/* Detail Info */}
                <div className="flex flex-col gap-6 px-4 py-4 overflow-y-auto overflow-x-hidden">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 w-full max-w-full">
                        <InfoItem label="Category" value={currentRow.category} />
                        <InfoItem label="No. Telepon" value={currentRow.noTelp} />
                        <InfoItem label="Description" value={currentRow.description} full />
                        <InfoItem label="BillCode" value={currentRow.billCode} full />
                        <InfoItem
                            label="From Payment"
                            value={currentRow.fromPayment}
                        />
                        <InfoItem
                            label="To Payment"
                            value={currentRow.toPayment}
                        />
                        <InfoItem
                            label="Completed At"
                            value={
                                currentRow.completedAt
                                    ? formatDateTime(currentRow.completedAt)
                                    : '-'
                            }
                        />
                        <InfoItem label="Completed By" value={currentRow?.completedBy?.nama ?? "-"} />
                    </div>

                    {/* Images Carousel */}
                    {currentRow.images && currentRow.images.length > 0 && (
                        <div className="w-full max-w-full">
                            <h3 className="text-sm font-medium mb-2">Images</h3>
                            <Carousel orientation="horizontal" className="w-full max-w-lg mx-auto select-none">
                                <CarouselContent>
                                    {currentRow.images.map((img) => (
                                        <CarouselItem key={img.id} className="flex justify-center">
                                            <div className="w-full flex justify-center">
                                                <Image
                                                    src={img.url}
                                                    height={600}
                                                    width={600}
                                                    alt={`ticket-${img.id}`}
                                                    className="rounded-lg max-h-96 w-auto max-w-full object-contain border bg-white"
                                                    draggable={true}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <SheetFooter className="gap-2 mt-auto pt-4 border-t">
                    <SheetClose asChild>
                        <Button variant="outline" type="button">
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

/* 🔹 Komponen kecil biar rapih */
function InfoItem({
                      label,
                      value,
                      full = false,
                  }: {
    label: string
    value: string | null | undefined
    full?: boolean
}) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
                {label}
            </label>
            <p className="text-sm text-primary bg-muted/40 rounded px-3 py-2 border w-full max-w-full">
                {value || '-'}
            </p>
        </div>
    )
}
