declare const highlightLanguages: {
    javascript: import('highlight.js').LanguageFn;
    js: import('highlight.js').LanguageFn;
    typescript: import('highlight.js').LanguageFn;
    ts: import('highlight.js').LanguageFn;
    python: import('highlight.js').LanguageFn;
    py: import('highlight.js').LanguageFn;
    java: import('highlight.js').LanguageFn;
    html: import('highlight.js').LanguageFn;
    css: import('highlight.js').LanguageFn;
    json: import('highlight.js').LanguageFn;
    bash: import('highlight.js').LanguageFn;
    sh: import('highlight.js').LanguageFn;
    sql: import('highlight.js').LanguageFn;
    markdown: import('highlight.js').LanguageFn;
    md: import('highlight.js').LanguageFn;
};
declare const subsetLanguages: string[];
export { highlightLanguages, subsetLanguages };
