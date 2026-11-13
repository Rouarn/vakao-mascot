import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@vakao/mascot'],
    },
  },
});
