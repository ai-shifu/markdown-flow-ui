import React from "react";
import type { InteractionDefaultValueOptions } from "../../lib/interaction-defaults";
import {
  getMarkdownFlowDirection,
  getMarkdownFlowLanguage,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import ContentRender from "../ContentRender";
import { CustomRenderBarProps, OnSendContentParams } from "../types";
import "./markdownFlow.css";

export interface MarkdownFlowProps {
  initialContentList?: {
    content: string;
    isFinished?: boolean;
    userInput?: string;
    defaultInputText?: string;
    defaultButtonText?: string;
    defaultSelectedValues?: string[];
    readonly?: boolean;
    customRenderBar?: CustomRenderBarProps;
    onClickCustomButtonAfterContent?: () => void;
    dynamicInteractionFormat?: string;
  }[];
  /**
   * Locale used for built-in UI text when a more specific text prop is not provided.
   * Arabic sets RTL direction; other supported locales set LTR direction.
   * When omitted, direction is inherited from the host and UI text uses the default locale.
   */
  locale?: MarkdownFlowLocale;
  /** Overrides the locale-derived language. */
  lang?: string;
  customRenderBar?: CustomRenderBarProps;
  onSend?: (content: OnSendContentParams) => void;
  // Multi-select confirm button text (i18n support)
  confirmButtonText?: string;
  // Copy button text for code blocks
  copyButtonText?: string;
  // Copied state text for code blocks
  copiedButtonText?: string;
  beforeSend?: (content: OnSendContentParams) => boolean;
  interactionDefaultValueOptions?: InteractionDefaultValueOptions;
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  initialContentList = [],
  locale,
  lang,
  customRenderBar,
  onSend: onSendProp,
  confirmButtonText,
  copyButtonText,
  copiedButtonText,
  beforeSend: beforeSendProp,
  interactionDefaultValueOptions,
}) => {
  return (
    <div
      className="markdown-flow"
      dir={getMarkdownFlowDirection(locale)}
      lang={lang ?? getMarkdownFlowLanguage(locale)}
    >
      {initialContentList.map((contentInfo, index) => {
        const isFinished = contentInfo.isFinished ?? false;
        const onSend = isFinished ? undefined : onSendProp;
        const beforeSend = beforeSendProp ?? (() => true);
        return (
          <ContentRender
            key={index}
            content={contentInfo.content}
            userInput={contentInfo.userInput}
            defaultInputText={contentInfo.defaultInputText}
            defaultButtonText={contentInfo.defaultButtonText}
            defaultSelectedValues={contentInfo.defaultSelectedValues}
            readonly={contentInfo.readonly}
            customRenderBar={contentInfo.customRenderBar || customRenderBar}
            onSend={onSend}
            beforeSend={beforeSend}
            locale={locale}
            lang={lang}
            interactionDefaultValueOptions={interactionDefaultValueOptions}
            onClickCustomButtonAfterContent={
              contentInfo.onClickCustomButtonAfterContent
            }
            confirmButtonText={confirmButtonText}
            copyButtonText={copyButtonText}
            copiedButtonText={copiedButtonText}
            dynamicInteractionFormat={contentInfo.dynamicInteractionFormat}
          />
        );
      })}
    </div>
  );
};

export default MarkdownFlow;
