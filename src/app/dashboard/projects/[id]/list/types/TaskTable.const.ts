

export const initials = (s?: string) =>
    (s ?? '').trim().split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase?.() ?? '').join('') || 'U';
