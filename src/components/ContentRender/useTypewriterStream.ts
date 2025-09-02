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

const useTypewriterStream = ({
  content = "",
  typingSpeed = 80,
  disabled = false,
}: UseTypewriterProps = {}) => {
  const [displayContent, setDisplayContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const parsedSegmentsRef = useRef<Segment[]>([]);
  const displayIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const lastContentRef = useRef("");
  const lastParsedLengthRef = useRef(0);

  // Cleanup function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Incremental content parsing - parse only newly added content
  const parseIncrementalContent = useCallback(
    (fullText: string, previousLength: number): Segment[] => {
      const segments: Segment[] = [];

      // If it's completely new content, parse the entire text
      if (previousLength === 0) {
        return parseFullContent(fullText);
      }

      // Parse only the newly added content
      const newContent = fullText.substring(previousLength);
      if (!newContent) return [];

      // Perform simple character-level segmentation for new content
      // Avoid regex matching to prevent issues with incomplete Markdown formatting
      for (const char of newContent) {
        segments.push({
          content: char,
          isMarkdown: false,
        });
      }

      return segments;
    },
    [],
  );

  // Full content parsing - used for initial content or content reset
  const parseFullContent = useCallback((text: string): Segment[] => {
    const segments: Segment[] = [];

    // Simply treat each character as a segment
    // This avoids regex matching issues
    for (const char of text) {
      segments.push({
        content: char,
        isMarkdown: false,
      });
    }

    return segments;
  }, []);

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
      setIsComplete(true);
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
      setDisplayContent(newContent);
      setIsTyping(false);
      setIsComplete(true);
      lastContentRef.current = newContent;
      lastParsedLengthRef.current = newContent.length;
      return;
    }

    // Check if content is growing
    const isContentGrowth =
      newContent.length >= oldContent.length &&
      newContent.startsWith(oldContent);

    if (isContentGrowth && oldContent) {
      // Content growth: parse only new parts
      const newSegments = parseIncrementalContent(
        newContent,
        lastParsedLengthRef.current,
      );
      parsedSegmentsRef.current = [
        ...parsedSegmentsRef.current,
        ...newSegments,
      ];
      lastParsedLengthRef.current = newContent.length;

      // Update completion status
      const isNowComplete =
        displayIndexRef.current >= parsedSegmentsRef.current.length;
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
      const segments = parseFullContent(newContent);
      parsedSegmentsRef.current = segments;
      displayIndexRef.current = 0;
      lastParsedLengthRef.current = newContent.length;

      const isNowComplete = segments.length === 0;
      setIsComplete(isNowComplete);

      if (!isNowComplete && newContent && isMountedRef.current) {
        setIsTyping(true);
        type();
      }
    }

    lastContentRef.current = newContent;
  }, [
    content,
    disabled,
    clearTimer,
    parseIncrementalContent,
    parseFullContent,
    type,
    isTyping,
  ]);

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
    setIsComplete(false);
    lastContentRef.current = "";
    lastParsedLengthRef.current = 0;
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    displayIndexRef.current = 0;
    setDisplayContent("");
    setIsTyping(true);
    setIsComplete(false);
    type();
  }, [clearTimer, type]);

  return {
    displayContent,
    isTyping,
    isComplete,
    reset,
    start,
    getSegments: () => parsedSegmentsRef.current,
  };
};

export default useTypewriterStream;
