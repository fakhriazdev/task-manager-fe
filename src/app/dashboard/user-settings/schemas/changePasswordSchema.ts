import * as Yup from 'yup'

export const changePasswordSchema = Yup.object({
    current: Yup.string()
        .required('Current password is required'),

    new: Yup.string()
        .min(6, 'New password must be at least 6 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character')
        .notOneOf([Yup.ref('current')], 'New password must be different from current')
        .required('New password is required'),

    confirm: Yup.string()
        .oneOf([Yup.ref('new')], 'Passwords must match')
        .required('Please confirm your new password'),
})

export type ChangePasswordValues = Yup.InferType<typeof changePasswordSchema>
