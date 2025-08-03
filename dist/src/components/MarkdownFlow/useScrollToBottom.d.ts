import { RefObject } from 'react';
interface UseScrollToBottomOptions {
    behavior?: 'smooth' | 'auto';
    autoScrollOnInit?: boolean;
    scrollDelay?: number;
    scrollThreshold?: number;
}
interface UseScrollToBottomReturn {
    showScrollToBottom: boolean;
    scrollToBottom: () => void;
    handleUserScrollToBottom: () => void;
    isAtBottom: boolean;
    followNewContent: boolean;
}
declare const useScrollToBottom: (containerRef: RefObject<HTMLDivElement | null>, dependencies?: any[], options?: UseScrollToBottomOptions) => UseScrollToBottomReturn;
export default useScrollToBottom;
