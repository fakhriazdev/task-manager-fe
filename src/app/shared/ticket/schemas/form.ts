// =======================================
// app/shared/schemas/form.ts
// =======================================
import * as Yup from 'yup';
import {
    CATEGORY_VALUES,
    PAYMENT_VALUES,
    type CategoryCode,
    type PaymentCode,
    type TicketForm,
} from '@/lib/ticket/TicketTypes';

/* Upload rules + helpers */
export const FILE_RULES = {
    maxMB: 1,
    maxFiles: 5,
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
} as const;

export const bytes = (mb: number) => mb * 1024 * 1024;

export const isAcceptedMime = (
    t: string
): t is (typeof FILE_RULES.accept)[number] =>
    (FILE_RULES.accept as readonly string[]).includes(t);

/* Yup helpers */
const STR = () =>
    Yup.string()
        .ensure()
        .nullable()
        .default(null);

/** Field schema (payment) */
// fromPayment field
const fromPaymentField = Yup.mixed<PaymentCode>()
    .nullable()
    .when("category", {
        is: "Transaksi" as CategoryCode,
        then: (s) =>
            s
                .oneOf(PAYMENT_VALUES as readonly PaymentCode[], "Choose a valid payment method")
                .required("From Payment is required for transaction issues"),
        otherwise: (s) => s.nullable(),
    })
    .default(null);

// toPayment field
const toPaymentField = Yup.mixed<PaymentCode>()
    .nullable()
    .when("category", {
        is: "Transaksi" as CategoryCode,
        then: (s) =>
            s
                .oneOf(PAYMENT_VALUES as readonly PaymentCode[], "Choose a valid payment method")
                .required("To Payment is required for transaction issues"),
        otherwise: (s) => s.nullable(),
    })
    .default(null);


export const validationShape = {
    idStore: Yup.string()
        .ensure()
        .transform((v) => (v ?? '').trim().toUpperCase())
        .required('ID Store wajib diisi')
        .min(5, 'ID Store tidak valid')
        .max(6, 'ID Store tidak boleh lebih dari 5 Digit')
        .default(''),

    noTelp: Yup.string()
        .ensure()
        .transform((v) => (v ?? '').trim())
        .matches(/^\d+$/, 'Nomor Telepon hanya boleh berisi angka')
        .required('Nomor Telepon wajib diisi')
        .matches(/^08\d{7,13}$/, 'Nomor Telepon harus diawali dengan 08 dan berisi 9–15 digit')
        .min(9, 'Nomor Telepon tidak valid (minimal 9 digit)')
        .max(13, 'Nomor Telepon tidak boleh lebih dari 13 digit')
        .default(''),

    category: Yup.mixed<CategoryCode>()
        .oneOf(CATEGORY_VALUES, 'Kategori tidak valid')
        .required('Kategori wajib dipilih')
        .default(null),

    description: Yup.string()
        .ensure()
        .transform((v) => (v ?? '').trim())
        .required('Description wajib diisi')
        .min(10, 'Description minimal 10 karakter')
        .max(200, 'Description tidak boleh lebih dari 200 karakter')
        .default(''),

    fromPayment: fromPaymentField,
    toPayment: toPaymentField,

    isDirectSelling: Yup.boolean()
        .nullable()
        .when('category', {
            is: 'Transaksi' as CategoryCode,
            then: (s) => s.nullable(), // tidak wajib diisi
            otherwise: (s) => s.nullable(),
        })
        .default(false),

    billCode: STR()
        .when('category', {
            is: 'Transaksi' as CategoryCode,
            then: (s) =>
                s.required('billCode wajib diisi untuk masalah transaksi')
                    .length(12, 'billCode harus terdiri dari tepat 12 karakter'),
            otherwise: (s) =>
                s.length(12, 'billCode harus terdiri dari tepat 12 karakter'),
        })
        .default(null),

    grandTotal: STR()
        .when('category', {
            is: 'Transaksi' as CategoryCode,
            then: (s) =>
                s.required('Grand Total wajib diisi untuk masalah transaksi')
                    .matches(/^\d+([.,]\d{1,2})?$/, 'Grand Total harus berupa angka yang valid')
                    .max(12, 'Grand Total tidak boleh lebih dari 12 karakter'),
            otherwise: (s) =>
                s.matches(/^$|^\d+([.,]\d{1,2})?$/, 'Grand Total harus berupa angka yang valid')
                    .max(12, 'Grand Total tidak boleh lebih dari 12 karakter'),
        })
        .default(null),

    /** images: WAJIB (FileList, minimal 1 file) */
    images: Yup.mixed<FileList>()
        .test('not-empty', 'Minimal 1 gambar harus diunggah', (val) => {
            return val instanceof FileList && val.length > 0;
        })
        .test('max-files', `Maksimal ${FILE_RULES.maxFiles} file yang boleh diunggah`, (val) => {
            if (!val) return false;
            return val.length <= FILE_RULES.maxFiles;
        })
        .test('each-size', `Ukuran tiap file harus ≤ ${FILE_RULES.maxMB} MB`, (val) => {
            if (!val) return false;
            const limit = bytes(FILE_RULES.maxMB);
            for (const f of Array.from(val)) if (f.size > limit) return false;
            return true;
        })
        .test('each-mime', 'Tipe file tidak didukung', (val) => {
            if (!val) return false;
            for (const f of Array.from(val)) if (!isAcceptedMime(f.type)) return false;
            return true;
        }),
} satisfies { [K in keyof TicketForm]: Yup.AnySchema };

export const validationSchema = Yup.object(validationShape)
    .required()
    .noUnknown();
