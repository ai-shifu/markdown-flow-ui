import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";

const highlightLanguages = {
  javascript,
  js: javascript,
  typescript,
  ts: typescript,
  python,
  py: python,
  java,
  html,
  css,
  json,
  bash,
  sh: bash,
  sql,
  markdown,
  md: markdown,
};

const subsetLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "html",
  "css",
  "json",
  "bash",
  "sql",
  "markdown",
];

export { highlightLanguages, subsetLanguages };
