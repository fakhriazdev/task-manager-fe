
// types/task.ts

export interface Assignees {
    nik: string;
    nama: string;
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

export interface Section {
    id: string;
    name: string;
}
