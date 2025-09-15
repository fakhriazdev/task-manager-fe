import {z, ZodType} from "zod";

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


export const seasonalSchema = z.object({
    product_code: z.string().min(1, 'product_code is required'),
    discount: z.union([z.string(), z.number()])
        .refine(val => !isNaN(Number(val)), { message: 'discount must be a number' }),
    start_date: z.string().min(1, 'start_date is required'),
    end_date: z.string().min(1, 'end_date is required'),
});
export type Seasonal = z.infer<typeof seasonalSchema>;

export const flashSaleSchema = z.object({
    sku: z.string().min(1, 'sku is required'),
    price: z.union([z.string(), z.number()])
        .refine(val => !isNaN(Number(val)), { message: 'price must be a number' }),
    flash_start: z.string().min(1, 'flash_start is required'),
    flash_end: z.string().min(1, 'flash_end is required'),
});
export type FlashSale = z.infer<typeof flashSaleSchema>;

export const regularSchema = z.object({
    product_code: z.string().min(1, 'product_code is required'),
    price: z.union([z.string(), z.number()])
        .refine(val => !isNaN(Number(val)), { message: 'price must be a number' }),
});
export type Regular = z.infer<typeof regularSchema>;

export const clearanceSchema = z.object({
    product_code: z.string().min(1, 'product_code is required'),
    clearance_price: z.union([z.string(), z.number()])
        .refine(val => !isNaN(Number(val)), { message: 'clearance_price must be a number' }),
    clearance_reason: z.string().min(1, 'clearance_reason is required'),
});
export type Clearance = z.infer<typeof clearanceSchema>;

// 2. Reusable Rule Type
export type ParsingRule<T> = {
    requiredFields: (keyof T)[];
    description: string;
    example: Record<keyof T, string>;
    schema: ZodType<T>;
};

// 3. Final Rules Record
export const PARSING_RULES = {
    'seasonal': {
        requiredFields: ['product_code', 'discount', 'start_date', 'end_date'],
        description: 'Seasonal promotions with time-based discounts',
        example: {
            product_code: 'PROD001',
            discount: '15',
            start_date: '2024-01-01',
            end_date: '2024-01-31',
        },
        schema: seasonalSchema,
    } satisfies ParsingRule<Seasonal>,

    'flash-sale': {
        requiredFields: ['sku', 'price', 'flash_start', 'flash_end'],
        description: 'Time-limited flash sales with special pricing',
        example: {
            sku: 'SKU001',
            price: '99.99',
            flash_start: '2024-01-15 10:00',
            flash_end: '2024-01-15 18:00',
        },
        schema: flashSaleSchema,
    } satisfies ParsingRule<FlashSale>,

    'regular': {
        requiredFields: ['product_code', 'price'],
        description: 'Regular price updates without time constraints',
        example: {
            product_code: 'PROD001',
            price: '149.99',
        },
        schema: regularSchema,
    } satisfies ParsingRule<Regular>,

    'clearance': {
        requiredFields: ['product_code', 'clearance_price', 'clearance_reason'],
        description: 'Clearance items with discounted pricing',
        example: {
            product_code: 'PROD001',
            clearance_price: '49.99',
            clearance_reason: 'End of season',
        },
        schema: clearanceSchema,
    } satisfies ParsingRule<Clearance>,
};

// 4. Optional Union Type
export type PromotionRow = Seasonal | FlashSale | Regular | Clearance;
export type Promosi = z.infer<typeof promosiSchema>