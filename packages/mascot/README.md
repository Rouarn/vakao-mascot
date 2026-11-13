# @vakao/mascot

一个固定在页面右下角的小看板娘：呼吸、眨眼、视线跟随、点击挥手与气泡。核心是**零依赖的 Web Component**（原生 JS + Shadow DOM + 内联 SVG 分层骨骼），React 与 Vue 封装通过子路径提供，且都是可选 peer 依赖。

- 原生入口零运行时依赖；不安装 React / Vue 也不会被迫下载它们
- 一个包、五个入口：`.`、`./auto`、`./react`、`./vue`、`./vue/vite`
- 无图片、无模型、无字体，角色为自绘原创形象

## 安装

```bash
pnpm add @vakao/mascot
```

React / Vue 作为可选 peer 依赖：用哪个框架，项目里本来就有对应的包即可，无需额外安装别的包。

## 入口一览

| 子路径 | 用途 | 依赖 |
| --- | --- | --- |
| `@vakao/mascot` | 核心类、注册函数、类型 | 无 |
| `@vakao/mascot/auto` | 副作用入口，导入即注册 `<vakao-mascot>` | 无 |
| `@vakao/mascot/react` | React 组件 `VakaoMascot` | `react >= 18`（可选 peer） |
| `@vakao/mascot/vue` | Vue 组件 `VakaoMascot` | `vue ^3.3`（可选 peer） |
| `@vakao/mascot/vue/vite` | Vue 编译助手 `withVakaoMascot()` | `vue ^3.3`（可选 peer） |

每个子路径都带自己的 `.d.ts` 类型声明。主入口无副作用，可安全摇树；只有 `./auto` 会在导入时注册元素。

## 原生接入

最省事的方式是引入 `auto` 入口：

```html
<script type="module">
  import '@vakao/mascot/auto';
</script>

<vakao-mascot size="210" greeting="嗨～ 今天也要开心哦！"></vakao-mascot>
```

如果要自己控制注册时机或标签名：

```ts
import { defineVakaoMascot } from '@vakao/mascot';

defineVakaoMascot();            // 注册 <vakao-mascot>
// defineVakaoMascot('my-vila'); // 也可以注册成别的标签

document.addEventListener('vakao-mascot:greet', (event) => {
  console.log(event.detail.greeting);
});
```

## React 接入

```tsx
import { useRef } from 'react';
import { VakaoMascot } from '@vakao/mascot/react';
import type { VakaoMascotElement } from '@vakao/mascot';

export function SiteLayout() {
  const mascot = useRef<VakaoMascotElement>(null);

  return (
    <VakaoMascot
      ref={mascot}
      size={210}
      greeting="嗨～ 今天也要开心哦！"
      theme="auto"
      onGreet={(event) => console.log(event.detail.greeting)}
      onReady={() => console.log('mascot ready')}
    />
  );
}
```

封装已经处理：

- React < 19 不会给自定义元素写 JS 属性 → 在 layout effect 里显式赋值；
- React 合成事件对自定义元素无效 → 用 `addEventListener` 绑定 `vakao-mascot:greet` / `vakao-mascot:ready`；
- `ref` 转发到真实的 `VakaoMascotElement`，可直接调用 `ref.current?.greet()`；
- 服务端渲染只输出标签与特性，不访问 `window` / `customElements`。

## Vue 接入

```vue
<script setup lang="ts">
import { VakaoMascot } from '@vakao/mascot/vue';
import type { MascotGreetDetail } from '@vakao/mascot';

function handleGreet(event: CustomEvent<MascotGreetDetail>) {
  console.log(event.detail.greeting);
}
</script>

<template>
  <VakaoMascot :size="210" greeting="嗨～ 今天也要开心哦！" @greet="handleGreet" />
</template>
```

封装已经处理 props → 元素特性/属性的同步、`greet` / `ready` 事件映射、卸载清理与 SSR 安全。

如果要在模板里**直接写原生标签**，把编译选项包一层，构建时就不会再提示 “Failed to resolve component”：

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { withVakaoMascot } from '@vakao/mascot/vue/vite';

export default defineConfig({
  plugins: [vue(withVakaoMascot())],
});
```

```html
<script setup lang="ts">
import '@vakao/mascot/auto';
</script>

<template>
  <vakao-mascot size="210" greeting="你好"></vakao-mascot>
</template>
```

`withVakaoMascot()` 会保留你已有的 `isCustomElement` 判断。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | number | `210` | 角色最大宽度（px），限制在 96–420；窄屏自动缩到 `30vw` |
| `greeting` | string | `嗨～ 今天也要开心哦！` | 点击时气泡里的文字 |
| `theme` | `auto` / `light` / `dark` | `auto` | 气泡配色；`auto` 跟随系统 |
| `accent` | string | `#2f9e8c` | 键盘聚焦描边与强调色 |
| `label` | string | `和看板娘打个招呼` | 角色按钮的无障碍名称 |

原生环境直接写 attribute 或 JS property 都可以：

```js
const mascot = document.querySelector('vakao-mascot');
mascot.size = 260;
mascot.greeting = '欢迎回来';
mascot.theme = 'dark';
```

## 事件

| 事件 | 触发时机 | `detail` | React | Vue |
| --- | --- | --- | --- | --- |
| `vakao-mascot:greet` | 点击角色 / 调用 `greet()` | `{ greeting: string }` | `onGreet` | `@greet` |
| `vakao-mascot:ready` | 元素挂载后的下一帧 | `{ element: VakaoMascotElement }` | `onReady` | `@ready` |

两个事件都是 `bubbles: true`、`composed: true`，可以直接在 `document` 上监听。

## 尺寸、主题与适配

```css
/* 页面级覆盖，不需要穿透 Shadow DOM */
vakao-mascot {
  --vk-mascot-size: 240px;       /* 等价于 size 属性 */
  --vk-mascot-accent: #e07a5f;
  --vk-mascot-offset-x: 12px;    /* 距右侧 */
  --vk-mascot-offset-y: 12px;    /* 距底部 */

  /* 气泡配色（theme 已提供 light / dark 两套，这里可细调） */
  --vk-mascot-bubble-bg: #fffdf8;
  --vk-mascot-bubble-fg: #4a3f36;
  --vk-mascot-bubble-border: rgba(74, 63, 54, 0.08);
  --vk-mascot-bubble-shadow: 0 6px 18px rgba(30, 40, 60, 0.16);
}
```

- 默认 `width: min(--vk-mascot-size, 30vw)`，移动端不会占满屏幕；
- 宿主 `pointer-events: none`，只有角色本体 `pointer-events: auto`，不会拦截正文链接；
- 自动适配 `safe-area-inset-*`（刘海屏）；
- `prefers-reduced-motion: reduce` 下关闭呼吸、摆动与挥手，仅保留气泡与低成本反馈；
- 角色本体是可聚焦的 `<button>`，有 `focus-visible` 描边，气泡使用 `role="status"` + `aria-live="polite"`。

## 许可与素材来源

- 代码与角色图形均以 **MIT** 许可发布，详见 [LICENSE](./LICENSE)。
- 角色是本项目用 SVG 路径自绘的原创简化形象，没有使用 Live2D 官方示例模型、开源模型、字体或任何外部图片。
- 本项目不包含、也不复用任何受版权保护的商业角色素材。
