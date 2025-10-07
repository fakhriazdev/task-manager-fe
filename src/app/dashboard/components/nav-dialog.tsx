"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavStore } from "@/lib/stores/useNavStore"

export function NavDialog() {
    const { open, closeDialog } = useNavStore()

    if (!open) return null // tidak render apapun jika tidak ada modal aktif

    return (
        <Dialog open={!!open} onOpenChange={closeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {open === "projects" ? "Tambah Project" : "Tambah Icikiwir"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 text-sm text-muted-foreground">
                    {open === "projects"
                        ? "Isi form tambah project di sini..."
                        : "Isi form khusus Icikiwir di sini..."}
                </div>
            </DialogContent>
        </Dialog>
    )
}
