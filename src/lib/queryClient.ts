import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";



export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            toast.error(`${(error as Error).message}`);
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            toast.error(`Mutation error: ${(error as Error).message}`);
        },
    }),
});
