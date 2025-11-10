import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult,} from "@tanstack/react-query";
import {CommonResponse} from "@/lib/roles/rolesTypes";
import {RepairTransaction, SummaryTicketByUser, TicketFormPayload, TicketList} from "@/lib/ticket/TicketTypes";
import ReportServices from "@/lib/ticket/ticketService";
import {toast} from "sonner";
import {useRouter} from "next/navigation";


export function useTicketActions() {
    return useQuery<TicketList[], Error>({
        queryKey: ["ticket"],
        queryFn: async () => {
            const res = await ReportServices.getTickets();
            const data = res.data ?? [];
            // sort ascending by createdAt
            return data.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        },
    });
}
export function useSummaryTicketByUser() {
    return useQuery<SummaryTicketByUser[], Error>({
        queryKey: ["summary"],
        queryFn: async () => {
            const res = await ReportServices.getSummaryByUser();
            return res.data ?? [];
        },
    });
}

export function useTicketByNikActions(
    nik: string
): UseQueryResult<TicketList[], Error> {
    return useQuery<TicketList[], Error>({
        queryKey: ["ticketByNik", nik],
        queryFn: async () => {
            const res = await ReportServices.getTicketByNik(nik)
            const data = res.data ?? [];
            return data.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        },
        enabled: !!nik, // nggak jalan kalau nik kosong
    })
}

// ADD ticket
export function useAddTicket(): UseMutationResult<{ ticketId: string; callbackUrl?: string }, Error, TicketFormPayload> {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (form: TicketFormPayload) => {
            const { callbackUrl, payload } = form;
            const res: CommonResponse<string> = await ReportServices.addTicket(payload);
            if (!res.data) {
                throw new Error("Response tidak memiliki data ticket id");
            }
            return { ticketId: res.data, callbackUrl };
        },
        onMutate: () => toast.loading("Creating Ticket..."),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["ticket"], refetchType: "active" });
            // toast.success("Add Ticket Successfully!");
            toast.dismiss();
            toast.success(
                "Ticket berhasil dibuat!",

                {
                    toasterId: 'middle',
                    description:"Silahkan Check Ticket anda di List Ticket",
                    duration: 20000,
                }
            );
            if (res.callbackUrl != null) {
                router.push(res.callbackUrl);
            }
        },
        onError: () => {
            toast.dismiss();
            toast.error(
                "Gagal Membuat Ticket",

                {
                    toasterId: 'middle',
                    description: "Silahkan Coba kembali",
                    duration: 20000,
                }
            );
        },
    });
}

export function useRepairTransaction(): UseMutationResult<
    string,
    Error,
    RepairTransaction
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: RepairTransaction) => {
            const res: CommonResponse<string> = await ReportServices.repairTransaction(payload);

            if (!res.data) {
                throw new Error("Repair transaction gagal: tidak ada data");
            }

            return res.data;
        },
        onMutate: () => {
            toast.loading("Sending repair request...");
        },
        onSuccess: (message) => {
            queryClient.invalidateQueries({ queryKey: ["ticket"], refetchType: "active" });
            toast.dismiss();
            toast.success(message ?? "Repair request sent successfully!");
        },
        onError: (error) => {
            toast.dismiss();
            toast.error(error.message ?? "Failed to send repair request");
        },
    });
}

export function useCompleteTicket(): UseMutationResult<
    { ticketId: string },
    Error,
    { ticketId: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { ticketId: string }) => {
            const res: CommonResponse<string> = await ReportServices.ticketComplete(payload);
            if (!res.data) throw new Error("Complete ticket gagal: tidak ada data");
            return { ticketId: res.data };
        },

        onMutate: () => {
            toast.loading("Menyelesaikan tiket...");
        },

        onSuccess: async (res) => {
            // tandai stale SEMUA query terkait
            await queryClient.invalidateQueries({ queryKey: ["ticket"], refetchType: "all" });
            await queryClient.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "ticketByNik",
                refetchType: "all",
            });
            await queryClient.invalidateQueries({ queryKey: ["summary"], refetchType: "all" });

            // langsung refetch sekarang (tanpa nunggu mount/focus)
            await queryClient.refetchQueries({ queryKey: ["ticket"] });
            await queryClient.refetchQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "ticketByNik",
            });
            await queryClient.refetchQueries({ queryKey: ["summary"] });

            toast.dismiss();
            toast.success(`Tiket ${res.ticketId} berhasil diselesaikan`);
        },

        onError: (error) => {
            toast.dismiss();
            toast.error(error.message ?? "Gagal menyelesaikan tiket");
        },
    });
}

export function usePendingTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { ticketId: string; reason: string }) => {
            const res = await ReportServices.ticketPending(payload)
            if (!res.data) throw new Error("Pending ticket gagal: tidak ada data")
            return {ticketId: res.data}
        },

        onMutate: () => {
            toast.loading("Sedang melakukan pending tiket...")
        },

        onSuccess: async (res) => {
            // tandai stale SEMUA query terkait
            await queryClient.invalidateQueries({queryKey: ["ticket"], refetchType: "all"});
            await queryClient.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "ticketByNik",
                refetchType: "all",
            });
            await queryClient.invalidateQueries({queryKey: ["summary"], refetchType: "all"});

            // langsung refetch sekarang (tanpa nunggu mount/focus)
            await queryClient.refetchQueries({queryKey: ["ticket"]});
            await queryClient.refetchQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "ticketByNik",
            });
            await queryClient.refetchQueries({queryKey: ["summary"]});

            toast.dismiss();
            toast.success(`Tiket ${res.ticketId} berhasil diPending`);
        },

        onError: (error) => {
            toast.dismiss()
            toast.error(error.message ?? "Gagal pending tiket")
        },
    })
}

export function useReassignTicket(): UseMutationResult<
    string,
    Error,
    { ticketId: string; nik: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const res: CommonResponse<string> = await ReportServices.reassignTicket(payload);
            if (!res.data) throw new Error("Gagal reassign tiket: tidak ada data dari server");
            return res.data; // contoh: "OK" atau ticketId
        },

        onMutate: async ({ ticketId, nik }) => {
            toast.dismiss();
            toast.loading("Mengalihkan handler tiket...");

            // 🔄 Optimistic update untuk ui ["ticket"]
            await queryClient.cancelQueries({ queryKey: ["ticket"] });
            const prevTickets = queryClient.getQueryData<TicketList[]>(["ticket"]);

            if (prevTickets) {
                queryClient.setQueryData<TicketList[]>(["ticket"], (old) =>
                    (old ?? []).map((t) =>
                        t.id === ticketId
                            ? { ...t, handler: { nik, nama: t.handler?.nama ?? nik } }
                            : t
                    )
                );
            }

            return { prevTickets }; // kembalikan untuk rollback jika error
        },

        onSuccess: async () => {
            // ✅ Invalidate daftar tiket umum
            await queryClient.invalidateQueries({ queryKey: ["ticket"], refetchType: "active" });

            // ✅ Invalidate semua query ticketByNik apapun param-nya (nik lama/baru)
            await queryClient.invalidateQueries({
                predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "ticketByNik",
                refetchType: "active",
            });

            // ✅ Invalidate ringkasan per user
            await queryClient.invalidateQueries({ queryKey: ["summary"], refetchType: "active" });

            toast.dismiss();
            toast.success("Tiket berhasil dialihkan");
        },

        onError: (error, _vars, ctx) => {
            // ♻️ Rollback optimistic jika perlu
            if (ctx?.prevTickets) {
                queryClient.setQueryData(["ticket"], ctx.prevTickets);
            }
            toast.dismiss();
            toast.error(error.message ?? "Gagal mengalihkan tiket");
        },
    });
}