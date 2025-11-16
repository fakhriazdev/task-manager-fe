import {z, ZodEffects, ZodObject, ZodRawShape, ZodType} from 'zod'
import { FormikErrors } from 'formik'

export function validateForm<T extends Record<string, unknown>>(schema: ZodType<T>) {
    return (values: T): FormikErrors<T> => {
        const result = schema.safeParse(values);
        if (result.success) return {};

        const errors: FormikErrors<T> = {};

        for (const issue of result.error.issues) {
            const key = issue.path[0];
            if (key && typeof key === 'string') {
                errors[key as keyof T] = issue.message as FormikErrors<T>[keyof T];
            }
        }

        return errors;
    };
}


export const applyRoleBasedAccessRules = <
    T extends ZodRawShape
>(
    baseSchema: ZodObject<T> | ZodEffects<ZodObject<T>>
) => {
    return baseSchema.superRefine((data, ctx) => {
        const { roleId, accessStoreIds, accessRegionIds } = data as {
            roleId?: string;
            accessStoreIds?: string[];
            accessRegionIds?: string[];
        };

        if (roleId === 'SC' && (!accessStoreIds || accessStoreIds.length === 0)) {
            ctx.addIssue({
                path: ['accessStoreIds'],
                message: 'Access store harus diisi jika role SC',
                code: z.ZodIssueCode.custom,
            });
        }

        if (roleId === 'AC' && (!accessRegionIds || accessRegionIds.length === 0)) {
            ctx.addIssue({
                path: ['accessRegionIds'],
                message: 'Access region harus diisi jika role AC',
                code: z.ZodIssueCode.custom,
            });
        }
    });
};

export const allowedMimes: ReadonlyArray<string> = [
    // Images
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/avif',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    'text/plain',
];


export const FILE_RULES = {
    maxFiles: 5,
    maxSizeBytes: 1 * 1024 * 1024, // 1 MB (match Multer limit)
    accept: allowedMimes,
} as const;

export const ProjectAttachmentSchema = z.object({
    attachments: z
        .array(z.instanceof(File))
        .min(1, 'Minimal 1 file.')
        .max(FILE_RULES.maxFiles, `Maksimal ${FILE_RULES.maxFiles} file.`)
        .superRefine((files, ctx) => {
            for (const file of files) {
                if (!allowedMimes.includes(file.type)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Tipe file ${file.name} tidak diizinkan.`,
                        path: ['attachments'],
                    });
                }

                if (file.size > FILE_RULES.maxSizeBytes) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `${file.name} lebih dari ${Math.round(
                            FILE_RULES.maxSizeBytes / 1024 / 1024,
                        )} MB.`,
                        path: ['attachments'],
                    });
                }
            }
        }),
});
