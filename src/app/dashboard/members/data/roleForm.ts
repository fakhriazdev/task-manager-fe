import { ZodSchema } from "zod"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { FormikErrors } from "formik"

export function roleForm<T extends Record<string, any>>(schema: ZodSchema<T>) {
    const validateSchema = toFormikValidationSchema(schema)

    return async (values: T): Promise<FormikErrors<T>> => {
        try {
            await validateSchema.validate(values, { abortEarly: false })
            return {}
        } catch (err: any) {
            const errors: FormikErrors<T> = {}
            if (err?.inner) {
                err.inner.forEach((validationError: any) => {
                    const path = validationError.path as keyof T
                    if (path) {
                        errors[path] = validationError.messagex
                    }
                })
            }
            return errors
        }
    }
}
