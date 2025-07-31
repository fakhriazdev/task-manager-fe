import {z} from "zod";

export const promosiSchema = z.object({
    id: z.string(),
    idStore: z.string().nonempty("ID is required"),
    brand: z.string().nonempty("Brand name is required"),
    keterangan: z.string().nonempty("Region is required"),
    potongan: z.string().nonempty("Address is required"),
    kelipatan: z.string().nonempty("Address is required"),
    startDate: z.string(),
    endDate: z.string(),
    status: z.boolean(),
})


export type Promosi = z.infer<typeof promosiSchema>