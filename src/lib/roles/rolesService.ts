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
    updateRoles: async (id:string,datas:Roles): Promise<CommonResponse<Roles[]>> => {
        const {data} = await axiosInstance.patch(`${baseURL}/update/${id}`,datas);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    addRoles: async (datas:Roles): Promise<CommonResponse<Roles[]>> => {
        const {data} = await axiosInstance.post(`${baseURL}/add`,datas);
        if (data.statusCode !== 201 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    deleteRole: async (id: string): Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.delete(`${baseURL}/delete/${id}`);
        if (data.statusCode !== 201 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    }

}



export default RolesService;