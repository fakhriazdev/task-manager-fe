"use client"

import * as React from "react"
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconLayoutColumns,
    IconSearch,
    IconX,
} from "@tabler/icons-react"
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    HeaderContext,
    RowSelectionState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

import DateRangePicker from "@/components/shared/DateRangePicker"
import type { DateRange } from "react-day-picker"
import { DataTableFacet } from "@/app/dashboard/ticket/components/DataTableFacet"
import { useTicketStore } from "@/lib/stores/useTicketStore"
import { TicketList } from "@/lib/ticket/TicketTypes"

interface DataTableProps<TData extends TicketList> {
    data: TData[]
    columns: ColumnDef<TData>[]
    getRowId?: (row: TData, index: number) => string
    defaultColumnVisibility?: VisibilityState
    onGlobalQueryChange?: (q: string) => void
    defaultGlobalQuery?: string
    autoFocusGlobalSearch?: boolean
    onSearchFocused?: () => void
}

export function getHeaderLabel<TData>(col: Column<TData, unknown> | undefined): string {
    if (!col) return ""
    const header = col?.columnDef?.header
    if (typeof header === "string") return header
    if (typeof header === "function") {
        try {
            const ctx = { column: col } as HeaderContext<TData, unknown>
            const rendered = header(ctx)
            if (typeof rendered === "string") return rendered
            if (React.isValidElement<{ children?: React.ReactNode }>(rendered) && rendered.props) {
                const { children } = rendered.props
                if (typeof children === "string") return children
                if (Array.isArray(children)) return children.filter((c) => typeof c === "string").join(" ")
            }
        } catch {
            return col?.id ?? ""
        }
    }
    return col?.id ?? ""
}

export function DataTableTicket<TData extends TicketList>({
                                                              data,
                                                              columns,
                                                              getRowId = (_, index) => index.toString(),
                                                              defaultColumnVisibility = {},
                                                              onGlobalQueryChange,
                                                              defaultGlobalQuery,
                                                              autoFocusGlobalSearch,
                                                              onSearchFocused,
                                                          }: DataTableProps<TData>) {
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(defaultColumnVisibility)
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 })

    // Global search
    const [globalFilter, setGlobalFilter] = React.useState<string>(defaultGlobalQuery ?? "")
    const searchInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (defaultGlobalQuery !== undefined && defaultGlobalQuery !== globalFilter) {
            setGlobalFilter(defaultGlobalQuery)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGlobalQuery])

    React.useEffect(() => {
        onGlobalQueryChange?.(globalFilter)
    }, [globalFilter, onGlobalQueryChange])

    React.useEffect(() => {
        if (autoFocusGlobalSearch && searchInputRef.current) {
            searchInputRef.current.focus({ preventScroll: true })
            onSearchFocused?.()
        }
    }, [autoFocusGlobalSearch, onSearchFocused])

    // ====== Detail open state (dari store) ======
    const open = useTicketStore((s) => s.open)
    const { setOpen, setCurrentRow } = useTicketStore()

    // Row selection: akan aktif hanya saat detail terbuka
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

    const openDetail = React.useCallback(
        (row: TData, rowId: string) => {
            setRowSelection({ [rowId]: true }) // tandai selected
            setCurrentRow(row)
            setOpen("detail")
        },
        [setCurrentRow, setOpen]
    )

    // Bersihkan selection ketika detail ditutup
    React.useEffect(() => {
        if (open !== "detail") setRowSelection({})
    }, [open])

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, columnFilters, pagination, globalFilter, rowSelection },
        getRowId,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        defaultColumn: {
            enableGlobalFilter: true,
        },
        enableRowSelection: true,
    })

    // Reset ke page 1 saat filter/sort/search berubah (tanpa mengubah selection;
    // selection akan diatur oleh state `open`)
    React.useEffect(() => {
        setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    }, [globalFilter, columnFilters, sorting])

    // Date range untuk kolom 'createdAt'
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
    const applyDateFilter = React.useCallback(
        (range: DateRange | undefined) => {
            setDateRange(range)
            table.getColumn("createdAt")?.setFilterValue(
                range
                    ? {
                        from: range.from ?? null,
                        to: range.to ?? range.from ?? null,
                    }
                    : undefined
            )
        },
        [table]
    )

    const clearDateFilter = React.useCallback(() => {
        setDateRange(undefined)
        table.getColumn("createdAt")?.setFilterValue(undefined)
    }, [table])

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 px-4 lg:px-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Global Search */}
                <div className="relative w-full lg:max-w-sm">
                    <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search…"
                        className="pl-8 pr-8"
                        value={globalFilter}
                        onChange={(e) => table.setGlobalFilter(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape" && globalFilter) table.setGlobalFilter("")
                        }}
                    />
                    {globalFilter ? (
                        <button
                            type="button"
                            onClick={() => table.setGlobalFilter("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/70 text-muted-foreground"
                            aria-label="Clear search"
                        >
                            <IconX className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                {/* Date Range + Columns */}
                <div className="flex items-center gap-2">
                    <DataTableFacet table={table} columnId="status" title="Status" maxChips={3} />
                    <DateRangePicker
                        value={dateRange}
                        onChange={applyDateFilter}
                        placeholder="Created Date"
                        align="end"
                        side="bottom"
                    />
                    {dateRange?.from && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearDateFilter}>
                            <IconX className="h-4 w-4" />
                            <span className="sr-only">Clear date filter</span>
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <IconLayoutColumns className="h-4 w-4" />
                                <span className="hidden lg:inline">View</span>
                                <span className="lg:hidden">Columns</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {getHeaderLabel(column)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => {
                                    const isSelected = !!table.getState().rowSelection[row.id]
                                    return (
                                        <TableRow
                                            key={row.id}
                                            role="button"
                                            tabIndex={0}
                                            data-state={isSelected ? "selected" : undefined}
                                            className={[
                                                "cursor-pointer hover:bg-muted/50 transition",
                                                isSelected ? "bg-primary/5 ring-1 ring-primary" : "",
                                            ].join(" ")}
                                            onDoubleClick={() => openDetail(row.original as TData, row.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault()
                                                    openDetail(row.original as TData, row.id)
                                                }
                                            }}
                                            // klik biasa tidak mengubah selection (supaya hanya aktif saat detail)
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex" />
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Rows per page
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 15, 20, 25, 30].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <IconChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <IconChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <IconChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <IconChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
