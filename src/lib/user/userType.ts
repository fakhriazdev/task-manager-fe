
export interface User {
    nik: string ;
    nama: string;
    noTelp: string;
    email: string;
    roleId: string;
    statusActive:boolean;
    handleWeb:boolean;
    accessStoreIds:AccessStores[]
    accessRegionIds:AccessRegions[]
}

export interface UserMinimal {
    nik: string ;
    nama: string;
}

export interface NewUser {
    nik: string ;
    nama: string;
    password: string;
    noTelp: string;
    email: string;
    roleId: string;
    statusActive:boolean
    handleWeb:boolean;
    accessStoreIds:AccessStores[]
    accessRegionIds:AccessRegions[]
}

export interface AccessStores {
    storeId: string;
}
export interface AccessRegions {
    regionId: string;
}

export interface UpdatePassword {
    nik: string ;
    currentPassword: string;
    newPassword: string;
}

export interface CommonResponse <T>{
    message: string;
    statusCode: number;
    data?: T;

}