import axiosInstance from "@/api/AxiosInstance";
import { CommonResponse } from "@/lib/roles/rolesTypes";
import {RepairTransaction, SummaryTicketByUser, TicketForm, TicketList} from "@/lib/ticket/TicketTypes";

const baseURL = "/api/tickets";

const ReportServices = {
    getTickets: async (): Promise<CommonResponse<TicketList[]>> => {
        const { data } = await axiosInstance.get(baseURL);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },

    getSummaryByUser: async (): Promise<CommonResponse<SummaryTicketByUser[]>> => {
        const { data } = await axiosInstance.get(`${baseURL}/summary`);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },

    getTicketByNik: async (nik:string): Promise<CommonResponse<TicketList[]>> => {
        const { data } = await axiosInstance.get(`${baseURL}/${nik}`);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },

    repairTransaction: async (
        payload: RepairTransaction
    ): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/repair-transaction`, payload);
        if (data.statusCode !== 200 && data.statusCode !== 201) {
            throw new Error(data.message);
        }
        return data;
    },

    addTicket: async (payload: TicketForm): Promise<CommonResponse<string>> => {
        const formData = new FormData();

        // required
        formData.append("idStore", payload.idStore);
        formData.append("noTelp", payload.noTelp);
        formData.append("category", payload.category);
        formData.append("description", payload.description);


        // optional → tetap kirim walau kosong
        formData.append("fromPayment", payload.fromPayment ?? "");
        formData.append("toPayment", payload.toPayment ?? "");
        formData.append("isDirectSelling", String(payload.isDirectSelling ?? false));
        formData.append("billCode", payload.billCode ?? "");
        formData.append("grandTotal", payload.grandTotal ?? "");

        // images
        Array.from(payload.images).forEach((file) => {
            formData.append("files", file);
        });

        // debug log isi formData
        // for (const [k, v] of formData.entries()) {
        //   console.log(k, v);
        // }

        const { data } = await axiosInstance.post(baseURL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.statusCode !== 200 && data.statusCode !== 201) {
            throw new Error(data.message);
        }
        return data;
    },

    ticketComplete: async (payload: { ticketId:string }):Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/complete`, payload);
        if (data.statusCode !== 200 && data.statusCode !== 201) {
            throw new Error(data.message);
        }
        return data;
    }
};

export default ReportServices;
