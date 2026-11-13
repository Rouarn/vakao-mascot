import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { withVakaoMascot } from '@vakao/mascot/vue/vite';

export default defineConfig({
  base: './',
  // 如果模板里直接写 <vakao-mascot />，这个包装会告诉编译器它是自定义元素。
  plugins: [vue(withVakaoMascot())],
});
