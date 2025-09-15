// src/lib/utils/currency.ts
export const unformatToDigits = (val: string): string => val.replace(/\D/g, "");

/**
 * Formats a numeric string/number into "Rp 1.234.567".
 * If empty/invalid → returns "Rp ".
 */
export const formatIDR = (
    val: string | number | null | undefined
): string => {
    const digits = String(val ?? "").replace(/\D/g, "");
    if (!digits) return "Rp ";
    const n = Number(digits);
    if (Number.isNaN(n)) return "Rp ";
    return `Rp ${n.toLocaleString("id-ID")}`;
};
