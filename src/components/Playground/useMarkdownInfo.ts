import { useState, useEffect } from "react";

interface MarkdownInfoData {
  block_count: number;
  variables: string[];
  interaction_blocks: number[];
  content_blocks: number[];
}

interface MarkdownInfoResponse {
  code: number;
  message: string;
  data: MarkdownInfoData;
  trace: string;
}

const useMarkdownInfo = (content: string) => {
  const [data, setData] = useState<MarkdownInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdownInfo = async () => {
      try {
        setLoading(true);

        // Use Next.js built-in fetch
        const response = await fetch(
          "https://play.dev.pillowai.cn/api/v1/playground/markdownflow_info",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
            // Next.js fetch caching options
            cache: "no-store",
            // Or use next: { revalidate: 0 } to disable cache
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: MarkdownInfoResponse = await response.json();

        if (result.code === 200) {
          setData(result.data);
        } else {
          setError(result.message || "Request failed");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    if (content) {
      fetchMarkdownInfo();
    }
  }, [content]);

  return { data, loading, error };
};

export default useMarkdownInfo;
