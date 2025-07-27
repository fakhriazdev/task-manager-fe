import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import {User,CommonResponse} from "@/lib/user/userType";
import UserService from "@/lib/user/userService";
import {UserUpdate} from "@/app/dashboard/members/schemas/schemas";
import {toast} from "sonner";
import userService from "@/lib/user/userService";



export function useUserAction(): UseQueryResult<User[], Error> {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response: CommonResponse<User[]> = await UserService.getUsers();
            return response.data ?? [];
        },
    });
}

export function useAddUser(): UseMutationResult<CommonResponse<string>, Error, User> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newUser: User) => {
            return await UserService.add(newUser);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
export function useUpdateUser(): UseMutationResult<CommonResponse<string>, Error, { nik: string; data: UserUpdate }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ nik, data }) => {
            return await userService.update(nik, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'active' });
            toast.success("Update User Successfully!")
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}

export function useResetPasswordUser(): UseMutationResult<CommonResponse<string>, Error, { nik: string }> {
    return useMutation({
        mutationFn: async ({ nik }) => {
            return await userService.resetPassword(nik);
        },
        onSuccess: () => {
            toast.success("Reset Password User Successfully!")
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}
