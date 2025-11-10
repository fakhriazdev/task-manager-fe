import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type SizeKey = "sm" | "md" | "lg" | "xl"

type BrandedComponent<P = unknown> = React.ComponentType<P> & { __agItem: true };


const SIZE: Record<SizeKey, { avatar: string; space: string }> = {
    sm: { avatar: "h-6 w-6 text-[10px]", space: "-space-x-2" },
    md: { avatar: "h-8 w-8 text-xs", space: "-space-x-3" },
    lg: { avatar: "h-10 w-10 text-sm", space: "-space-x-3.5" },
    xl: { avatar: "h-12 w-12 text-base", space: "-space-x-4" },
}

const isAvatarGroupItem = (
    n: React.ReactNode
): n is React.ReactElement<AvatarGroupItemProps> => {
    if (!React.isValidElement(n)) return false
    const t = n.type as BrandedComponent
    return t === AvatarGroupItem || t.__agItem
}

function initials(name?: string) {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    const a = parts[0]?.[0] ?? ""
    const b = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (a + b).toUpperCase()
}

function formatCount(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 ? 1 : 0)}K`
    return String(n)
}

/* ============ Item ============ */
export type AvatarGroupItemProps = {
    id?: string | number
    name?: string
    src?: string
    alt?: string
    fallback?: string
    href?: string
    onClick?: (e: React.MouseEvent) => void
    className?: string
}

export function AvatarGroupItem({
                                    name,
                                    src,
                                    alt,
                                    fallback,
                                    href,
                                    onClick,
                                    className,
                                }: AvatarGroupItemProps) {
    const core = (
        <Avatar
            className={cn(
                "ring-2 ring-background shadow-sm transition-transform rounded-full",
                "hover:scale-[1.03] focus-visible:scale-[1.03]",
                className
            )}
            onClick={onClick}
        >
            {src ? <AvatarImage src={src} alt={alt ?? name ?? "avatar"} /> : null}
            <AvatarFallback className="bg-muted text-foreground/80">
                {fallback ?? initials(name)}
            </AvatarFallback>
        </Avatar>
    )
    return href ? (
        <a href={href} aria-label={name ?? alt}>{core}</a>
    ) : (
        core
    )
}

/* ============ Parent ============ */
export type AvatarGroupProps = {
    children: React.ReactNode
    max?: number
    size?: SizeKey
    label?: string
    reverse?: boolean
    className?: string
}

export function AvatarGroup({
                                children,
                                max = 3,
                                size = "md",
                                label = "Avatar group",
                                reverse = false,
                                className,
                            }: AvatarGroupProps) {
    const s = SIZE[size]

    // ambil hanya AvatarGroupItem
    const items = React.Children.toArray(children).filter(isAvatarGroupItem)


    const show = Math.max(0, Math.min(items.length, max))
    const rest = Math.max(0, items.length - show)
    const ordered = reverse ? [...items].reverse() : items

    // ==== KEY DIOLAH DI SINI (rapih di depan) ====
    const visible = ordered.slice(0, show).map((el, i) => {
        const p = el.props
        const k = String(p.id ?? p.name ?? i) // id → name → index
        return {
            key: k,
            node: React.cloneElement(el, {
                className: cn(s.avatar, el.props.className),
            }),
        }
    })

    return (
        <div
            className={cn("flex isolate", s.space, reverse && "flex-row-reverse", className)}
            aria-label={label}
        >
            {visible.map(({ key, node }) => (
                <div key={key} className="relative">
                    {node}
                </div>
            ))}

            {rest > 0 && (
                <div
                    className={cn(
                        s.avatar,
                        "rounded-full bg-muted text-foreground/90",
                        "flex items-center justify-center font-medium",
                        "ring-2 ring-background shadow-sm"
                    )}
                    aria-label={`+${formatCount(rest)} more`}
                >
                    +{formatCount(rest)}
                </div>
            )}
        </div>
    )
}
(AvatarGroupItem as BrandedComponent).__agItem = true
AvatarGroupItem.displayName = "AvatarGroupItem"
AvatarGroup.displayName = "AvatarGroup"

export default AvatarGroup
