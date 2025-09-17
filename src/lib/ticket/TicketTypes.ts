// ==============================
// lib/ticket/TicketTypes.ts
// ==============================

// ---------- Category ----------
export const CATEGORY_OPTIONS = [
    { value: 'Transaksi', label: 'Transaction Issues' },
    { value: 'U92',       label: 'U92 Issues' },
    { value: 'LOGOFF',    label: 'LOGOFF Issues' },
    { value: 'Other',     label: 'Other Issues' },
] as const;

export type CategoryOption = typeof CATEGORY_OPTIONS[number];
export type CategoryCode   = CategoryOption['value'];

export const CATEGORY_VALUES =
    CATEGORY_OPTIONS.map(o => o.value) as readonly CategoryCode[];

// ---------- Payment ----------
export const PAYMENT_OPTIONS = [
    { value: 'DBCA',      label: 'D.BCA' },
    { value: 'DBNI',      label: 'D.BNI' },
    { value: 'DBRI',      label: 'D.BRI' },
    { value: 'DMDR',      label: 'D.MDR' },
    { value: 'CBCA',      label: 'K.BCA' },
    { value: 'CBNI',      label: 'K.BNI' },
    { value: 'CBRI',      label: 'K.BRI' },
    { value: 'CMDR',      label: 'K.MDR' },
    { value: 'KQRIS',     label: 'K.QRIS' },
    { value: 'QRISBCA',  label: 'D.QRIS BCA' },
    { value: 'QRISBNI',  label: 'D.QRIS BNI' },
    { value: 'QRISBRI',  label: 'D.QRIS BRI' },
    { value: 'QRISMDR',  label: 'D.QRIS MDR' },
    { value: 'KINDODANA', label: 'K.INDODANA' },
] as const;

// const paymentMap = Object.fromEntries(
//     PAYMENT_OPTIONS.map((opt) => [opt.value, opt.label])
// );
//
// export function getPaymentLabel(value?: string | null): string {
//     if (!value) return "-";
//     return paymentMap[value] ?? value;
// }

export type PaymentOption = typeof PAYMENT_OPTIONS[number];
export type PaymentCode   = PaymentOption['value'];

export const PAYMENT_VALUES =
    PAYMENT_OPTIONS.map(o => o.value) as readonly PaymentCode[];

// ---------- Formik form values ----------
export type TicketForm = {
    idStore: string;
    noTelp:string;
    category: CategoryCode;
    description: string;
    fromPayment?: PaymentCode | "";
    toPayment?: PaymentCode | "";
    isDirectSelling?: boolean;
    billCode?: string;
    grandTotal?: string;
    images: FileList;
};

export enum EStatus {
    QUEUED = 'QUEUED',
    ONPROCESS = 'ONPROCESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

type Image = {
    id: string;
    url: string;
}

export type TicketList = {
    id:string;
    idStore: string,
    noTelp:string;
    category: string,
    status: EStatus,
    description: string,
    fromPayment: string,
    toPayment: string,
    isDirectSelling: boolean,
    billCode: string,
    grandTotal: string,
    images: Image[];
    handler: { nama: string | null; };
    completedBy: { nama: string | null; };
    completedAt:string | null;
    createdAt: string,
    updatedAt: string,
}

export type SummaryTicketByUser = {
    nik:string,
    name: string,
    total: number,
    uncompleted:number
}

export type TicketFormPayload = {
    payload: TicketForm,
    callbackUrl?:string
}

export type RepairTransaction = {
    commandType: string;
    idStore: string;
    ticketId: string;
    payload: {
        ID_TR_SALES_HEADER: string;
        grandTotal: string;
        fromPaymentType: string;
        toPaymentType: string;
        directSelling: boolean;
    };
}

// ---------- Common response ----------
export interface CommonResponse<T> {
    message: string;
    statusCode: number;
    data?: T;
}
