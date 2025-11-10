import axiosInstance from "@/api/AxiosInstance";
import {
    AddSubTaskRequest,
    CommonResponse, CreateTaskProjectRequest, DeleteSectionRequest,
    MoveSectionPayload, MoveSubTaskPayload,
    MoveTaskPayload,
    Project,
    ProjectDetail, Section,
    Task,
    TaskList, TaskPatch, UpdateSubTaskRequest,
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

    //task
    addTask:async (idProject:string,payload:CreateTaskProjectRequest):Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.post(`${baseURL}/${idProject}/task`,payload);
        if(data.statusCode !== 201 && data.statusCode !== 200){
            throw new Error(data.message);
        }
        return data;
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

    //section
    addSection: async (idProject:string,payload:{name:string}):Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.post(`${baseURL}/${idProject}/section`, payload);
        if (data.statusCode !== 201 && data.statusCode !== 200){
            throw new Error(data.message);
        }
        return data
    },
    deleteSection: async (idProject: string, payload: DeleteSectionRequest): Promise<CommonResponse<string>> => {
        const url = `${baseURL}/${encodeURIComponent(idProject)}/section/${encodeURIComponent(payload.sectionId)}`;

        const { data } = await axiosInstance.delete<CommonResponse<string>>(url, {
            params: { includeTask: payload.includeTask },
        });

        if (![200, 201].includes(data?.statusCode ?? 0)) {
            throw new Error(data?.message ?? 'Failed to delete section');
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

    //sub-task
    addSubTask: async (taskId: string, payload: AddSubTaskRequest): Promise<CommonResponse<{ id: string }>> => {
        const { data } = await axiosInstance.post<CommonResponse<{ id: string }>>(
            `${baseURL}/task/${taskId}/subtask`,
            payload
        )
        return data
    },
    updateSubTask: async (
        subtaskId: string,
        payload: UpdateSubTaskRequest
    ): Promise<CommonResponse<unknown>> => {
        const { data } = await axiosInstance.put<CommonResponse<unknown>>(
            `${baseURL}/subtask/${subtaskId}`,
            payload
        );
        return data;
    },

    deleteSubTask: async (
        subtaskId: string
    ): Promise<CommonResponse<null>> => {
        const { data } = await axiosInstance.delete<CommonResponse<null>>(
            `${baseURL}/subtask/${subtaskId}`
        );
        return data;
    },

    moveSubTask: async (
        subtaskId: string,
        payload: MoveSubTaskPayload
    ): Promise<CommonResponse<{ id: string; rank?: string }>> => {
        const { data } = await axiosInstance.patch<
            CommonResponse<{ id: string; rank?: string }>
        >(`${baseURL}/subtask/${subtaskId}/move`, payload);
        return data;
    },

};

export default ProjectService;
