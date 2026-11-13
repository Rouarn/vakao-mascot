# vakao-mascot

一个固定在页面右下角的星芒少女看板娘：呼吸、眨眼、瞳孔跟随、点击挥手与气泡。角色用 VaKao 的暖色 tokens 上色（纸色 / 米色 / 墨色，橙紫只做小面积点缀），四芒星只保留侧马尾发根上的一枚橙色小星作为识别点，核心是**零依赖的 Web Component**（原生 JS + Shadow DOM + 内联 SVG 分层骨骼），React 与 Vue 封装以子路径形式随同一个包发布。

- 单包多入口：`@vakao/mascot`、`/auto`、`/react`、`/vue`、`/vue/vite`，另有可选的 `/live2d`
- 核心 37.3 KB（gzip 10.4 KB），React 封装 2.0 KB，Vue 封装 2.3 KB，Live2D 子路径 8.3 KB（不含 pixi 与运行时）
- 默认角色零图片、零模型、零运行时依赖；Live2D 子路径的 pixi 依赖默认不安装
- 角色可替换：按骨骼契约注入自定义 SVG，或按需接入 Live2D 模型
- React / Vue 是**可选 peer 依赖**，只做原生接入时不会被迫安装框架
- 默认角色是团队品牌语言绘制的原创 SVG，不使用任何受版权保护的模型或立绘

完整用法（安装、属性、事件、CSS 变量、框架接入）见 [packages/mascot/README.md](./packages/mascot/README.md)。

## 目录结构

```
packages/mascot   @vakao/mascot —— 单包，含 core / auto / react / vue / vue/vite 五个主入口，以及可选的 live2d 子路径
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

- 单元测试 24 个：core（渲染、属性、事件、视线、小尺寸与眨眼、reduced-motion、SSR）、自定义 SVG 角色（注入、回退、清洗、抽象形态）、React（挂载、事件、属性同步、SSR）、Vue（挂载、事件、属性同步、SSR、编译助手）、Live2D（注册、缺 Core / 缺 src 的错误提示）。
- 三个示例都使用**构建后的 dist 产物**启动，并在隔离 headless Chrome 中实际跑通：自定义元素升级、人物渲染、呼吸、随机眨眼、视线跟随、点击挥手与气泡、控制台无错误。
- 自定义 SVG 角色与默认少女在同一页面实测：两者都响应视线、眨眼、点击，自定义角色没有残留默认节点。
- 浅色、深色与 24px 极小尺寸分别截图核对：人物剪影、马尾发根上的橙色星形发饰、墨线与橙色网点两层，以及深色下发丝的一圈淡灰描边。
- Live2D 子路径用官方免费示例 Haru 实测：模型加载、右下角定位、点击动作与视线 API 均生效。
- `pnpm pack` 产物为单包，各子路径在打包后仍可正确解析（以打包产物实际导入验证）。

## 许可与素材来源

- 代码与角色图形均以 **MIT** 许可发布，详见 [LICENSE](./LICENSE)。
- 角色是本项目用 SVG 路径绘制的原创图形，造型语言与配色取自 VaKao 品牌视觉资源（tokens 与四芒星 `star-four.svg`），没有使用 Live2D 官方示例模型、开源模型、字体或任何外部图片。
- 本项目不包含、也不复用任何受版权保护的商业角色素材。

## 相关项目

- 灵感来源：`girl-atlas.com` 右下角的客服挂件。其角色为《Re:从零开始的异世界生活》的雷姆，受版权保护；该站采用 WebP 雪碧图逐帧动画，本项目只借鉴了“右下角看板角色”的产品形态，技术实现为参数化 SVG 骨骼。
