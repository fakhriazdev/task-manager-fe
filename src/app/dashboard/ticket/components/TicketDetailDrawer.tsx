'use client'

import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { TicketList, EStatus, getPaymentLabel } from '@/lib/ticket/TicketTypes'
import { formatDateTime } from '@/lib/utils'

import {
    Check,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    X,
    ZoomIn,
    ZoomOut,
    RefreshCw,
} from 'lucide-react'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

/** Utils & constants for zoom **/
const MIN_SCALE = 1
const MAX_SCALE = 5
const STEP = 0.2
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: TicketList | null
}

export default function TicketDetailDrawer({ open, onOpenChange, currentRow }: Props) {
    // state
    const images = currentRow?.images ?? []
    const hasImages = images.length > 0

    const [lbOpen, setLbOpen] = useState(false)
    const [lbIndex, setLbIndex] = useState(0)

    const openAt = (i: number) => {
        if (!hasImages) return
        setLbIndex(Math.max(0, Math.min(i, images.length - 1)))
        setLbOpen(true)
    }

    const prev = useCallback(() => {
        if (!hasImages) return
        setLbIndex((i) => (i - 1 + images.length) % images.length)
    }, [images.length, hasImages])

    const next = useCallback(() => {
        if (!hasImages) return
        setLbIndex((i) => (i + 1) % images.length)
    }, [images.length, hasImages])

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

    // Zoom & Pan state (shared to viewport)
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

    // reset ketika lightbox dibuka / gambar diganti
    useEffect(() => {
        setZoom(1)
        setOffset({ x: 0, y: 0 })
    }, [lbOpen, lbIndex])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col max-w-3xl">
                <SheetHeader className="text-left border-b pb-3">
                    <SheetTitle className="text-lg font-bold">Ticket Detail{currentRow ? ` - ${currentRow.id}` : ''}</SheetTitle>
                    <SheetDescription asChild>
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Store:</span> <b>{currentRow?.idStore ?? '-'}</b>
                            </div>
                            <div className="flex justify-end">{currentRow ? renderStatus(currentRow.status) : null}</div>
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
                                {currentRow?.category === 'Transaksi' && (
                                    <>
                                        <InfoItem label="BillCode" value={currentRow.billCode} full />
                                        <InfoItem label="Pembayaran Saat ini" value={getPaymentLabel(currentRow.fromPayment)} />
                                        <InfoItem label="Seharusnya ke" value={getPaymentLabel(currentRow.toPayment)} />
                                        <InfoItem
                                            label="DirectSelling?"
                                            value={
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        currentRow.isDirectSelling
                                                            ? "border-green-500 text-green-600 bg-green-50"
                                                            : "border-red-500 text-red-600 bg-red-50"
                                                    }
                                                >
                                                    {currentRow.isDirectSelling ? "Ya" : "Tidak"}
                                                </Badge>
                                            }
                                            full
                                        />
                                    </>
                                )}
                                <InfoItem label="Completed At" value={currentRow.completedAt ? formatDateTime(currentRow.completedAt) : '-'} />
                                <InfoItem label="Completed By" value={currentRow?.completedBy?.nama ?? '-'} />
                                <InfoItem label="ID Team Viewer" value={currentRow.idtv} full />
                            </div>

                            {/* Images Carousel */}
                            {hasImages && (
                                <div className="w-full max-w-full">
                                    <h3 className="text-sm font-medium mb-2">Images</h3>
                                    <Carousel orientation="horizontal" className="w-full max-w-lg mx-auto select-none">
                                        <CarouselContent>
                                            {images.map((img, i) => (
                                                <CarouselItem key={img.id ?? i} className="flex justify-center">
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
                                                            alt={`ticket-${img.id ?? i}`}
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

            {/* Lightbox Dialog */}
            {hasImages && (
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
                            <div className="flex items-center gap-1">
                                {/* Zoom controls */}
                                <Button size="icon" variant="ghost" title="Zoom out (−)" onClick={() => setZoom((z) => clamp(z - STEP, MIN_SCALE, MAX_SCALE))}>
                                    <ZoomOut className="h-5 w-5" />
                                </Button>
                                <div className="px-2 text-xs tabular-nums min-w-12 text-center">{(zoom * 100).toFixed(0)}%</div>
                                <Button size="icon" variant="ghost" title="Zoom in (+)" onClick={() => setZoom((z) => clamp(z + STEP, MIN_SCALE, MAX_SCALE))}>
                                    <ZoomIn className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    title="Reset (fit)"
                                    onClick={() => {
                                        setZoom(1)
                                        setOffset({ x: 0, y: 0 })
                                    }}
                                >
                                    <RefreshCw className="h-5 w-5" />
                                </Button>

                                <Link href={images[lbIndex]?.url || '#'} download target="_blank" rel="noreferrer">
                                    <Button size="icon" variant="ghost" title="Download">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button size="icon" variant="ghost" onClick={() => setLbOpen(false)} title="Close">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Body */}
                        <LightboxViewport
                            src={images[lbIndex]?.url ?? ''}
                            alt={`ticket-${images[lbIndex]?.id ?? lbIndex}`}
                            onPrev={prev}
                            onNext={next}
                            zoom={zoom}
                            setZoom={setZoom}
                            offset={offset}
                            setOffset={setOffset}
                        />

                        {/* Hint */}
                        <div className="px-4 pb-3 text-center text-xs text-muted-foreground">
                            Gunakan ← → untuk navigasi, Scroll/Pinch untuk zoom, drag/dua-jari untuk geser, double-click untuk toggle zoom, Esc untuk menutup.
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Sheet>
    )
}

// ---------------- LightboxViewport ----------------

type LightboxViewportProps = {
    src: string
    alt: string
    onPrev: () => void
    onNext: () => void
    zoom: number
    setZoom: React.Dispatch<React.SetStateAction<number>>
    offset: { x: number; y: number }
    setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
}

function LightboxViewport({ src, alt, onPrev, onNext, zoom, setZoom, offset, setOffset }: LightboxViewportProps) {
    const frameRef = React.useRef<HTMLDivElement | null>(null)

    // Keyboard (opsional zoom/reset via Ctrl/Cmd)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') onPrev()
            if (e.key === 'ArrowRight') onNext()
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                e.preventDefault()
                setZoom((z) => clamp(z + STEP, MIN_SCALE, MAX_SCALE))
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault()
                setZoom((z) => clamp(z - STEP, MIN_SCALE, MAX_SCALE))
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault()
                setZoom(1)
                setOffset({ x: 0, y: 0 })
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onPrev, onNext, setZoom, setOffset])

    // WHEEL: trackpad & mouse (pinch=ctrlKey, pan dua-jari saat zoomed-in, mouse wheel zoom stepwise)
    const onWheel = (e: React.WheelEvent) => {
        if (!frameRef.current) return
        e.preventDefault()

        const rect = frameRef.current.getBoundingClientRect()
        const cx = e.clientX - rect.left - rect.width / 2 - offset.x
        const cy = e.clientY - rect.top - rect.height / 2 - offset.y

        if (e.ctrlKey) {
            const factor = Math.exp(-e.deltaY * 0.002)
            const target = clamp(zoom * factor, MIN_SCALE, MAX_SCALE)
            const scale = target / zoom
            const nx = offset.x - cx * (scale - 1)
            const ny = offset.y - cy * (scale - 1)
            setZoom(target)
            setOffset({ x: nx, y: ny })
            return
        }

        if (zoom > 1 && (Math.abs(e.deltaX) + Math.abs(e.deltaY) > 0)) {
            setOffset((o) => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
            return
        }

        const dir = e.deltaY > 0 ? -1 : 1
        const target = clamp(zoom + dir * STEP, MIN_SCALE, MAX_SCALE)
        const scale = target / zoom
        const nx = offset.x - cx * (scale - 1)
        const ny = offset.y - cy * (scale - 1)
        setZoom(target)
        setOffset({ x: nx, y: ny })
    }

    // Pointer-based pan & pinch (touch)
    const pointers = React.useRef<Map<number, { x: number; y: number }>>(new Map())
    const pinchStart = React.useRef<{ dist: number; zoom: number; center: { x: number; y: number }; offset: { x: number; y: number } } | null>(
        null,
    )
    const dragging = React.useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 })

    const onPointerDown = (e: React.PointerEvent) => {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

        if (pointers.current.size === 2) {
            const [p1, p2] = [...pointers.current.values()]
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
            const centerScreen = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
            const rect = frameRef.current!.getBoundingClientRect()
            const cx = centerScreen.x - rect.left - rect.width / 2 - offset.x
            const cy = centerScreen.y - rect.top - rect.height / 2 - offset.y
            pinchStart.current = { dist, zoom, center: { x: cx, y: cy }, offset: { ...offset } }
        } else if (zoom > 1) {
            dragging.current = { active: true, x: e.clientX, y: e.clientY }
        }

        ;(e.target as Element).setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (pointers.current.has(e.pointerId)) {
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        }

        if (pinchStart.current && pointers.current.size >= 2) {
            const vals = [...pointers.current.values()]
            const p1 = vals[0], p2 = vals[1]
            const newDist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
            if (newDist <= 0) return
            const factor = newDist / pinchStart.current.dist
            const target = clamp(pinchStart.current.zoom * factor, MIN_SCALE, MAX_SCALE)
            const scale = target / pinchStart.current.zoom
            const nx = pinchStart.current.offset.x - pinchStart.current.center.x * (scale - 1)
            const ny = pinchStart.current.offset.y - pinchStart.current.center.y * (scale - 1)
            setZoom(target)
            setOffset({ x: nx, y: ny })
            return
        }

        if (dragging.current.active) {
            const dx = e.clientX - dragging.current.x
            const dy = e.clientY - dragging.current.y
            dragging.current.x = e.clientX
            dragging.current.y = e.clientY
            setOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
        }
    }

    const onPointerUpOrCancel = (e: React.PointerEvent) => {
        pointers.current.delete(e.pointerId)
        if (pointers.current.size < 2) pinchStart.current = null
        dragging.current.active = false
    }

    const onDoubleClick = (e: React.MouseEvent) => {
        if (!frameRef.current) return
        const rect = frameRef.current.getBoundingClientRect()
        const cx = e.clientX - rect.left - rect.width / 2 - offset.x
        const cy = e.clientY - rect.top - rect.height / 2 - offset.y
        const target = zoom > 1 ? 1 : 2
        const scale = target / zoom
        const nx = offset.x - cx * (scale - 1)
        const ny = offset.y - cy * (scale - 1)
        setZoom(target)
        setOffset(target === 1 ? { x: 0, y: 0 } : { x: nx, y: ny })
    }

    return (
        <div className="relative">
            {/* Nav buttons */}
            <button
                type="button"
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/90 p-2 hover:bg-background"
                aria-label="Previous"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                type="button"
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-background/90 p-2 hover:bg-background"
                aria-label="Next"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Frame */}
            <div
                ref={frameRef}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUpOrCancel}
                onPointerCancel={onPointerUpOrCancel}
                onDoubleClick={onDoubleClick}
                className="mx-auto w-[min(92vw,64rem)] h-[min(78vh,calc(100vh-12rem))] flex items-center justify-center select-none relative overflow-hidden"
                style={{ touchAction: zoom > 1 ? 'none' : 'pan-y' }}
            >
                <div
                    className="relative"
                    style={{
                        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                        transition: 'transform 100ms ease-out',
                        willChange: 'transform',
                        cursor: zoom > 1 ? 'grab' : 'auto',
                    }}
                >
                    <div className="relative">
                        <Image
                            src={src}
                            alt={alt}
                            width={1600}
                            height={1200}
                            className="max-w-[min(92vw,64rem)] max-h-[min(78vh,calc(100vh-12rem))] object-contain pointer-events-none select-none"
                            draggable={false}
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ---------- Small pieces ---------- */
function InfoItem({
                      label,
                      value,
                      full = false,
                  }: {
    label: string
    value: React.ReactNode
    full?: boolean
}) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
            <div className="text-sm text-primary bg-muted/40 rounded px-3 py-2 border w-full max-w-full">
                {value ?? '-'}
            </div>
        </div>
    )
}

function renderStatus(status: EStatus) {
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
        case EStatus.PENDING:
            label = 'Pending'
            style = 'text-yellow-600 border-yellow-600 bg-yellow-50'
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
        <Badge variant="outline" className={`flex items-center gap-2 font-semibold text-xs ${style}`}>
            {icon}
            {label}
        </Badge>
    )
}