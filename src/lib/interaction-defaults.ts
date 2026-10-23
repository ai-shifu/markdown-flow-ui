import {
  createInteractionParser,
  trimVariablePadding,
  INTERACTION_CONTENT_SOURCE,
} from "remark-flow";
import type { Node } from "unist";
import { getMarkdownSourceAnalysis } from "../components/ContentRender/utils/inline-code-ranges";

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
const INTERACTION_TAG_PATTERN = /<custom-variable\b/i;
// Same definition of where an interaction ends as the parser uses, so an option carrying a
// `\]` is read whole instead of being cut at its first bracket. A variable assignment is optional.
const INTERACTION_SHORTCODE_PATTERN = new RegExp(
  `\\?\\[(${INTERACTION_CONTENT_SOURCE})\\](?!\\()`
);
const JSON_LIKE_VALUE_PATTERN = /^[\[{]/;

interface InteractionOptionCandidate {
  token: string;
  value: string;
}

const findInteractionSource = (
  node: Node & { value?: unknown; children?: readonly Node[] }
): string | null => {
  if (node.type === "flowInteraction" && "value" in node)
    return typeof node.value === "string" ? node.value : null;
  if (node.children) {
    for (const child of node.children) {
      const source = findInteractionSource(child);
      if (source !== null) return source;
    }
  }
  return null;
};

const parseInteractionBlock = (
  content?: string | null
): InteractionParseResult | null => {
  if (!content) {
    return null;
  }

  try {
    // Read a grammar-owned interaction, so a syntax example cannot supply its key
    // or swallow a later real control. Keep the existing serialized-tag path.
    const source =
      findInteractionSource(getMarkdownSourceAnalysis(content).tree) ??
      (INTERACTION_TAG_PATTERN.test(content) ? content : null);
    if (source === null) return null;
    // The compatibility formatter turns invalid source into a text-input placeholder.
    // Defaults must retain plain replay behavior instead of inventing an interaction.
    if (interactionParser.parse(source).error) return null;
    return interactionParser.parseToRemarkFormat(
      source
    ) as InteractionParseResult;
  } catch (error) {
    console.warn("Failed to parse interaction block", error);
  }

  return null;
};

const normalizeButtonValue = (
  token: string,
  info: InteractionParseResult
): { value: string; display?: string } | null => {
  if (!token) {
    return null;
  }

  const cleaned = trimVariablePadding(token);
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
    .map((item) => trimVariablePadding(item))
    .filter(Boolean);
};

const trimLeadingInteractionSeparators = (raw: string) => {
  let index = 0;
  while (
    index < raw.length &&
    (raw[index] === "," ||
      raw[index] === "，" ||
      trimVariablePadding(raw[index]) === "")
  )
    index += 1;
  return raw.slice(index);
};

const buildInteractionOptionCandidates = (
  info: InteractionParseResult
): InteractionOptionCandidate[] => {
  const buttonValues = info.buttonValues || [];
  const buttonTexts = info.buttonTexts || [];
  const candidates: InteractionOptionCandidate[] = [];
  const seenCandidates = new Set<string>();

  buttonValues.forEach((buttonValue, index) => {
    const normalizedValue = trimVariablePadding(`${buttonValue ?? ""}`);
    const normalizedText = trimVariablePadding(`${buttonTexts[index] ?? ""}`);

    [normalizedValue, normalizedText].forEach((token) => {
      if (!token) {
        return;
      }

      const candidateKey = `${token}::${normalizedValue || token}`;
      if (seenCandidates.has(candidateKey)) {
        return;
      }

      seenCandidates.add(candidateKey);
      candidates.push({
        token,
        value: normalizedValue || token,
      });
    });
  });

  return candidates.sort(
    (left, right) => right.token.length - left.token.length
  );
};

const matchInteractionOptionPrefix = (
  raw: string,
  info: InteractionParseResult
): InteractionOptionCandidate | null => {
  const normalizedRaw = trimLeadingInteractionSeparators(raw);
  const candidates = buildInteractionOptionCandidates(info);

  for (const candidate of candidates) {
    if (!normalizedRaw.startsWith(candidate.token)) {
      continue;
    }

    const trailingChar = normalizedRaw[candidate.token.length];
    if (
      trailingChar &&
      trailingChar !== "," &&
      trailingChar !== "，" &&
      trimVariablePadding(trailingChar) !== ""
    ) {
      continue;
    }

    return candidate;
  }

  return null;
};

const resolveMultiSelectFallbackDefaults = (
  raw: string,
  info: InteractionParseResult
): InteractionDefaultValues => {
  const tokens = splitPresetValues(raw);

  if (!tokens.length) {
    return {};
  }

  const selectedValues: string[] = [];
  const customInputs: string[] = [];

  tokens.forEach((token) => {
    const mapped = normalizeButtonValue(token, info);

    if (mapped) {
      selectedValues.push(mapped.value);
      return;
    }

    if (info.placeholder) {
      customInputs.push(token);
      return;
    }

    selectedValues.push(token);
  });

  return {
    selectedValues: selectedValues.length ? selectedValues : undefined,
    inputText: customInputs.length ? customInputs.join(", ") : undefined,
  };
};

const resolveMultiSelectInteractionDefaults = (
  raw: string,
  info: InteractionParseResult
): InteractionDefaultValues => {
  const selectedValues: string[] = [];
  let remainingRaw = trimVariablePadding(raw);

  // Prefer option-aware prefix matching before delimiter splitting so
  // option labels that contain commas can still round-trip correctly.
  while (remainingRaw) {
    const matchedCandidate = matchInteractionOptionPrefix(remainingRaw, info);

    if (!matchedCandidate) {
      break;
    }

    selectedValues.push(matchedCandidate.value);
    const normalizedRemainingRaw =
      trimLeadingInteractionSeparators(remainingRaw);
    remainingRaw = trimLeadingInteractionSeparators(
      normalizedRemainingRaw.slice(matchedCandidate.token.length)
    );
  }

  if (selectedValues.length > 0) {
    return {
      selectedValues,
      inputText:
        info.placeholder && remainingRaw.trim()
          ? remainingRaw.trim()
          : undefined,
    };
  }

  const fallbackDefaults = resolveMultiSelectFallbackDefaults(raw, info);

  if (fallbackDefaults.selectedValues?.length) {
    return fallbackDefaults;
  }

  if (info.placeholder) {
    return {
      inputText: raw.trim(),
    };
  }

  return fallbackDefaults;
};

const normalizeStructuredInteractionDefaults = (
  payload?: StructuredInteractionPayload | null
): InteractionDefaultValues | null => {
  if (!payload || Array.isArray(payload)) {
    return null;
  }

  const selectedValues = Array.isArray(payload.selectedValues)
    ? payload.selectedValues
        .map((item) => trimVariablePadding(`${item ?? ""}`))
        .filter(Boolean)
    : undefined;
  const buttonText = trimVariablePadding(`${payload.buttonText ?? ""}`);
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

  if (!JSON_LIKE_VALUE_PATTERN.test(trimVariablePadding(rawValue))) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StructuredInteractionPayload;
    return normalizeStructuredInteractionDefaults(parsed);
  } catch {
    return null;
  }
};

const hasPotentialInteractionBlock = (content?: string | null) =>
  Boolean(
    content &&
      (INTERACTION_TAG_PATTERN.test(content) ||
        INTERACTION_SHORTCODE_PATTERN.test(content))
  );

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
  const normalized =
    rawValue === null || rawValue === undefined
      ? undefined
      : trimVariablePadding(rawValue.toString());

  if (!normalized) {
    return {};
  }

  const structuredDefaults = parseStructuredInteractionDefaults(normalized);

  if (structuredDefaults) {
    return structuredDefaults;
  }

  const customDefaults = resolveCustomInteractionDefaults(
    content,
    normalized,
    null,
    options
  );

  if (customDefaults) {
    return customDefaults;
  }

  if (!hasPotentialInteractionBlock(content)) {
    return {
      buttonText: normalized,
      inputText: normalized,
    };
  }

  const interactionInfo = parseInteractionBlock(content);
  const customDefaultsWithInteraction = resolveCustomInteractionDefaults(
    content,
    normalized,
    interactionInfo,
    options
  );

  if (customDefaultsWithInteraction) {
    return customDefaultsWithInteraction;
  }

  if (!interactionInfo) {
    return {
      buttonText: normalized,
      inputText: normalized,
    };
  }

  if (interactionInfo.isMultiSelect) {
    return resolveMultiSelectInteractionDefaults(normalized, interactionInfo);
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
        .map((value) => trimVariablePadding(value))
        .filter(Boolean)
    : undefined;
};
