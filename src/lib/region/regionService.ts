import axiosInstance from "@/api/AxiosInstance";
import {CommonResponse, Region} from "@/lib/region/regionType";


const baseURL = '/api/regions';

const RegionService = {
    getRegions: async (): Promise<CommonResponse<Region[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },

    addRegion: async (datas:Region): Promise<CommonResponse<Region[]>> => {
        const {data} = await axiosInstance.post(`${baseURL}/add`,datas);
        if (data.statusCode !== 201 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },

    updateRegion: async (id:string,datas:Region): Promise<CommonResponse<Region[]>> => {
        const {data} = await axiosInstance.patch(`${baseURL}/update/${id}`,datas);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },


};

export default RegionService;
