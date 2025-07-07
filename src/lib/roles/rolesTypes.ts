
export interface Roles {
    id: string ;
    nama: string;
}

export interface CommonResponse <T>{
    message: string;
    statusCode: number;
    data?: T;

}