"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "@/fsd/shared/api/react-query";

interface ReactQueryProviderProps {
    children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
