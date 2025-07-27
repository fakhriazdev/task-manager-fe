
export interface User {
    nik: string ;
    nama: string;
    password: string;
    noTelp: string;
    email: string;
    roleId: string;
    statusActive:boolean
    accessStoreIds:AccessStores[]
    accessRegionIds:AccessRegions[]
}

export interface AccessStores {
    storeId: string;
}
export interface AccessRegions {
    regionId: string;
}

export interface CommonResponse <T>{
    message: string;
    statusCode: number;
    data?: T;

}