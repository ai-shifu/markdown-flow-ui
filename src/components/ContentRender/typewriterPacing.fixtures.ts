import type { MarkdownFlowLocale } from "../../lib/locale";

export const TYPEWRITER_PACING_FIXTURE_LENGTHS = [
  "short",
  "medium",
  "long",
] as const;

export type TypewriterPacingFixtureLength =
  (typeof TYPEWRITER_PACING_FIXTURE_LENGTHS)[number];

export const TYPEWRITER_PACING_LANGUAGE_CODES = [
  "zh",
  "en",
  "fr",
  "ar",
  "th",
] as const;

export type TypewriterPacingLanguageCode =
  (typeof TYPEWRITER_PACING_LANGUAGE_CODES)[number];

export interface TypewriterPacingLanguage {
  code: TypewriterPacingLanguageCode;
  label: string;
  locale: MarkdownFlowLocale;
  lang: string;
  dir: "ltr" | "rtl";
}

export const TYPEWRITER_PACING_LANGUAGES: readonly TypewriterPacingLanguage[] =
  [
    {
      code: "zh",
      label: "中文",
      locale: "zh-CN",
      lang: "zh-CN",
      dir: "ltr",
    },
    {
      code: "en",
      label: "English",
      locale: "en-US",
      lang: "en-US",
      dir: "ltr",
    },
    {
      code: "fr",
      label: "Français",
      locale: "fr-FR",
      lang: "fr-FR",
      dir: "ltr",
    },
    {
      code: "ar",
      label: "العربية",
      locale: "ar-SA",
      lang: "ar-SA",
      dir: "rtl",
    },
    {
      code: "th",
      label: "ไทย",
      locale: "th-TH",
      lang: "th-TH",
      dir: "ltr",
    },
  ];

const SHORT_FIXTURES = {
  zh: "今天我们学习如何把复杂问题拆成清晰步骤。",
  en: "Today we will learn how to break a complex problem down into clear, manageable steps.",
  fr: "Aujourd’hui, apprenons à décomposer un problème complexe en étapes claires.",
  ar: "سنتعلم اليوم كيف نقسم المشكلة المعقدة إلى خطوات واضحة يسهل تنفيذها.",
  th: "วันนี้เราจะเรียนรู้วิธีแบ่งปัญหาซับซ้อนเป็นขั้นตอนที่ชัดเจน",
} as const;

const SECOND_SENTENCE_FIXTURES = {
  zh: "先写下目标，再列出已知条件，最后逐项验证答案。",
  en: "Write down the goal first, list what you know, then verify the answer step by step.",
  fr: "Notez d’abord l’objectif, listez les éléments connus, puis vérifiez la réponse étape par étape.",
  ar: "اكتب الهدف أولا، ثم سجل المعطيات المعروفة، وبعد ذلك تحقق من الإجابة خطوة بخطوة.",
  th: "เริ่มจากเขียนเป้าหมาย ระบุข้อมูลที่รู้ แล้วตรวจคำตอบทีละขั้นตอน",
} as const;

const THIRD_SENTENCE_FIXTURES = {
  zh: "遇到卡点时，回到上一步检查假设，不要急着猜结论。",
  en: "If you get stuck, return to the previous step and check your assumptions instead of guessing.",
  fr: "En cas de blocage, revenez à l’étape précédente et vérifiez vos hypothèses au lieu de deviner.",
  ar: "إذا واجهت صعوبة، فارجع إلى الخطوة السابقة وتحقق من افتراضاتك بدلا من التخمين.",
  th: "เมื่อพบจุดติดขัด ให้ย้อนกลับไปตรวจสมมติฐานในขั้นก่อนหน้าแทนการเดาคำตอบ",
} as const;

const FOURTH_SENTENCE_FIXTURES = {
  zh: "这样做能减少遗漏，也让过程更容易复盘和改进。",
  en: "This approach reduces omissions and makes the process easier to review and improve.",
  fr: "Cette méthode réduit les oublis et facilite la révision et l’amélioration du processus.",
  ar: "تقلل هذه الطريقة السهو وتجعل مراجعة العملية وتحسينها أسهل.",
  th: "วิธีนี้ช่วยลดสิ่งที่ตกหล่น และทำให้ทบทวนกับปรับปรุงกระบวนการได้ง่ายขึ้น",
} as const;

const joinFixtureSentences = (...sentences: readonly string[]): string =>
  sentences.join(" ");

export const TYPEWRITER_PACING_FIXTURES: Record<
  TypewriterPacingFixtureLength,
  Record<TypewriterPacingLanguageCode, string>
> = {
  short: SHORT_FIXTURES,
  medium: {
    zh: joinFixtureSentences(SHORT_FIXTURES.zh, SECOND_SENTENCE_FIXTURES.zh),
    en: joinFixtureSentences(SHORT_FIXTURES.en, SECOND_SENTENCE_FIXTURES.en),
    fr: joinFixtureSentences(SHORT_FIXTURES.fr, SECOND_SENTENCE_FIXTURES.fr),
    ar: joinFixtureSentences(SHORT_FIXTURES.ar, SECOND_SENTENCE_FIXTURES.ar),
    th: joinFixtureSentences(SHORT_FIXTURES.th, SECOND_SENTENCE_FIXTURES.th),
  },
  long: {
    zh: joinFixtureSentences(
      SHORT_FIXTURES.zh,
      SECOND_SENTENCE_FIXTURES.zh,
      THIRD_SENTENCE_FIXTURES.zh,
      FOURTH_SENTENCE_FIXTURES.zh
    ),
    en: joinFixtureSentences(
      SHORT_FIXTURES.en,
      SECOND_SENTENCE_FIXTURES.en,
      THIRD_SENTENCE_FIXTURES.en,
      FOURTH_SENTENCE_FIXTURES.en
    ),
    fr: joinFixtureSentences(
      SHORT_FIXTURES.fr,
      SECOND_SENTENCE_FIXTURES.fr,
      THIRD_SENTENCE_FIXTURES.fr,
      FOURTH_SENTENCE_FIXTURES.fr
    ),
    ar: joinFixtureSentences(
      SHORT_FIXTURES.ar,
      SECOND_SENTENCE_FIXTURES.ar,
      THIRD_SENTENCE_FIXTURES.ar,
      FOURTH_SENTENCE_FIXTURES.ar
    ),
    th: joinFixtureSentences(
      SHORT_FIXTURES.th,
      SECOND_SENTENCE_FIXTURES.th,
      THIRD_SENTENCE_FIXTURES.th,
      FOURTH_SENTENCE_FIXTURES.th
    ),
  },
};
