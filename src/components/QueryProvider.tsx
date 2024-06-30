"use client";

/*
This is a seperate file for just QueryClientProvider
Because Only plain objects, and a few built-ins, can be passed to Client Components
from Server Components. Classes or null prototypes are not supported.
and client = new QueryClient() is not supported to be
passed directly from app/layout.tsx (server component)
as some of the {children} may be client component
*/

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

const client = new QueryClient();

const QueryProvider = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProvider;
