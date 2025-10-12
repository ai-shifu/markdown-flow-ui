"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { autocompletion } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import CustomDialog from "./components/CustomDialog";
import EditorContext from "./editor-context";
import ImageInject from "./components/ImageInject";
import VideoInject from "./components/VideoInject";
import VariableSelect from "./components/VariableSelect";
import { SelectedOption, IEditorContext, Variable } from "./types";
import "./markdownFlowEditor.css";

import {
  createSlashCommands,
  parseContentInfo,
  getVideoContentToInsert,
} from "./utils";
import ImgPlaceholder from "./plugins/ImgPlaceholder";
import VideoPlaceholder from "./plugins/VideoPlaceholder";
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
  onChange?: (value: string) => void;
  onBlur?: () => void;
  locale?: "en-US" | "zh-CN";
  uploadProps?: UploadProps;
};

const Editor: React.FC<EditorProps> = ({
  content = "",
  editMode = EditMode.CodeEdit,
  variables,
  onChange,
  onBlur,
  locale = "en-US",
  uploadProps,
}) => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);
  const activeLocale = (locale || i18n.language) as "en-US" | "zh-CN";
  const currentStrings = resources[activeLocale]?.translation ?? enUS;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(
    SelectedOption.Empty
  );
  const [selectContentInfo, setSelectContentInfo] = useState<any>();
  const editorViewRef = useRef<EditorView | null>(null);

  const editorContextValue: IEditorContext = {
    selectedOption: SelectedOption.Empty,
    setSelectedOption,
    dialogOpen,
    setDialogOpen,
  };

  const onSelectedOption = useCallback((selectedOption: SelectedOption) => {
    setDialogOpen(true);
    setSelectedOption(selectedOption);
  }, []);

  const insertText = useCallback(
    (text: string) => {
      if (!editorViewRef.current) return;

      const { state, dispatch } = editorViewRef.current;
      const from = state.selection.main.from;

      dispatch({
        changes: { from, insert: text },
        selection: { anchor: from + text.length },
      });
    },
    [editorViewRef]
  );

  const deleteSelectedContent = useCallback(() => {
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
  }, [selectContentInfo, editorViewRef]);

  const handleSelectImage = useCallback(
    ({
      resourceUrl,
      resourceTitle,
    }: {
      resourceUrl?: string;
      resourceTitle?: string;
    }) => {
      const textToInsert = `![${resourceTitle}](${resourceUrl})`;
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
    [insertText, selectedOption]
  );

  const handleSelectVideo = useCallback(
    ({
      resourceUrl,
      resourceTitle,
    }: {
      resourceUrl: string;
      resourceTitle: string;
    }) => {
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
    [insertText, selectedOption]
  );

  const handleSelectVariable = useCallback(
    (variable: Variable) => {
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
      setDialogOpen(false);
    },
    [insertText, selectedOption, deleteSelectedContent, selectContentInfo]
  );

  const slashCommandsExtension = useCallback(() => {
    return autocompletion({
      override: [
        createSlashCommands(onSelectedOption, {
          image: currentStrings.slashImage,
          video: currentStrings.slashVideo,
        }),
      ],
    });
  }, [currentStrings.slashImage, currentStrings.slashVideo, onSelectedOption]);

  const handleEditorUpdate = useCallback((view: EditorView) => {
    editorViewRef.current = view;
  }, []);

  const handleTagClick = useCallback((event: any) => {
    event.stopPropagation();
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
  }, []);

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
  }, []);

  return (
    <div className="markdown-flow-editor">
      <EditorContext.Provider value={editorContextValue}>
        <CodeMirror
          extensions={[
            EditorView.lineWrapping,
            markdown(),
            syntaxHighlighting(defaultHighlightStyle),
            ...[
              editMode === EditMode.QuickEdit
                ? [
                    slashCommandsExtension(),
                    ImgPlaceholder,
                    VideoPlaceholder,
                    EditorView.updateListener.of((update) => {
                      handleEditorUpdate(update.view);
                    }),
                  ]
                : [],
            ],
          ]}
          basicSetup={{
            lineNumbers: false,
            syntaxHighlighting: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: false,
          }}
          className="rounded-md"
          placeholder={t("placeholder")}
          value={content}
          theme="light"
          minHeight="2rem"
          onChange={(value: string) => {
            onChange?.(value);
          }}
          onBlur={onBlur}
        />
        <CustomDialog
          labels={{
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
          {selectedOption === SelectedOption.Variable && (
            <VariableSelect
              variables={variables}
              onSelect={handleSelectVariable}
            />
          )}
        </CustomDialog>
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
