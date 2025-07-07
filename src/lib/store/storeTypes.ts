
export interface Store {
    id: string ;
    brand: string;
    regionId: string;
    address: string;
    statusActive: boolean;
}

export interface CommonResponse <T>{
    message: string;
    statusCode: number;
    data?: T;

}