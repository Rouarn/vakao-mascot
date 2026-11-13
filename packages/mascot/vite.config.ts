import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    lib: {
      entry: {
        index: 'src/index.ts',
        auto: 'src/auto.ts',
        react: 'src/react.tsx',
        vue: 'src/vue.ts',
        'vue-vite': 'src/vue-vite.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'vue'],
    },
  },
});
