"use client";

import * as React from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

import { useNavStore } from "@/lib/stores/useNavStore";
import { useUserContainsAction } from "@/lib/user/useUserAction";
import { useDebounce } from "@/utils/useDebaunce";
import { UserMinimal } from "@/lib/user/userType";
import {
    useNewProjectAction,
    useUpdateProjectAction,
} from "@/lib/project/projectAction";
import {
    CreateProjectPayload,
    EProjectRole,
    MemberProject,
    UpdateProjectPayload,
} from "@/lib/project/projectTypes";

/* ===========================================================
 *  Role
 * ===========================================================
 */

// Semua role yang mungkin datang dari backend (termasuk OWNER / creator)
const ROLE_VALUES = ["OWNER", "EDITOR", "READ"] as const;
export type TProjectRole = (typeof ROLE_VALUES)[number];

// Role yang boleh dipilih user di UI (tanpa OWNER)
const SELECTABLE_ROLES: TProjectRole[] = ["EDITOR", "READ"];

/* ===========================================================
 *  Schema
 * ===========================================================
 */

const ProjectMiniSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    desc: z.string().min(1, "Deskripsi tidak boleh kosong"),
    // status archive disimpan supaya tidak berubah waktu edit
    isArchive: z.boolean().default(false).optional(),
    members: z
        .array(
            z.object({
                nik: z.string().max(9, "NIK wajib"),
                nama: z.string(),
                projectRole: z.enum(ROLE_VALUES),
            }),
        )
        .default([])
        .optional(),
});

export type ProjectSchemas = z.infer<typeof ProjectMiniSchema>;

/* ===========================================================
 *  Helper: Zod -> Formik
 * ===========================================================
 */

function zodToFormikValidate<T extends z.ZodTypeAny>(schema: T) {
    return (values: unknown) => {
        const r = schema.safeParse(values);
        if (r.success) return {};
        const errs: Record<string, string> = {};
        for (const i of r.error.issues) {
            const key = i.path.join(".");
            if (!errs[key]) errs[key] = i.message;
        }
        return errs;
    };
}

/* ===========================================================
 *  Default values
 * ===========================================================
 */

const defaultProject: ProjectSchemas = {
    name: "",
    desc: "",
    isArchive: false,
    members: [],
};

/* ===========================================================
 *  Core Form Dialog (reusable)
 * ===========================================================
 */

type ProjectFormMode = "create" | "edit";

type ProjectFormDialogProps = {
    mode: ProjectFormMode;
    title: string;
    open: boolean;
    initialValues?: Partial<ProjectSchemas> | null;
    className?: string;
    submitting?: boolean;
    onSubmit: (values: ProjectSchemas) => Promise<void> | void;
    onClose: () => void;
};

function ProjectFormDialog({
                               mode,
                               title,
                               open,
                               initialValues,
                               className,
                               submitting,
                               onSubmit,
                               onClose,
                           }: ProjectFormDialogProps) {
    // merge default + initial (PASTI string untuk name & desc)
    const merged: ProjectSchemas = React.useMemo(
        () => ({
            ...defaultProject,
            ...(initialValues ?? {}),
            name: (initialValues?.name ?? defaultProject.name) || "",
            desc: (initialValues?.desc ?? defaultProject.desc) || "",
            members:
                (initialValues?.members ?? defaultProject.members) as ProjectSchemas["members"],
            isArchive: initialValues?.isArchive ?? defaultProject.isArchive,
        }),
        [initialValues],
    );

    // temp input untuk NIK & Role sebelum ditambahkan ke array
    const [nikTemp, setNikTemp] = React.useState("");
    const [roleTemp, setRoleTemp] = React.useState<TProjectRole>("EDITOR");
    const nikInputRef = React.useRef<HTMLInputElement>(null);

    // Debounce query nik untuk search anggota
    const debouncedNik = useDebounce(nikTemp, 300);
    const { data: suggestions = [], isFetching } = useUserContainsAction(debouncedNik, {
        enabled: debouncedNik.length >= 2,
    });

    // Map NIK -> name (untuk tampilan di card jika kebetulan ada di cache)
    const nameByNik = React.useMemo(() => {
        const m = new Map<string, string>();
        for (const u of suggestions as UserMinimal[]) m.set(u.nik, u.nama);
        return m;
    }, [suggestions]);

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="sm:max-w-lg bg-card">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <Formik<ProjectSchemas>
                    initialValues={merged}
                    validate={zodToFormikValidate(ProjectMiniSchema)}
                    enableReinitialize
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await onSubmit(values);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, touched, isSubmitting, values, setFieldValue }) => {
                        const currentMembers = Array.isArray(values.members) ? values.members : [];

                        // ➕ Tambah member by NIK (optional nama)
                        const addNik = (nikFromItem?: string, namaFromItem?: string) => {
                            const raw = (nikFromItem ?? nikTemp).trim();
                            if (!raw) return;

                            const existIdx = currentMembers.findIndex((m) => m.nik === raw);
                            const nama = (namaFromItem ?? nameByNik.get(raw) ?? "").trim();

                            if (existIdx >= 0) {
                                // update role; sekaligus isi nama bila sebelumnya kosong
                                const next = [...currentMembers];
                                next[existIdx] = {
                                    ...next[existIdx],
                                    projectRole: roleTemp,
                                    nama: next[existIdx].nama || nama,
                                };
                                setFieldValue("members", next);
                            } else {
                                setFieldValue("members", [
                                    ...currentMembers,
                                    { nik: raw, nama, projectRole: roleTemp },
                                ]);
                            }

                            setNikTemp("");
                            nikInputRef.current?.focus();
                        };

                        // ❌ Remove member by NIK
                        const removeNik = (nik: string) => {
                            setFieldValue(
                                "members",
                                currentMembers.filter((m) => m.nik !== nik),
                            );
                        };

                        // 🔁 Ubah role member di list (kecuali OWNER → read-only)
                        const handleChangeMemberRole = (nik: string, newRole: TProjectRole) => {
                            const next = currentMembers.map((m) =>
                                m.nik === nik ? { ...m, projectRole: newRole } : m,
                            );
                            setFieldValue("members", next);
                        };

                        const isBusy = submitting || isSubmitting;
                        const submitLabel =
                            mode === "create"
                                ? isBusy
                                    ? "Creating..."
                                    : "Create"
                                : isBusy
                                    ? "Saving..."
                                    : "Save changes";

                        return (
                            <Form className={className ?? "space-y-4"}>
                                <Accordion
                                    type="multiple"
                                    defaultValue={["general", "members"]}
                                    className="w-full"
                                >
                                    {/* === GENERAL === */}
                                    <AccordionItem value="general" className="border-none no-underline">
                                        <AccordionTrigger className="text-sm font-semibold no-underline hover:no-underline focus:no-underline [&[data-state=open]]:no-underline [&_*]:no-underline">
                                            <h1 className="text-xs text-white/50">General</h1>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-2 space-y-4">
                                            {/* Name */}
                                            <div className="grid gap-1.5">
                                                <label htmlFor="name" className="text-sm font-medium">
                                                    Name <span className="text-red-500">*</span>
                                                </label>
                                                <Field name="name">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Input
                                                            id="name"
                                                            placeholder="SpaceX Sprint"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                        />
                                                    )}
                                                </Field>
                                                {touched.name && errors.name && (
                                                    <p className="text-xs text-red-500">{errors.name}</p>
                                                )}
                                            </div>

                                            {/* Desc */}
                                            <div className="grid gap-1.5">
                                                <label htmlFor="desc" className="text-sm font-medium">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <Field name="desc">
                                                    {({ field }: FieldProps<string>) => (
                                                        <Textarea
                                                            id="desc"
                                                            rows={4}
                                                            placeholder="Guys hope to see you all there."
                                                            {...field}
                                                            value={field.value ?? ""}
                                                        />
                                                    )}
                                                </Field>
                                                {touched.desc && errors.desc && (
                                                    <p className="text-xs text-red-500">{errors.desc}</p>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* === MEMBERS === */}
                                    <AccordionItem value="members" className="border-none no-underline">
                                        <AccordionTrigger className="text-sm font-semibold no-underline hover:no-underline focus:no-underline [&[data-state=open]]:no-underline [&_*]:no-underline">
                                            <h1 className="text-xs text-white/50">Members</h1>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-2 space-y-3">
                                            {/* Input NIK + Select Role + Tambah + Suggestion dropdown */}
                                            <div className="flex items-start gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        ref={nikInputRef}
                                                        id="members-nik-input"
                                                        placeholder="Ketik NIK minimal 2 karakter…"
                                                        value={nikTemp}
                                                        onChange={(e) => setNikTemp(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                addNik();
                                                            }
                                                        }}
                                                    />

                                                    {/* suggestions dropdown */}
                                                    {debouncedNik.length >= 2 && (
                                                        <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-sm max-h-56 overflow-y-auto">
                                                            {isFetching && (
                                                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                                                    Searching…
                                                                </div>
                                                            )}
                                                            {!isFetching &&
                                                                (suggestions as UserMinimal[]).length === 0 && (
                                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                                        No matches
                                                                    </div>
                                                                )}
                                                            {(suggestions as UserMinimal[]).map((u) => (
                                                                <button
                                                                    key={u.nik}
                                                                    type="button"
                                                                    className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                                                                    onClick={() => addNik(u.nik, u.nama)}
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

                                                <Select
                                                    value={roleTemp}
                                                    defaultValue="EDITOR"
                                                    onValueChange={(v) => setRoleTemp(v as TProjectRole)}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue placeholder="Role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SELECTABLE_ROLES.map((r) => (
                                                            <SelectItem key={r} value={r}>
                                                                {r}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Button type="button" onClick={() => addNik()}>
                                                    Tambah
                                                </Button>
                                            </div>

                                            {/* List members as cards (scrollable) */}
                                            <div className="h-40 overflow-y-auto space-y-2">
                                                {currentMembers.length > 0 ? (
                                                    currentMembers.map((m) => {
                                                        const isOwner = m.projectRole === "OWNER";

                                                        return (
                                                            <div
                                                                key={m.nik}
                                                                className="w-full rounded-md border bg-muted/50 px-3 py-2 flex items-center justify-between gap-3"
                                                                title={`${m.nik} • ${m.projectRole}`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="w-full flex justify-between text-sm font-medium truncate items-center gap-2">
                                                                        <div className="min-w-0">
                                                                            <p className="truncate">
                                                                                {m.nama || "Tanpa nama"}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground truncate">
                                                                                {m.nik}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Role & actions */}
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {isOwner ? (
                                                                        // OWNER → badge read-only
                                                                        <span className="inline-flex items-center rounded bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500 border border-amber-500/60">
                                      OWNER
                                    </span>
                                                                    ) : (
                                                                        <Select
                                                                            value={m.projectRole}
                                                                            onValueChange={(v) =>
                                                                                handleChangeMemberRole(
                                                                                    m.nik,
                                                                                    v as TProjectRole,
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="w-[110px] h-8 text-xs">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {SELECTABLE_ROLES.map((r) => (
                                                                                    <SelectItem key={r} value={r}>
                                                                                        {r}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}

                                                                    {/* Tombol delete hanya kalau bukan OWNER */}
                                                                    {!isOwner && (
                                                                        <button
                                                                            type="button"
                                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted shrink-0"
                                                                            aria-label={`Hapus ${m.nik}`}
                                                                            onClick={() => removeNik(m.nik)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                            Belum ada anggota.
                          </span>
                                                )}
                                            </div>

                                            {/* Error members (jika ada) */}
                                            {errors.members && (
                                                <p className="text-xs text-red-500">Members tidak valid</p>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <DialogFooter className="gap-2 pt-2">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => onClose()}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isBusy}>
                                        {submitLabel}
                                    </Button>
                                </DialogFooter>
                            </Form>
                        );
                    }}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}

/* ===========================================================
 *  Wrapper: Add Project (create)
 * ===========================================================
 */

type AddProjectDialogProps = {
    open: boolean;
};

export function AddProjectDialog({ open }: AddProjectDialogProps) {
    const { closeDialog } = useNavStore();
    const createProject = useNewProjectAction();

    const handleSubmit = async (values: ProjectSchemas) => {
        const payload: CreateProjectPayload = {
            name: values.name.trim(),
            desc: values.desc,
            members:
                values.members?.map((m) => ({
                    nik: m.nik,
                    roleId: m.projectRole as EProjectRole,
                })) ?? [],
        };

        await createProject.mutateAsync(payload);
        closeDialog();
    };

    return (
        <ProjectFormDialog
            mode="create"
            title="Add Project"
            open={open}
            onSubmit={handleSubmit}
            submitting={createProject.isPending}
            onClose={closeDialog}
            initialValues={null}
        />
    );
}

/* ===========================================================
 *  Wrapper: Edit Project (update)
 * ===========================================================
 */

type EditProjectDialogProps = {
    open: boolean;
    project: {
        id: string;
        name: string | undefined;
        desc: string | undefined;
        isArchive: boolean;
        members: MemberProject[];
    };
};

export function EditProjectDialog({ open, project }: EditProjectDialogProps) {
    const { closeDialog } = useNavStore();
    const projectId = String(project.id);
    const updateProject = useUpdateProjectAction(projectId);

    const initialValues: Partial<ProjectSchemas> = React.useMemo(
        () => ({
            // pastikan string, bukan undefined
            name: project.name ?? "",
            desc: project.desc ?? "",
            // normalisasi status archive dari API ke field form
            isArchive: project.isArchive ?? false,
            members:
                project.members?.map((m) => ({
                    nik: m.nik,
                    nama: m.nama,
                    projectRole: (m.role as TProjectRole) ?? "READ",
                })) ?? [],
        }),
        [project],
    );

    const handleSubmit = async (values: ProjectSchemas) => {
        const payload: UpdateProjectPayload = {
            name: values.name.trim(),
            desc: values.desc,
            isArchive: values.isArchive ?? false,
            members:
                values.members?.map((m) => ({
                    nik: m.nik,
                    roleId: m.projectRole as EProjectRole,
                })) ?? [],
        };

        await updateProject.mutateAsync(payload);
        closeDialog();
    };

    return (
        <ProjectFormDialog
            mode="edit"
            title={`Edit Project ${project.name ?? ""}`}
            open={open}
            onSubmit={handleSubmit}
            submitting={updateProject.isPending}
            onClose={closeDialog}
            initialValues={initialValues}
        />
    );
}
