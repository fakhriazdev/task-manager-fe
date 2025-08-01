import axiosInstance from "@/api/AxiosInstance";
import {CommonResponse, LoginPayload, RegisterPayload, UserInfo} from "@/lib/auth/authTypes";


const baseURL = `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/`;

const AuthService = {
    login: async (user: LoginPayload):Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}login`, user);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data;
    },
    userInfo: async ():Promise<CommonResponse<UserInfo>> => {
        const { data } = await axiosInstance.get(`${baseURL}user-info`);
        // if (data.statusCode !== 202 && data.statusCode !== 200) {
        //     throw new Error(data.message);
        // }
        return data;
    },
    register: async (user: RegisterPayload):Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}register`, user);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data;
    },
    logout: async ():Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}logout`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data;
    },

};

export default AuthService;