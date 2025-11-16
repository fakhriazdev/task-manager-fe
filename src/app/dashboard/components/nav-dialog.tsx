"use client"

import * as React from "react"
import { useNavStore } from "@/lib/stores/useNavStore"
import { AddProjectDialog, EditProjectDialog } from "./AddOrEditProjectDialog"
import { ConfirmDialog } from "@/components/shared/confirmDialog"
import {
    useDeleteProjectAction,
    useUpdateProjectAction,
    useProjectDetailAction,
} from "@/lib/project/projectAction"
import { UpdateProjectPayload, MemberProject } from "@/lib/project/projectTypes"
import { Input } from "@/components/ui/input"

export function NavDialog() {
    const { open, currentProject, setOpen, setCurrentProject } = useNavStore()

    const projectId = currentProject?.id ? String(currentProject.id) : undefined
    const isProjectDialog = open === "project"
    const isArchiveDialog = open === "archive" || open === "restore"
    const isArchiving = open === "archive"
    const isDeleteDialog = open === "deleteProject"

    const updateMutation = useUpdateProjectAction(projectId)
    const deleteMutation = useDeleteProjectAction()

    // 🔍 Ambil detail project hanya kalau lagi buka dialog "project" + punya projectId (edit mode)
    const { data: projectDetail } = useProjectDetailAction(projectId, {
        enabled: !!projectId && isProjectDialog,
    })

    const [deleteConfirmText, setDeleteConfirmText] = React.useState("")

    if (!open) return null

    const handleClose = () => {
        setOpen(null)
        setCurrentProject(null)
        setDeleteConfirmText("")
    }

    const handleConfirmArchiveRestore = () => {
        if (!projectId) return

        const payload: UpdateProjectPayload = {
            isArchive: isArchiving,
        }

        updateMutation.mutate(payload, {
            onSettled: handleClose,
        })
    }

    const handleConfirmDelete = () => {
        if (!projectId) return

        deleteMutation.mutate(
            { projectId },
            {
                onSettled: handleClose,
            },
        )
    }

    const requiredPhrase = currentProject ? `Delete ${currentProject.name}` : ""
    const isDeleteDisabled =
        deleteMutation.isPending ||
        !requiredPhrase ||
        deleteConfirmText.trim() !== requiredPhrase


    const editProject: {
        id: string
        name: string | undefined
        desc: string | undefined
        isArchive: boolean
        members: MemberProject[]
    } | null =
        projectId && isProjectDialog && projectDetail
            ? {
                id: projectId,
                name: projectDetail.name,
                desc: projectDetail.desc,
                // pakai detail kalau ada, fallback ke currentProject
                isArchive:
                    typeof projectDetail.isArchive === "boolean"
                        ? projectDetail.isArchive
                        : currentProject?.isArchive ?? false,
                members: (projectDetail.members as MemberProject[]) ?? [],
            }
            : null

    return (
        <>
            {/* Create / Edit / Detail Project */}
            {isProjectDialog &&
                (projectId && editProject ? (
                    // EDIT / DETAIL mode
                    <EditProjectDialog open={true} project={editProject} />
                ) : (
                    // CREATE mode
                    <AddProjectDialog open={true} />
                ))}

            {/* Archive / Restore Dialog */}
            {isArchiveDialog && currentProject && (
                <ConfirmDialog
                    destructive={isArchiving}
                    open={true}
                    handleConfirm={handleConfirmArchiveRestore}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            handleClose()
                        }
                    }}
                    className="max-w-md"
                    title={
                        isArchiving
                            ? `Archive this project: ${currentProject.name}?`
                            : `Restore this project: ${currentProject.name}?`
                    }
                    desc={
                        <>
                            You are about to{" "}
                            <strong>{isArchiving ? "archive" : "restore"}</strong> project{" "}
                            <strong>{currentProject.name}</strong>.
                            <br />
                            This action will update the project status in the system.
                            <br />
                            Please confirm if you would like to continue.
                        </>
                    }
                    confirmText={
                        updateMutation.isPending
                            ? "Loading..."
                            : isArchiving
                                ? "Archive"
                                : "Restore"
                    }
                />
            )}

            {/* Delete Dialog – dengan input konfirmasi */}
            {isDeleteDialog && currentProject && (
                <ConfirmDialog
                    destructive={true}
                    open={true}
                    disabled={isDeleteDisabled}
                    isLoading={deleteMutation.isPending}
                    handleConfirm={handleConfirmDelete}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            handleClose()
                        }
                    }}
                    className="max-w-md"
                    title={`Delete this project: ${currentProject.name}?`}
                    desc={
                        <div className="space-y-4">
                            <div>
                                You are about to <strong>permanently delete</strong> project{" "}
                                <strong>{currentProject.name}</strong>.
                                <br />
                                This action cannot be undone and all related data may be removed
                                from the system.
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    To confirm, please type{" "}
                                    <code className="rounded bg-muted px-1 py-0.5 text-md text-red-500">
                                        {requiredPhrase}
                                    </code>{" "}
                                    below.
                                </p>
                                <Input
                                    autoFocus
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                />
                            </div>
                        </div>
                    }
                    confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
                />
            )}
        </>
    )
}
