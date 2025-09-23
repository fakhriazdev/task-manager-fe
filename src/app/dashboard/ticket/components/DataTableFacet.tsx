"use client"

import * as React from "react"
import { Table as RTTable } from "@tanstack/react-table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

type FacetValue = { value: string; count: number }

interface DataTableFacetProps<TData> {
    table: RTTable<TData>
    columnId: string
    title: string
    placeholder?: string
    maxHeight?: number
    maxChips?: number
}

export function DataTableFacet<TData>({
                                          table,
                                          columnId,
                                          title,
                                          placeholder = title,
                                          maxHeight = 240,
                                          maxChips = 2,
                                      }: DataTableFacetProps<TData>) {
    const column = table.getColumn(columnId)
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    if (!column) return null

    const selected: string[] = (column.getFilterValue() as string[]) ?? []

    const map = column.getFacetedUniqueValues() as Map<string, number>
    const items: FacetValue[] = Array.from(map.entries())
        .map(([v, c]) => ({ value: String(v), count: c }))
        .sort((a, b) => a.value.localeCompare(b.value))

    const filtered = query
        ? items.filter((it) => it.value.toLowerCase().includes(query.toLowerCase()))
        : items

    const toggle = (val: string) => {
        const next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
        column.setFilterValue(next.length ? next : undefined)
    }

    const clear = () => column.setFilterValue(undefined)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-dashed justify-start"
                >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">{title}</span>

                    {selected.length > 0 && <span className="mx-2 h-4 w-px bg-border" aria-hidden />}

                    {selected.length > 0 && (
                        <div
                            className="flex items-center gap-1 overflow-hidden"
                            // penting: cegah Radix menutup/membuka popover saat interaksi di area chip
                            onPointerDown={(e) => e.preventDefault()}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {selected.slice(0, maxChips).map((v) => (
                                <Badge
                                    key={v}
                                    variant="secondary"
                                    className="px-2 py-0.5 text-xs rounded-md flex items-center gap-1"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    {v}
                                    {/* ⛔️ BUKAN <button> — pakai <span> supaya tidak nested button */}
                                    <span
                                        aria-label={`Remove ${v}`}
                                        className="inline-flex cursor-pointer"
                                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toggle(v)
                                        }}
                                    >
                    <X className="h-3 w-3 opacity-70 hover:opacity-100" />
                  </span>
                                </Badge>
                            ))}
                            {selected.length > maxChips && (
                                <Badge variant="secondary" className="px-2 py-0.5 text-xs rounded-md">
                                    +{selected.length - maxChips}
                                </Badge>
                            )}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-60 p-0" align="start">
                <div className="p-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="h-8"
                    />
                </div>

                <ScrollArea className="px-1" style={{ maxHeight }}>
                    <div className="py-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No items.</div>
                        ) : (
                            filtered.map((it) => {
                                const checked = selected.includes(it.value)

                                const onToggle = () => toggle(it.value)
                                const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        onToggle()
                                    }
                                }

                                return (
                                    <div
                                        key={it.value}
                                        role="menuitemcheckbox"
                                        aria-checked={checked}
                                        tabIndex={0}
                                        onClick={onToggle}
                                        onKeyDown={onKeyDown}
                                        className="w-full px-3 py-2 hover:bg-accent/50 flex items-center gap-2 cursor-pointer rounded"
                                    >
                                        {/* Radix Checkbox is a <button> – that's fine now because parent is a <div>, not a <button> */}
                                        <Checkbox
                                            checked={checked}
                                            // just visual; clicks are handled by parent container for bigger hit area
                                            onClick={(e) => e.preventDefault()}
                                            className="pointer-events-none"
                                        />
                                        <span className="flex-1 text-sm truncate">{it.value}</span>
                                        <span className="text-xs tabular-nums text-muted-foreground">{it.count}</span>
                                    </div>
                                )
                            })
                        )}

                    </div>
                </ScrollArea>

                <div className="flex items-center justify-between p-2 border-t">
                    <Button variant="ghost" size="sm" type="button" onClick={clear}>
                        Reset
                    </Button>
                    <Button size="sm" type="button" onClick={() => setOpen(false)}>
                        Done
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
