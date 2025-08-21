import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { buildApiUrl, getApiConfig } from "./config";

function getAccessToken() {
  return localStorage.getItem("azam-access-token") || "";
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string = "GET",
  data?: unknown,
  customHeaders?: Record<string, string>
): Promise<any> {
  const { baseUrl } = getApiConfig();
  const fullUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : buildApiUrl(url, baseUrl);

  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let errorJson;
    try {
      errorJson = await res.json();
    } catch {
      errorJson = { message: res.statusText };
    }
    throw errorJson; // <-- This is the key change!
  }
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    // Build the full URL using the configurable base URL
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/api/') 
      ? url 
      : buildApiUrl(url);
      
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
