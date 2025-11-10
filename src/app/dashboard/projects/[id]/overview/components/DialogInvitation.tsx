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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Copy, ChevronDown } from "lucide-react"

// ===== Types =====
export type MemberRole = "viewer" | "commenter" | "editor" | "admin"
export type Member = {
    id: string | number
    name: string
    email?: string
    avatarUrl?: string
    role: MemberRole
    isGuest?: boolean
}

type Invite = {
    id: string | number
    name: string
    email: string
    code?: string // mis. 141183091
    status: "waiting" | "expired" | "accepted"
}

export type DialogInvitationProps = {
    projectName?: string
    members?: Member[]
    defaultInviteRole?: MemberRole
    onInvite?: (email: string, role: MemberRole) => void
    onChangeRole?: (memberId: Member["id"], role: MemberRole) => void
    onRemove?: (memberId: Member["id"]) => void
    onCopyLink?: () => void
    trigger?: React.ReactNode // custom trigger (e.g. "Add Assignee" row)
}

// ===== UI bits =====
function RoleSelect({
                        value,
                        onChange,
                        className,
                    }: {
    value: MemberRole
    onChange?: (r: MemberRole) => void
    className?: string
}) {
    return (
        <Select value={value} onValueChange={(v: MemberRole) => onChange?.(v)}>
            <SelectTrigger className={cn("h-8 w-[120px] justify-between", className)}>
                <SelectValue placeholder="Peran" />
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin proyek</SelectItem>
            </SelectContent>
        </Select>
    )
}

// Dummy data riwayat undangan (ganti dari API jika ada)
const invites: Invite[] = [
    { id: 1, name: "Taufan", email: "taufan@gmail.com", code: "141183091", status: "waiting" },
    { id: 2, name: "Joko", email: "joko@gmail.com", code: "141183091", status: "expired" },
]

export default function DialogInvitation(props: DialogInvitationProps) {
    const {
        projectName = "MEMBERSHIP",
        members: initialMembers,
        defaultInviteRole = "editor",
        onInvite,
        onChangeRole,
        onRemove,
        onCopyLink,
        trigger,
    } = props

    // state dialog
    const [open, setOpen] = React.useState(false)
    // state collapsible RIWAYAT (terpisah agar dialog tidak tertutup)
    const [invitesOpen, setInvitesOpen] = React.useState(true)

    const [email, setEmail] = React.useState("")
    const [inviteRole, setInviteRole] = React.useState<MemberRole>(defaultInviteRole)
    const [members, setMembers] = React.useState<Member[]>(
        initialMembers ?? [
            { id: 2, name: "Heru Baskoro", email: "heru.it@amscorp.co.id", avatarUrl: "/avatars/03.png", role: "admin" },
            { id: 3, name: "fakhriaz dev", email: "fakhriazdev@gmail.com", role: "editor", isGuest: true },
        ]
    )

    function handleInvite() {
        if (!email.trim()) return
        onInvite?.(email.trim(), inviteRole)
        // contoh: push ke ui lokal
        setMembers((prev) => [
            { id: `tmp-${Date.now()}`, name: email.trim(), email: email.trim(), role: inviteRole, isGuest: true },
            ...prev,
        ])
        setEmail("")
    }

    function setRoleLocal(id: Member["id"], role: MemberRole) {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
        onChangeRole?.(id, role)
    }

    function removeLocal(id: Member["id"]) {
        setMembers((prev) => prev.filter((m) => m.id !== id))
        onRemove?.(id)
    }

    function copyLink() {
        navigator.clipboard?.writeText("https://app.example.com/p/123")
        onCopyLink?.()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="outline">Bagikan</Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-card">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Bagikan {projectName}</DialogTitle>
                    <DialogDescription>Undang orang atau atur akses ke proyek ini.</DialogDescription>
                </DialogHeader>

                {/* Invite row */}
                <div className="px-6 pt-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="invite-email" className="sr-only">
                                Undang dengan email
                            </Label>
                            <div className="flex gap-2 justify-between">
                                <Input
                                    id="invite-email"
                                    placeholder="Tambahkan anggota menurut nik atau email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={cn("w-[180px]")}
                                />
                                <div className="flex gap-2">
                                    <RoleSelect value={inviteRole} onChange={setInviteRole} className={cn("w-[130px]")} />
                                    <Button onClick={handleInvite} disabled={!email.trim()}>
                                        Undang
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Riwayat Undangan (collapsible punya state sendiri) */}
                <Collapsible open={invitesOpen} onOpenChange={setInvitesOpen} className="px-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">Riwayat Undangan</div>
                        <Button variant="ghost" size="sm" className="gap-1" asChild>
                            <CollapsibleTrigger className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-1">{invites.length}</span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${invitesOpen ? "rotate-180" : ""}`}
                                />
                            </CollapsibleTrigger>
                        </Button>
                    </div>

                    <CollapsibleContent className="mt-2 space-y-1">
                        {invites.map((inv) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/40"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback>{inv.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="text-sm leading-5 truncate">{inv.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {inv.code ? `${inv.code} | ` : null}
                                            {inv.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        {inv.status === "waiting" && "waiting.."}
                                        {inv.status === "expired" && "expired"}
                                        {inv.status === "accepted" && "accepted"}
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                                        ⋯
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>

                <Separator className="my-1" />

                {/* Members ui */}
                <div className="px-6 pb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Anggota</div>
                    <Button variant="link" size="sm" className="px-0">
                        Kelola pemberitahuan
                    </Button>
                </div>

                <ScrollArea className="px-6" style={{ maxHeight: 320 }}>
                    <div className="space-y-1 pb-2">
                        {members.map((m) => (
                            <div
                                key={String(m.id)}
                                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/40"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className="h-8 w-8">
                                        {m.avatarUrl ? <AvatarImage src={m.avatarUrl} alt={m.name} /> : null}
                                        <AvatarFallback>
                                            {m.name
                                                .split(" ")
                                                .map((p) => p[0])
                                                .slice(0, 2)
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="truncate leading-5">{m.name}</div>
                                        {m.email ? (
                                            <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                                        ) : null}
                                    </div>
                                    {m.isGuest ? <Badge variant="secondary" className="ml-2">Tamu</Badge> : null}
                                </div>

                                <div className="flex items-center gap-2">
                                    <RoleSelect value={m.role} onChange={(r) => setRoleLocal(m.id, r)} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => removeLocal(m.id)}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <Separator className="my-4" />

                <DialogFooter className="px-6 pb-6 flex-col sm:flex-row sm:justify-between gap-3">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={copyLink}>
                        <Copy className="h-4 w-4 mr-2" /> Salin tautan proyek
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
