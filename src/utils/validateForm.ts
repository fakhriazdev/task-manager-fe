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