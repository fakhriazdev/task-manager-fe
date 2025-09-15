import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO date string ke format lokal Indonesia
 * @param isoString ISO 8601 string (contoh: "2025-08-31T16:07:43.788Z")
 * @param withTime default true → tampilkan jam, menit, detik
 * @returns string tanggal terformat
 */
/**
 * Format ISO date string ke "YYYY-MM-DD HH:mm:ss"
 * @param isoString ISO 8601 string atau Date object
 * @returns string
 */
export function formatDateTime(isoString: string | Date): string {
  const date = typeof isoString === "string" ? new Date(isoString) : isoString

  const pad = (n: number) => n.toString().padStart(2, "0")

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // bulan 0-11
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

