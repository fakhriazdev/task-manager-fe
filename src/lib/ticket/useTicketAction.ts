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
            return res.data ?? [];
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
            return res.data ?? []
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
            toast.success("Add Ticket Successfully!");
            if (res.callbackUrl != null) {
                router.push(res.callbackUrl);
            }
        },
        onError: (error) => {
            toast.error(error.message ?? "Failed to add ticket");
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

export function useCompleteTicket(): UseMutationResult<{ ticketId: string }, Error,
    { ticketId: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { ticketId: string }) => {
            console.log(payload,'param ')
            const res: CommonResponse<string> = await ReportServices.ticketComplete(payload);
            if (!res.data) {
                throw new Error("Complete ticket gagal: tidak ada data");
            }

            return { ticketId: res.data };
        },
        onMutate: () => {
            toast.loading("Menyelesaikan tiket...");
        },
        onSuccess: (res) => {
            toast.dismiss();
            toast.success(`Tiket ${res.ticketId} berhasil diselesaikan`);
            queryClient.invalidateQueries({
                queryKey: ["ticket"],
                refetchType: "active",
            });
        },
        onError: (error) => {
            toast.dismiss();
            toast.error(error.message ?? "Gagal menyelesaikan tiket");
        },
    });
}

