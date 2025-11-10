'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProjectStore } from '@/lib/stores/useProjectStore';
import { useCreateTaskAction } from '@/lib/project/projectAction';

type Props = {
    projectId: string;
};

export default function CreateTaskDialog({ projectId }: Props) {
    const open = useProjectStore(s => s.open);
    const setOpen = useProjectStore(s => s.setOpen);
    const currentRowId = useProjectStore(s => s.currentRowId);
    const setCurrentRow = useProjectStore(s => s.setCurrentRow);

    const qc = useQueryClient();
    const createTaskMutation = useCreateTaskAction(projectId);

    const [title, setTitle] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [err, setErr] = React.useState<string | null>(null);
    const submittingRef = React.useRef(false);

    const isOpen = open === 'createTask';
    const isBusy = createTaskMutation.isPending || submittingRef.current;

    const safeClose = React.useCallback(() => {
        setOpen(null);
        setCurrentRow(null);
        setErr(null);
        setTitle('');
        setDesc('');
        submittingRef.current = false;
    }, [setOpen, setCurrentRow]);

    const handleSubmit = React.useCallback(() => {
        if (!projectId) return;
        if (createTaskMutation.isPending || submittingRef.current) return;

        const sectionId = currentRowId || '';
        const name = title.trim();
        const d = desc.trim();
        if (!name || !sectionId) return;

        submittingRef.current = true;
        setErr(null);

        createTaskMutation.mutate(
            { name, section: sectionId, desc: d || undefined, beforeId: null, afterId: null },
            {
                onSuccess: () => safeClose(),
                onError: () => setErr('Gagal membuat task'),
                onSettled: () => {
                    submittingRef.current = false;
                    qc.invalidateQueries({ queryKey: ['tasks', projectId] });
                },
            }
        );
    }, [projectId, currentRowId, title, desc, createTaskMutation, qc, safeClose]);

    return (
        <Dialog
            open={isOpen}
    onOpenChange={(openNow) => (openNow ? setOpen('createTask') : safeClose())}
>
    <DialogContent className="sm:max-w-lg">
    <form
        className="contents"
    onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
    }}
>
    <DialogHeader>
        <DialogTitle>Tambah Task</DialogTitle>
    <DialogDescription>Task baru akan ditambahkan ke section ini.</DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-2">
    <div className="grid gap-2">
    <Label htmlFor="task-title">Judul</Label>
        <Input
    id="task-title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Mis. Setup CI, Implement fitur X"
    autoFocus
    maxLength={255}
    />
    </div>

    <div className="grid gap-2">
    <Label htmlFor="task-desc">Deskripsi (opsional)</Label>
        <Textarea
    id="task-desc"
    rows={4}
    value={desc}
    onChange={(e) => setDesc(e.target.value)}
    placeholder="Detail, acceptance criteria, link terkait..."
    maxLength={64}
    />
    </div>

    {err && <p className="text-sm text-destructive">{err}</p>}
        </div>

        <DialogFooter className="gap-2">
    <Button type="button" variant="outline" onClick={safeClose} disabled={isBusy}>
        Batal
        </Button>
        <Button type="submit" disabled={!title.trim() || isBusy} aria-busy={isBusy}>
        {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Simpan
        </Button>
        </DialogFooter>
        </form>
        </DialogContent>
        </Dialog>
    );
    }
