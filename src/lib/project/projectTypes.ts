//Payload
export type MoveSectionPayload = { beforeId?: string | null; afterId?: string | null }
export type MoveTaskPayload = { targetSectionId?: string | null; beforeId?: string | null; afterId?: string | null; };
export type MoveSubTaskPayload = { beforeId?: string | null; afterId?: string | null };
export type AssigneeInput = { nik: string; name: string }
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
    members: MemberProject[];
    activities:null;
}

//section & TaskItem
type Assignees = {
    nik: string;
    name: string;
    assignedAt: Date;
};

export interface Task {
    id: string
    section: string;
    name: string
    desc: string | null;
    dueDate: string | null;
    status: boolean;
    assignees: Assignees[] | null;
    creator: { nama: string };
    subTask: SubTask[];
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
}





