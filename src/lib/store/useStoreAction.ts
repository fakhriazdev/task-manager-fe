import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import {toast} from "sonner";
import {Store,CommonResponse} from "@/lib/store/storeTypes";
import StoreService from './storeService';

export function useStoreAction(): UseQueryResult<Store[], Error> {
    return useQuery({
        queryKey: ['stores'],
        queryFn: async () => {
            const response: CommonResponse<Store[]> = await StoreService.getStores();
            return response.data ?? [];
        },
    });
}

export function useUpdateStore(): UseMutationResult<CommonResponse<Store>, Error, { id: string; data: Store }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            return await StoreService.updateStore(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'], refetchType: 'active' });
            toast.success("Update Store Successfully!")
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}

export function useAddStore(): UseMutationResult<CommonResponse<Store[]>, Error, { data: Store }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }:{data:Store}) => {
            return await StoreService.addStore(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'], refetchType: 'active' });
            toast.success("Add Store Successfully!");
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}

export function useDeleteStore(): UseMutationResult<CommonResponse<string>, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }) => {
            return await StoreService.deleteStore(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stores'], refetchType: 'active' });
            toast.success("Delete store Successfully!");
        },
        onError: (error) => {
            toast.error(`${error.message}`);
        },
    });
}


