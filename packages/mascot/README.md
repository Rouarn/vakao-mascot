# @vakao/mascot

一个固定在页面右下角的星芒少女看板娘：呼吸、眨眼、瞳孔跟随、点击挥手与气泡。角色用 VaKao 的暖色 tokens 上色，四芒星只保留发髻上的一枚橙色小星作为识别点。核心是**零依赖的 Web Component**（原生 JS + Shadow DOM + 内联 SVG 分层骨骼），React 与 Vue 封装通过子路径提供，且都是可选 peer 依赖。

- 原生入口零运行时依赖；不安装 React / Vue 也不会被迫下载它们
- 一个包、五个主入口：`.`、`./auto`、`./react`、`./vue`、`./vue/vite`；另有可选的 `./live2d`
- 角色可替换：内置 SVG 可通过骨骼契约换成你自己的分层 SVG，也可按需接入 Live2D 模型
- 无图片、无模型、无字体，默认角色是品牌视觉语言绘制的星芒少女 SVG

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

## 默认角色：星芒少女

默认角色是一个干净的小女孩：墨色短发、青色连衣裙、紫色腰带，全部用品牌 tokens 上色（`paper` / `raised` / `ink` / `faint` / `accent` 与四芒星的橙蓝紫黄）。品牌符号不作为角色本体，而是作为**识别点**嵌进造型里：

| 识别点 | 用法 |
| --- | --- |
| 发饰 | 右侧头发上的橙色四芒星，直接用品牌 `star-four` 的四瓣曲线，是剪影上最明显的记号 |
| 瞳孔高光 | 每只眼睛的高光是一颗白色小四芒星 |
| 胸针与裙摆 | 胸前黄色四芒星胸针，裙摆两侧紫 / 黄小四芒星，呼应四瓣配色 |
| 点墨笔触 | 发梢与裙摆收笔用圆润的尖角，和点墨资产的圆头收笔保持一致 |

交互回到人形语义：

| 交互 | 表现 |
| --- | --- |
| 待机呼吸 | 躯干纵向缩放 ±1.2% 并轻微浮动，手臂与头发跟着摆动 |
| 眨眼 | 睁眼 / 闭眼两组图形切换，2.2–5.6s 随机，25% 连眨两下 |
| 鼠标视线跟随 | 瞳孔位移 + 头部微转（最大约 6°） |
| 点击 | 右臂抬到 -105° 挥手 1.7s，气泡出现并派发 `greet` 事件 |

深色主题下给发丝加一圈 `faint` 描边，保证墨色头发在近黑背景上仍有轮廓；角色配色本身不随主题改变。尺寸下限 16px，24px 下仍能看出人形剪影与发髻上的橙色小星。

## 自定义角色（SVG 骨骼）

默认角色只是内置的一份 SVG。只要按契约给你的 SVG 打上 `data-rig` 标记，呼吸、眨眼、视线跟随、点击挥手与气泡都会复用同一套逻辑（非人形骨骼还可以声明 `data-rig-mode="abstract"`，用光晕脉冲替代眨眼）：

```html
<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <g data-rig="rig" data-rig-origin="50 118">
    <g data-rig="head" data-rig-pivot="50 45">
      <circle cx="50" cy="45" r="30" fill="#ffd9c2"/>
      <g data-rig="eye-left"><circle data-rig="iris-left" cx="42" cy="42" r="4"/></g>
      <g data-rig="eye-right"><circle data-rig="iris-right" cx="58" cy="42" r="4"/></g>
    </g>
    <g data-rig="arm-right" data-rig-pivot="70 80">
      <rect x="66" y="78" width="8" height="20" rx="4"/>
    </g>
  </g>
</svg>
```

```js
import { defineVakaoMascotRig } from '@vakao/mascot';

defineVakaoMascotRig('mini', svgMarkup);

const mascot = document.querySelector('vakao-mascot');
mascot.rig = 'mini';        // 也可以直接给 SVG 字符串 / 元素
// mascot.resetRig();       // 恢复默认角色
```

必需节点是 `head`、`eye-left`、`eye-right`，其余节点（瞳孔、后发、侧发、手臂、阴影、闭眼图形）都是可选的；缺失的可选节点会跳过对应动画。

注入的 SVG 会先清洗：移除 `<script>`、事件属性、外部引用与非本地 `<use>`，避免把 SVG 注入变成 XSS 入口；缺少必需节点或解析失败时会打印错误并回退默认角色。

完整的节点表、锚点属性、视口约定与参数范围见 [docs/rig-contract.md](./docs/rig-contract.md)。

## Live2D 模型（可选子路径）

如果你更想用 Live2D Cubism 4 模型，可以按需引入独立入口：

```bash
pnpm add @vakao/mascot
pnpm add pixi.js@^6.5.0 pixi-live2d-display@^0.4.0
```

```html
<!-- Cubism Core 必须由你自行提供，见下方授权说明 -->
<script src="/live2dcubismcore.min.js"></script>

<script type="module">
  import '@vakao/mascot/live2d';
</script>

<vakao-live2d src="/models/haru/haru_greeter_t03.model3.json" motion="Tap" size="260"></vakao-live2d>
```

- `pixi.js` / `pixi-live2d-display` 是可选 peer 依赖，不用 Live2D 时不会被安装或打包；
- 主入口不引用这个子路径，主包体积不受影响；
- 支持视线跟随、待机动作、点击动作，尺寸与右下角定位与 SVG 角色一致；
- 属性：`src`（`.model3.json`）、`size`、`motion`（点击动作组）、`idle`（待机动作组）。

### 授权（重要）

- Cubism Core 由 Live2D 官方分发，有独立授权，**不能打包进产物**，需要你自行引入 `live2dcubismcore.min.js`；
- 模型素材（`.model3.json`、贴图、动作）各有自己的授权，官方示例模型也有使用范围，**“能加载”不等于“可商用”**；
- 本项目的 MIT 许可只覆盖组件代码，不覆盖 Cubism Core 与任何模型素材。

放置方式、属性细节、验证记录见 [docs/live2d.md](./docs/live2d.md)。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | number | `210` | 角色最大宽度（px），限制在 16–420；窄屏自动缩到 `30vw` |
| `greeting` | string | `嗨～ 今天也要开心哦！` | 点击时气泡里的文字 |
| `theme` | `auto` / `light` / `dark` | `auto` | 气泡与发丝描边的明暗；`auto` 跟随系统 |
| `accent` | string | `#f0995f` | 键盘聚焦描边的强调色 |
| `label` | string | `和星芒少女打个招呼` | 角色按钮的无障碍名称 |

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
- 角色是本项目用 SVG 路径绘制的原创图形，造型语言与配色取自 VaKao 品牌视觉资源（tokens 与四芒星 `star-four.svg`），没有使用 Live2D 官方示例模型、开源模型、字体或任何外部图片。
- 本项目不包含、也不复用任何受版权保护的商业角色素材。
