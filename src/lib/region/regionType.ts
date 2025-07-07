export interface Region {
    id: string
    region: string
}

export interface CommonResponse<T> {
    statusCode: number
    message: string
    data: T
}