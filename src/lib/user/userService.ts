import axiosInstance from "@/api/AxiosInstance";
import {User, CommonResponse, NewUser} from "@/lib/user/userType";
import {UserUpdate} from "@/app/dashboard/members/schemas/schemas";

const baseURL = '/api/users';

const StoreService = {
    getUsers: async (): Promise<CommonResponse<User[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },

    add: async (payload: NewUser): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/add`, payload);
        console.log(data)
        if (data.statusCode !== 200 && data.statusCode !== 201) {
            throw new Error(data.message);
        }
        return data;
    },

    update: async (nik: string, payload: UserUpdate): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.patch(`${baseURL}/update/${nik}`, payload);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },
    resetPassword: async (nik: string): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.patch(`${baseURL}/reset-password/${nik}`);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    }
}



export default StoreService;