//Payload

export type MoveSectionPayload = { beforeId?: string | null; afterId?: string | null }
export type MoveTaskPayload = { targetSectionId?: string | null; beforeId?: string | null; afterId?: string | null; };
export type MoveSubTaskPayload = { beforeId?: string | null; afterId?: string | null };
export type AssigneeInput = { nik: string }
export type TaskUpdateInput =
    | { type: 'rename'; id: string; name: string }
    | { type: 'setDesc'; id: string; desc: string | null }
    | { type: 'setDueDate'; id: string; dueDate: string | null }
    | { type: 'setStatus'; id: string; status: boolean }
    | { type: 'setAssignees'; id: string; assignees: AssigneeInput[] }
export type TaskPatch = Partial<{
    name: string
    desc: string | null
    dueDate: string | null   // ISO string atau null untuk clear
    status: boolean
    assignees: AssigneeInput[]
}>
export type UpdateProjectPayload = {
    name?: string
    desc?: string
    isArchive?: boolean;
    members?:{
        nik: string ;
        roleId: EProjectRole;
    }[]
}
//ui
export interface CommonResponse<T> {
    statusCode: number
    message: string
    data: T
}

//project
export interface Project {
    id:string;
    name: string ;
    color: string;
    isArchive: boolean;
}

export interface CreateProjectPayload {
    name: string ;
    desc: string ;
    members:{
        nik: string ;
        roleId: EProjectRole;
    }[]
}

//project Detail
export interface MemberProject {
    nik:string;
    role:string;
    nama:string;
}

export interface ProjectDetail {
    id:string;
    name: string ;
    desc: string;
    isArchive: boolean;
    members: MemberProject[];
    activities:null;
}

//section & TaskItem
export type Assignees = {
    nik: string;
    nama: string;
};
export type Attachment = {
    id:string;
    taskId:string;
    url:string;
    filename:string;
    mimeType:string;
}

export interface Task {
    id: string
    section: string;
    name: string
    desc: string | null;
    dueDate: string | null;
    status: boolean;
    assignees: Assignees[] | null;
    creator: { nama: string };
    subTask: SubTaskList[];
}

export interface Section {
    id: string
    name: string
    tasks: Task[]
}
export type DeleteSectionRequest ={
    sectionId: string
    includeTask: boolean
}

export interface TaskList {
    unlocated: Task[]
    sections: Section[]
}

export type UploadTaskAttachmentVariables = {
    taskId: string;
    files: File[];
    onProgress?: (percent: number) => void;
};
export type DeleteAttachmentVariables = {
    taskId: string;
    attachmentIds: string[];
};
export type CreateTaskProjectRequest = {
    name: string;
    tag?: string;
    desc?: string;
    section?: string;
};

//task-detail

export type AddSubTaskRequest = {
    name: string
    dueDate?: string | null
}

export type UpdateSubTaskRequest = {
    name?: string
    dueDate?: string | null
    status?: boolean | null
}

export type SubTask = {
    id: string
    name: string
    dueDate?: string | null
    status?: boolean | null
    rank?: string | null
    _isNew?: boolean
    assignees: Assignees[]
}

export type SubTaskList = {
    id: string
    name: string
    dueDate?: string | null
    status?: boolean | null
    rank?: string | null
    _isNew?: boolean
    assignees: Assignees[]
}

export enum EProjectRole {
    EDITOR = 'EDITOR',
    READ = 'READ',
    OWNER = 'OWNER',
}

export type MemberRequest = {
    nik: string;
    roleId: EProjectRole;
};

export type ProjectMemberResponse = {
    nik: string;
    nama: string;
};

export type OwnTaskList = {
    id: string;
    name: string;
    status: boolean;
    dueDate: Date | null;
    project: {
        id:string;
        name: string;
        color: string | null;
    };
};




