import { useState, useEffect, useRef, useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

interface UseSSEReturn<T = any> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  sseIndex: number | null;
  connect: () => Promise<void>;
  close: () => void;
}

const FINISHED_MESSAGE = "[DONE]";

interface UseSSEOptions extends RequestInit {
  autoConnect?: boolean;
  onStart?: (index: number) => void;
  onFinish?: (finalData: any, index: number) => void;
  maxRetries?: number;
  retryDelay?: number;
}

type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "closed";

const useSSE = <T = any>(
  url: string,
  options: UseSSEOptions = {},
): UseSSEReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [sseIndex, setSseIndex] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const connectionStateRef = useRef<ConnectionState>("disconnected");
  const currentIndexRef = useRef(-1);
  const finalDataRef = useRef<string>("");
  const retryCountRef = useRef(0);

  const { autoConnect = true, maxRetries = 3, retryDelay = 1000 } = options;

  const isActive = () =>
    mountedRef.current && connectionStateRef.current !== "closed";

  const retry = useCallback(async () => {
    if (retryCountRef.current < maxRetries && isActive()) {
      retryCountRef.current++;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      if (isActive()) {
        await connect();
      }
    }
  }, [maxRetries, retryDelay]);

  const connect = useCallback(async () => {
    if (
      connectionStateRef.current === "connecting" ||
      connectionStateRef.current === "connected" ||
      !isActive()
    ) {
      return;
    }

    try {
      connectionStateRef.current = "connecting";
      setIsLoading(true);
      setError(null);

      const newIndex = ++currentIndexRef.current;
      setSseIndex(newIndex);
      finalDataRef.current = "";

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      await fetchEventSource(url, {
        ...options,
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          ...Object.entries(options.headers || {}).reduce(
            (acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            },
            {} as Record<string, string>,
          ),
        },
        signal: abortController.signal,
        openWhenHidden: true,
        onopen: async (response) => {
          if (isActive()) {
            connectionStateRef.current = "connected";
            setIsLoading(false);
            setError(null);
            retryCountRef.current = 0;
            options.onStart?.(newIndex);
          }
        },
        onmessage: (event) => {
          if (isActive()) {
            if (event.data.toUpperCase() === FINISHED_MESSAGE) {
              options.onFinish?.(finalDataRef.current, newIndex);
              close();
              return;
            }
            try {
              let parsedData: any = event.data;
              finalDataRef.current += parsedData;
              setData(finalDataRef.current as any);
            } catch (err) {
              console.warn("Failed to process SSE message:", err);
            }
          }
        },
        onclose: () => {
          if (isActive()) {
            connectionStateRef.current = "disconnected";
            setIsLoading(false);
          }
        },
        onerror: (err) => {
          if (isActive()) {
            connectionStateRef.current = "error";
            setError(err);
            setIsLoading(false);
            retry();
          }
          throw err;
        },
      });
    } catch (err) {
      if (isActive()) {
        connectionStateRef.current = "error";
        setError(err as Error);
        setIsLoading(false);
        retry();
      }
    }
  }, [url, JSON.stringify(options), retry]);

  const close = useCallback(() => {
    connectionStateRef.current = "closed";
    retryCountRef.current = 0;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (mountedRef.current) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connectionStateRef.current = "disconnected";
    retryCountRef.current = 0;

    if (autoConnect) {
      const timeoutId = setTimeout(() => {
        if (connectionStateRef.current === "disconnected") {
          connect();
        }
      }, 100);

      return () => {
        mountedRef.current = false;
        clearTimeout(timeoutId);
        close();
      };
    } else {
      return () => {
        mountedRef.current = false;
        close();
      };
    }
  }, [connect, close, autoConnect]);

  // Listen for url and options changes to reconnect
  useEffect(() => {
    if (connectionStateRef.current !== "disconnected") {
      close();
      setData(null);
      setError(null);
      finalDataRef.current = "";
      connectionStateRef.current = "disconnected";
      retryCountRef.current = 0;

      const timeoutId = setTimeout(() => {
        if (connectionStateRef.current === "disconnected" && isActive()) {
          connect();
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [url, JSON.stringify(options), connect, close]);

  return {
    data,
    isLoading,
    error,
    sseIndex,
    connect,
    close,
  };
};

export default useSSE;
