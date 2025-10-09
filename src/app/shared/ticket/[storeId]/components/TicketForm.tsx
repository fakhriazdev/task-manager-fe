'use client';

import React from 'react';
import {
    Formik,
    Form,
    Field,
    ErrorMessage,
    type FieldProps,
    type FieldMetaProps,
} from 'formik';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileImage, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAddTicket } from '@/lib/ticket/useTicketAction';
import {
    CATEGORY_OPTIONS,
    PAYMENT_OPTIONS,
    type CategoryCode,
    type PaymentCode,
    type TicketForm,
} from '@/lib/ticket/TicketTypes';
import { validationSchema, FILE_RULES } from '@/app/shared/ticket/[storeId]/schemas/form';
import { useImageUpload } from '@/hooks/useImageUpload';
import {Select, SelectContent, SelectLabel, SelectTrigger, SelectValue ,SelectGroup, SelectItem} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {formatIDR, unformatToDigits} from "@/utils/currency";

export default function TicketForm() {
    const addTicket = useAddTicket();
    const isLoading = addTicket.isPending;
    const getPaymentLabel = (code?: PaymentCode | "") =>
        PAYMENT_OPTIONS.find(o => o.value === code)?.label ?? (code || "-");
    const params = useParams<{ storeId?: string }>();
    // const router = useRouter();
    const storeIdFromRoute = Array.isArray(params?.storeId)
        ? params?.storeId?.[0] ?? ''
        : params?.storeId ?? '';

    const safeStoreId = (storeIdFromRoute || '').toUpperCase();

    const {
        selectedImages,
        previews,
        uploadError,
        setUploadError,
        handleUpload,
        handleRemove,
        fileInputRef,
        handleReset
    } = useImageUpload();

    const initialValues: TicketForm = {
        idStore: safeStoreId,
        noTelp:'',
        category: 'Transaksi',
        description: '',
        fromPayment: '',
        toPayment: '',
        isDirectSelling: false,
        billCode: '',
        idtv:'',
        grandTotal: '',
        images: new DataTransfer().files,
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-lg dark:bg-[#2e353f]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileImage className="w-6 h-6 text-primary" /> Create New Ticket
                    </CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new ticket
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Formik<TicketForm>
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={async (values:TicketForm) => {
                            if (selectedImages.length === 0) {
                                setUploadError('Please upload at least one image.');
                                return;
                            }
                            const dt = new DataTransfer();
                            selectedImages.forEach((f) => dt.items.add(f));

                            const payload: TicketForm = {
                                ...values,
                                idStore: safeStoreId || values.idStore,
                                images: dt.files,

                            };

                            await addTicket.mutateAsync({payload, callbackUrl: `https://web.amscorp.id:3060/module/support/TicketList.aspx?str=${values.idStore}`});
                            setUploadError('');
                        }}
                    >
                        {(formik) => {
                            const { values, setFieldValue, isValid, dirty } = formik;
                            console.log(values,'values')
                            const isTransaksi = values.category === 'Transaksi';
                            return (
                                <Form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Store ID *</Label>
                                            <Field name="idStore">
                                                {({ field, meta }: FieldProps<string, TicketForm>) => (
                                                    <>
                                                        <Input
                                                            {...field}
                                                            value={(field.value || safeStoreId).toUpperCase()}
                                                            readOnly
                                                            placeholder="Enter store ID"
                                                            maxLength={6}
                                                        />
                                                        {meta.touched && meta.error && (
                                                            <p className="text-sm text-destructive">
                                                                {meta.error}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </Field>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>No. Telephone *</Label>
                                            <Field name="noTelp">
                                                {({ field, meta }: FieldProps<string, TicketForm>) => (
                                                    <>
                                                        <Input
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            placeholder="Enter your No Telephone"
                                                            maxLength={13}
                                                        />
                                                        {meta.touched && meta.error && (
                                                            <p className="text-sm text-destructive">
                                                                {meta.error}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                    {/* Category */}
                                    <div className="space-y-2">
                                        <Label>Category *</Label>
                                        <Field name="category">
                                            {({ meta }: { meta: FieldMetaProps<TicketForm["category"]> }) => (
                                                <>
                                                    <Select
                                                        value={values.category || ""}
                                                        onValueChange={(next: string) => {
                                                            const nextCat = next as CategoryCode
                                                            const fixedIdStore = (values.idStore && values.idStore.trim()) ? values.idStore.toUpperCase() : safeStoreId;
                                                            setFieldValue("category", nextCat, true)

                                                            // reset semua field + images setiap ganti kategori
                                                            formik.setValues(
                                                                {
                                                                    ...values,
                                                                    idStore: fixedIdStore,
                                                                    noTelp: "",
                                                                    category: nextCat,
                                                                    description: "",
                                                                    fromPayment: "",
                                                                    toPayment: "",
                                                                    isDirectSelling: false,
                                                                    billCode: "",
                                                                    grandTotal: "",
                                                                    images: new DataTransfer().files,
                                                                },
                                                                false
                                                            )
                                                            handleReset(setFieldValue)
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                meta.touched && meta.error && "border-destructive"
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Categories</SelectLabel>
                                                                {CATEGORY_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>

                                                    {meta.touched && meta.error && (
                                                        <p className="text-sm text-destructive">{meta.error}</p>
                                                    )}
                                                </>
                                            )}
                                        </Field>
                                    </div>


                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label>Description *</Label>
                                        <Field name="description">
                                            {({ field, meta }: FieldProps<string, TicketForm>) => (
                                                <>
                                                    <Textarea
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        placeholder="Please describe the issue..."
                                                    />
                                                    {meta.touched && meta.error && (
                                                        <p className="text-sm text-destructive">
                                                            {meta.error}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </Field>
                                    </div>

                                    {/* Transaction fields grid 2 kolom */}
                                    {isTransaksi && (
                                        <div className="space-y-4 p-4 border rounded bg-muted/30">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* From Payment */}
                                                <div className="space-y-2">
                                                    <Label>Tercatat Pembayaran Saat Ini *</Label>
                                                    <Field name="fromPayment">
                                                        {({ meta }: { meta: FieldMetaProps<TicketForm["fromPayment"]> }) => (
                                                            <>
                                                                <Select
                                                                    value={values.fromPayment || ""}
                                                                    onValueChange={(next: string) => {
                                                                        setFieldValue("fromPayment", next as PaymentCode, true);
                                                                    }}
                                                                >
                                                                    <SelectTrigger
                                                                        className={cn(
                                                                            "w-full",
                                                                            meta.touched && meta.error && "border-destructive"
                                                                        )}
                                                                    >
                                                                        <SelectValue placeholder="Select from payment" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            <SelectLabel>Payments</SelectLabel>
                                                                            {PAYMENT_OPTIONS.map((opt) => (
                                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                                    {opt.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>

                                                                {meta.touched && meta.error && (
                                                                    <p className="text-sm text-destructive">{meta.error}</p>
                                                                )}
                                                            </>
                                                        )}
                                                    </Field>
                                                </div>


                                                {/* To Payment */}
                                                <div className="space-y-2">
                                                    <Label>Seharusnya ke *</Label>
                                                    <Field name="toPayment">
                                                        {({ meta }: { meta: FieldMetaProps<TicketForm["toPayment"]> }) => (
                                                            <>
                                                                <Select
                                                                    value={values.toPayment || ""}
                                                                    onValueChange={(next: string) => {
                                                                        setFieldValue("toPayment", next as PaymentCode, true);
                                                                    }}
                                                                >
                                                                    <SelectTrigger
                                                                        className={cn(
                                                                            "w-full",
                                                                            meta.touched && meta.error && "border-destructive"
                                                                        )}
                                                                    >
                                                                        <SelectValue placeholder="Select to payment" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            <SelectLabel>Payments</SelectLabel>
                                                                            {PAYMENT_OPTIONS.map((opt) => (
                                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                                    {opt.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>

                                                                {meta.touched && meta.error && (
                                                                    <p className="text-sm text-destructive">{meta.error}</p>
                                                                )}
                                                            </>
                                                        )}
                                                    </Field>
                                                </div>


                                                {/* Billcode */}
                                                <div className="space-y-2">
                                                    <Label>Bill Code *</Label>
                                                    <Field name="billCode">
                                                        {({
                                                              field,
                                                              meta,
                                                          }: FieldProps<string | null, TicketForm>) => (
                                                            <>
                                                                <Input
                                                                    {...field}
                                                                    value={field.value?.toUpperCase() ?? ''}
                                                                    placeholder="Enter bill code"
                                                                    maxLength={12}
                                                                />
                                                                {meta.touched && meta.error && (
                                                                    <p className="text-sm text-destructive">
                                                                        {meta.error}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </Field>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Grand Total *</Label>
                                                    <Field name="grandTotal">
                                                        {({ field, meta, form }: FieldProps<string | null, TicketForm>) => {
                                                            const rawValue = field.value ?? "";

                                                            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const onlyDigits = unformatToDigits(e.target.value);
                                                                form.setFieldValue("grandTotal", onlyDigits, true);
                                                            };

                                                            return (
                                                                <>
                                                                    <Input
                                                                        {...field}
                                                                        value={formatIDR(rawValue)}
                                                                        placeholder="Enter grand total"
                                                                        onChange={handleChange}
                                                                        inputMode="numeric"
                                                                        pattern="[0-9]*"
                                                                    />
                                                                    {meta.touched && meta.error && (
                                                                        <p className="text-sm text-destructive">{meta.error}</p>
                                                                    )}
                                                                </>
                                                            );
                                                        }}
                                                    </Field>
                                                </div>
                                                {/* Direct Selling */}
                                                <div className="space-y-2 md:col-span-2">
                                                    <Field name="isDirectSelling">
                                                        {({ field, meta, form }: FieldProps<boolean | null, TicketForm>) => (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        id="isDirectSelling"
                                                                        type="checkbox"
                                                                        checked={field.value ?? false}
                                                                        onChange={(e) =>
                                                                            form.setFieldValue("isDirectSelling", e.target.checked, true)
                                                                        }
                                                                        className="h-4 w-4 rounded border-gray-300"
                                                                    />
                                                                    <Label htmlFor="isDirectSelling">Direct Selling</Label>
                                                                </div>

                                                                {/* helper text */}
                                                                <p className="text-sm text-muted-foreground">
                                                                    *Apakah transaksi ini termasuk Direct Selling? Jika ya, silakan centang kotak di atas.
                                                                </p>

                                                                {meta.touched && meta.error && (
                                                                    <p className="text-sm text-destructive">{meta.error}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Field>
                                                </div>



                                            </div>
                                        </div>
                                    )}

                                    {/* IDTV */}
                                    <div className="space-y-2">
                                        <Label>ID Team Viewer *</Label>
                                        <Field name="idtv">
                                            {({
                                                  field,
                                                  meta,
                                              }: FieldProps<string | null, TicketForm>) => (
                                                <>
                                                    <Input
                                                        {...field}
                                                        value={field.value?.toUpperCase() ?? ''}
                                                        placeholder="Enter bill code"
                                                        maxLength={10}
                                                    />
                                                    {meta.touched && meta.error && (
                                                        <p className="text-sm text-destructive">
                                                            {meta.error}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </Field>
                                    </div>


                                    {/* Image Upload */}
                                    <div className="space-y-4">
                                        <Label>Attachments *</Label>
                                        {uploadError && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{uploadError}</AlertDescription>
                                            </Alert>
                                        )}
                                        <label className="block w-full h-40 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <span className="text-sm">
                        Click to upload or drag and drop
                      </span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept={FILE_RULES.accept.join(',')}
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleUpload(e.currentTarget.files, setFieldValue)
                                                }
                                                disabled={selectedImages.length >= FILE_RULES.maxFiles}
                                            />
                                        </label>

                                        {selectedImages.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {selectedImages.map((f, i) => {
                                                    const src = previews[i] ?? null;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="relative border rounded overflow-hidden aspect-[4/3]"
                                                        >
                                                            {src ? (
                                                                <Image
                                                                    src={src}
                                                                    alt={f.name}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                                    <FileImage className="w-8 h-8 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleRemove(i, setFieldValue)
                                                                }
                                                                className="absolute top-1 right-1 h-6 w-6 rounded-full p-0"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <ErrorMessage
                                            name="images"
                                            component="p"
                                            className="text-sm text-destructive"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                disabled={isLoading || !isValid || !dirty}
                                                className="w-full"
                                            >
                                                {isLoading ? "Creating Ticket..." : "Create Ticket"}
                                            </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Kirim tiket ini ?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-base leading-relaxed">
                                                    {values.category === "Transaksi" ? (
                                                        <>
                                                            <p className="mb-2">Apakah Anda yakin ingin mengubah metode pembayaran?</p>

                                                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                                                <dt className="text-muted-foreground">Kode Tagihan</dt>
                                                                <dd className="font-semibold text-primary">{values.billCode}</dd>

                                                                <dt className="text-muted-foreground">Total</dt>
                                                                <dd className="font-semibold text-primary">{formatIDR(values.grandTotal)}</dd>

                                                                <dt className="text-muted-foreground">Dari</dt>
                                                                <dd className="font-semibold text-primary ">{getPaymentLabel(values.fromPayment)}</dd>

                                                                <dt className="text-muted-foreground">Ke</dt>
                                                                <dd className="font-semibold text-primary">{getPaymentLabel(values.toPayment)}</dd>

                                                                <dt className="text-muted-foreground">Direct Selling</dt>
                                                                <dd className="font-semibold text-primary">{values.isDirectSelling ? "Ya" : "Tidak"}</dd>
                                                            </dl>

                                                            <p className="mt-3 text-muted-foreground">
                                                                Silakan periksa kembali. Anda dapat membatalkan untuk mengoreksi, atau lanjutkan untuk mengirim.
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            Apakah Anda yakin ingin mengirim tiket ini? Mohon periksa kembali formulir Anda. Anda dapat membatalkan untuk meninjau atau melanjutkan untuk mengirim.
                                                        </>
                                                    )}
                                                </AlertDialogDescription>

                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Kembali</AlertDialogCancel>
                                                <AlertDialogAction onClick={formik.submitForm} disabled={isLoading}>
                                                    Ya, Kirim
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </Form>
                            );
                        }}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    );
}
