"use client";

import * as React from "react";
import { Formik, Form, Field } from "formik";
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
import {useUserContainsAction} from "@/lib/user/useUserAction";
import { useDebounce } from "@/utils/useDebaunce";
import { UserMinimal } from "@/lib/user/userType";
import {useNewProjectAction} from "@/lib/project/projectAction";
import { CreateProjectPayload } from "@/lib/project/projectTypes";


/* ===== Role enum (string literals) ===== */
export const ERoleProject = ["EDITOR", "READ"] as const;
export type TProjectRole = typeof ERoleProject[number];

/* ===== Zod schema (name, desc, members) ===== */
const ProjectMiniSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    desc: z.string().min(1, "Deskripsi tidak boleh kosong"),
    members: z
        .array(
            z.object({
                nik: z.string().max(9, "NIK wajib"),
                nama: z.string(),
                projectRole: z.enum(ERoleProject),
            })
        )
        .default([])
        .optional(),
});
export type ProjectSchemas = z.infer<typeof ProjectMiniSchema>;

/* ===== Adapter Zod -> Formik ===== */
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

/* ===== Default values ===== */
const project: ProjectSchemas = { name: "", desc: "", members: [] };

type Props = {
    title: string;
    initialValues?: Partial<ProjectSchemas>;
    className?: string;
    open: boolean;
};


/* ===== Form mini (name + desc + members) — FULLY CONTROLLED by prop `open` ===== */
export function AddOrEditProjectDialog({
                                           initialValues,
                                           className,
                                           open,
                                           title
                                       }: Props) {
    const merged = { ...project, ...initialValues };
    const { closeDialog } = useNavStore();
    const createProject = useNewProjectAction();
    // temp input untuk NIK & Role sebelum ditambahkan ke array
    const [nikTemp, setNikTemp] = React.useState("");
    const [roleTemp, setRoleTemp] = React.useState<TProjectRole>("EDITOR"); // default EDITOR
    const nikInputRef = React.useRef<HTMLInputElement>(null);

    // === Debounce query nik untuk search anggota ===
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
                if (!v) closeDialog();
            }}
        >
            <DialogContent className="sm:max-w-lg bg-card">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Isi nama, deskripsi, dan anggota (opsional).</DialogDescription>
                </DialogHeader>

                <Formik<ProjectSchemas>
                    initialValues={merged}
                    validate={zodToFormikValidate(ProjectMiniSchema)}
                    onSubmit={async (values, { setSubmitting }) => {
                        const payload: CreateProjectPayload = {
                            name: values.name.trim(),
                            desc: values.desc,
                            members: (values.members ?? []).map(m => ({
                                nik: m.nik,
                                role: m.projectRole,
                                nama: m.nama,
                            })),
                        };

                        try {
                            await createProject.mutateAsync(payload);
                            setSubmitting(false);
                            closeDialog();
                        } catch {
                            setSubmitting(false);
                        }
                    }}


                    enableReinitialize
                >
                    {({ errors, touched, isSubmitting, values, setFieldValue }) => {
                        const currentMembers = Array.isArray(values.members) ? values.members : [];

                        // ganti signature: terima nik + (opsional) nama
                        const addNik = (nikFromItem?: string, namaFromItem?: string) => {
                            const raw = (nikFromItem ?? nikTemp).trim();
                            if (!raw) return;

                            const existIdx = currentMembers.findIndex((m) => m.nik === raw);
                            const nama = (namaFromItem ?? nameByNik.get(raw) ?? "").trim(); // ambil dari suggestion map kalau ada

                            if (existIdx >= 0) {
                                // update role; sekaligus isi nama bila sebelumnya kosong
                                const next = [...currentMembers];
                                next[existIdx] = {
                                    ...next[existIdx],
                                    projectRole: roleTemp,
                                    nama: next[existIdx].nama || nama, // jangan timpa kalau sudah ada
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


                        const removeNik = (nik: string) => {
                            setFieldValue(
                                "members",
                                currentMembers.filter((m) => m.nik !== nik)
                            );
                        };

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
                                                <Field as={Input} id="name" name="name" placeholder="SpaceX Sprint" />
                                                {touched.name && errors.name && (
                                                    <p className="text-xs text-red-500">{errors.name}</p>
                                                )}
                                            </div>

                                            {/* Desc */}
                                            <div className="grid gap-1.5">
                                                <label htmlFor="desc" className="text-sm font-medium">
                                                    Description <span className="text-red-500">*</span>
                                                </label>
                                                <Field
                                                    as={Textarea}
                                                    id="desc"
                                                    name="desc"
                                                    rows={4}
                                                    placeholder="Guys hope to see you all there."
                                                />
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
                                                    {(debouncedNik.length >= 2) && (
                                                        <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-sm max-h-56 overflow-y-auto">
                                                            {isFetching && (
                                                                <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
                                                            )}
                                                            {!isFetching && (suggestions as UserMinimal[]).length === 0 && (
                                                                <div className="px-3 py-2 text-xs text-muted-foreground">No matches</div>
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
                                        <span className="text-muted-foreground">• {u.nama}</span>
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
                                                        {ERoleProject.map((r) => (
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
                                                    currentMembers.map((m) => (
                                                        <div
                                                            key={m.nik}
                                                            className="w-full rounded-md border bg-muted/50 px-3 py-2 flex items-center justify-between"
                                                            title={`${m.nik} • ${m.projectRole}`}
                                                        >
                                                            <div className="w-full">
                                                                <div className="w-full flex justify-between text-sm font-medium truncate items-center">
                                                                    <div className="min-w-0">
                                                                        <p className="truncate">{m.nama}</p>
                                                                        <p className="text-xs text-muted-foreground truncate">
                                                                            {m.nik}
                                                                        </p>
                                                                    </div>

                                                                    <span className="ml-2 inline-block rounded bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                                    {m.projectRole}
                                  </span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                                                aria-label={`Hapus ${m.nik}`}
                                                                onClick={() => removeNik(m.nik)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Belum ada anggota.</span>
                                                )}
                                            </div>

                                            {/* Error members (jika ada) */}
                                            {errors.members && (
                                                <p className="text-xs text-red-500">
                                                    {"Members tidak valid"}
                                                </p>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <DialogFooter className="gap-2 pt-2">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => closeDialog()}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting || createProject.isPending}>
                                        {createProject.isPending ? "creating..." : "create"}
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
