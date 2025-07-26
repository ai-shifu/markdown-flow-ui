import { useState, useEffect } from 'react';

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
        
        // 使用 Next.js 内置的 fetch
        const response = await fetch('https://play.dev.pillowai.cn/api/v1/playground/markdownflow_info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',        
          },
          body: JSON.stringify({ content }),
          // Next.js fetch 的缓存选项
          cache: 'no-store',
          // 或者使用 next: { revalidate: 0 } 来禁用缓存
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: MarkdownInfoResponse = await response.json();

        if (result.code === 200) {
          setData(result.data);
        } else {
          setError(result.message || '请求失败');
        }
      } catch (err: any) {
        setError(err.message || '网络错误');
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