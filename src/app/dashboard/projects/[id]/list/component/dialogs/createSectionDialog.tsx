'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProjectStore } from '@/lib/stores/useProjectStore';
import { useCreateSectionAction } from '@/lib/project/projectAction';

type Props = {
    projectId: string;
};

export default function CreateSectionDialog({ projectId }: Props) {
    const open = useProjectStore(s => s.open);
    const setOpen = useProjectStore(s => s.setOpen);

    const isOpen = open === 'createSection';

    const [name, setName] = React.useState('');
    const [err, setErr] = React.useState<string | null>(null);
    const submittingRef = React.useRef(false);

    const qc = useQueryClient();
    const createSectionMutation = useCreateSectionAction(projectId);

    const isBusy = createSectionMutation.isPending || submittingRef.current;

    const safeClose = React.useCallback(() => {
        setOpen(null);
        setErr(null);
        setName('');
        submittingRef.current = false;
    }, [setOpen]);

    const handleSubmit = React.useCallback(() => {
        if (!projectId) return;
        if (createSectionMutation.isPending || submittingRef.current) return;

        const trimmed = name.trim();
        if (!trimmed) return;

        setErr(null);
        submittingRef.current = true;

        createSectionMutation.mutate(
            { name: trimmed, beforeId: null, afterId: null },
            {
                onSuccess: () => safeClose(),
                onError: () => setErr('Gagal membuat bagan/section'),
                onSettled: () => {
                    submittingRef.current = false;
                    qc.invalidateQueries({ queryKey: ['tasks', projectId] });
                },
            }
        );
    }, [projectId, name, createSectionMutation, qc, safeClose]);

    return (
        <Dialog
            open={isOpen}
    onOpenChange={(openNow) => (openNow ? setOpen('createSection') : safeClose())}
>
    <DialogContent className="sm:max-w-md">
    <form
        className="contents"
    onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
    }}
>
    <DialogHeader>
        <DialogTitle>Buat Bagan/Section</DialogTitle>
    <DialogDescription>Section baru akan muncul pada daftar.</DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-2">
    <div className="grid gap-2">
    <Label htmlFor="sec-name">Nama bagan</Label>
    <Input
    id="sec-name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Mis. TO DO, IN PROGRESS, DONE"
    autoFocus
    maxLength={100}
    />
    </div>
    {err && <p className="text-sm text-destructive">{err}</p>}
        </div>

        <DialogFooter className="gap-2">
    <Button type="button" variant="outline" onClick={safeClose} disabled={isBusy}>
        Batal
        </Button>
        <Button type="submit" disabled={!name.trim() || isBusy} aria-busy={isBusy}>
        {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Simpan
        </Button>
        </DialogFooter>
        </form>
        </DialogContent>
        </Dialog>
    );
    }
