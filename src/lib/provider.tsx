"use client";

import {HydrationBoundary, QueryClientProvider} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { queryClient } from "./queryClient";

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => queryClient);

    return (
        <QueryClientProvider client={client}>
            <HydrationBoundary state={null}>{children}</HydrationBoundary>
        </QueryClientProvider>
    );
}
