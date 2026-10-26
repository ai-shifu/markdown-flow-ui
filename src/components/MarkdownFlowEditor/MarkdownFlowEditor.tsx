"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { autocompletion } from "@codemirror/autocomplete";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import CustomDialog from "./components/CustomDialog";
import EditorToolbar from "./components/EditorToolbar";
import EditorContext from "./editor-context";
import ImageInject from "./components/ImageInject";
import VideoInject from "./components/VideoInject";
import {
  SelectedOption,
  IEditorContext,
  Variable,
  SelectContentInfo,
  EditorAction,
  EditorApi,
} from "./types";
import "./markdownFlowEditor.css";

import {
  createSlashCommands,
  parseContentInfo,
  getImageContentToInsert,
  getVideoContentToInsert,
} from "./utils";
import ImgPlaceholder from "./plugins/ImgPlaceholder";
import VideoPlaceholder from "./plugins/VideoPlaceholder";
import { mediaPlaceholderLabels } from "./plugins/mediaPlaceholderLabels";
import SyntaxHighlighter from "./plugins/SyntaxHighlighter";
// import createFixedTextPlaceholder from "./plugins/FixedTextPlaceholder";
// import DividerPlaceholder from "./plugins/DividerPlaceholder";
import { initReactI18next, useTranslation } from "react-i18next";
import i18next from "i18next";
import { UploadProps } from "./uploadTypes";
import {
  DEFAULT_EDITOR_LOCALE,
  editorLocaleResources,
  getEditorLocaleMessages,
} from "./editorI18n";
import {
  getMarkdownFlowDirection,
  getMarkdownFlowLanguage,
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import { useDetachedLanguage } from "../../lib/useDetachedLanguage";
import { useResolvedDirection } from "../../lib/useResolvedDirection";

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: editorLocaleResources,
    lng: DEFAULT_EDITOR_LOCALE,
    fallbackLng: DEFAULT_EDITOR_LOCALE,
    interpolation: { escapeValue: false },
  });
} else {
  Object.entries(editorLocaleResources).forEach(([lng, resource]) => {
    i18next.addResourceBundle(
      lng,
      "translation",
      resource.translation,
      true,
      true
    );
  });
}

export enum EditMode {
  CodeEdit = "codeEdit",
  QuickEdit = "quickEdit",
}

type EditorProps = {
  content?: string;
  editMode?: EditMode;
  /** @deprecated Variable picking is no longer supported. Retained for compatibility. */
  variables?: Variable[];
  /** @deprecated Variable picking is no longer supported. Retained for compatibility. */
  systemVariables?: Variable[];
  onChange?: (value: string) => void;
  onBlur?: () => void;
  locale?: MarkdownFlowLocale;
  /** Overrides the locale-derived language. */
  lang?: string;
  uploadProps?: UploadProps;
  disabled?: boolean;
  toolbarActionsRight?: EditorAction[];
  onReady?: (api: EditorApi) => void;
};

const Editor: React.FC<EditorProps> = ({
  content = "",
  editMode = EditMode.CodeEdit,
  onChange,
  onBlur,
  locale,
  lang,
  uploadProps,
  disabled = false,
  toolbarActionsRight,
  onReady,
}) => {
  const { t, i18n } = useTranslation();
  const resolvedLocale = normalizeMarkdownFlowLocale(
    locale ?? DEFAULT_EDITOR_LOCALE
  );
  const direction = getMarkdownFlowDirection(locale);
  const language = lang ?? getMarkdownFlowLanguage(locale);

  useEffect(() => {
    if (i18n.language !== resolvedLocale) {
      i18n.changeLanguage(resolvedLocale);
    }
  }, [i18n, resolvedLocale]);

  const currentStrings = getEditorLocaleMessages(resolvedLocale);
  const toolbarLabels = useMemo(
    () => ({
      image: t("toolbarInsertImage", {
        defaultValue: "Insert image",
      }),
      video: t("toolbarInsertVideo", {
        defaultValue: "Insert video",
      }),
      confirmOutput: t("toolbarConfirmOutput", {
        defaultValue: "Insert fixed output",
      }),
      insertLink: t("toolbarInsertLink", {
        defaultValue: "Insert link",
      }),
      insertButton: t("toolbarInsertButton", {
        defaultValue: "Insert button",
      }),
      insertSingleChoice: t("toolbarInsertSingleChoice", {
        defaultValue: "Insert single choice",
      }),
      insertMultiChoice: t("toolbarInsertMultiChoice", {
        defaultValue: "Insert multi choice",
      }),
      insertInput: t("toolbarInsertInput", {
        defaultValue: "Insert input",
      }),
      singleChoiceOption1: t("toolbarChoiceOption1", {
        defaultValue: "Option 1",
      }),
      singleChoiceOption2: t("toolbarChoiceOption2", {
        defaultValue: "Option 2",
      }),
      inputPlaceholder: t("toolbarInputPlaceholder", {
        defaultValue: "Please enter",
      }),
    }),
    [t]
  );
  const placeholderText =
    editMode === EditMode.QuickEdit
      ? t("placeholderQuickEdit", {
          defaultValue: t("placeholderCodeEdit", {
            defaultValue: t("placeholder"),
          }),
        })
      : t("placeholderCodeEdit", { defaultValue: t("placeholder") });
  const [dialogOpen, setDialogOpen] = useState(false);
  const editorRootRef = useRef<HTMLDivElement>(null);
  const portalLanguage = useDetachedLanguage(editorRootRef, language);
  const { resolvedDirection: portalDirection } = useResolvedDirection(
    editorRootRef,
    direction
  );
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(
    SelectedOption.Empty
  );
  const [selectContentInfo, setSelectContentInfo] =
    useState<SelectContentInfo | null>();
  const editorViewRef = useRef<EditorView | null>(null);
  const editorContextValue: IEditorContext = {
    selectedOption,
    setSelectedOption,
    dialogOpen,
    setDialogOpen,
  };

  useEffect(() => {
    if (!disabled) {
      return;
    }
    setDialogOpen(false);
    setSelectedOption(SelectedOption.Empty);
    setSelectContentInfo(null);
  }, [disabled, setDialogOpen, setSelectedOption, setSelectContentInfo]);

  // const insertFixedText = useCallback(() => {
  //   if (!editorViewRef.current) return;
  //   const view = editorViewRef.current;
  //   const { state, dispatch } = view;
  //   const selection = state.selection.main;
  //   const selectedText = state.sliceDoc(selection.from, selection.to);
  //   const startTag = "===";
  //   const endTag = "===";
  //   const insertContent = `${startTag}${selectedText ?? ""}${endTag}`;

  //   dispatch({
  //     changes: {
  //       from: selection.from,
  //       to: selection.to,
  //       insert: insertContent,
  //     },
  //     selection: {
  //       anchor: selection.from + startTag.length + (selectedText?.length ?? 0),
  //     },
  //   });
  //   view.focus();
  // }, []);

  // const insertDivider = useCallback(() => {
  //   if (!editorViewRef.current) return;
  //   const view = editorViewRef.current;
  //   const { state, dispatch } = view;
  //   const selection = state.selection.main;
  //   const insertContent = `\n\n---\n\n`;

  //   dispatch({
  //     changes: {
  //       from: selection.from,
  //       to: selection.to,
  //       insert: insertContent,
  //     },
  //     selection: {
  //       anchor: selection.from + insertContent.length,
  //     },
  //   });
  //   view.focus();
  // }, []);

  const onSelectedOption = useCallback(
    (option: SelectedOption) => {
      if (disabled) {
        return;
      }
      // if (option === SelectedOption.FixedText) {
      //   insertFixedText();
      //   setSelectedOption(SelectedOption.Empty);
      //   setDialogOpen(false);
      //   setSelectContentInfo(null);
      //   return;
      // }

      // if (option === SelectedOption.Divider) {
      //   insertDivider();
      //   setSelectedOption(SelectedOption.Empty);
      //   setDialogOpen(false);
      //   setSelectContentInfo(null);
      //   return;
      // }

      setSelectedOption(option);

      setDialogOpen(true);
    },
    [disabled]
  );

  const insertText = useCallback(
    (text: string) => {
      if (disabled || !editorViewRef.current) return;

      const { state, dispatch } = editorViewRef.current;
      const from = state.selection.main.from;

      dispatch({
        changes: { from, insert: text },
        selection: { anchor: from + text.length },
      });
    },
    [editorViewRef, disabled]
  );

  const replaceSelection = useCallback(
    (text: string) => {
      if (disabled || !editorViewRef.current) {
        return;
      }
      const { state, dispatch } = editorViewRef.current;
      const selection = state.selection.main;
      dispatch({
        changes: { from: selection.from, to: selection.to, insert: text },
        selection: { anchor: selection.from + text.length },
      });
    },
    [disabled]
  );

  const focusEditor = useCallback(() => {
    editorViewRef.current?.focus();
  }, []);

  const getContent = useCallback(() => {
    return editorViewRef.current?.state.doc.toString() ?? "";
  }, []);

  const setContent = useCallback(
    (text: string) => {
      if (disabled) {
        return;
      }
      if (!editorViewRef.current) {
        onChange?.(text);
        return;
      }
      const view = editorViewRef.current;
      const { state, dispatch } = view;
      dispatch({
        changes: { from: 0, to: state.doc.length, insert: text },
        selection: { anchor: text.length },
      });
    },
    [disabled, onChange]
  );

  const deleteSelectedContent = useCallback(() => {
    if (disabled) {
      return;
    }
    if (
      !selectContentInfo ||
      !editorViewRef.current ||
      selectContentInfo.from === -1
    )
      return;

    const { from, to } = selectContentInfo;
    const { dispatch } = editorViewRef.current;

    dispatch({
      changes: { from, to, insert: "" },
    });
  }, [selectContentInfo, editorViewRef, disabled]);

  const insertConfirmOutputMarker = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const template = "======";
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 3,
      },
    });
    view.focus();
  }, [disabled]);

  const insertLinkTemplate = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const template = "[]()";
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 1,
      },
    });
    view.focus();
  }, [disabled]);

  const insertButtonTemplate = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const template = "?[]";
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 2,
      },
    });
    view.focus();
  }, [disabled]);

  const insertSingleChoiceTemplate = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const optionLabel1 = toolbarLabels.singleChoiceOption1;
    const optionLabel2 = toolbarLabels.singleChoiceOption2;
    const template = `?[%{{  }} ${optionLabel1} | ${optionLabel2}]`;
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 6,
      },
    });
    view.focus();
  }, [
    disabled,
    toolbarLabels.singleChoiceOption1,
    toolbarLabels.singleChoiceOption2,
  ]);

  const insertMultiChoiceTemplate = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const optionLabel1 = toolbarLabels.singleChoiceOption1;
    const optionLabel2 = toolbarLabels.singleChoiceOption2;
    const template = `?[%{{  }} ${optionLabel1} || ${optionLabel2}]`;
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 6,
      },
    });
    view.focus();
  }, [
    disabled,
    toolbarLabels.singleChoiceOption1,
    toolbarLabels.singleChoiceOption2,
  ]);

  const insertInputFieldTemplate = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const placeholder = toolbarLabels.inputPlaceholder ?? "请输入";
    const template = `?[%{{  }}...${placeholder}]`;
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 6,
      },
    });
    view.focus();
  }, [disabled, toolbarLabels.inputPlaceholder]);

  const handleSelectImage = useCallback(
    ({
      resourceUrl,
      resourceTitle,
      scalePercent,
    }: {
      resourceUrl?: string;
      resourceTitle?: string;
      scalePercent?: number;
    }) => {
      if (!resourceUrl || disabled) return;
      const textToInsert = getImageContentToInsert({
        resourceUrl,
        resourceTitle,
        scalePercent,
      });
      if (selectContentInfo?.type === SelectedOption.Image) {
        deleteSelectedContent();
        if (!editorViewRef.current) return;
        const { dispatch } = editorViewRef.current;
        dispatch({
          changes: { from: selectContentInfo.from, insert: textToInsert },
        });
      } else {
        insertText(textToInsert);
      }
      setDialogOpen(false);
    },
    [deleteSelectedContent, disabled, insertText, selectContentInfo]
  );

  const handleSelectVideo = useCallback(
    ({
      resourceUrl,
      resourceTitle,
    }: {
      resourceUrl: string;
      resourceTitle: string;
    }) => {
      if (disabled) {
        return;
      }
      const textToInsert = getVideoContentToInsert(resourceUrl, resourceTitle);
      if (selectContentInfo?.type === SelectedOption.Video) {
        deleteSelectedContent();
        if (!editorViewRef.current) return;
        const { dispatch } = editorViewRef.current;
        dispatch({
          changes: { from: selectContentInfo.from, insert: textToInsert },
        });
      } else {
        insertText(textToInsert);
      }
      setDialogOpen(false);
    },
    [deleteSelectedContent, disabled, insertText, selectContentInfo]
  );

  const slashCommandsExtension = useCallback(() => {
    return autocompletion({
      override: [
        createSlashCommands(onSelectedOption, {
          // divider: currentStrings.slashDivider,
          // fixedText: currentStrings.slashFixedText,
          image: currentStrings.slashImage,
          video: currentStrings.slashVideo,
        }),
      ],
    });
  }, [
    // currentStrings.slashDivider,
    // currentStrings.slashFixedText,
    currentStrings.slashImage,
    currentStrings.slashVideo,
    onSelectedOption,
  ]);

  // const fixedTextPlaceholderExtension = useMemo(
  //   () =>
  //     createFixedTextPlaceholder(
  //       currentStrings.fixedTextPlaceholder ?? "添加固定文本",
  //       currentStrings.fixedTextTooltip ??
  //         currentStrings.slashFixedText ??
  //         "固定文本"
  //     ),
  //   [
  //     currentStrings.fixedTextPlaceholder,
  //     currentStrings.fixedTextTooltip,
  //     currentStrings.slashFixedText,
  //   ]
  // );

  const handleEditorUpdate = useCallback((update: ViewUpdate) => {
    editorViewRef.current = update.view;
  }, []);

  const handleTagClick = useCallback(
    (event: any) => {
      event.stopPropagation();
      if (disabled) {
        return;
      }
      const { type, from, to, dataset } = event.detail;
      const value = parseContentInfo(type, dataset);
      setSelectContentInfo({
        type,
        value,
        from,
        to,
      });
      setSelectedOption(type);

      setDialogOpen(true);
    },
    [disabled]
  );

  useEffect(() => {
    if (!dialogOpen) {
      setSelectedOption(SelectedOption.Empty);
      setSelectContentInfo(null);
    }
  }, [dialogOpen]);

  useEffect(() => {
    const handleWrap = (e: any) => {
      if (e.detail.view === editorViewRef.current) {
        handleTagClick(e);
      }
    };
    window.addEventListener("globalTagClick", handleWrap);
    return () => {
      window.removeEventListener("globalTagClick", handleWrap);
    };
  }, [handleTagClick]);

  const imagePlaceholderTitle = t("imageDefaultTitle");
  const videoPlaceholderTitle = t("videoDefaultTitle");
  const mediaPlaceholderLabelsExtension = useMemo(
    () =>
      mediaPlaceholderLabels.of({
        image: imagePlaceholderTitle,
        video: videoPlaceholderTitle,
      }),
    [imagePlaceholderTitle, videoPlaceholderTitle]
  );

  const editorExtensions = useMemo(() => {
    const extensions = [
      EditorView.lineWrapping,
      markdown(),
      syntaxHighlighting(defaultHighlightStyle),
      SyntaxHighlighter,
    ];

    if (!disabled) {
      extensions.push(slashCommandsExtension());
    }

    if (editMode === EditMode.QuickEdit) {
      extensions.push(
        mediaPlaceholderLabelsExtension,
        ImgPlaceholder,
        VideoPlaceholder
        // fixedTextPlaceholderExtension,
        // DividerPlaceholder,
      );
    }

    extensions.push(
      EditorView.updateListener.of((update) => {
        handleEditorUpdate(update);
      })
    );

    return extensions;
  }, [
    disabled,
    editMode,
    slashCommandsExtension,
    handleEditorUpdate,
    mediaPlaceholderLabelsExtension,
  ]);

  const handleContentChange = useCallback(
    (value: string) => {
      if (disabled) {
        return;
      }
      onChange?.(value);
    },
    [onChange, disabled]
  );

  const editorApi = useMemo(
    () => ({
      insertTextAtCursor: insertText,
      replaceSelection,
      focus: focusEditor,
      getContent,
      setContent,
    }),
    [focusEditor, getContent, insertText, replaceSelection, setContent]
  );

  const handleToolbarActionClick = useCallback(
    (action: EditorAction) => {
      if (disabled || "render" in action) {
        return;
      }
      action.onClick?.(editorApi);
    },
    [disabled, editorApi]
  );

  const toolbarRightSlot = useMemo(() => {
    if (!toolbarActionsRight?.length) {
      return null;
    }
    return (
      <div className="markdown-flow-editor-toolbar-right">
        {toolbarActionsRight.map((action) => {
          if ("render" in action) {
            return (
              <div
                className="markdown-flow-editor-toolbar-right-item"
                key={action.key}
              >
                {action.render(editorApi)}
              </div>
            );
          }
          const ariaLabel = action.label || action.tooltip || undefined;
          const button = (
            <button
              type="button"
              key={action.key}
              disabled={disabled || action.disabled}
              onClick={() => handleToolbarActionClick(action)}
              className="markdown-flow-editor-toolbar-right-button"
              aria-label={ariaLabel}
              title={action.label || action.tooltip}
            >
              {action.icon ? (
                <span className="toolbar-right-icon">{action.icon}</span>
              ) : null}
              {action.label ? (
                <span className="toolbar-right-label">{action.label}</span>
              ) : null}
            </button>
          );
          const wrapped = action.tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent
                side="top"
                dir={portalDirection}
                lang={portalLanguage}
              >
                {action.tooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            button
          );
          return (
            <div
              className="markdown-flow-editor-toolbar-right-item"
              key={action.key}
            >
              {wrapped}
            </div>
          );
        })}
      </div>
    );
  }, [
    disabled,
    editorApi,
    handleToolbarActionClick,
    portalDirection,
    portalLanguage,
    toolbarActionsRight,
  ]);

  useEffect(() => {
    onReady?.(editorApi);
  }, [editorApi]);

  return (
    <div
      className="markdown-flow-editor"
      ref={editorRootRef}
      dir={direction}
      lang={language}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled}
    >
      <EditorToolbar
        disabled={disabled}
        labels={toolbarLabels}
        tooltipDirection={portalDirection}
        tooltipLanguage={portalLanguage}
        onSelect={onSelectedOption}
        onInsertConfirmOutput={insertConfirmOutputMarker}
        onInsertLink={insertLinkTemplate}
        onInsertButton={insertButtonTemplate}
        onInsertSingleChoice={insertSingleChoiceTemplate}
        onInsertMultiChoice={insertMultiChoiceTemplate}
        onInsertInputField={insertInputFieldTemplate}
        rightSlot={toolbarRightSlot}
      />
      <div className="markdown-flow-editor-body relative overflow-auto">
        <EditorContext.Provider value={editorContextValue}>
          <CodeMirror
            extensions={editorExtensions}
            basicSetup={{
              lineNumbers: false,
              searchKeymap: false,
              syntaxHighlighting: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              foldGutter: false,
            }}
            className="rounded-md"
            placeholder={placeholderText}
            value={content}
            theme="light"
            minHeight="2rem"
            editable={!disabled}
            onChange={handleContentChange}
            onBlur={onBlur}
          />
          {!disabled && (
            <CustomDialog
              dir={portalDirection}
              lang={portalLanguage}
              labels={{
                closeButtonLabel: t("dialogCloseLabel"),
                title:
                  selectedOption === SelectedOption.Image
                    ? t("dialogTitleImage")
                    : selectedOption === SelectedOption.Video
                      ? t("dialogTitleVideo")
                      : t("dialogTitle"),
              }}
            >
              {selectedOption === SelectedOption.Image && (
                <ImageInject
                  value={selectContentInfo?.value}
                  onSelect={handleSelectImage}
                  uploadProps={uploadProps}
                />
              )}
              {selectedOption === SelectedOption.Video && (
                <VideoInject
                  value={selectContentInfo?.value}
                  onSelect={handleSelectVideo}
                />
              )}
            </CustomDialog>
          )}
        </EditorContext.Provider>
      </div>
    </div>
  );
};

export default Editor;
