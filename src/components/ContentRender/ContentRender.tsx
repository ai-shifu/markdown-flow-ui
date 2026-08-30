import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkFlow from "remark-flow";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PluggableList } from "unified";
import { CustomRenderBarProps, OnSendContentParams } from "../types";
import { sanitizeInvalidTagName } from "./utils/sanitize-invalid-tag-name";
import { stripSvgTextLineBreaks } from "./utils/strip-svg-text-line-breaks";
import "./contentRender.css";
import "./github-markdown-light.css";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import CodeBlock, { CodeBlockContext } from "./CodeBlock";
import CustomButtonInputVariable, {
  ComponentsWithCustomVariable,
} from "./plugins/CustomVariable";
import MermaidChart, { type MermaidChartProps } from "./plugins/MermaidChart";
import {
  preserveCustomVariableProperties,
  restoreCustomVariableProperties,
} from "./utils/custom-variable-props";
import {
  highlightLanguages,
  subsetLanguages,
} from "./utils/highlight-languages";
// import { processMarkdownText } from "./utils/process-markdown";
import {
  parseMarkdownSegments,
  mermaidBlockIsComplete,
} from "./utils/mermaid-parse";
import { normalizeInlineHtml } from "./utils/normalize-inline-html";
import IframeSandbox from "./IframeSandbox";
import {
  appendContentAwareTypewriterQueue,
  CONTENT_AWARE_TYPEWRITER_TICK_BUDGET,
  consumeContentAwareTypewriterQueue,
  getTrailingTypewriterGrapheme,
  isContentAwareTypewriterQueueEmpty,
  type ContentAwareTypewriterQueue,
} from "./utils/typewriter-pacing";
import {
  splitContentSegments,
  type RenderSegment,
} from "./utils/split-content";
import {
  getInteractionDefaultValues,
  type InteractionDefaultValueOptions,
} from "../../lib/interaction-defaults";
import {
  getMarkdownFlowDirection,
  getMarkdownFlowLanguage,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import { getContentRenderLocaleTexts } from "./contentRenderI18n";

const SANDBOX_TAG_HINT_PATTERN =
  /<(script|style|link|iframe|html|head|body|meta|title|base|template|div|section|article|main)\b/i;
const FIXED_TYPEWRITER_CHUNK_SIZE = 2;

export type ContentRenderTypewriterPacing = "fixed" | "content-aware";

// Define component Props type
export interface ContentRenderProps {
  content: string;
  contentType?: string;
  /** Locale used for built-in UI text when a more specific text prop is not provided. */
  locale?: MarkdownFlowLocale;
  /** Overrides the locale-derived language; omitted values inherit from the host. */
  lang?: string;
  /** Overrides locale-derived direction; omitted values inherit when no locale is set. */
  dir?: React.HTMLAttributes<HTMLDivElement>["dir"];
  /**
   * Callback invoked when the custom button after content is clicked.
   * This button is rendered via the `<custom-button-after-content>` tag in markdown content.
   * @example
   * ```tsx
   * <ContentRender
   *   content="Hello <custom-button-after-content>Ask</custom-button-after-content>"
   *   onClickCustomButtonAfterContent={() => console.log('Button clicked')}
   * />
   * ```
   */
  customRenderBar?: CustomRenderBarProps;
  onClickCustomButtonAfterContent?: () => void;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  enableTypewriter?: boolean;
  /** Controls how much text is revealed per tick. Defaults to the legacy fixed pacing. */
  typewriterPacing?: ContentRenderTypewriterPacing;
  onTypeFinished?: () => void;
  onTypewriterStateChange?: (state: ContentRenderTypewriterState) => void;
  userInput?: string;
  interactionDefaultValueOptions?: InteractionDefaultValueOptions;
  defaultButtonText?: string;
  defaultInputText?: string; // Text input by user
  defaultSelectedValues?: string[]; // Default selected values for multi-select
  readonly?: boolean;
  // Multi-select confirm button text (i18n support)
  confirmButtonText?: string;
  // Copy button text (i18n support)
  copyButtonText?: string;
  // Copied state text (i18n support)
  copiedButtonText?: string;
  // Dynamic interaction format for multi-select support
  dynamicInteractionFormat?: string;
  // Loading text before first HTML block renders inside iframe (i18n support)
  sandboxLoadingText?: string;
  // Loading text while styles are being generated inside iframe
  sandboxStyleLoadingText?: string;
  // Loading text while scripts are being cached/executed inside iframe
  sandboxScriptLoadingText?: string;
  // Disable sandbox loading overlays when upper layers have already entered an error state
  disableSandboxLoadingOverlay?: boolean;
  // Fullscreen button text for iframe sandbox
  sandboxFullscreenButtonText?: string;
  // Exit fullscreen button text for iframe sandbox
  sandboxExitFullscreenButtonText?: string;
  // Sandbox render mode
  sandboxMode?: "content" | "blackboard";
  beforeSend?: (param: OnSendContentParams) => boolean;
  // tooltipMinLength?: number; // Control minimum character length for tooltip display, default 10
}

export interface ContentRenderTypewriterState {
  isTypewriterEnabled: boolean;
  isTyping: boolean;
  isComplete: boolean;
  renderedLength: number;
  totalLength: number;
}

// Render svg string via Shadow DOM to avoid markdown wrapping
const SvgBlockInShadow: React.FC<{ svg: string }> = ({ svg }) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const styleId = "content-render-svg-style";
    let styleEl = shadowRoot.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      // Keep intrinsic SVG width so the wrapper can scroll horizontally when needed
      styleEl.textContent = `
        svg { height: auto; display: inline-block; }
        svg.content-render-svg-el--responsive { width: 100%; max-width: 100%; }
        svg.content-render-svg-el--fixed { max-width: none; }
      `;
      shadowRoot.appendChild(styleEl);
    }

    const nodesToRemove = Array.from(shadowRoot.childNodes).filter(
      (node) => node !== styleEl
    );
    nodesToRemove.forEach((node) => shadowRoot.removeChild(node));

    const template = document.createElement("template");
    const cleanedSvg = stripSvgTextLineBreaks(svg);
    template.innerHTML = cleanedSvg;
    shadowRoot.append(template.content.cloneNode(true));

    let hasResponsiveSvg = false;
    let hasFixedSvg = false;

    shadowRoot.querySelectorAll("svg").forEach((svgEl) => {
      // Derive responsive sizing from viewBox so pure viewBox SVGs stay visible and fluid
      const viewBox = svgEl.getAttribute("viewBox");
      if (!viewBox) return;

      const dimensions = viewBox
        .trim()
        .split(/[\s,]+/)
        .map((value) => Number(value));

      if (dimensions.length !== 4 || dimensions.some(Number.isNaN)) return;

      const [, , viewBoxWidth, viewBoxHeight] = dimensions;
      const widthAttr = svgEl.getAttribute("width");
      const heightAttr = svgEl.getAttribute("height");
      const isRelativeLength = (value?: string | null) => {
        if (!value) return false;
        const normalized = value.trim().toLowerCase();
        return normalized === "auto" || normalized.endsWith("%");
      };
      const toNumericLength = (value?: string | null) => {
        if (!value) return null;
        const normalized = value.trim().toLowerCase();
        if (normalized === "auto" || normalized.endsWith("%")) {
          return null;
        }
        const parsed = Number.parseFloat(normalized);
        return Number.isNaN(parsed) ? null : parsed;
      };
      // Treat percentage/auto sizing as responsive so viewBox drives the layout
      const isWidthRelative = isRelativeLength(widthAttr);
      const isHeightRelative = isRelativeLength(heightAttr);
      const widthMissing = !widthAttr || widthAttr === "0";
      const heightMissing = !heightAttr || heightAttr === "0";
      const numericWidth = toNumericLength(widthAttr);
      const numericHeight = toNumericLength(heightAttr);
      const matchesViewBox =
        numericWidth === viewBoxWidth && numericHeight === viewBoxHeight;

      // Prefer responsive layout when sizing is relative or matches the viewBox
      const shouldUseResponsiveSize =
        isWidthRelative ||
        isHeightRelative ||
        (widthMissing && heightMissing) ||
        matchesViewBox;

      if (shouldUseResponsiveSize) {
        hasResponsiveSvg = true;
        svgEl.classList.add("content-render-svg-el--responsive");
        svgEl.classList.remove("content-render-svg-el--fixed");
        svgEl.style.width = "100%";
        svgEl.style.height = "auto";
        if (!svgEl.style.aspectRatio && viewBoxHeight > 0) {
          svgEl.style.aspectRatio = `${viewBoxWidth} / ${viewBoxHeight}`;
        }
        return;
      }

      hasFixedSvg = true;
      svgEl.classList.add("content-render-svg-el--fixed");
      svgEl.classList.remove("content-render-svg-el--responsive");
      if (widthMissing && viewBoxWidth > 0) {
        svgEl.setAttribute("width", `${viewBoxWidth}`);
      }
      if (heightMissing && viewBoxHeight > 0) {
        svgEl.setAttribute("height", `${viewBoxHeight}`);
      }
    });

    const hostResponsive = hasResponsiveSvg && !hasFixedSvg;
    host.classList.toggle("content-render-svg--responsive", hostResponsive);
    host.classList.toggle("content-render-svg--fixed", !hostResponsive);
  }, [svg]);

  return (
    <div className="content-render-svg-scroll">
      <div className="content-render-svg" ref={hostRef} />
    </div>
  );
};

// Extended component interface
type CustomComponents = ComponentsWithCustomVariable & {
  "custom-button-after-content"?: React.ComponentType<{
    children: React.ReactNode;
  }>;
};

type MarkdownComponentRuntimeValues = {
  direction?: ContentRenderProps["dir"];
  language?: string;
  mermaidMessages: MermaidChartProps["messages"];
  beforeSend?: (param: OnSendContentParams) => boolean;
  locale?: MarkdownFlowLocale;
  onClickCustomButtonAfterContent?: () => void;
  onSend?: (content: OnSendContentParams) => void;
  readonly: boolean;
  renderContent: string;
  resolvedConfirmButtonText: string;
  resolvedCopiedButtonText: string;
  resolvedCopyButtonText: string;
  resolvedDefaultButtonText?: string;
  resolvedDefaultInputText?: string;
  resolvedDefaultSelectedValues?: string[];
};

const MarkdownComponentRuntimeContext =
  React.createContext<React.RefObject<MarkdownComponentRuntimeValues> | null>(
    null
  );

const MarkdownCode = (props: React.ComponentProps<"code">) => {
  const runtimeValuesRef = React.useContext(MarkdownComponentRuntimeContext);
  const isInCodeBlock = React.useContext(CodeBlockContext);
  if (!runtimeValuesRef) {
    throw new Error("Markdown code renderer requires ContentRender context.");
  }
  const { className, children, ...rest } = props as {
    className?: string;
    children?: React.ReactNode;
    dir?: string;
  };
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1];
  if (language === "mermaid") {
    const chartContent = children?.toString().replace(/\n$/, "") || "";
    const frozen = mermaidBlockIsComplete(
      runtimeValuesRef.current.renderContent,
      chartContent
    );
    return (
      <MermaidChart
        chart={chartContent}
        frozen={frozen}
        messages={runtimeValuesRef.current.mermaidMessages}
      />
    );
  }

  return (
    <code
      className={className}
      {...rest}
      dir={rest.dir ?? (isInCodeBlock ? undefined : "ltr")}
    >
      {children}
    </code>
  );
};

const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkMath,
  remarkFlow,
  remarkBreaks,
];

const rehypePlugins: PluggableList = [
  preserveCustomVariableProperties,
  rehypeRaw,
  sanitizeInvalidTagName,
  restoreCustomVariableProperties,
  [rehypeHighlight, { languages: highlightLanguages, subset: subsetLanguages }],
  rehypeKatex,
];

export const MarkdownRenderer: React.FC<{
  content: string;
  components: CustomComponents;
  locale?: MarkdownFlowLocale;
}> = ({ content: markdownContent, components, locale }) => {
  const texts = getContentRenderLocaleTexts(locale);
  return (
    <div className="markdown-renderer">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        remarkRehypeOptions={{
          footnoteLabel: texts.footnoteLabel,
          footnoteBackLabel: (referenceIndex, rereferenceIndex) => {
            const reference =
              String(referenceIndex + 1) +
              (rereferenceIndex > 1 ? `-${rereferenceIndex}` : "");
            return texts.footnoteBackLabel.replace("{reference}", reference);
          },
        }}
        components={components}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

const mergeNonSandboxSegments = (segments: RenderSegment[]) => {
  if (segments.length <= 1) return segments;
  const merged: RenderSegment[] = [];

  segments.forEach((segment) => {
    if (segment.type === "sandbox") {
      merged.push(segment);
      return;
    }

    const last = merged[merged.length - 1];
    if (last && last.type !== "sandbox") {
      merged[merged.length - 1] = {
        type: "markdown",
        value: `${last.value}${segment.value}`,
      };
      return;
    }

    merged.push({ type: "markdown", value: segment.value });
  });

  return merged;
};

const splitTextByCharacterChunk = (value: string, chunkSize: number) => {
  const safeChunkSize = Math.max(1, chunkSize);
  const characters = Array.from(value);

  return {
    chunk: characters.slice(0, safeChunkSize).join(""),
    rest: characters.slice(safeChunkSize).join(""),
  };
};

const areStringArraysEqual = (left?: string[], right?: string[]) => {
  if (left === right) {
    return true;
  }
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
};

const useStableStringArray = (values?: string[]) => {
  const valuesRef = useRef<string[] | undefined>(values);

  if (!areStringArraysEqual(valuesRef.current, values)) {
    valuesRef.current = values;
  }

  return valuesRef.current;
};

const ContentRender: React.FC<ContentRenderProps> = ({
  content,
  contentType,
  locale,
  lang,
  dir,
  customRenderBar,
  onSend,
  typingSpeed = 40,
  enableTypewriter = false,
  typewriterPacing = "fixed",
  onTypeFinished,
  onTypewriterStateChange,
  userInput,
  interactionDefaultValueOptions,
  defaultButtonText,
  defaultInputText,
  defaultSelectedValues,
  readonly = false,
  confirmButtonText,
  copyButtonText,
  copiedButtonText,
  sandboxLoadingText,
  sandboxStyleLoadingText,
  sandboxScriptLoadingText,
  disableSandboxLoadingOverlay = false,
  sandboxFullscreenButtonText,
  sandboxExitFullscreenButtonText,
  sandboxMode = "content",
  onClickCustomButtonAfterContent,
  beforeSend,
  // tooltipMinLength,
}) => {
  const localeTexts = getContentRenderLocaleTexts(locale);
  const mermaidMessages = useMemo(
    () => ({
      loading: localeTexts.mermaidLoadingText,
      emptyChart: localeTexts.mermaidEmptyChartText,
      error: localeTexts.mermaidErrorText,
    }),
    [localeTexts]
  );
  const direction = dir ?? getMarkdownFlowDirection(locale);
  const language = lang ?? getMarkdownFlowLanguage(locale);
  const resolvedConfirmButtonText =
    confirmButtonText || localeTexts.confirmButtonText;
  const resolvedCopyButtonText = copyButtonText || localeTexts.copyButtonText;
  const resolvedCopiedButtonText =
    copiedButtonText || localeTexts.copiedButtonText;
  const resolvedSandboxFullscreenButtonText =
    sandboxFullscreenButtonText || localeTexts.sandboxFullscreenButtonText;
  const resolvedSandboxExitFullscreenButtonText =
    sandboxExitFullscreenButtonText ||
    localeTexts.sandboxExitFullscreenButtonText;
  const shouldApplyTypewriterByContentType =
    !contentType || contentType === "text";
  const isTypewriterEnabled =
    Boolean(enableTypewriter) && shouldApplyTypewriterByContentType;
  const typewriterTickMs = Math.max(0, typingSpeed);
  const fixedTypewriterContentVersion =
    typewriterPacing === "fixed" ? content : undefined;
  const [displayContent, setDisplayContent] = useState(() =>
    isTypewriterEnabled ? "" : content
  );
  const displayContentRef = useRef(displayContent);
  const pendingContentRef = useRef("");
  const contentAwareQueueRef = useRef<ContentAwareTypewriterQueue>({
    tokens: [],
    head: 0,
    trailingGrapheme: "",
  });
  const contentAwareBudgetRef = useRef(0);
  const previousTypewriterEnabledRef = useRef(isTypewriterEnabled);
  const previousTypewriterPacingRef = useRef(typewriterPacing);
  const previousSourceContentRef = useRef(content);
  const hasReportedTypeFinishedRef = useRef(false);
  const [typewriterWakeVersion, setTypewriterWakeVersion] = useState(0);

  useEffect(() => {
    const wasTypewriterEnabled = previousTypewriterEnabledRef.current;
    const previousTypewriterPacing = previousTypewriterPacingRef.current;
    const previousSourceContent = previousSourceContentRef.current;
    const wasPending = Boolean(pendingContentRef.current);

    previousTypewriterEnabledRef.current = isTypewriterEnabled;
    previousTypewriterPacingRef.current = typewriterPacing;
    previousSourceContentRef.current = content;

    if (
      content !== previousSourceContent ||
      isTypewriterEnabled !== wasTypewriterEnabled
    ) {
      hasReportedTypeFinishedRef.current = false;
    }

    const clearPendingContent = () => {
      pendingContentRef.current = "";
      contentAwareQueueRef.current = {
        tokens: [],
        head: 0,
        trailingGrapheme: "",
      };
      contentAwareBudgetRef.current = 0;
    };

    const updateDisplayContent = (nextContent: string) => {
      displayContentRef.current = nextContent;
      setDisplayContent(nextContent);
    };

    if (!isTypewriterEnabled) {
      clearPendingContent();
      updateDisplayContent(content);
      return;
    }

    if (!wasTypewriterEnabled) {
      clearPendingContent();
      updateDisplayContent("");
    }

    const visibleContent = !wasTypewriterEnabled
      ? ""
      : displayContentRef.current;

    if (!content.startsWith(visibleContent)) {
      clearPendingContent();
      updateDisplayContent(content);
      if (typewriterPacing === "content-aware") {
        contentAwareQueueRef.current = {
          tokens: [],
          head: 0,
          trailingGrapheme: getTrailingTypewriterGrapheme(content),
        };
      }
      return;
    }

    let nextPendingContent = content.slice(visibleContent.length);
    if (!nextPendingContent) {
      pendingContentRef.current = "";
      contentAwareBudgetRef.current = 0;
      contentAwareQueueRef.current =
        typewriterPacing === "content-aware"
          ? {
              tokens: [],
              head: 0,
              trailingGrapheme: getTrailingTypewriterGrapheme(visibleContent),
            }
          : { tokens: [], head: 0, trailingGrapheme: "" };
      return;
    }

    if (typewriterPacing === "content-aware") {
      const previousPendingContent = previousSourceContent.slice(
        visibleContent.length
      );
      const canAppendToCachedQueue =
        wasTypewriterEnabled &&
        previousTypewriterPacing === "content-aware" &&
        content.startsWith(previousSourceContent) &&
        pendingContentRef.current === previousPendingContent;

      if (canAppendToCachedQueue) {
        const appended = appendContentAwareTypewriterQueue(
          contentAwareQueueRef.current,
          content.slice(previousSourceContent.length)
        );
        contentAwareQueueRef.current = appended.queue;

        if (appended.immediateChunk) {
          nextPendingContent = nextPendingContent.slice(
            appended.immediateChunk.length
          );
          updateDisplayContent(`${visibleContent}${appended.immediateChunk}`);
        }
      } else {
        const appended = appendContentAwareTypewriterQueue(
          {
            tokens: [],
            head: 0,
            trailingGrapheme: getTrailingTypewriterGrapheme(visibleContent),
          },
          nextPendingContent
        );
        contentAwareQueueRef.current = appended.queue;

        if (appended.immediateChunk) {
          nextPendingContent = nextPendingContent.slice(
            appended.immediateChunk.length
          );
          updateDisplayContent(`${visibleContent}${appended.immediateChunk}`);
        }

        contentAwareBudgetRef.current = 0;
      }
    } else {
      contentAwareQueueRef.current = {
        tokens: [],
        head: 0,
        trailingGrapheme: "",
      };
      contentAwareBudgetRef.current = 0;
    }

    pendingContentRef.current = nextPendingContent;

    if (!wasPending && nextPendingContent) {
      setTypewriterWakeVersion((version) => version + 1);
    }
  }, [content, isTypewriterEnabled, typewriterPacing]);

  useEffect(() => {
    if (!isTypewriterEnabled) {
      return;
    }

    if (
      hasReportedTypeFinishedRef.current ||
      pendingContentRef.current ||
      displayContent !== content
    ) {
      return;
    }

    hasReportedTypeFinishedRef.current = true;
    onTypeFinished?.();
  }, [content, displayContent, isTypewriterEnabled, onTypeFinished]);

  useEffect(() => {
    if (!isTypewriterEnabled || !pendingContentRef.current) {
      return undefined;
    }

    const typewriterTimer = window.setTimeout(() => {
      if (!pendingContentRef.current) {
        return;
      }

      let chunk = "";

      if (typewriterPacing === "content-aware") {
        const result = consumeContentAwareTypewriterQueue(
          contentAwareQueueRef.current,
          contentAwareBudgetRef.current + CONTENT_AWARE_TYPEWRITER_TICK_BUDGET
        );

        chunk = result.chunk;
        contentAwareQueueRef.current = result.queue;

        if (isContentAwareTypewriterQueueEmpty(result.queue)) {
          contentAwareBudgetRef.current = 0;
        } else {
          contentAwareBudgetRef.current = result.remainingBudget;
        }
      } else {
        const fixedChunk = splitTextByCharacterChunk(
          pendingContentRef.current,
          FIXED_TYPEWRITER_CHUNK_SIZE
        );
        chunk = fixedChunk.chunk;
      }

      if (!chunk) {
        return;
      }

      pendingContentRef.current = pendingContentRef.current.slice(chunk.length);
      if (!pendingContentRef.current) {
        contentAwareQueueRef.current =
          typewriterPacing === "content-aware"
            ? {
                tokens: [],
                head: 0,
                trailingGrapheme: contentAwareQueueRef.current.trailingGrapheme,
              }
            : { tokens: [], head: 0, trailingGrapheme: "" };
        contentAwareBudgetRef.current = 0;
      }

      const nextDisplayContent = `${displayContentRef.current}${chunk}`;
      displayContentRef.current = nextDisplayContent;
      setDisplayContent(nextDisplayContent);
    }, typewriterTickMs);

    return () => window.clearTimeout(typewriterTimer);
  }, [
    displayContent,
    fixedTypewriterContentVersion,
    isTypewriterEnabled,
    typewriterPacing,
    typewriterTickMs,
    typewriterWakeVersion,
  ]);

  const typewriterState = useMemo<ContentRenderTypewriterState>(
    () => ({
      isTypewriterEnabled,
      isTyping: isTypewriterEnabled && displayContent !== content,
      isComplete: displayContent === content,
      renderedLength: displayContent.length,
      totalLength: content.length,
    }),
    [content, displayContent, isTypewriterEnabled]
  );

  useEffect(() => {
    onTypewriterStateChange?.(typewriterState);
  }, [onTypewriterStateChange, typewriterState]);

  const renderContent = isTypewriterEnabled ? displayContent : content;
  const normalizedContent = useMemo(
    () => normalizeInlineHtml(renderContent),
    [renderContent]
  );

  const interactionDefaults = useMemo(
    () =>
      getInteractionDefaultValues(
        renderContent,
        userInput,
        interactionDefaultValueOptions
      ),
    [interactionDefaultValueOptions, renderContent, userInput]
  );

  const resolvedDefaultButtonText =
    defaultButtonText?.trim() || interactionDefaults.buttonText;
  const resolvedDefaultInputText =
    defaultInputText?.trim() || interactionDefaults.inputText;
  const fallbackSelectedValues = useMemo(
    () =>
      userInput
        ? userInput
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : undefined,
    [userInput]
  );
  const resolvedDefaultSelectedValues = defaultSelectedValues?.length
    ? defaultSelectedValues
    : interactionDefaults.selectedValues || fallbackSelectedValues;
  const stableDefaultSelectedValues = useStableStringArray(
    resolvedDefaultSelectedValues
  );
  const componentRuntimeValuesRef = useRef<MarkdownComponentRuntimeValues>({
    direction,
    language,
    mermaidMessages,
    beforeSend,
    locale,
    onClickCustomButtonAfterContent,
    onSend,
    readonly,
    renderContent,
    resolvedConfirmButtonText,
    resolvedCopiedButtonText,
    resolvedCopyButtonText,
    resolvedDefaultButtonText,
    resolvedDefaultInputText,
    resolvedDefaultSelectedValues: stableDefaultSelectedValues,
  });

  componentRuntimeValuesRef.current = {
    direction,
    language,
    mermaidMessages,
    beforeSend,
    locale,
    onClickCustomButtonAfterContent,
    onSend,
    readonly,
    renderContent,
    resolvedConfirmButtonText,
    resolvedCopiedButtonText,
    resolvedCopyButtonText,
    resolvedDefaultButtonText,
    resolvedDefaultInputText,
    resolvedDefaultSelectedValues: stableDefaultSelectedValues,
  };

  const components = useMemo<CustomComponents>(
    () => ({
      "custom-button-after-content": ({
        children,
      }: {
        children: React.ReactNode;
      }) => {
        return (
          <button
            className="content-render-custom-button-after-content"
            onClick={
              componentRuntimeValuesRef.current.onClickCustomButtonAfterContent
            }
          >
            <span className="content-render-custom-button-after-content-inner">
              {children}
            </span>
          </button>
        );
      },
      "custom-variable": (props) => (
        <CustomButtonInputVariable
          {...props}
          readonly={componentRuntimeValuesRef.current.readonly}
          defaultButtonText={
            componentRuntimeValuesRef.current.resolvedDefaultButtonText
          }
          defaultInputText={
            componentRuntimeValuesRef.current.resolvedDefaultInputText
          }
          defaultSelectedValues={
            componentRuntimeValuesRef.current.resolvedDefaultSelectedValues
          }
          onSend={componentRuntimeValuesRef.current.onSend}
          beforeSend={componentRuntimeValuesRef.current.beforeSend}
          locale={componentRuntimeValuesRef.current.locale}
          dir={componentRuntimeValuesRef.current.direction}
          lang={componentRuntimeValuesRef.current.language}
          confirmButtonText={
            componentRuntimeValuesRef.current.resolvedConfirmButtonText
          }
          // tooltipMinLength={tooltipMinLength}
        />
      ),
      code: MarkdownCode,
      table: ({ ...props }) => (
        <div className="content-render-table-container">
          <table className="content-render-table" {...props} />
        </div>
      ),
      th: ({ ...props }) => <th className="content-render-th" {...props} />,
      td: ({ ...props }) => <td className="content-render-td" {...props} />,
      tr: ({ ...props }) => <tr className="content-render-tr" {...props} />,
      li: ({ node, ...props }) => {
        const className = node?.properties?.className;
        const hasTaskListItem =
          (typeof className === "string" &&
            className.includes("task-list-item")) ||
          (Array.isArray(className) && className.includes("task-list-item"));
        if (hasTaskListItem) {
          return <li className="content-render-task-list-item" {...props} />;
        }
        return <li {...props} />;
      },
      ol: ({ ...props }) => <ol className="content-render-ol" {...props} />,
      ul: ({ ...props }) => <ul className="content-render-ul" {...props} />,
      input: ({ ...props }) => {
        if (props.type === "checkbox") {
          return (
            <input
              type="checkbox"
              className="content-render-checkbox"
              disabled
              {...props}
            />
          );
        }
        return <input {...props} />;
      },
      a: ({ children, ...props }) => (
        <a target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      ),
      pre: (props) => (
        <CodeBlock
          {...props}
          copyButtonText={
            componentRuntimeValuesRef.current.resolvedCopyButtonText
          }
          copiedButtonText={
            componentRuntimeValuesRef.current.resolvedCopiedButtonText
          }
        />
      ),
    }),
    []
  );

  const hasPotentialSandboxTags = useMemo(
    () => SANDBOX_TAG_HINT_PATTERN.test(renderContent),
    [renderContent]
  );

  const renderSegments = useMemo(
    () =>
      hasPotentialSandboxTags ? splitContentSegments(renderContent, true) : [],
    [renderContent, hasPotentialSandboxTags]
  );

  const hasSandbox = renderSegments.some(
    (segment) => segment.type === "sandbox"
  );
  const mergedRenderSegments = useMemo(
    () => mergeNonSandboxSegments(renderSegments),
    [renderSegments]
  );

  const segments = useMemo(
    () => parseMarkdownSegments(normalizedContent),
    [normalizedContent]
  );

  const renderMarkdownSegments = (raw: string, keyPrefix: string) => {
    const normalized = normalizeInlineHtml(raw);
    const parsed = parseMarkdownSegments(normalized);

    return parsed.map((seg, index) => {
      const key = `${keyPrefix}-${seg.type}-${index}`;

      if (seg.type === "text") {
        return (
          <MarkdownComponentRuntimeContext.Provider
            key={key}
            value={componentRuntimeValuesRef}
          >
            <MarkdownRenderer
              locale={locale}
              components={components}
              content={seg.value}
            />
          </MarkdownComponentRuntimeContext.Provider>
        );
      }

      if (seg.type === "mermaid") {
        return (
          <MermaidChart
            key={key}
            chart={seg.value}
            frozen={!seg.complete}
            messages={mermaidMessages}
          />
        );
      }

      if (seg.type === "svg") {
        return <SvgBlockInShadow key={key} svg={seg.value} />;
      }

      return null;
    });
  };

  if (hasSandbox) {
    return (
      <div
        className="content-render markdown-body"
        dir={direction}
        lang={language}
      >
        {mergedRenderSegments.map((segment, idx) =>
          segment.type === "sandbox" ? (
            <IframeSandbox
              key={`sandbox-${idx}`}
              hideFullScreen
              type="sandbox"
              content={segment.value}
              className="content-render-iframe"
              locale={locale}
              dir={direction}
              lang={language}
              loadingText={sandboxLoadingText}
              styleLoadingText={sandboxStyleLoadingText}
              scriptLoadingText={sandboxScriptLoadingText}
              disableLoadingOverlay={disableSandboxLoadingOverlay}
              fullScreenButtonText={resolvedSandboxFullscreenButtonText}
              exitFullScreenButtonText={resolvedSandboxExitFullscreenButtonText}
              mode={sandboxMode}
            />
          ) : (
            <React.Fragment key={`md-${idx}`}>
              {renderMarkdownSegments(segment.value, `md-${idx}`)}
            </React.Fragment>
          )
        )}
      </div>
    );
  }

  return (
    <div
      className="content-render markdown-body"
      dir={direction}
      lang={language}
    >
      {segments.map((seg, index) => {
        if (seg.type === "text") {
          return (
            <MarkdownComponentRuntimeContext.Provider
              key={index}
              value={componentRuntimeValuesRef}
            >
              <MarkdownRenderer
                locale={locale}
                components={components}
                content={seg.value}
              />
            </MarkdownComponentRuntimeContext.Provider>
          );
        }

        if (seg.type === "mermaid") {
          return (
            <MermaidChart
              key={index}
              chart={seg.value}
              frozen={!seg.complete}
              messages={mermaidMessages}
            />
          );
        }

        if (seg.type === "svg") {
          return <SvgBlockInShadow key={index} svg={seg.value} />;
        }
      })}

      {customRenderBar && (
        <div className="content-render-custom-bar">
          {React.createElement(customRenderBar, {
            content,
            displayContent: normalizedContent,
            onSend,
          })}
        </div>
      )}
    </div>
  );
};

export default ContentRender;
