'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTaskAttachmentsAction, useDeleteAttachmentAction } from '@/lib/project/projectAction';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    FileIcon,
    EllipsisVertical,
    Trash2,
    Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Attachment } from '@/lib/project/projectTypes';
import AttachmentForm from '@/components/shared/AttachmentForm';

type AttachmentListProps = {
    taskId: string;
};

export default function AttachmentList({ taskId }: AttachmentListProps) {
    const {
        data: attachments,
        isLoading,
        isError,
        error,
    } = useTaskAttachmentsAction(taskId);

    const deleteMutation = useDeleteAttachmentAction();

    const items = attachments ?? [];
    const [preview, setPreview] = useState<Attachment | null>(null);

    const handleCardClick = (att: Attachment) => {
        const isImage = att.mimeType?.startsWith('image/');
        if (isImage) {
            setPreview(att);
        } else {
            window.open(att.url, '_blank');
        }
    };

    const handleDelete = (attachmentId: string) => {
        deleteMutation.mutate({
            taskId,
            attachmentIds: [attachmentId],
        });
    };

    // skeleton loading
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-2 rounded-md border bg-card p-2"
                    >
                        <Skeleton className="h-16 w-full rounded-md" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertDescription className="text-xs">
                    Gagal memuat lampiran:{' '}
                    {error instanceof Error ? error.message : 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            {/* GRID ATTACHMENTS */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.length === 0 && (
                    <p className="col-span-3 md:col-span-4 lg:col-span-5 text-xs text-muted-foreground italic">
                        Belum ada lampiran untuk tugas ini.
                    </p>
                )}

                {items.map((att) => {
                    const isImage = att.mimeType?.startsWith('image/');

                    return (
                        <div
                            key={att.id}
                            className={cn(
                                'group flex flex-col gap-1 rounded-md border bg-card p-2 text-xs',
                                'hover:border-primary/60 hover:bg-accent/40 transition-colors',
                            )}
                        >
                            {/* area preview */}
                            <div
                                className="relative h-16 w-full rounded-md bg-muted overflow-hidden cursor-pointer"
                                onClick={() => handleCardClick(att)}
                            >
                                {isImage ? (
                                    <Image
                                        src={att.url}
                                        alt={att.filename}
                                        fill
                                        sizes="120px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <FileIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                )}

                                {/* hover dropdown pojok kanan atas */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                'absolute top-1 right-1 inline-flex items-center justify-center rounded-full',
                                                'bg-background/80 shadow-sm p-1',
                                                'opacity-0 group-hover:opacity-100 transition-opacity',
                                            )}
                                            onClick={(e) => e.stopPropagation()} // ⬅️ supaya klik icon nggak preview
                                        >
                                            <EllipsisVertical className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent side="bottom" align="end" className="w-36">
                                        {/* DOWNLOAD */}
                                        <DropdownMenuItem
                                            asChild
                                            onClick={(e) => {
                                                e.stopPropagation(); // ⬅️ mencegah buka preview
                                            }}
                                        >
                                            <a
                                                href={att.url}
                                                download={att.filename}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <Download className="h-3 w-3 text-primary" />
                                                <span>Download</span>
                                            </a>
                                        </DropdownMenuItem>

                                        {/* DELETE */}
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive flex items-center gap-2"
                                            disabled={deleteMutation.isPending}
                                            onClick={(e) => {
                                                e.stopPropagation(); // ⬅️ ini penting
                                                handleDelete(att.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            <span>Hapus</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* info text */}
                            <div className="mt-1">
                                <p className="line-clamp-2 break-all text-[11px] font-medium">
                                    {att.filename}
                                </p>
                                {att.mimeType && (
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        {att.mimeType}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}


                {/* Card upload di ujung grid */}
                {items.length !== 0 && (
                    <AttachmentForm taskId={taskId} />
                )}

            </div>

            {/* FULLSCREEN PREVIEW UNTUK IMAGE */}
            <Dialog
                open={!!preview}
                onOpenChange={(open) => {
                    if (!open) setPreview(null);
                }}
            >
                {preview && (
                    <DialogContent className="w-full bg-background/95 border-0 p-3">
                        <DialogTitle className="text-sm mb-2">Preview</DialogTitle>
                        <div className="relative w-full aspect-[4/3] md:aspect-video bg-black rounded-md overflow-hidden">
                            <Image
                                src={preview.url}
                                alt={preview.filename}
                                fill
                                sizes="100vw"
                                className="object-contain"
                            />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground break-all">
                            {preview.filename}
                        </p>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}
