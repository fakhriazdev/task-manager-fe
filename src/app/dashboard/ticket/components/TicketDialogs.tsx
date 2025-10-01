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


    return (
        <>
            {currentRow && (
                <>
                    <TicketDetailDrawer
                        key={`ticket-detail-${currentRow.id}`}
                        open={open === "detail"}
                        onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setOpen(null)
                                setCurrentRow(null)
                            } else {
                                setOpen("detail")
                            }
                        }}
                        currentRow={currentRow}
                    />
                    {currentRow?.category?.toLowerCase().trim() === "transaksi" && (
                        <ConfirmDialog
                            key="ticket-sendMQ"
                            destructive
                            open={open === "confirm"}
                            onOpenChange={(isOpen) => {
                                if (!isOpen) {
                                    setOpen(null)
                                    setTimeout(() => setCurrentRow(null), 500)
                                } else {
                                    setOpen("confirm")
                                }
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
                                    for transaction <strong>{currentRow?.id}</strong>. <br />
                                    This will attempt to fix the transaction issue in the system. <br />
                                    Please confirm if you would like to proceed.
                                </>
                            }
                            confirmText={repairMutation.isPending ? "Sending..." : "Send Message"}
                        />
                    )}
                    <ConfirmDialog
                        key="ticket-confirm"
                        destructive
                        open={open === "complete"}
                        onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setOpen(null)
                                setTimeout(() => setCurrentRow(null), 500)
                            } else {
                                setOpen("confirm")
                            }
                        }}
                        handleConfirm={() => {
                            if (!currentRow) return

                            const payload = { ticketId: currentRow.id }

                            completeMutation.mutate(payload, {
                                onSettled: () => {
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
                                <strong> completed</strong>. <br />
                                This action will update the ticket status in the system. <br />
                                Please confirm if you would like to continue.
                            </>
                        }
                        confirmText={completeMutation.isPending ? "Loading..." : "Complete"}
                    />
                    <ConfirmPendingTicket
                        open={open === "pending"}
                        onOpenChange={(isOpen:boolean) => setOpen(isOpen ? "pending" : null)}
                    />

                </>
            )}



        </>
    )
}
