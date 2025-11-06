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
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import go from "highlight.js/lib/languages/go";
import plaintext from "highlight.js/lib/languages/plaintext";
import rust from "highlight.js/lib/languages/rust";
import shell from "highlight.js/lib/languages/shell";
import scss from "highlight.js/lib/languages/scss";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import vhdl from "highlight.js/lib/languages/vhdl";
import latex from "highlight.js/lib/languages/latex";
import lua from "highlight.js/lib/languages/lua";
import php from "highlight.js/lib/languages/php";

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
  c,
  cpp,
  go,
  plaintext,
  rust,
  shell,
  scss,
  xml,
  yaml,
  vhdl,
  latex,
  php,
  lua,
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
  "c",
  "cpp",
  "go",
  "plaintext",
  "rust",
  "shell",
  "scss",
  "xml",
  "yaml",
  "vhdl",
  "latex",
  "lua",
  "php",
];

export { highlightLanguages, subsetLanguages };
