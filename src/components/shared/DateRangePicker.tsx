"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { IconCalendar, IconChevronDown } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"
import {
    endOfMonth,
    endOfToday,
    endOfWeek,
    format,
    startOfMonth,
    startOfToday,
    startOfWeek,
    subDays,
    subMonths,
} from "date-fns"

type PresetKey =
    | "today"
    | "yesterday"
    | "last7"
    | "thisWeek"
    | "lastWeek"
    | "thisMonth"
    | "lastMonth"
    | "all"

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
    {
        key: "today",
        label: "Today",
        getRange: () => ({ from: startOfToday(), to: endOfToday() }),
    },
    {
        key: "yesterday",
        label: "Yesterday",
        getRange: () => {
            const d = subDays(startOfToday(), 1)
            return { from: d, to: endOfToday() /* atau endOfDay(d) jika hanya 1 hari */ }
        },
    },
    {
        key: "last7",
        label: "Last 7 days",
        getRange: () => ({ from: subDays(startOfToday(), 6), to: endOfToday() }),
    },
    {
        key: "thisWeek",
        label: "This week",
        getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }),
    },
    {
        key: "lastWeek",
        label: "Last week",
        getRange: () => {
            const start = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })
            const end = endOfWeek(start, { weekStartsOn: 1 })
            return { from: start, to: end }
        },
    },
    {
        key: "thisMonth",
        label: "This month",
        getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    },
    {
        key: "lastMonth",
        label: "Last month",
        getRange: () => {
            const d = subMonths(new Date(), 1)
            return { from: startOfMonth(d), to: endOfMonth(d) }
        },
    },
    {
        key: "all",
        label: "All time",
        getRange: () => ({ from: undefined, to: undefined }),
    },
]

export interface DateRangePickerProps {
    value?: DateRange
    onChange?: (range: DateRange | undefined) => void
    className?: string
    placeholder?: string
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
}

export default function DateRangePicker({
                                            value,
                                            onChange,
                                            className,
                                            placeholder = "Select date range",
                                            align = "end",
                                            side = "bottom",
                                        }: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [range, setRange] = React.useState<DateRange | undefined>(value)

    React.useEffect(() => {
        setRange(value)
    }, [value])

    const apply = (r: DateRange | undefined) => {
        onChange?.(r)
        setOpen(false)
    }

    const clear = () => {
        setRange(undefined)
        onChange?.(undefined)
        setOpen(false)
    }

    const pickPreset = (key: PresetKey) => {
        const r = presets.find((p) => p.key === key)?.getRange()
        setRange(r)
        onChange?.(r)
        setOpen(false)
    }

    const label =
        range?.from
            ? range.to
                ? `${format(range.from, "dd MMM yyyy")} - ${format(range.to, "dd MMM yyyy")}`
                : `${format(range.from, "dd MMM yyyy")}`
            : placeholder

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("justify-start gap-2", className)}>
                    <IconCalendar className="h-4 w-4" />
                    <span className={cn(!range?.from && "text-muted-foreground")}>{label}</span>
                    <IconChevronDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" side={side} align={align}>
                <div className="grid gap-2 p-3 lg:grid-cols-[180px_1fr]">
                    {/* Preset kiri */}
                    <div className="flex lg:flex-col gap-2">
                        {presets.map((p) => (
                            <Button key={p.key} variant="ghost" size="sm" className="justify-start" onClick={() => pickPreset(p.key)}>
                                {p.label}
                            </Button>
                        ))}
                    </div>

                    {/* Calendar kanan (2 bulan) */}
                    <div className="rounded-md border">
                        <Calendar
                            mode="range"
                            numberOfMonths={2}
                            selected={range}
                            onSelect={(r) => setRange(r)}
                            // disabled={{ after: new Date() }} // optional: blokir masa depan
                            initialFocus
                        />
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={clear}>
                            Clear
                        </Button>
                        <Button size="sm" onClick={() => apply(range)}>
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
