import { useRouter } from "next/navigation";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import AuthService from "@/lib/auth/authService";
import {CommonResponse, LoginPayload} from "@/lib/auth/authTypes";
import { toast } from "sonner";

export function useAuthActions() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setUser } = useAuthStore();

    const login = useMutation({
        mutationFn: async (payload: LoginPayload) => {
            const { callbackUrl, ...credentials } = payload;
            const res = await AuthService.login(credentials);
            return { ...res, callbackUrl };
        },
        onMutate: () => toast.loading("Logging in..."),
        onSuccess: async (res) => {
            toast.dismiss();
            if(res.statusCode !== 500){
                toast.success(res.message || "Login berhasil");
                const userRes = await AuthService.userInfo();
                setUser(userRes.data!);
                queryClient.setQueryData(['user-info'], userRes.data);
                router.push(res.callbackUrl || "/dashboard");
                router.push("/dashboard");
            }else {
                toast.error(res.message);
            }
        },
        onError: (err: Error) => {
            toast.dismiss();
            toast.error(err.message || "Login gagal");
        },
    });

    const logout = useMutation<CommonResponse<string>, Error, void>({
        mutationFn: AuthService.logout,
        onMutate: () => toast.loading("Logging out..."),
        onSuccess: (res) => {
            toast.dismiss();
            router.push("/login");
            toast.success(res.message || "Logged out");
        },
        onError: (err: Error) => {
            toast.dismiss();
            toast.error(err.message || "Logout gagal");
        },
    });

    return {
        login,
        logout,
    };
}
