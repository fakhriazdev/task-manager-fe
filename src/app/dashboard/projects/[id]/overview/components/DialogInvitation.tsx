"use client"

import * as React from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Copy } from "lucide-react"
import { EProjectRole, MemberProject, MemberRequest } from "@/lib/project/projectTypes"
import { useUserContainsAction } from "@/lib/user/useUserAction"
import { useDebounce } from "@/utils/useDebaunce"
import type { UserMinimal } from "@/lib/user/userType"
import { useSyncMemberProjectAction } from "@/lib/project/projectAction"
import { useParams } from "next/navigation"

// ===== Types =====
export type DialogInvitationProps = {
    projectId?: string                // <- boleh optional, kita fallback ke URL
    projectName?: string
    members?: MemberProject[]
    defaultInviteRole?: Exclude<EProjectRole, "OWNER">
    onCopyLink?: () => void
    trigger?: React.ReactNode
}

// ===== UI bits =====
function RoleSelect({
                        value,
                        onChange,
                        className,
                    }: {
    value: Exclude<EProjectRole, "OWNER">
    onChange?: (r: Exclude<EProjectRole, "OWNER">) => void
    className?: string
}) {
    return (
        <Select
            value={value}
            onValueChange={(v) => onChange?.(v as Exclude<EProjectRole, "OWNER">)}
        >
            <SelectTrigger className={cn("h-8 w-[120px] justify-between", className)}>
                <SelectValue placeholder="Peran" />
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value={EProjectRole.EDITOR}>Editor</SelectItem>
                <SelectItem value={EProjectRole.READ}>Read</SelectItem>
            </SelectContent>
        </Select>
    )
}

export default function DialogInvitation(props: DialogInvitationProps) {
    const {
        projectId: propProjectId,
        projectName = "MEMBERSHIP",
        members: initialMembers,
        defaultInviteRole = EProjectRole.EDITOR,
        onCopyLink,
        trigger,
    } = props

    const params = useParams() as { id?: string; projectId?: string }

    // 🔹 projectId yang dipakai beneran
    const resolvedProjectId = React.useMemo(
        () =>
            propProjectId ??
            params.projectId ??
            params.id ??
            undefined,
        [propProjectId, params],
    )

    const [open, setOpen] = React.useState(false)

    // search input
    const [query, setQuery] = React.useState("")
    const [inviteRole, setInviteRole] =
        React.useState<Exclude<EProjectRole, "OWNER">>(defaultInviteRole)

    // local members state
    const [members, setMembers] = React.useState<MemberProject[]>(() =>
        (initialMembers ?? []).map((m) => ({
            ...m,
            role: m.role as EProjectRole,
        })),
    )

    // sync ketika props.members berubah
    React.useEffect(() => {
        setMembers(
            (initialMembers ?? []).map((m) => ({
                ...m,
                role: m.role as EProjectRole,
            })),
        )
    }, [initialMembers])

    // ==== base snapshot untuk cek dirty ====
    const baseMembers = React.useMemo(
        () =>
            (initialMembers ?? []).map((m) => ({
                nik: m.nik,
                role: m.role as EProjectRole,
            })),
        [initialMembers],
    )

    const isDirty = React.useMemo(() => {
        const normalize = (list: { nik: string; role: EProjectRole }[]) =>
            [...list]
                .filter((m) => m.nik && !String(m.nik).startsWith("tmp-"))
                .sort((a, b) => String(a.nik).localeCompare(String(b.nik)))
                .map((m) => `${m.nik}:${m.role}`)
                .join("|")

        const baseKey = normalize(baseMembers)
        const currentKey = normalize(
            members.map((m) => ({
                nik: m.nik,
                role: m.role as EProjectRole,
            })),
        )

        return baseKey !== currentKey
    }, [baseMembers, members])

    // ===== search user (NIK/nama) =====
    const debouncedQuery = useDebounce(query, 300)
    const {
        data: suggestions = [],
        isFetching,
    } = useUserContainsAction(debouncedQuery, {
        enabled: debouncedQuery.length >= 2,
    })

    const suggestionList = (suggestions as UserMinimal[]) ?? []

    const handleSelectSuggestion = (user: UserMinimal) => {
        setMembers((prev) => {
            if (prev.some((m) => m.nik === user.nik)) return prev
            return [
                {
                    nik: user.nik,
                    nama: user.nama,
                    role: inviteRole,
                },
                ...prev,
            ]
        })
        setQuery("")
    }

    function handleInviteManual() {
        const value = query.trim()
        if (!value) return

        const looksLikeNik = /^\d{3,}$/.test(value)

        setMembers((prev) => [
            {
                nik: looksLikeNik ? value : `tmp-${Date.now()}`,
                nama: value,
                email: value.includes("@") ? value : undefined,
                role: inviteRole,
                isGuest: !looksLikeNik,
            },
            ...prev,
        ])

        setQuery("")
    }

    function setRoleLocal(nik: MemberProject["nik"], role: Exclude<EProjectRole, "OWNER">) {
        setMembers((prev) =>
            prev.map((m) => (m.nik === nik ? { ...m, role } : m)),
        )
    }

    function removeLocal(nik: MemberProject["nik"]) {
        setMembers((prev) => prev.filter((m) => m.nik !== nik))
    }

    function copyLink() {
        navigator.clipboard?.writeText("https://app.example.com/p/123")
        onCopyLink?.()
    }

    // ====== Sync ke backend (TanStack mutation) ======
    const { mutateAsync: syncMembers, isPending } = useSyncMemberProjectAction()

    const handleSaveMembers = async () => {
        if (!resolvedProjectId) {
            console.error("No projectId resolved for DialogInvitation")
            return
        }

        try {
            const payloadMembers: MemberRequest[] = members
                .filter((m) => m.nik && !String(m.nik).startsWith("tmp-"))
                .map((m) => ({
                    nik: m.nik,
                    roleId: m.role as EProjectRole,
                }))

            await syncMembers({
                projectId: resolvedProjectId,
                members: payloadMembers,
            })

            setOpen(false)
        } catch (err) {
            console.error("SYNC MEMBERS ERROR", err)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline">Bagikan</Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[520px] p-0 bg-card max-h-[80vh] flex flex-col">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Bagikan {projectName}</DialogTitle>
                    <DialogDescription>
                        Undang orang atau atur akses ke proyek ini.
                    </DialogDescription>
                </DialogHeader>

                {/* Invite row */}
                <div className="w-full px-6 pt-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="invite-query" className="sr-only">
                                Undang dengan NIK / email
                            </Label>
                            <div className="w-full flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="invite-query"
                                        placeholder="Tambahkan anggota menurut NIK atau email..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full"
                                    />

                                    {debouncedQuery.length >= 2 && (
                                        <div className="absolute inset-x-0 top-full mt-1 rounded-md border bg-popover shadow-sm max-h-56 overflow-y-auto z-50">
                                            {isFetching && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                                    Searching…
                                                </div>
                                            )}

                                            {!isFetching && suggestionList.length === 0 && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                                    No matches
                                                </div>
                                            )}

                                            {suggestionList.map((u) => (
                                                <button
                                                    key={u.nik}
                                                    type="button"
                                                    className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                                                    onClick={() => handleSelectSuggestion(u)}
                                                    title={`${u.nik} • ${u.nama}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                            <span className="truncate">
                              <span className="font-medium">{u.nik}</span>{" "}
                                <span className="text-muted-foreground">
                                • {u.nama}
                              </span>
                            </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <RoleSelect
                                        value={inviteRole}
                                        onChange={setInviteRole}
                                        className="w-[100px]"
                                    />
                                    <Button onClick={handleInviteManual} disabled={!query.trim()}>
                                        Undang
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Members list header */}
                <div className="px-6 pb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Anggota</div>
                    {!resolvedProjectId && (
                        <span className="text-[10px] text-destructive">
              projectId tidak ditemukan (cek URL / props)
            </span>
                    )}
                </div>

                {/* Members list */}
                <ScrollArea className="px-6 flex-1">
                    <div className="space-y-1 pb-2">
                        {members.map((m) => {
                            const nama = m.nama ?? ""
                            const roleEnum = m.role as EProjectRole
                            const isOwner = roleEnum === EProjectRole.OWNER

                            const editableRole: Exclude<EProjectRole, "OWNER"> =
                                roleEnum === EProjectRole.EDITOR ? EProjectRole.EDITOR : EProjectRole.READ

                            const initials =
                                nama
                                    .trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map((p) => p[0] ?? "")
                                    .join("")
                                    .toUpperCase() || "?"

                            return (
                                <div
                                    key={String(m.nik)}
                                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/40"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="truncate leading-5">
                                                {nama || "Tanpa nama"}
                                            </div>
                                            {m.nik ? (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {m.nik}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOwner ? (
                                            <span className="inline-flex items-center rounded bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500 border border-amber-500/60">
                        OWNER
                      </span>
                                        ) : (
                                            <RoleSelect
                                                value={editableRole}
                                                onChange={(r) => setRoleLocal(m.nik, r)}
                                            />
                                        )}

                                        {!isOwner && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => removeLocal(m.nik)}
                                            >
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                <Separator className="my-4" />

                <DialogFooter className="px-6 pb-6 flex flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={copyLink}
                    >
                        <Copy className="h-4 w-4 mr-2" /> Salin tautan proyek
                    </Button>

                    <Button
                        onClick={handleSaveMembers}
                        disabled={isPending || !isDirty || !resolvedProjectId}
                    >
                        {isPending ? "Menyimpan..." : "Simpan perubahan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
