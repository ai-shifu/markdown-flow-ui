interface UseTypewriterProps {
    content: string;
    typingSpeed?: number;
    disabled?: boolean;
}
declare const useTypewriter: ({ content, typingSpeed, disabled }: UseTypewriterProps) => {
    displayContent: string;
    isTyping: boolean;
    reset: () => void;
    start: () => void;
};
export default useTypewriter;
