import { createInteractionParser } from "remark-flow";

export interface InteractionParseResult {
  buttonTexts?: string[];
  buttonValues?: string[];
  placeholder?: string;
  variableName?: string;
  isMultiSelect?: boolean;
}

export interface InteractionDefaultValues {
  buttonText?: string;
  inputText?: string;
  selectedValues?: string[];
}

export interface InteractionDefaultResolverParams {
  content?: string | null;
  rawValue?: string | null;
  interactionInfo?: InteractionParseResult | null;
}

export type InteractionDefaultResolver = (
  params: InteractionDefaultResolverParams
) => InteractionDefaultValues | null | undefined;

export interface InteractionDefaultValueOptions {
  resolveDefaultValues?: InteractionDefaultResolver;
}

interface StructuredInteractionPayload {
  buttonText?: unknown;
  inputText?: unknown;
  selectedValues?: unknown;
}

const interactionParser = createInteractionParser();

const parseInteractionBlock = (
  content?: string | null
): InteractionParseResult | null => {
  if (!content) {
    return null;
  }

  try {
    return interactionParser.parseToRemarkFormat(
      content
    ) as InteractionParseResult;
  } catch (error) {
    console.warn("Failed to parse interaction block", error);
    return null;
  }
};

const normalizeButtonValue = (
  token: string,
  info: InteractionParseResult
): { value: string; display?: string } | null => {
  if (!token) {
    return null;
  }

  const cleaned = token.trim();
  const buttonValues = info.buttonValues || [];
  const buttonTexts = info.buttonTexts || [];
  const valueIndex = buttonValues.indexOf(cleaned);

  if (valueIndex > -1) {
    return {
      value: buttonValues[valueIndex],
      display: buttonTexts[valueIndex],
    };
  }

  const textIndex = buttonTexts.indexOf(cleaned);

  if (textIndex > -1) {
    return {
      value: buttonValues[textIndex] || buttonTexts[textIndex],
      display: buttonTexts[textIndex],
    };
  }

  return null;
};

const splitPresetValues = (raw: string) => {
  return raw
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeStructuredInteractionDefaults = (
  payload?: StructuredInteractionPayload | null
): InteractionDefaultValues | null => {
  if (!payload || Array.isArray(payload)) {
    return null;
  }

  const selectedValues = Array.isArray(payload.selectedValues)
    ? payload.selectedValues
        .map((item) => `${item ?? ""}`.trim())
        .filter(Boolean)
    : undefined;
  const buttonText = `${payload.buttonText ?? ""}`.trim();
  const inputText =
    typeof payload.inputText === "string" ? payload.inputText : undefined;

  if (!selectedValues?.length && !buttonText && !inputText) {
    return null;
  }

  return {
    buttonText: buttonText || undefined,
    inputText,
    selectedValues: selectedValues?.length ? selectedValues : undefined,
  };
};

const parseStructuredInteractionDefaults = (rawValue?: string | null) => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StructuredInteractionPayload;
    return normalizeStructuredInteractionDefaults(parsed);
  } catch {
    return null;
  }
};

const resolveCustomInteractionDefaults = (
  content?: string | null,
  rawValue?: string | null,
  interactionInfo?: InteractionParseResult | null,
  options?: InteractionDefaultValueOptions
) => {
  return (
    options?.resolveDefaultValues?.({
      content,
      rawValue,
      interactionInfo,
    }) ?? null
  );
};

export const getInteractionDefaultValues = (
  content?: string | null,
  rawValue?: string | null,
  options?: InteractionDefaultValueOptions
): InteractionDefaultValues => {
  const normalized = rawValue?.toString().trim();

  if (!normalized) {
    return {};
  }

  const interactionInfo = parseInteractionBlock(content);
  const customDefaults = resolveCustomInteractionDefaults(
    content,
    normalized,
    interactionInfo,
    options
  );

  if (customDefaults) {
    return customDefaults;
  }

  const structuredDefaults = parseStructuredInteractionDefaults(normalized);

  if (structuredDefaults) {
    return structuredDefaults;
  }

  if (!interactionInfo) {
    return {
      buttonText: normalized,
      inputText: normalized,
    };
  }

  if (interactionInfo.isMultiSelect) {
    const tokens = splitPresetValues(normalized);

    if (!tokens.length) {
      return {};
    }

    const selectedValues: string[] = [];
    const customInputs: string[] = [];

    tokens.forEach((token) => {
      const mapped = normalizeButtonValue(token, interactionInfo);

      if (mapped) {
        selectedValues.push(mapped.value);
        return;
      }

      if (interactionInfo.placeholder) {
        customInputs.push(token);
        return;
      }

      selectedValues.push(token);
    });

    return {
      selectedValues: selectedValues.length ? selectedValues : undefined,
      inputText: customInputs.length ? customInputs.join(", ") : undefined,
    };
  }

  const mapped = normalizeButtonValue(normalized, interactionInfo);

  if (mapped) {
    return {
      buttonText: mapped.value || mapped.display || normalized,
    };
  }

  if (interactionInfo.placeholder) {
    return {
      inputText: normalized,
    };
  }

  return {
    buttonText: normalized,
    inputText: normalized,
  };
};

export const getInteractionDefaultSelectedValues = (
  content?: string | null,
  rawValue?: string | null,
  options?: InteractionDefaultValueOptions
) => {
  const defaults = getInteractionDefaultValues(content, rawValue, options);

  if (defaults.selectedValues) {
    return defaults.selectedValues;
  }

  return rawValue
    ? rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;
};
