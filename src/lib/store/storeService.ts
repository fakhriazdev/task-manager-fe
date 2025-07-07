import axiosInstance from "@/api/AxiosInstance";
import {Store,CommonResponse} from "@/lib/store/storeTypes";



const baseURL = '/api/stores';

const StoreService = {
    getStores: async (): Promise<CommonResponse<Store[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    updateStore: async (id:string,datas:Store): Promise<CommonResponse<Store>> => {
        const {data} = await axiosInstance.patch(`${baseURL}/update/${id}`,datas);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    addStore: async (datas:Store): Promise<CommonResponse<Store[]>> => {
        const {data} = await axiosInstance.post(`${baseURL}/add`,datas);
        if (data.statusCode !== 201 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    deleteStore: async (id: string): Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.delete(`${baseURL}/delete/${id}`);
        if (data.statusCode !== 201 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    }

}



export default StoreService;