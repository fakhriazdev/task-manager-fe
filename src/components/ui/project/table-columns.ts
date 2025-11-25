// lib/project/tableColumns.ts
export const TABLE_COLUMN_WIDTHS = {
    checkbox: '60px',      // Kolom 1: Checkbox/Icon
    name: '1fr',           // Kolom 2: Nama (flexible)
    assignee: '180px',     // Kolom 3: Assignee
    deadline: '150px',     // Kolom 4: Tenggat
    creator: '150px',      // Kolom 5: Creator
} as const;

// Total width untuk header "Nama" yang colspan 2
export const TABLE_HEADER_NAME_WIDTH = `calc(${TABLE_COLUMN_WIDTHS.checkbox} + ${TABLE_COLUMN_WIDTHS.name})`;

// Grid template untuk CSS Grid (jika diperlukan)
export const TABLE_GRID_TEMPLATE = `${TABLE_COLUMN_WIDTHS.checkbox} ${TABLE_COLUMN_WIDTHS.name} ${TABLE_COLUMN_WIDTHS.assignee} ${TABLE_COLUMN_WIDTHS.deadline} ${TABLE_COLUMN_WIDTHS.creator}`;