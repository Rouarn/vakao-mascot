import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    lib: {
      entry: {
        index: 'src/index.ts',
        vite: 'src/vite.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['vue', '@vakao/mascot'],
    },
  },
});
