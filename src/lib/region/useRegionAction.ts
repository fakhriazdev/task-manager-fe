import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import {Region} from "@/lib/region/regionType";
import RegionService from "@/lib/region/regionService";
import {toast} from "sonner";
import {CommonResponse} from "@/lib/store/storeTypes";

type ApiErrorResponse = {
    statusCode: number;
    message: string;
    error?: string;
};

interface ApiError extends Error {
    response?: {
        data?: ApiErrorResponse;
    };
}


export function useRegionAction(): UseQueryResult<Region[], Error> {
    return useQuery({
        queryKey: ['region'],
        queryFn: async () => {
            const response: CommonResponse<Region[]> = await RegionService.getRegions();
            return response.data ?? [];
        },
    });
}


export function useAddRegion(): UseMutationResult<CommonResponse<Region[]>, Error, { data: Region }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }:{data:Region}) => {
            return await RegionService.addRegion(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['region'], refetchType: 'active' });
            toast.success("Add Region Successfully!");
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}
export function useUpdateRegion(): UseMutationResult<CommonResponse<Region[]>, Error, { id: string; data: Region }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            return await RegionService.updateRegion(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['region'] });
            toast.success("Update Region Successfully!");
        },
        onError: (error) => {
            toast.error(`${error.message}`);
        },
    });
}

export function useDeleteRegion(): UseMutationResult<
    CommonResponse<Region>,
    ApiError,
    { id: string }
> {
    const queryClient = useQueryClient();

    return useMutation<CommonResponse<Region>, ApiError, { id: string }>({
        mutationFn: async ({ id }) => {
            return await RegionService.deleteRegion(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["region"] });
            toast.success("Delete Region Successfully!");
        },
        onError: (error) => {
            // Sekarang bisa akses response dengan aman
            const message =
                error.response?.data?.message ?? error.message ?? "Failed to delete region";
            toast.error(message);
        },
    });
}




