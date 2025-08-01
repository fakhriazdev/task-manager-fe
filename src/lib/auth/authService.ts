import axiosInstance from "@/api/AxiosInstance";
import {CommonResponse, LoginPayload, RegisterPayload, UserInfo} from "@/lib/auth/authTypes";


const baseURL = '/api/auth';

const AuthService = {
    login: async (user: LoginPayload): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/login/`, user);
        return data;
    },
    register: async (user: RegisterPayload): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/register/`, user);
        return data;
    },
    logout: async (): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/logout/`);
        return data;
    },
    userInfo: async (): Promise<CommonResponse<UserInfo>> => {
        const { data } = await axiosInstance.get(`${baseURL}/user-info/`);
        return data;
    },
};


export default AuthService;