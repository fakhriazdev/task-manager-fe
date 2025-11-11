import {useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import {User, CommonResponse, NewUser, UpdatePassword, UserMinimal} from "@/lib/user/userType";
import UserService from "@/lib/user/userService";
import {UserUpdate} from "@/app/dashboard/members/schemas/schemas";
import {toast} from "sonner";
import userService from "@/lib/user/userService";
import {useRouter} from "next/navigation";



export function useUserAction(): UseQueryResult<User[], Error> {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response: CommonResponse<User[]> = await UserService.getUsers();
            return response.data ?? [];
        },
    });
}
export function useUserContainsAction(
    nik: string,
    opts?: { enabled?: boolean }
): UseQueryResult<UserMinimal[], Error> {
    return useQuery<UserMinimal[], Error>({
        queryKey: ["usersContains", nik],
        enabled: (!!nik && nik.length > 0) && (opts?.enabled ?? true),
        queryFn: async () => {
            const response: CommonResponse<UserMinimal[]> = await UserService.getUserContains(nik);
            return response.data ?? [];
        },
    });
}

export function useAddUser(): UseMutationResult<CommonResponse<string>, Error, NewUser> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newUser: NewUser) => {
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

export function useChangePasswordUser(): UseMutationResult<CommonResponse<string>, Error, UpdatePassword> {
    const router = useRouter();
    return useMutation({
        mutationFn: async ({ nik,currentPassword,newPassword }) => {
            return await userService.updatePassword({nik,currentPassword,newPassword});
        },
        onSuccess: () => {
            toast.success("Change Password Successfully!")
            router.push("login");
        },
        onError: (error) => {
            toast.error(`${error.message}`)
        },
    });
}