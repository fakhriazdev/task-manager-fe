import { z } from 'zod'

// Role
export const roleSchema = z.object({
    id: z.string().nonempty("ID is required"),
    nama: z.string().nonempty("Role name is required"),
})

// Region
export const regionSchema = z.object({
    id: z.string().nonempty("Code is required"),
    region: z.string().nonempty("Region name is required"),
})

// Store
export const storeSchema = z.object({
    id: z.string().nonempty("ID is required"),
    brand: z.string().nonempty("Brand name is required"),
    regionId: z.string().nonempty("Region is required"),
    address: z.string().nonempty("Address is required"),
    statusActive: z.boolean(),
})

// Access ID Schema
export const accessStoresSchema = z.object({
    storeId: z.string().nonempty("Store ID is required"),
})

export const accessRegionSchema = z.object({
    regionId: z.string().nonempty("Region ID is required"),
})

// Shared Fields for User
const sharedUserSchemaFields = {
    nik: z.string().nonempty("NIK is required"),
    nama: z.string().nonempty("Nama is required"),
    noTelp: z.string().nonempty("No Telepon is required"),
    email: z.string().nonempty("Email is required"),
    roleId: z.string().nonempty("Role is required"),
    accessStoreIds: z.array(accessStoresSchema).default([]),
    accessRegionIds: z.array(accessRegionSchema).default([]),
    statusActive: z.boolean(),
}

// Create User Schema
export const UserSchema = z
    .object({
        password: z
            .string()
            .nonempty("Password is required")
            .min(8, "Password must be at least 8 characters long")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        ...sharedUserSchemaFields,
    })
    .superRefine((data, ctx) => {
        const storeRoles = ['SC', 'SPV', 'SPVJ', 'CASHIER']
        const regionRoles = ['AC']

        if (storeRoles.includes(data.roleId) && data.accessStoreIds.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['accessStoreIds'],
                message: 'Store access is required for this role',
            })
        }

        if (regionRoles.includes(data.roleId) && data.accessRegionIds.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['accessRegionIds'],
                message: 'Region access is required for this role',
            })
        }
    })

export const updateUserSchema = z
    .object({
        ...sharedUserSchemaFields,
    })
    .superRefine((data, ctx) => {
        const storeRoles = ['SC', 'SPV', 'SPVJ', 'CASHIER']
        const regionRoles = ['AC']

        if (storeRoles.includes(data.roleId) && data.accessStoreIds.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['accessStoreIds'],
                message: 'Store access is required for this role',
            })
        }

        if (regionRoles.includes(data.roleId) && data.accessRegionIds.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['accessRegionIds'],
                message: 'Region access is required for this role',
            })
        }
    })

// ✅ Type inference
export type User = z.infer<typeof UserSchema>
export type UserUpdate = z.infer<typeof updateUserSchema>
export type Region = z.infer<typeof regionSchema>
export type Store = z.infer<typeof storeSchema>
export type Role = z.infer<typeof roleSchema>
