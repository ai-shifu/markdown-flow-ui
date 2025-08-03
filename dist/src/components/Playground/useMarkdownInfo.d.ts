interface MarkdownInfoData {
    block_count: number;
    variables: string[];
    interaction_blocks: number[];
    content_blocks: number[];
}
declare const useMarkdownInfo: (content: string) => {
    data: MarkdownInfoData | null;
    loading: boolean;
    error: string | null;
};
export default useMarkdownInfo;
