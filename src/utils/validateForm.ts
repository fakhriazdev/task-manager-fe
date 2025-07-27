import {z, ZodEffects, ZodObject, ZodType} from 'zod'
import { FormikErrors } from 'formik'

export function validateForm<T>(schema: ZodType<T>) {
    return (values: T): FormikErrors<T> => {
        const result = schema.safeParse(values)
        if (result.success) return {}

        const errors: FormikErrors<T> = {}
        for (const issue of result.error.issues) {
            const key = issue.path[0]
            if (key) {
                errors[key as keyof T] = issue.message as any
            }
        }

        return errors
    }
}

export const applyRoleBasedAccessRules = (
    baseSchema: ZodObject<any> | ZodEffects<ZodObject<any>>
) => {
    return baseSchema.superRefine((data, ctx) => {
        const { roleId, accessStoreIds, accessRegionIds } = data

        if (roleId === 'SC' && (!accessStoreIds || accessStoreIds.length === 0)) {
            ctx.addIssue({
                path: ['accessStoreIds'],
                message: 'Access store harus diisi jika role SC',
                code: z.ZodIssueCode.custom,
            })
        }

        if (roleId === 'AC' && (!accessRegionIds || accessRegionIds.length === 0)) {
            ctx.addIssue({
                path: ['accessRegionIds'],
                message: 'Access region harus diisi jika role AC',
                code: z.ZodIssueCode.custom,
            })
        }
    })
}