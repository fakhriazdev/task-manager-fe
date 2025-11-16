import z from "zod";
import {allowedMimes, FILE_RULES, ProjectAttachmentSchema, validateForm} from "@/utils/validateForm";
import React, {useMemo, useState} from "react";
import {useUploadTaskAttachmentAction} from "@/lib/project/projectAction";
import {ErrorMessage, FormikProvider, useFormik} from "formik";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Upload} from "lucide-react";

type ProjectAttachmentValues = z.infer<typeof ProjectAttachmentSchema>;

const attachmentInitialValues: ProjectAttachmentValues = {
    attachments: [],
};

type AttachmentFormProps = {
    taskId: string;
};
export default function AttachmentForm({ taskId }: AttachmentFormProps) {
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const uploadMutation = useUploadTaskAttachmentAction();

    const formik = useFormik<ProjectAttachmentValues>({
        initialValues: attachmentInitialValues,
        validate: validateForm(ProjectAttachmentSchema),
        validateOnChange: false,
        validateOnBlur: false,
        validateOnMount: false,
        onSubmit: async (values, helpers) => {
            try {
                setUploadError(null);
                setUploadProgress(0);

                await uploadMutation.mutateAsync({taskId, files: values.attachments, onProgress: (p) => setUploadProgress(p),});

                helpers.resetForm();
                setUploadProgress(null);
            } catch (err) {
                console.error(err);
                setUploadError('Upload gagal, coba lagi.');
                setUploadProgress(null);
            } finally {
                helpers.setSubmitting(false);
            }
        },
    });

    const {
        setFieldValue,
        setFieldError,
        isSubmitting,
        submitForm,
    } = formik;

    const selectedFiles = formik.values.attachments ?? [];

    const canAddMore = useMemo(
        () => selectedFiles.length < FILE_RULES.maxFiles,
        [selectedFiles.length],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const current = formik.values.attachments ?? [];
        const combined = [...current, ...files];

        if (combined.length > FILE_RULES.maxFiles) {
            const allowedToAdd = FILE_RULES.maxFiles - current.length;
            const finalCombined =
                allowedToAdd > 0
                    ? [...current, ...files.slice(0, allowedToAdd)]
                    : current;

            setFieldValue('attachments', finalCombined);
            const msg = `Maksimal ${FILE_RULES.maxFiles} file.`;
            setUploadError(msg);
            setFieldError('attachments', msg);
            return;
        }

        // Validasi manual tipe & size
        for (const file of files) {
            if (!allowedMimes.includes(file.type)) {
                const msg = `Tipe file "${file.name}" tidak diizinkan.`;
                setUploadError(msg);
                setFieldError('attachments', msg);
                return;
            }
            if (file.size > FILE_RULES.maxSizeBytes) {
                const msg = `"${file.name}" lebih dari ${Math.round(
                    FILE_RULES.maxSizeBytes / 1024 / 1024,
                )} MB.`;
                setUploadError(msg);
                setFieldError('attachments', msg);
                return;
            }
        }

        // ✅ Lolos semua → set value dulu
        setUploadError(null);
        setFieldError('attachments', undefined);
        setFieldValue('attachments', combined);

        // ⬇️ submit di next tick, biar Formik sempat commit nilai barunya
        setTimeout(() => {
            console.log('before submit, formik.values.attachments =>', formik.values.attachments);
            void submitForm();
        }, 0);
    };

    return (
        <FormikProvider value={formik}>
            <div className="w-full h-32">
                <div className="flex h-full flex-col gap-1">
                    {uploadError && (
                        <Alert variant="destructive" className="py-1 px-2 text-[11px]">
                            <AlertDescription className="text-[11px]">
                                {uploadError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <label
                        className="flex-1 w-full border-2 border-dashed rounded-md border-primary
                       flex flex-col items-center justify-center gap-1
                       cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                        <Upload className="w-6 h-6 text-primary" />

                        <span className="text-[11px] leading-tight text-muted-foreground text-center px-2">
              Upload file
            </span>

                        <span className="text-[9px] leading-tight text-muted-foreground/80 text-center px-2">
              Max {FILE_RULES.maxFiles} file ·{' '}
                            {Math.round(FILE_RULES.maxSizeBytes / 1024 / 1024)}MB
            </span>

                        <input
                            type="file"
                            multiple
                            accept={FILE_RULES.accept.join(',')}
                            className="hidden"
                            onChange={handleChange}
                            disabled={
                                !canAddMore ||
                                isSubmitting ||
                                uploadMutation.isPending
                            }
                        />
                    </label>

                    {uploadProgress !== null && (
                        <div className="w-full mt-0.5">
                            <div className="h-1.5 w-full rounded bg-muted">
                                <div
                                    className="h-full rounded bg-primary transition-[width] duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="mt-0.5 text-[10px] text-muted-foreground text-right">
                                {uploadProgress}%
                            </p>
                        </div>
                    )}

                    <ErrorMessage
                        name="attachments"
                        component="p"
                        className="text-[11px] text-destructive"
                    />
                </div>
            </div>
        </FormikProvider>
    );
}
