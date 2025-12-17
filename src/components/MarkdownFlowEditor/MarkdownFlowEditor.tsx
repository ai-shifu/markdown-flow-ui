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
import CustomDialog from "./components/CustomDialog";
import CustomPopover from "./components/CustomPopover";
import EditorToolbar from "./components/EditorToolbar";
import VariableSearchDropdown from "./components/VariableSearchDropdown";
import EditorContext from "./editor-context";
import ImageInject from "./components/ImageInject";
import VideoInject from "./components/VideoInject";
import VariableSelect from "./components/VariableSelect";
import {
  SelectedOption,
  IEditorContext,
  Variable,
  SelectContentInfo,
  PopoverPosition,
} from "./types";
import "./markdownFlowEditor.css";

import {
  createSlashCommands,
  parseContentInfo,
  getVideoContentToInsert,
  extractVariableNames,
  createVariableExpressionRegexp,
} from "./utils";
import ImgPlaceholder from "./plugins/ImgPlaceholder";
import VideoPlaceholder from "./plugins/VideoPlaceholder";
import VariablePlaceholder from "./plugins/VariablePlaceholder";
// import createFixedTextPlaceholder from "./plugins/FixedTextPlaceholder";
// import DividerPlaceholder from "./plugins/DividerPlaceholder";
import enUS from "./locales/en-US.json";
import zhCN from "./locales/zh-CN.json";
import { initReactI18next, useTranslation } from "react-i18next";
import i18next from "i18next";
import { UploadProps } from "./uploadTypes";

const resources = {
  "en-US": { translation: enUS },
  "zh-CN": { translation: zhCN },
};

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: "en-US",
    fallbackLng: "en-US",
    interpolation: { escapeValue: false },
  });
} else {
  Object.entries(resources).forEach(([lng, resource]) => {
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
  variables?: Variable[];
  systemVariables?: Variable[];
  onChange?: (value: string) => void;
  onBlur?: () => void;
  locale?: "en-US" | "zh-CN";
  uploadProps?: UploadProps;
  disabled?: boolean;
};

const EMPTY_VARIABLES: Variable[] = [];

// Detect whether cursor is still inside a {{variable}} expression
const isCursorInsideVariableExpression = (
  content: string,
  cursorPosition: number
) => {
  if (!content || cursorPosition < 0) {
    return false;
  }
  const regexp = createVariableExpressionRegexp();
  let match: RegExpExecArray | null;

  while ((match = regexp.exec(content)) !== null) {
    const matchStart = match.index ?? 0;
    const matchEnd = matchStart + match[0].length;
    const innerStart = matchStart + 2;
    const innerEnd = matchEnd - 2;
    if (cursorPosition >= innerStart && cursorPosition <= innerEnd) {
      return true;
    }
    if (regexp.lastIndex === match.index) {
      regexp.lastIndex++;
    }
  }

  return false;
};

const Editor: React.FC<EditorProps> = ({
  content = "",
  editMode = EditMode.CodeEdit,
  variables: initialVariables,
  systemVariables: initialSystemVariables,
  onChange,
  onBlur,
  locale = "en-US",
  uploadProps,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);
  const activeLocale = (locale || i18n.language) as "en-US" | "zh-CN";
  const currentStrings = resources[activeLocale]?.translation ?? enUS;
  const toolbarLabels = useMemo(
    () => ({
      image: t("toolbarInsertImage", {
        defaultValue: "Insert image",
      }),
      video: t("toolbarInsertVideo", {
        defaultValue: "Insert video",
      }),
      variable: currentStrings.slashVariable ?? "Variable",
      addVariable: t("toolbarInsertNewVariable", {
        defaultValue: "Insert new variable",
      }),
      search: t("toolbarInsertExistingVariable", {
        defaultValue: "Insert existing variable",
      }),
      confirmOutput: t("toolbarConfirmOutput", {
        defaultValue: "Confirm output",
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
      singleChoiceOption1: t("toolbarChoiceOption1", {
        defaultValue: "Option 1",
      }),
      singleChoiceOption2: t("toolbarChoiceOption2", {
        defaultValue: "Option 2",
      }),
    }),
    [
      currentStrings.slashImage,
      currentStrings.slashVideo,
      currentStrings.slashVariable,
      t,
    ]
  );
  const variableSearchLabels = useMemo(
    () => ({
      searchPlaceholder: t("variableSearchPlaceholder", {
        defaultValue: "Search variable",
      }),
      systemLabel: t("variableSectionSystem", "System Variables"),
      customLabel: t("variableSectionCustom", "Custom Variables"),
      emptyLabel: t("variableNotFound", "No variables found"),
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
  const safeInitialVariables = initialVariables ?? EMPTY_VARIABLES;
  const safeInitialSystemVariables = initialSystemVariables ?? EMPTY_VARIABLES;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  const [variables, setVariables] = useState<Variable[]>(safeInitialVariables);
  const [systemVariables, setSystemVariables] = useState<Variable[]>(
    safeInitialSystemVariables
  );

  useEffect(() => {
    setVariables(safeInitialVariables);
  }, [safeInitialVariables]);

  useEffect(() => {
    setSystemVariables(safeInitialSystemVariables);
  }, [safeInitialSystemVariables]);

  const [selectedOption, setSelectedOption] = useState<SelectedOption>(
    SelectedOption.Empty
  );
  const [selectContentInfo, setSelectContentInfo] =
    useState<SelectContentInfo | null>();
  const editorViewRef = useRef<EditorView | null>(null);
  const pendingVariableContentRef = useRef<string | null>(null);
  const variableSearchAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [variableSearchOpen, setVariableSearchOpen] = useState(false);
  const closeVariableSearch = useCallback(() => {
    setVariableSearchOpen(false);
    variableSearchAnchorRef.current = null;
  }, []);
  const handleVariableSearchToggle = useCallback(
    (button: HTMLButtonElement) => {
      if (disabled) {
        return;
      }
      if (variableSearchOpen && variableSearchAnchorRef.current === button) {
        closeVariableSearch();
        return;
      }
      variableSearchAnchorRef.current = button;
      setVariableSearchOpen(true);
    },
    [closeVariableSearch, disabled, variableSearchOpen]
  );

  const editorContextValue: IEditorContext = {
    selectedOption,
    setSelectedOption,
    dialogOpen,
    setDialogOpen,
    popoverOpen,
    setPopoverOpen,
    popoverPosition,
    setPopoverPosition,
  };

  useEffect(() => {
    if (!disabled) {
      return;
    }
    setDialogOpen(false);
    setPopoverOpen(false);
    setSelectedOption(SelectedOption.Empty);
    setSelectContentInfo(null);
    setPopoverPosition(null);
    closeVariableSearch();
  }, [
    closeVariableSearch,
    disabled,
    setDialogOpen,
    setPopoverOpen,
    setPopoverPosition,
    setSelectedOption,
    setSelectContentInfo,
  ]);

  const addVariablesFromContent = useCallback(
    (text: string) => {
      if (editMode !== EditMode.QuickEdit || !text) {
        return;
      }

      const names = extractVariableNames(text);
      if (!names.length) {
        return;
      }

      const systemNameSet = new Set(
        systemVariables.map((variable) => variable.name.toLowerCase())
      );

      setVariables((prev) => {
        const existingNames = new Set(
          prev.map((variable) => variable.name.toLowerCase())
        );
        const addedNames = new Set<string>();
        const newVariables: Variable[] = [];

        names.forEach((rawName) => {
          const normalized = rawName.toLowerCase();
          if (
            !rawName ||
            systemNameSet.has(normalized) ||
            existingNames.has(normalized) ||
            addedNames.has(normalized)
          ) {
            return;
          }
          newVariables.push({ name: rawName });
          addedNames.add(normalized);
        });

        if (!newVariables.length) {
          return prev;
        }

        return [...newVariables, ...prev];
      });
    },
    [editMode, systemVariables]
  );

  useEffect(() => {
    addVariablesFromContent(content);
  }, [content, addVariablesFromContent]);

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
      closeVariableSearch();
      // if (option === SelectedOption.FixedText) {
      //   insertFixedText();
      //   setSelectedOption(SelectedOption.Empty);
      //   setDialogOpen(false);
      //   setPopoverOpen(false);
      //   setSelectContentInfo(null);
      //   setPopoverPosition(null);
      //   return;
      // }

      // if (option === SelectedOption.Divider) {
      //   insertDivider();
      //   setSelectedOption(SelectedOption.Empty);
      //   setDialogOpen(false);
      //   setPopoverOpen(false);
      //   setSelectContentInfo(null);
      //   setPopoverPosition(null);
      //   return;
      // }

      setSelectedOption(option);

      if (option === SelectedOption.Variable) {
        if (editorViewRef.current) {
          const { state } = editorViewRef.current;
          const pos = state.selection.main.from;
          const coords = editorViewRef.current.coordsAtPos(pos);
          if (coords) {
            setPopoverPosition({
              x: coords.left,
              y: coords.bottom,
            });
          }
        }
        setPopoverOpen(true);
      } else {
        setDialogOpen(true);
      }
    },
    [closeVariableSearch, disabled]
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

  const insertVariableTemplate = useCallback(() => {
    if (disabled || !editorViewRef.current) {
      return;
    }
    closeVariableSearch();
    const view = editorViewRef.current;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const template = "{{}}";
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
  }, [closeVariableSearch, disabled]);

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
    const optionLabel1 = toolbarLabels.singleChoiceOption1 ?? "选项1";
    const optionLabel2 = toolbarLabels.singleChoiceOption2 ?? "选项2";
    const template = `?[%{{}}${optionLabel1}|${optionLabel2}]`;
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 5,
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
    const optionLabel1 = toolbarLabels.singleChoiceOption1 ?? "选项1";
    const optionLabel2 = toolbarLabels.singleChoiceOption2 ?? "选项2";
    const template = `?[%{{}}${optionLabel1}||${optionLabel2}]`;
    dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: template,
      },
      selection: {
        anchor: selection.from + 5,
      },
    });
    view.focus();
  }, [
    disabled,
    toolbarLabels.singleChoiceOption1,
    toolbarLabels.singleChoiceOption2,
  ]);

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
      const sanitizedHtmlUrl = resourceUrl.replace(/"/g, "&quot;");
      const clampedScale =
        typeof scalePercent === "number"
          ? Math.max(1, Math.min(1000, Math.round(scalePercent)))
          : undefined;
      const sanitizedTitle = resourceTitle?.replace(/"/g, "&quot;");
      const escapeMarkdownText = (text: string) =>
        text.replace(/([\[\]\\])/g, "\\$1");
      const markdownTitle = resourceTitle
        ? escapeMarkdownText(resourceTitle)
        : "";
      const widthAttribute =
        typeof clampedScale === "number" && clampedScale !== 100
          ? ` width="${clampedScale}%"`
          : "";
      const htmlTitleAttributes = sanitizedTitle
        ? ` alt="${sanitizedTitle}" title="${sanitizedTitle}"`
        : "";

      const textToInsert =
        !clampedScale || clampedScale === 100
          ? `![${markdownTitle}](${resourceUrl})`
          : `<img src="${sanitizedHtmlUrl}"${htmlTitleAttributes}${widthAttribute} />`;
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
    [insertText, selectedOption, disabled]
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
    [insertText, selectedOption, disabled]
  );

  const handleSelectVariable = useCallback(
    (variable: Variable) => {
      if (disabled) {
        return;
      }
      const textToInsert = `{{${variable.name}}}`;
      if (selectContentInfo?.type === SelectedOption.Variable) {
        deleteSelectedContent();
        if (!editorViewRef.current) return;
        const { dispatch } = editorViewRef.current;
        dispatch({
          changes: { from: selectContentInfo.from, insert: textToInsert },
        });
      } else {
        insertText(textToInsert);
      }
      setPopoverOpen(false);
      closeVariableSearch();
    },
    [
      insertText,
      selectedOption,
      deleteSelectedContent,
      selectContentInfo,
      disabled,
      closeVariableSearch,
    ]
  );

  const slashCommandsExtension = useCallback(() => {
    return autocompletion({
      override: [
        createSlashCommands(onSelectedOption, {
          // divider: currentStrings.slashDivider,
          // fixedText: currentStrings.slashFixedText,
          image: currentStrings.slashImage,
          video: currentStrings.slashVideo,
          variable: currentStrings.slashVariable,
        }),
      ],
    });
  }, [
    // currentStrings.slashDivider,
    // currentStrings.slashFixedText,
    currentStrings.slashImage,
    currentStrings.slashVideo,
    currentStrings.slashVariable,
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

  const handleEditorUpdate = useCallback(
    (update: ViewUpdate) => {
      editorViewRef.current = update.view;
      if (
        editMode === EditMode.QuickEdit &&
        pendingVariableContentRef.current &&
        update.selectionSet
      ) {
        const cursorPosition = update.state.selection.main.head;
        const docText = update.state.doc.toString();
        const stillInside = isCursorInsideVariableExpression(
          docText,
          cursorPosition
        );
        if (!stillInside) {
          addVariablesFromContent(docText);
          pendingVariableContentRef.current = null;
        }
      }
    },
    [addVariablesFromContent, editMode]
  );

  const handleTagClick = useCallback(
    (event: any) => {
      event.stopPropagation();
      if (disabled) {
        return;
      }
      const { type, from, to, dataset, target } = event.detail;
      const value = parseContentInfo(type, dataset);
      setSelectContentInfo({
        type,
        value,
        from,
        to,
      });
      setSelectedOption(type);

      if (type === SelectedOption.Variable) {
        if (target) {
          const rect = target.getBoundingClientRect();
          setPopoverPosition({
            x: rect.left,
            y: rect.bottom,
          });
        }
        setPopoverOpen(true);
      } else {
        setDialogOpen(true);
      }
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
    if (!popoverOpen && selectedOption === SelectedOption.Variable) {
      setSelectedOption(SelectedOption.Empty);
      setSelectContentInfo(null);
    }
  }, [popoverOpen, selectedOption]);

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

  const editorExtensions = useMemo(() => {
    const extensions = [
      EditorView.lineWrapping,
      markdown(),
      syntaxHighlighting(defaultHighlightStyle),
    ];

    if (!disabled) {
      extensions.push(slashCommandsExtension());
    }

    if (editMode === EditMode.QuickEdit) {
      extensions.push(
        ImgPlaceholder,
        VideoPlaceholder,
        VariablePlaceholder
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
  }, [disabled, editMode, slashCommandsExtension, handleEditorUpdate]);

  const handleContentChange = useCallback(
    (value: string) => {
      if (disabled) {
        return;
      }
      const cursorPosition =
        editorViewRef.current?.state.selection.main.head ?? -1;
      const skipAddition = isCursorInsideVariableExpression(
        value,
        cursorPosition
      );
      if (skipAddition) {
        pendingVariableContentRef.current = value;
      } else {
        pendingVariableContentRef.current = null;
        addVariablesFromContent(value);
      }
      onChange?.(value);
    },
    [addVariablesFromContent, onChange, disabled]
  );

  return (
    <div
      className="markdown-flow-editor"
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled}
    >
      <EditorToolbar
        disabled={disabled}
        labels={toolbarLabels}
        onSelect={onSelectedOption}
        onInsertVariablePlaceholder={insertVariableTemplate}
        onVariableSearchToggle={handleVariableSearchToggle}
        onVariableSearchClose={closeVariableSearch}
        onInsertConfirmOutput={insertConfirmOutputMarker}
        onInsertLink={insertLinkTemplate}
        onInsertButton={insertButtonTemplate}
        onInsertSingleChoice={insertSingleChoiceTemplate}
        onInsertMultiChoice={insertMultiChoiceTemplate}
        variableSearchActive={!disabled && variableSearchOpen}
      />
      <VariableSearchDropdown
        open={!disabled && variableSearchOpen}
        anchorElement={variableSearchAnchorRef.current}
        onClose={closeVariableSearch}
        onSelect={handleSelectVariable}
        variables={variables}
        systemVariables={systemVariables}
        labels={variableSearchLabels}
      />
      <EditorContext.Provider value={editorContextValue}>
        <CodeMirror
          extensions={editorExtensions}
          basicSetup={{
            lineNumbers: false,
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
            labels={{
              title:
                selectedOption === SelectedOption.Image
                  ? t("dialogTitleImage")
                  : selectedOption === SelectedOption.Video
                    ? t("dialogTitleVideo")
                    : selectedOption === SelectedOption.Variable
                      ? t("dialogTitleVariable")
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

        {!disabled && (
          <CustomPopover>
            <VariableSelect
              variables={variables}
              systemVariables={systemVariables}
              selectedName={selectContentInfo?.value?.variableName}
              onSelect={handleSelectVariable}
              onAddVariable={(variable) => {
                setVariables((prev) => {
                  const normalized = variable.name.toLowerCase();
                  const exists = prev.some(
                    (item) => item.name.toLowerCase() === normalized
                  );
                  if (exists) {
                    return prev;
                  }
                  return [variable, ...prev];
                });
              }}
            />
          </CustomPopover>
        )}
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
