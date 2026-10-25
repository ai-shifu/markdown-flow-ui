export const CJK_SAFE_SANS_FONT_FAMILIES = [
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  "Oxygen",
  "Ubuntu",
  "Cantarell",
  '"Open Sans"',
  '"Helvetica Neue"',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  '"Source Han Sans SC"',
  '"Noto Sans CJK SC"',
  '"Noto Sans SC"',
  "Arial",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
  "sans-serif",
] as const;

export const CJK_SAFE_SANS_FONT_FAMILY = CJK_SAFE_SANS_FONT_FAMILIES.join(", ");

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

export const addCjkSafeSansToTailwindConfig = (
  config: unknown
): UnknownRecord => {
  const rootConfig = asRecord(config);
  const theme = asRecord(rootConfig.theme);
  const extend = asRecord(theme.extend);
  const fontFamily = asRecord(extend.fontFamily);

  return {
    ...rootConfig,
    theme: {
      ...theme,
      extend: {
        ...extend,
        fontFamily: {
          ...fontFamily,
          sans: [...CJK_SAFE_SANS_FONT_FAMILIES],
        },
      },
    },
  };
};
