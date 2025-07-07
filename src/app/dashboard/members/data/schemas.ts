import { z } from 'zod'

export const roleSchema = z.object({
    id: z.string().nonempty("ID is required"),
    nama: z.string().nonempty("Role name is required"),
});

export const regionSchema = z.object({
    id: z.string().nonempty("Code is required"),
    region: z.string().nonempty("Region name is required"),
});

export const storeSchema = z.object({
    id: z.string().nonempty("ID is required"),
    brand: z.string().nonempty("Brand name is required"),
    regionId: z.string().nonempty("region is required"),
    address: z.string().nonempty("Adrdress is required"),
    statusActive:  z.boolean()
});

export const accessStoresSchema = z.object({
    storeId: z.string().nonempty("Store ID is required"),
});

export const accessRegionSchema = z.object({
    regionId: z.string().nonempty("Regions ID is required"),
});

export const userSchema = z.object({
    nik: z.string().nonempty("NIK is required"),
    nama: z.string().nonempty("Nama name is required"),
    noTelp: z.string().nonempty("No Telepon is required"),
    email: z.string().nonempty("Email is required"),
    roleId: z.string().nonempty("Role is required"),
    accessStores: z.array(accessStoresSchema).optional(),
    accessRegions: z.array(accessRegionSchema).optional(),
    statusActive:  z.boolean()
});

export type Region = z.infer<typeof regionSchema>
export type User = z.infer<typeof userSchema>
export type Store = z.infer<typeof storeSchema>
export type Role = z.infer<typeof roleSchema>
