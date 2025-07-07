import axiosInstance from "@/api/AxiosInstance";
import {User,CommonResponse} from "@/lib/user/userType";
const baseURL = '/api/users';

const StoreService = {
    getUsers: async (): Promise<CommonResponse<User[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
}



export default StoreService;