import axiosInstance from "@/api/AxiosInstance";
import {
    AddSubTaskRequest, Attachment,
    CommonResponse, CreateProjectPayload, CreateTaskProjectRequest, DeleteSectionRequest, MemberRequest,
    MoveSectionPayload, MoveSubTaskPayload,
    MoveTaskPayload,
    Project,
    ProjectDetail, ProjectMemberResponse, Section,
    Task,
    TaskList, TaskPatch, UpdateProjectPayload, UpdateSubTaskRequest,
} from "@/lib/project/projectTypes";
import { AxiosRequestConfig } from "axios";


const baseURL = '/api/projects';

const ProjectService = {
    addProject:async (payload:CreateProjectPayload):Promise<CommonResponse<{ projectId:string }>> => {
        const {data} = await axiosInstance.post(baseURL, payload);
        if (data.statusCode !== 201 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },

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

    updateProjectById: async (idProject:string,payload:UpdateProjectPayload): Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.patch(`${baseURL}/${idProject}/update`,payload);
        if(data.statusCode !== 201 && data.statusCode !== 200){
            throw new Error(data.message);
        }
        return data;
    },
    deleteProjectById: async (idProject:string): Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.delete(`${baseURL}/${idProject}/delete`);
        if(data.statusCode !== 201 && data.statusCode !== 200){
            throw new Error(data.message);
        }
        return data;
    },

    //memberManagement
    syncMemberProject: async (
        idProject: string,
        members: MemberRequest[],
    ): Promise<CommonResponse<ProjectMemberResponse[]>> => {
        const { data } = await axiosInstance.patch(
            `${baseURL}/${idProject}/members`,
            { members },
        );

        if (data.statusCode !== 200) {
            throw new Error(data.message);
        }

        return data;
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
    deleteTask:async (taskId: string): Promise<CommonResponse<string>> => {
        const {data} = await axiosInstance.delete(`${baseURL}/tasks/${taskId}/delete`);
        if (data.statusCode !== 202 && data.statusCode !== 200) {
            throw new Error(data.message);
        }
        return data
    },

    //Attachments
    uploadTaskAttachmen: async (taskId: string, payload: FormData, config?: AxiosRequestConfig<FormData>,): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.post(`${baseURL}/tasks/${taskId}/attachments`,
            payload,
            config,
        );

            if (data.statusCode !== 200 && data.statusCode !== 202) {
                throw new Error(data.message);
            }
            return data;
        },
    getAttachmentsByTaskId: async (taskId:string): Promise<CommonResponse<Attachment[]>> => {
        const {data} = await axiosInstance.get(`${baseURL}/tasks/${taskId}/attachments`);
        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }
        return data;
    },

    deleteAttachmentByTaskId: async (
        taskId: string,
        ids: {id:string}[],
    ): Promise<CommonResponse<string>> => {
        const { data } = await axiosInstance.delete<CommonResponse<string>>(
            `${baseURL}/tasks/${taskId}/attachments`,
            {
                data: {
                    id: ids,
                },
            },
        );

        if (data.statusCode !== 200 && data.statusCode !== 202) {
            throw new Error(data.message);
        }

        return data;
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

    moveSubTask: async (subtaskId: string, payload: MoveSubTaskPayload): Promise<CommonResponse<{ id: string; rank?: string }>> => {
        const { data } = await axiosInstance.patch<CommonResponse<{ id: string; rank?: string }>>(`${baseURL}/subtask/${subtaskId}/move`, payload);
        return data;
    },

    syncSubTaskAssignees: async (
        taskId: string,
        subTaskId: string,
        assignees: { nik: string }[],
    ): Promise<CommonResponse<string>> => {
        const body = {
            assignees: assignees.map(a => ({ nik: a.nik.trim() })),
        };

        const { data } = await axiosInstance.patch<CommonResponse<string>>(
            `${baseURL}/tasks/${taskId}/subtasks/${subTaskId}/assignees`,
            body,
        );

        if (data.statusCode !== 200 && data.statusCode !== 201) {
            throw new Error(data.message);
        }

        return data;
    },
};

export default ProjectService;
