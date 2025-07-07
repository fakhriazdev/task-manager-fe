import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import  RolesService  from './rolesService';
import type { Roles, CommonResponse } from '../roles/rolesTypes';
import {toast} from "sonner";

export function useRolesAction(): UseQueryResult<Roles[], Error> {
    return useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response: CommonResponse<Roles[]> = await RolesService.getRoles();
            return response.data ?? [];
        },
    });
}

export function useUpdateRole(): UseMutationResult<CommonResponse<Roles[]>, Error, { id: string; data: Roles }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            return await RolesService.updateRoles(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'], refetchType: 'active' });
            toast.success("Update Role Successfully!")
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}

export function useAddRole(): UseMutationResult<CommonResponse<Roles[]>, Error, { data: Roles }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }:{data:Roles}) => {
            return await RolesService.addRoles(data);
        },
        onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['roles'], refetchType: 'active' });
                toast.success("Add Role Successfully!");
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}

export function useDeleteRole(): UseMutationResult<CommonResponse<string>, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }) => {
            return await RolesService.deleteRole(id); // return type: CommonResponse<string>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'], refetchType: 'active' });
            toast.success("Delete Role Successfully!");
        },
        onError: (error) => {
            toast.error(`${error.message}`);
        },
    });
}


