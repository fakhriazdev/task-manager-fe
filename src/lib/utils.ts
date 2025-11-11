import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


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

// utils/date.ts
export function formatDateTime2(isoString?: string | Date): string {
  if (!isoString) return ""
  const date = typeof isoString === "string" ? new Date(isoString) : isoString
  const now = new Date()

  const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()

  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)

  const isTomorrow =
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate()

  const diffMs = date.getTime() - now.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)

  if (sameDay) {
    if (diffMs > 0) {
      return diffHour > 0 ? `${diffHour} jam lagi` : `${diffMin} menit lagi`
    } else {
      const absMin = Math.abs(diffMin)
      const absHour = Math.floor(absMin / 60)
      return absHour > 0 ? `${absHour} jam lalu` : `${absMin} menit lalu`
    }
  }

  if (isTomorrow) {
    return "Besok"
  }

  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

/** true kalau sudah melewati waktu sekarang (OVERDUE) */
export function isOverdue(isoString?: string | Date): boolean {
  if (!isoString) return false
  const date = typeof isoString === "string" ? new Date(isoString) : isoString
  return date.getTime() < Date.now()
}




