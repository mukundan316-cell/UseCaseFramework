import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Helper function specifically for DELETE requests that don't return JSON
export async function apiDeleteRequest(url: string): Promise<void> {
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: "include",
  });

  await throwIfResNotOk(res);
  // Don't try to parse JSON for DELETE responses
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Debug logging to catch JSON parsing issues
    console.log('Query response:', {
      url: queryKey.join("/"),
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries())
    });
    
    // Check if response has content before parsing JSON
    const contentType = res.headers.get('content-type');
    const contentLength = res.headers.get('content-length');
    
    if (!contentType?.includes('application/json') || contentLength === '0') {
      console.warn('Response does not contain JSON:', { contentType, contentLength });
      return null;
    }
    
    try {
      return await res.json();
    } catch (error) {
      console.error('JSON parsing failed:', error, 'Response:', res);
      throw error;
    }
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
