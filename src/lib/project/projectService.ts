import axiosInstance from "@/api/AxiosInstance";
import {
    CommonResponse,
    MoveSectionPayload,
    MoveTaskPayload,
    Project,
    ProjectDetail, Section,
    Task,
    TaskList, TaskPatch
} from "@/lib/project/projectTypes";


const baseURL = '/api/projects';

const ProjectService = {
    getOwnProject: async (): Promise<CommonResponse<Project[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    getProject: async (idProject:string): Promise<CommonResponse<ProjectDetail>> => {
        const {data} = await axiosInstance.get(`${baseURL}/${idProject}`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    getTask: async (idProject:string): Promise<CommonResponse<TaskList>> => {
        const {data} = await axiosInstance.get(`${baseURL}/${idProject}/tasks`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },
    updateTask: async (taskId: string, patch: TaskPatch): Promise<CommonResponse<Task>> => {
        const { data } = await axiosInstance.patch(`${baseURL}/task/${taskId}`, patch);
        if (data?.statusCode && data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message || 'Update failed');
        }
        return data;
    },
    moveSection: async (idProject: string, sectionId: string, payload: MoveSectionPayload): Promise<CommonResponse<Section>> => {
        const { data } = await axiosInstance.put(
            `${baseURL}/${idProject}/section/${sectionId}/move`,
            payload
        )
        if (data.statusCode !== 200 && data.statusCode !== 202) throw new Error(data.message)
        return data
    },
    moveTask: async (idProject: string, taskId: string, payload: MoveTaskPayload,) => {
        const { data } = await axiosInstance.put(
            `${baseURL}/${idProject}/task/${taskId}/move`,
            payload,
        )
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message)
        }
        return data
    },
    renameSection: async (projectId: string, sectionId: string, name: string) => {
        const res = await axiosInstance.patch(
            `${baseURL}/${projectId}/section/${sectionId}`,
            { name }
        );
        if (res.status < 200 || res.status >= 300) {
            const msg = (res.data)?.message ?? 'Rename section failed';
            throw new Error(msg);
        }
        return res.data;
    },
};

export default ProjectService;
