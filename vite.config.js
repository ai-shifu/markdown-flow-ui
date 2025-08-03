import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MarkdownFlowUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'next',
        'next/router',
        '@codemirror/lang-markdown',
        '@codemirror/language-data',
        '@codemirror/view',
        '@uiw/react-codemirror',
        '@microsoft/fetch-event-source',
        'react-markdown',
        'rehype-highlight',
        'remark-gfm',
        'remark-breaks',
        'unified',
        'unist-util-visit',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});