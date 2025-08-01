import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: "task-manager-sms6.onrender.com",
    withCredentials: true,
});

export default axiosInstance;
