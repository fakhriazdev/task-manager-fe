
// types/task.ts

export interface Assignees {
    nik: string;
    name: string;
    assignedAt: Date;
}
export interface Task {
    section: string;
    id: string;
    name: string;
    desc:string | null;
    dueDate: string | null;
    creator:{nama:string};
    status: boolean;
    assignees: Assignees[] | null;
    comments?: number;
}

export interface TaskDetail {
    id: string;
    name: string;
    desc:string | null;
    dueDate: string | null;
    creator:{nama:string};
    status: boolean;
    assignees: Assignees[] | null;
    comments?: number;
}

export interface Section {
    id: string;
    name: string;
}
