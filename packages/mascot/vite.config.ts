import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    lib: {
      entry: {
        index: 'src/index.ts',
        auto: 'src/auto.ts',
        react: 'src/react.ts',
        vue: 'src/vue.ts',
        'vue-vite': 'src/vue-vite.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'vue'],
      output: {
        // 共享模块使用固定文件名，避免带 hash 的产物名进入发布包。
        chunkFileNames: 'chunks/[name].js',
      },
    },
  },
});
