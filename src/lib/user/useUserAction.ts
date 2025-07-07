import { useQuery, UseQueryResult } from '@tanstack/react-query';


import {User,CommonResponse} from "@/lib/user/userType";
import UserService from "@/lib/user/userService";


export function useUserAction(): UseQueryResult<User[], Error> {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response: CommonResponse<User[]> = await UserService.getUsers();
            return response.data ?? [];
        },
    });
}


