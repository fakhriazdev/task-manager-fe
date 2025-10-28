import { useTicketStore } from "@/lib/stores/useTicketStore"
import TicketDetailDrawer from "@/app/dashboard/ticket/components/TicketDetailDrawer"
import {ConfirmDialog} from "@/components/shared/confirmDialog";
import { RepairTransaction } from "@/lib/ticket/TicketTypes";
import {useCompleteTicket, useRepairTransaction} from "@/lib/ticket/useTicketAction";
import ConfirmPendingTicket from "@/app/dashboard/ticket/components/ConfirmPendingTicket";

export default function TicketDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useTicketStore()
    const repairMutation = useRepairTransaction()
    const completeMutation = useCompleteTicket()

    // 👉 anggap ini overlay states
    const isOverlay =
        open === "confirm" || open === "complete" || open === "pending"

    return (
        <>
            {currentRow && (
                <>
                    {/* 👉 Drawer tetap terbuka ketika overlay terbuka */}
                    <TicketDetailDrawer
                        key={`ticket-detail-${currentRow.id}`}
                        open={open === "detail" || isOverlay}
                        onOpenChange={(isOpen) => {
                            // kalau overlay terbuka, abaikan close di drawer (klik luar / ESC)
                            if (!isOpen && isOverlay) return
                            if (!isOpen) {
                                setOpen(null)
                                setCurrentRow(null)
                            } else {
                                setOpen("detail")
                            }
                        }}
                        currentRow={currentRow}
                    />

                    {/* ====== Confirm: Send MQ (hanya untuk category transaksi) ====== */}
                    {currentRow?.category?.toLowerCase().trim() === "transaksi" && (
                        <ConfirmDialog
                            key="ticket-sendMQ"
                            destructive
                            open={open === "confirm"}
                            onOpenChange={(isOpen) => {
                                // kalau close overlay, kembali ke detail (jangan clear row)
                                if (!isOpen) setOpen("detail")
                                else setOpen("confirm")
                            }}
                            handleConfirm={() => {
                                if (!currentRow) return
                                const payload: RepairTransaction = {
                                    commandType: "REPAIR_PAYMENT",
                                    idStore: currentRow.idStore,
                                    ticketId: currentRow.id,
                                    payload: {
                                        ID_TR_SALES_HEADER: currentRow.billCode,
                                        grandTotal: currentRow.grandTotal,
                                        fromPaymentType: currentRow.fromPayment,
                                        toPaymentType: currentRow.toPayment,
                                        directSelling: currentRow.isDirectSelling,
                                    },
                                }

                                repairMutation.mutate(payload, {
                                    onSettled: () => {
                                        // selesai: baru tutup semua & clear row
                                        setOpen(null)
                                        setCurrentRow(null)
                                    },
                                })
                            }}
                            className="max-w-md"
                            title={`Send Message to Repair Transaction: ${currentRow?.id} ?`}
                            desc={
                                <>
                                    You are about to send a repair request message to the MQ client
                                    for transaction <strong>{currentRow?.id}</strong>.<br />
                                    This will attempt to fix the transaction issue in the system.<br />
                                    Please confirm if you would like to proceed.
                                </>
                            }
                            confirmText={repairMutation.isPending ? "Sending..." : "Send Message"}
                        />
                    )}

                    {/* ====== Confirm: Complete ====== */}
                    <ConfirmDialog
                        key="ticket-confirm"
                        destructive
                        open={open === "complete"}
                        onOpenChange={(isOpen) => {
                            // 🔧 bugfix: saat open harus set "complete" (bukan "confirm")
                            if (!isOpen) setOpen("detail")
                            else setOpen("complete")
                        }}
                        handleConfirm={() => {
                            if (!currentRow) return
                            const payload = { ticketId: currentRow.id }

                            completeMutation.mutate(payload, {
                                onSettled: () => {
                                    // selesai: baru tutup semua & clear row
                                    setOpen(null)
                                    setCurrentRow(null)
                                },
                            })
                        }}
                        className="max-w-md"
                        title={`Complete this ticket: ${currentRow?.id}?`}
                        desc={
                            <>
                                You are about to mark ticket <strong>{currentRow?.id}</strong> as
                                <strong> completed</strong>.<br />
                                This action will update the ticket status in the system.<br />
                                Please confirm if you would like to continue.
                            </>
                        }
                        confirmText={completeMutation.isPending ? "Loading..." : "Complete"}
                    />

                    {/* ====== Confirm: Pending ====== */}
                    <ConfirmPendingTicket
                        open={open === "pending"}
                        onOpenChange={(isOpen: boolean) => {
                            // tutup overlay → balik ke detail, buka overlay → set pending
                            setOpen(isOpen ? "pending" : "detail")
                        }}
                    />
                </>
            )}
        </>
    )
}

