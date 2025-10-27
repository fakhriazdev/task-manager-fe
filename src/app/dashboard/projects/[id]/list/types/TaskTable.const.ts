// types/TaskTable.const.ts
export const TABLE_MIN_W = 'min-w-[880px]';

// Grid 3 kolom pakai CSS variables (bisa di-resize)
export const COLS_GRID =
    'grid grid-cols-3 items-stretch';

// Separator vertikal & horizontal (sedikit lebih tegas)
export const COL_SEP  = 'divide-x divide-border/80 bg-muted/50';
export const ROW_HSEP = 'border-b border-border/80 bg-muted/50';

// Header look
export const hdrBase =
    'text-[12px] uppercase tracking-wide text-primary bg-sidebar backdrop-blur';

export const initials = (s?: string) =>
    (s ?? '').trim().split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase?.() ?? '').join('') || 'U';
