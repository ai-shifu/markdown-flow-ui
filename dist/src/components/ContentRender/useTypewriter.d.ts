interface UseTypewriterProps {
    content?: string;
    typingSpeed?: number;
    disabled?: boolean;
}
interface Segment {
    content: string;
    isMarkdown: boolean;
    type?: string;
}
declare const useTypewriter: ({ content, typingSpeed, disabled }?: UseTypewriterProps) => {
    displayContent: string;
    isTyping: boolean;
    isComplete: boolean;
    reset: () => void;
    start: () => void;
    getSegments: () => Segment[];
};
export default useTypewriter;
