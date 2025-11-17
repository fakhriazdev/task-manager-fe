// components/ui/AvatarList.tsx
"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type AvatarListItem = {
    nik: string;
    nama: string;
};

export type AvatarListProps = {
    items: AvatarListItem[] | null | undefined;
    maxVisible?: number; // default 3
    size?: "sm" | "md" | "lg"; // default "md"
    showExtra?: boolean; // default true
    className?: string;
    onItemClick?: (item: AvatarListItem) => void;
    renderTrigger?: React.ReactNode; // optional trigger button (e.g. + button)
};

// ===== Utils =====
const normNik = (v: unknown) => String(v ?? "").trim();

const initials = (n: string) => {
    if (!n) return "?";
    const p = n.trim().split(/\s+/);
    return (
        ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() ||
        p[0]?.[0]?.toUpperCase() ||
        "?"
    );
};

// Pastel color classes
const PASTEL_BG_CLASSES = [
    "bg-rose-500 text-rose-900",
    "bg-orange-500 text-orange-900",
    "bg-amber-500 text-amber-900",
    "bg-emerald-500 text-emerald-900",
    "bg-teal-500 text-teal-900",
    "bg-sky-500 text-sky-900",
    "bg-indigo-500 text-indigo-900",
    "bg-purple-500 text-purple-900",
    "bg-pink-500 text-pink-900",
];

function getPastelClassesFromKey(key: string) {
    if (!key) return PASTEL_BG_CLASSES[0];

    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }

    const idx = Math.abs(hash) % PASTEL_BG_CLASSES.length;
    return PASTEL_BG_CLASSES[idx];
}

function getPastelClassesForItem(item: AvatarListItem) {
    const key = normNik(item.nik) || item.nama || "?";
    return getPastelClassesFromKey(key);
}

// Size variants
const SIZE_VARIANTS = {
    sm: {
        avatar: "h-6 w-6",
        text: "text-[9px]",
        ring: "ring-1",
    },
    md: {
        avatar: "h-7 w-7",
        text: "text-[10px]",
        ring: "ring-2",
    },
    lg: {
        avatar: "h-9 w-9",
        text: "text-xs",
        ring: "ring-2",
    },
};

export function AvatarList({
                               items,
                               maxVisible = 3,
                               size = "md",
                               showExtra = true,
                               className,
                               onItemClick,
                               renderTrigger,
                           }: AvatarListProps) {
    const list = items ?? [];
    const visible = list.slice(0, maxVisible);
    const extra = Math.max(list.length - maxVisible, 0);

    const sizeClasses = SIZE_VARIANTS[size];
    const isClickable = !!onItemClick;

    // Kosong
    if (list.length === 0 && !renderTrigger) {
        return null;
    }

    return (
        <div className={cn("flex items-center -space-x-2", className)}>
            {/* Visible avatars */}
            {visible.map((item) => {
                const pastel = getPastelClassesForItem(item);
                return (
                    <Avatar
                        key={normNik(item.nik)}
                        className={cn(
                            sizeClasses.avatar,
                            sizeClasses.ring,
                            "ring-background border border-border",
                            isClickable && "cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                        )}
                        title={item.nama}
                        onClick={isClickable ? () => onItemClick(item) : undefined}
                    >
                        <AvatarFallback
                            className={cn(
                                sizeClasses.text,
                                "font-semibold uppercase",
                                pastel
                            )}
                        >
                            {initials(item.nama)}
                        </AvatarFallback>
                    </Avatar>
                );
            })}

            {/* Trigger button (e.g. + button for AssigneePicker) */}
            {renderTrigger}

            {/* Extra count badge */}
            {showExtra && extra > 0 && (
                <Avatar
                    className={cn(
                        sizeClasses.avatar,
                        sizeClasses.ring,
                        "ring-background"
                    )}
                    title={`+${extra} more`}
                >
                    <AvatarFallback className={cn(sizeClasses.text, "bg-muted")}>
                        +{extra}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}

// Export utility functions for reuse
export { initials, getPastelClassesFromKey, getPastelClassesForItem, normNik };