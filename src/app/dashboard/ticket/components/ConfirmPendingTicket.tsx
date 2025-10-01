'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTicketStore } from '@/lib/stores/useTicketStore'
import { usePendingTicket } from '@/lib/ticket/useTicketAction'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/confirmDialog'

type Props = {
    open: boolean
    onOpenChange: (isOpen: boolean) => void
}

export default function ConfirmPendingTicket({ open, onOpenChange }: Props) {
    const { currentRow, setOpen, setCurrentRow } = useTicketStore()
    const pendingMutation = usePendingTicket()
    const [showConfirm, setShowConfirm] = useState(false)

    const formik = useFormik({
        initialValues: { reason: '' },
        validationSchema: Yup.object({
            reason: Yup.string()
                .trim()
                .required('Reason wajib diisi')
                .min(10, 'Minimal 10 karakter')
                .max(200, 'Maksimal 200 karakter'),
        }),
        onSubmit: () => {
            // Submit form tidak langsung mutate.
            // Kita buka ConfirmDialog dulu.
            setShowConfirm(true)
        },
    })

    const {
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        isValid,
        resetForm,
    } = formik

    // Reset form ketika modal utama ditutup
    useEffect(() => {
        if (!open) {
            resetForm()
            setShowConfirm(false)
        }
    }, [open, resetForm])

    // Close helper
    const closeAll = () => {
        setShowConfirm(false)
        onOpenChange(false)
        setTimeout(() => setCurrentRow(null), 300)
    }

    return (
        <>
            {/* 1) MODAL FORM */}
            <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                    onOpenChange(isOpen)
                    if (!isOpen) {
                        setTimeout(() => setCurrentRow(null), 500)
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pending this ticket: {currentRow?.id}?</DialogTitle>
                        <DialogDescription>
                            Isi alasan Pending di bawah. Setelah itu klik <strong>Continue</strong> untuk
                            konfirmasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            // kalau invalid, sentuh field biar error muncul
                            if (!isValid) {
                                formik.setTouched({ reason: true }, true)
                                return
                            }
                            handleSubmit()
                        }}
                        className="grid gap-3"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="reason">
                                Reason <span className="text-red-500">*</span>
                                <span className="text-red-500">
                  {touched.reason && errors.reason ? errors.reason : ''}
                </span>
                            </Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                value={values.reason}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="contoh: menunggu konfirmasi kasir soal IDTV tidak aktif..."
                                maxLength={200}
                                className="min-h-24"
                            />
                            <div className="flex items-center justify-end text-xs">
                                <span className="text-muted-foreground">{values.reason.length}/200</span>
                            </div>
                        </div>

                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={pendingMutation.isPending || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isValid || pendingMutation.isPending || isSubmitting}
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2) CONFIRM DIALOG */}
            <ConfirmDialog
                destructive
                open={showConfirm}
                onOpenChange={(isOpen: boolean) => setShowConfirm(isOpen)}
                title={`Konfirmasi Pending: ${currentRow?.id}`}
                desc={
                    <div className="space-y-2">
                        <p>
                            Kamu akan menandai ticket <strong>{currentRow?.id}</strong> sebagai{' '}
                            <strong>Pending</strong>.
                        </p>
                        <div className="rounded-md border p-3 text-sm">
                            <div className="font-medium mb-1">Reason</div>
                            <div className="whitespace-pre-wrap text-muted-foreground">
                                {values.reason.trim() || '-'}
                            </div>
                        </div>
                        <p>Yakin lanjut?</p>
                    </div>
                }
                handleConfirm={() => {
                    if (!currentRow) return
                    if (!isValid) return // guard ekstra
                    pendingMutation.mutate(
                        { ticketId: currentRow.id, reason: values.reason.trim() },
                        {
                            onSettled: () => {
                                setOpen(null)
                                closeAll()
                            },
                        }
                    )
                }}
                // Jika ConfirmDialog kamu sudah ditambah prop confirmDisabled, boleh aktifkan:
                // confirmDisabled={!isValid || pendingMutation.isPending || isSubmitting}
                confirmText={pendingMutation.isPending ? 'Saving...' : 'Confirm Pending'}
            />
        </>
    )
}
