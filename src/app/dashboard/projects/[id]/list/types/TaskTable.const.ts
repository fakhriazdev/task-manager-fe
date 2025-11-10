// types/TaskTable.const.ts
export const TABLE_MIN_W = 'min-w-[880px]';


export const COLS_GRID = 'grid grid-cols-5 items-stretch';
export const COL_SEP  = 'divide-x divide-border/80';
export const ROW_HSEP = 'border-b border-border/80';

// Header look
export const hdrBase =
    'text-[12px] uppercase tracking-wide text-primary bg-sidebar backdrop-blur';

export const initials = (s?: string) =>
    (s ?? '').trim().split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase?.() ?? '').join('') || 'U';
