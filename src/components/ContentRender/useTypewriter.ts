import { useState, useEffect, useRef, useCallback } from "react";

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

const useTypewriter = ({
  content = "",
  typingSpeed = 80,
  disabled = false,
}: UseTypewriterProps = {}) => {
  const [displayContent, setDisplayContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false); // Added: indicates if typing is complete

  const parsedSegmentsRef = useRef<Segment[]>([]);
  const displayIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const lastContentRef = useRef("");

  // Cleanup function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Markdown patterns
  const markdownPatterns = useRef([
    { pattern: /\?\[[^\]]*\]/, type: "custom-tag" },
    { pattern: /```[\s\S]*?```/, type: "code-block" },
    { pattern: /^#{1,6}\s[^\n]*$/m, type: "header" },
    { pattern: /\*\*\*[^*]+\*\*\*/, type: "bold-italic" },
    { pattern: /\*\*[^*]+\*\*/, type: "bold" },
    { pattern: /(?<!\*)\*[^*]+\*(?!\*)/, type: "italic" },
    { pattern: /~~[^~]+~~/, type: "strikethrough" },
    { pattern: /`[^`]+`/, type: "inline-code" },
    { pattern: /!\[[^\]]*\]\([^\)]*\)/, type: "image" },
    { pattern: /(?<!\!)\[[^\]]*\]\([^\)]*\)/, type: "link" },
    { pattern: /^(>\s*)+[^\n]*$/m, type: "blockquote" },
    { pattern: /^[-*]{3,}$/m, type: "hr" },
    // { pattern: /^(\s*)[-*+]\s+(\[[ xX]\])?\s*[^\n]*(\n(\s{2,}|\t+)[^\n]*)*$/m, type: 'list-item' },
    // { pattern: /^(\s*)\d+\.\s+[^\n]*(\n(\s{2,}|\t+)[^\n]*)*$/m, type: 'ordered-list-item' },
  ]).current;

  // Parse content into segments
  const parseContent = useCallback(
    (text: string): Segment[] => {
      const segments: Segment[] = [];
      let remainingText = text || "";

      while (remainingText.length > 0) {
        let matched = false;
        let earliestMatch: {
          match: RegExpExecArray;
          pattern: (typeof markdownPatterns)[0];
        } | null = null;
        let earliestIndex = Infinity;

        for (const pattern of markdownPatterns) {
          const match = pattern.pattern.exec(remainingText);
          if (match && match.index < earliestIndex) {
            earliestIndex = match.index;
            earliestMatch = { match, pattern };
          }
        }

        if (earliestMatch && earliestIndex >= 0) {
          if (earliestIndex > 0) {
            const plainText = remainingText.substring(0, earliestIndex);
            segments.push(
              ...Array.from(plainText).map((char) => ({
                content: char,
                isMarkdown: false,
              }))
            );
            remainingText = remainingText.substring(earliestIndex);
          }

          segments.push({
            content: earliestMatch.match[0],
            isMarkdown: true,
            type: earliestMatch.pattern.type,
          });
          remainingText = remainingText.substring(
            earliestMatch.match[0].length
          );
          matched = true;
        }

        if (!matched) {
          segments.push({
            content: remainingText[0],
            isMarkdown: false,
          });
          remainingText = remainingText.substring(1);
        }
      }

      return segments;
    },
    [markdownPatterns]
  );

  // Typing function
  const type = useCallback(() => {
    if (!isMountedRef.current) return;

    if (displayIndexRef.current < parsedSegmentsRef.current.length) {
      const segment = parsedSegmentsRef.current[displayIndexRef.current];
      setDisplayContent((prev) => prev + (segment?.content || ""));
      displayIndexRef.current++;

      if (isMountedRef.current) {
        timerRef.current = setTimeout(type, typingSpeed);
      }
    } else {
      setIsTyping(false);
      setIsComplete(true); // Typing complete
    }
  }, [typingSpeed]);

  // Main effect
  useEffect(() => {
    const newContent = content || "";
    const oldContent = lastContentRef.current;

    // If content is the same, don't process
    if (newContent === oldContent) {
      return;
    }

    // Disabled mode: show all content immediately
    if (disabled) {
      clearTimer();
      const segments = parseContent(newContent);
      setDisplayContent(segments.map((s) => s.content).join(""));
      setIsTyping(false);
      setIsComplete(true); // Complete directly in disabled mode
      lastContentRef.current = newContent;
      return;
    }

    // Check if content is growing
    const isContentGrowth =
      newContent.length >= oldContent.length &&
      newContent.startsWith(oldContent);

    if (isContentGrowth && oldContent) {
      // Content growth: reparse entire content and update segments
      const segments = parseContent(newContent);
      parsedSegmentsRef.current = segments;

      // Update completion status
      const isNowComplete = displayIndexRef.current >= segments.length;
      setIsComplete(isNowComplete);

      // If there's more content to type, ensure typewriter continues working
      if (!isNowComplete && !isTyping) {
        setIsTyping(true);
        type();
      }
    } else {
      // New content: start over
      clearTimer();
      setDisplayContent("");
      const segments = parseContent(newContent);
      parsedSegmentsRef.current = segments;
      displayIndexRef.current = 0;

      const isNowComplete = segments.length === 0;
      setIsComplete(isNowComplete);

      if (!isNowComplete && newContent && isMountedRef.current) {
        setIsTyping(true);
        type();
      }
    }

    lastContentRef.current = newContent;
  }, [content, disabled, clearTimer, parseContent, type, isTyping]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setDisplayContent("");
    parsedSegmentsRef.current = [];
    displayIndexRef.current = 0;
    setIsTyping(false);
    setIsComplete(false); // Reset completion status
    lastContentRef.current = "";
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    displayIndexRef.current = 0;
    setDisplayContent("");
    setIsTyping(true);
    setIsComplete(false); // Reset completion status at start
    type();
  }, [clearTimer, type]);

  return {
    displayContent,
    isTyping,
    isComplete, // Added: return completion status
    reset,
    start,
    getSegments: () => parsedSegmentsRef.current,
  };
};

export default useTypewriter;
