# vakao-mascot

一个固定在页面右下角的小看板娘组件：呼吸、眨眼、视线跟随、点击挥手与气泡。核心是**零依赖的 Web Component**（原生 JS + Shadow DOM + 内联 SVG 分层骨骼），React 与 Vue 封装以子路径形式随同一个包发布。

- 单包多入口：`@vakao/mascot`、`/auto`、`/react`、`/vue`、`/vue/vite`
- 核心 25.3 KB（gzip 7.1 KB），React 封装 2.0 KB，Vue 封装 2.3 KB
- 无图片、无模型、无运行时依赖
- React / Vue 是**可选 peer 依赖**，只做原生接入时不会被迫安装框架
- 角色为自绘原创形象，不使用任何受版权保护的模型或立绘

完整用法（安装、属性、事件、CSS 变量、框架接入）见 [packages/mascot/README.md](./packages/mascot/README.md)。

## 目录结构

```
packages/mascot   @vakao/mascot —— 单包，含 core / auto / react / vue / vue/vite 五个入口
examples/         三个基于构建产物的可运行示例（原生 / React / Vue）
```

## 本地开发

```bash
pnpm install
pnpm build          # 构建包（ESM + .d.ts）
pnpm test           # 运行全部单测
pnpm typecheck      # 类型检查
pnpm build:examples # 构建三个示例
pnpm dev:vanilla    # 原生示例
pnpm dev:react      # React 示例
pnpm dev:vue        # Vue 示例
```

要求 Node.js >= 18，包管理器 pnpm。

## 快速示例

```ts
// 原生：导入即注册
import '@vakao/mascot/auto';
```

```tsx
// React
import { VakaoMascot } from '@vakao/mascot/react';
```

```vue
<!-- Vue -->
<script setup lang="ts">
import { VakaoMascot } from '@vakao/mascot/vue';
</script>
```

## 测试与验证

- 单元测试 16 个：core（渲染、属性、事件、视线、reduced-motion、SSR）、React（挂载、事件、属性同步、SSR）、Vue（挂载、事件、属性同步、SSR、编译助手）。
- 三个示例都使用**构建后的 dist 产物**启动，并在隔离 headless Chrome 中实际跑通：自定义元素升级、Shadow DOM 渲染、视线跟随、点击触发 greet、控制台无错误。
- `pnpm pack` 产物为单包，五个子路径在打包后仍可正确解析（在示例中以打包产物实际导入验证）。

## 许可与素材来源

- 代码与角色图形均以 **MIT** 许可发布，详见 [LICENSE](./LICENSE)。
- 角色是本项目用 SVG 路径自绘的原创简化形象（蜜杏色短发、连帽衫），没有使用 Live2D 官方示例模型、开源模型、字体或任何外部图片。
- 本项目不包含、也不复用任何受版权保护的商业角色素材。

## 相关项目

- 灵感来源：`girl-atlas.com` 右下角的客服挂件。其角色为《Re:从零开始的异世界生活》的雷姆，受版权保护；该站采用 WebP 雪碧图逐帧动画，本项目只借鉴了“右下角看板角色”的产品形态，技术实现为参数化 SVG 骨骼。
