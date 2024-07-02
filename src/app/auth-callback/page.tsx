"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAuthStatus } from "./actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const [configId, setConfigId] = useState<string | null>(null);

  // O/W every time component will load it will get configurationId
  useEffect(() => {
    const configurationId = localStorage.getItem("configurationId");
    if (configurationId) setConfigId(configurationId);
  }, []);

  // Retry untill user is in our db
  const { data } = useQuery({
    queryKey: ["auth-callback"],
    queryFn: async () => await getAuthStatus(),
    retry: true,
    retryDelay: 500, // retry after every 500ms
  });

  // data.succes sent by getAuthStatus
  if (data?.success) {
    if (configId) {
      localStorage.removeItem("configurationId");
      router.push(`/configure/preview?id=${configId}`);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="w-full mt-32 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <h3 className="font-semibold text-xl">Please wait..</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
