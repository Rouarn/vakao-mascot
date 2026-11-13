import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    lib: {
      entry: {
        index: 'src/index.ts',
        auto: 'src/auto.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
  },
});
