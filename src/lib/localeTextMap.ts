export type LocaleTextValues<T extends readonly unknown[]> = {
  readonly [Index in keyof T]: string;
};

export const buildLocaleTexts = <const TKeys extends readonly string[]>(
  keys: TKeys,
  values: LocaleTextValues<TKeys>
): Record<TKeys[number], string> =>
  Object.fromEntries(keys.map((key, index) => [key, values[index]])) as Record<
    TKeys[number],
    string
  >;
