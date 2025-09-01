import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';

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
  'javascript',
  'typescript',
  'python',
  'java',
  'html',
  'css',
  'json',
  'bash',
  'sql',
  'markdown',
];

export { highlightLanguages, subsetLanguages };
