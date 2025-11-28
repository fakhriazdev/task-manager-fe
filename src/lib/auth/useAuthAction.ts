'use client';

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import AuthService from "@/lib/auth/authService";
import type { CommonResponse, LoginPayload, UserInfo } from "@/lib/auth/authTypes";
import { toast } from "sonner";

const qk = {
    userInfo: () => ["user-info"] as const,
};

type ApiErrorLike = {
    response?: {
        status?: number;
        data?: {
            statusCode?: number;
        };
    };
    statusCode?: number;
    status?: number;
};

// helper: ambil status code dari berbagai bentuk error (axios dsb.)
function getStatusCode(err: unknown): number | null {
    if (!err || typeof err !== "object") return null;

    const e = err as ApiErrorLike;

    return (
        e.response?.data?.statusCode ??
        e.response?.status ??
        e.statusCode ??
        e.status ??
        null
    );
}
export function useAuthActions() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const userFromStore = useAuthStore((s) => s.user) as UserInfo | null;
    const setUser = useAuthStore((s) => s.setUser);

    // 🔹 1. Query user-info → single source of truth
    const userQuery = useQuery<UserInfo | null, Error>({
        queryKey: qk.userInfo(),
        queryFn: async () => {
            try {
                const res: CommonResponse<UserInfo> = await AuthService.userInfo();
                const data = res.data ?? null;

                // sync ke Zustand hanya kalau beda
                const current = useAuthStore.getState().user as UserInfo | null;
                const isSame = JSON.stringify(current) === JSON.stringify(data);
                if (!isSame) {
                    setUser(data);
                }

                return data;
            } catch (err) {
                const status = getStatusCode(err);

                // 401 / 403 → anggap belum login, bukan error fatal
                if (status === 401 || status === 403) {
                    const current = useAuthStore.getState().user;
                    if (current !== null) setUser(null);
                    return null;
                }

                throw err as Error;
            }
        },
        initialData: userFromStore ?? null,
        retry: (failureCount, error) => {
            const status = getStatusCode(error);
            if (status === 401 || status === 403) return false;
            return failureCount < 3;
        },
    });

    // 🔹 2. Login mutation
    type LoginResponse = CommonResponse<unknown> & { callbackUrl?: string };

    const login = useMutation<LoginResponse, Error, LoginPayload>({
        mutationFn: async (payload) => {
            const { callbackUrl, ...credentials } = payload;
            const res: CommonResponse<unknown> = await AuthService.login(credentials);
            return { ...res, callbackUrl };
        },
        onMutate: () => toast.loading("Logging in..."),
        onSuccess: async (res) => {
            toast.dismiss();

            if (res.statusCode !== 500) {
                toast.success(res.message || "Login berhasil");

                // cukup invalidasi → userQuery refetch & sync Zustand
                await queryClient.invalidateQueries({
                    queryKey: qk.userInfo(),
                    refetchType: "active",
                });

                router.push(res.callbackUrl || "/dashboard");
            } else {
                toast.error(res.message);
            }
        },
        onError: (err) => {
            toast.dismiss();
            toast.error(err.message || "Login gagal");
        },
    });

    // 🔹 3. Logout mutation
    const logout = useMutation<CommonResponse<string>, Error, void>({
        mutationFn: AuthService.logout,
        onMutate: () => toast.loading("Logging out..."),
        onSuccess: (res) => {
            toast.dismiss();

            // bersihin cache + store
            queryClient.removeQueries({ queryKey: qk.userInfo() });
            setUser(null);

            router.push("/login");
            toast.success(res.message || "Logged out");
        },
        onError: (err) => {
            toast.dismiss();
            toast.error(err.message || "Logout gagal");
        },
    });

    return {
        // actions
        login,
        logout,

        // user info + status
        user: userQuery.data,
        isUserLoading: userQuery.isLoading,
        isUserError: userQuery.isError,
        userQuery,
    };
}
