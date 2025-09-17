//state
export interface UserInfo {
    nik: string ;
    nama: string;
    roleId: string;
}


//payload
export type LoginPayload = { nik: string; password: string; callbackUrl?: string; };
export type LogoutPayload = {callbackUrl?: string; };
export type RegisterPayload = { nik:string ,nama: string,password:string; no_telp: string; email: string };

//response
export interface CommonResponse <T>{
    message: string;
    statusCode: number;
    data?: T;

}