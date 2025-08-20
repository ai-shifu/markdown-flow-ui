interface UseSSEReturn<T = any> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    sseIndex: number | null;
    connect: () => Promise<void>;
    close: () => void;
}
interface UseSSEOptions extends RequestInit {
    autoConnect?: boolean;
    onStart?: (index: number) => void;
    onFinish?: (finalData: any, index: number) => void;
    maxRetries?: number;
    retryDelay?: number;
}
declare const useSSE: <T = any>(url: string, options?: UseSSEOptions) => UseSSEReturn<T>;
export default useSSE;
