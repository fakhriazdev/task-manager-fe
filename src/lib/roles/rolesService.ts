import axiosInstance from "@/api/AxiosInstance";
import { Roles, CommonResponse } from "@/lib/roles/rolesTypes";

const baseURL = '/api/roles';

const RolesService = {
    // Get all roles
    getRoles: async (): Promise<CommonResponse<Roles[]>> => {
        const { data } = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },

    // Update role by ID
    updateRole: async (id: string, payload: Roles): Promise<CommonResponse<Roles[]>> => {
        const { data } = await axiosInstance.patch(`${baseURL}/update/${id}`, payload);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },

    // Add new role
    addRole: async (payload: Roles): Promise<CommonResponse<Roles[]>> => {
        const { data } = await axiosInstance.post(`${baseURL}/create`, payload);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },
    deleteRole: async (id: string): Promise<CommonResponse<null>> => {
        const { data } = await axiosInstance.delete(`${baseURL}/delete/${id}`);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },
};

export default RolesService;
