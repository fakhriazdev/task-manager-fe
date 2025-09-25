'use client'

import { useCallback, useEffect, useState } from 'react'
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
import {TicketList, EStatus, getPaymentLabel} from '@/lib/ticket/TicketTypes'
import { formatDateTime } from '@/lib/utils'
import {
    Check,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    X,
} from 'lucide-react'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import Image from 'next/image'
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog'
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import Link from "next/link";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: TicketList | null
}

export default function TicketDetailDrawer({
                                               open,
                                               onOpenChange,
                                               currentRow,
                                           }: Props) {
    // ✅ Hooks selalu dipanggil (tidak ada early return)
    const images = currentRow?.images ?? []
    const [lbOpen, setLbOpen] = useState(false)
    const [lbIndex, setLbIndex] = useState(0)

    const openAt = (i: number) => {
        if (!images.length) return
        setLbIndex(Math.max(0, Math.min(i, images.length - 1)))
        setLbOpen(true)
    }

    const prev = useCallback(() => {
        if (!images.length) return
        setLbIndex((i) => (i - 1 + images.length) % images.length)
    }, [images.length])

    const next = useCallback(() => {
        if (!images.length) return
        setLbIndex((i) => (i + 1) % images.length)
    }, [images.length])

    useEffect(() => {
        if (!lbOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
            if (e.key === 'Escape') setLbOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lbOpen, prev, next])

    const renderStatus = (status: EStatus) => {
        let label = ''
        let style = ''
        let icon: React.ReactNode = null

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
                label = status as unknown as string
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
                        Ticket Detail{currentRow ? ` - ${currentRow.id}` : ''}
                    </SheetTitle>
                    <SheetDescription asChild>
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Store:</span>{' '}
                                <b>{currentRow?.idStore ?? '-'}</b>
                            </div>
                            <div className="flex justify-end">
                                {currentRow ? renderStatus(currentRow.status) : null}
                            </div>
                        </div>
                    </SheetDescription>
                </SheetHeader>

                {/* Detail Info */}
                <div className="flex flex-col gap-6 px-4 py-4 overflow-y-auto overflow-x-hidden">
                    {currentRow ? (
                        <>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 w-full max-w-full">
                                <InfoItem label="Category" value={currentRow.category} />
                                <InfoItem label="No. Telepon" value={currentRow.noTelp} />
                                <InfoItem label="Description" value={currentRow.description} full />
                                <InfoItem label="BillCode" value={currentRow.billCode} full />
                                <InfoItem label="Pembayaran Saat ini" value={getPaymentLabel(currentRow.fromPayment)} />
                                <InfoItem label="Seharusnya ke" value={getPaymentLabel(currentRow.toPayment)} />
                                <InfoItem
                                    label="Completed At"
                                    value={
                                        currentRow.completedAt
                                            ? formatDateTime(currentRow.completedAt)
                                            : '-'
                                    }
                                />
                                <InfoItem
                                    label="Completed By"
                                    value={currentRow?.completedBy?.nama ?? '-'}
                                />
                            </div>

                            {/* Images Carousel */}
                            {images.length > 0 && (
                                <div className="w-full max-w-full">
                                    <h3 className="text-sm font-medium mb-2">Images</h3>
                                    <Carousel
                                        orientation="horizontal"
                                        className="w-full max-w-lg mx-auto select-none"
                                    >
                                        <CarouselContent>
                                            {images.map((img, i) => (
                                                <CarouselItem key={img.id} className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openAt(i)}
                                                        className="w-full flex justify-center focus:outline-none"
                                                        aria-label={`Open image ${i + 1}`}
                                                    >
                                                        <Image
                                                            src={img.url}
                                                            height={600}
                                                            width={600}
                                                            alt={`ticket-${img.id}`}
                                                            className="rounded-lg max-h-96 w-auto max-w-full object-contain border bg-white"
                                                            draggable
                                                        />
                                                    </button>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground">No data</div>
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

            {/* 🔎 Lightbox Dialog */}
            {images.length > 0 && (
                <Dialog open={lbOpen} onOpenChange={setLbOpen}>
                    <DialogContent className="p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-[95vw] sm:max-w-[92vw] md:max-w-5xl overflow-hidden">

                        <VisuallyHidden>
                            <DialogTitle>Image Preview</DialogTitle>
                        </VisuallyHidden>

                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 p-2 border-b">
                            <div className="text-sm text-muted-foreground">
                                {lbIndex + 1} / {images.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={images[lbIndex]?.url} download target="_blank" rel="noreferrer">
                                    <Button size="icon" variant="ghost" title="Download">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button size="icon" variant="ghost" onClick={() => setLbOpen(false)} title="Close">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Body with constrained frame */}
                        <div className="relative">
                            {/* Nav buttons */}
                            <button
                                type="button"
                                onClick={prev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/90 p-2 hover:bg-background"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={next}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/90 p-2 hover:bg-background"
                                aria-label="Next"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>

                            {/* 👇 Frame pembatas gambar */}
                            <div
                                className="mx-auto w-[min(92vw,64rem)]     /* lebar <= 92vw atau 1024px */
                                           h-[min(78vh,calc(100vh-12rem))] /* tinggi aman, menyisakan header/footer */
                                           flex items-center justify-center">
                                {/* Pilih salah satu: <img> sederhana ATAU Next <Image fill> */}

                                {/* Opsi 1: img biasa */}
                                <Image
                                    src={images[lbIndex]?.url}
                                    alt={`ticket-${images[lbIndex]?.id}`}
                                    fill
                                    className="max-w-full max-h-full object-contain select-none"
                                    draggable
                                />
                                {false}
                            </div>
                        </div>
                        {/* Hint */}
                        <div className="px-4 pb-3 text-center text-xs text-muted-foreground">
                            Gunakan tombol ← → pada keyboard untuk navigasi, Esc untuk menutup.
                        </div>
                    </DialogContent>
                </Dialog>

            )}
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
