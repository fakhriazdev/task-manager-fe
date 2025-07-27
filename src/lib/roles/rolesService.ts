import axiosInstance from "@/api/AxiosInstance";
import {Roles,CommonResponse} from "@/lib/roles/rolesTypes";


const baseURL = '/api/roles';

const RolesService = {
    getRoles: async (): Promise<CommonResponse<Roles[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
}



export default RolesService;