# 自定义角色契约（SVG 骨骼）

`<vakao-mascot>` 默认自带一个用 SVG 路径绘制的原创角色。如果你有自己的分层 SVG，可以按本文的契约接入，呼吸、眨眼、视线跟随、点击挥手与气泡会全部复用同一套动画逻辑。

## 1. 视口与对齐

| 项目 | 约定 |
| --- | --- |
| 元素尺寸 | 由宿主决定：`width: min(var(--vk-mascot-size), 30vw)`，默认 210px |
| 宽高比 | 默认角色是 `220 / 260`；自定义 SVG 建议保持接近的竖向比例 |
| viewBox | 必须声明。推荐 `viewBox="0 0 220 260"`，也可以用自己的坐标系 |
| 对齐方式 | SVG 默认 `preserveAspectRatio="xMidYMax meet"`，即底部居中 |
| 定位 | 固定在右下角，自动适配 `safe-area-inset-*`，不需要自己写定位 |

角色请尽量填满 viewBox 的下半部分，脚或底座贴近 `viewBox` 底边，这样呼吸与阴影的位置才自然。

## 2. 节点标记

在需要被驱动的元素上写 `data-rig="<标记名>"`。

### 必需节点（缺任意一个都会回退默认角色）

| 标记 | 作用 |
| --- | --- |
| `head` | 头部容器，承载头部倾斜 |
| `eye-left` | 左眼容器，眨眼时整体切换或压缩 |
| `eye-right` | 右眼容器，同上 |

### 可选节点

| 标记 | 作用 | 缺失时 |
| --- | --- | --- |
| `rig` | 呼吸缩放的根容器，通常包住整个角色 | 自动用 `<svg>` 根节点 |
| `body` | 身体容器，仅用于语义标记 | 无影响 |
| `iris-left` / `iris-right` | 瞳孔组，跟随鼠标位移 | 视线只驱动头部倾斜 |
| `eye-open` / `eye-closed` | 睁眼、闭眼两套图形 | 没有 `eye-closed` 时，眨眼改为纵向压缩 `eye-*` 组 |
| `hair-back` | 后发，参与摆动 | 不摆动 |
| `lock-left` / `lock-right` | 左右侧发，参与摆动 | 不摆动 |
| `arm-left` | 左臂，轻微摆动 | 不摆动 |
| `arm-right` | 右臂，点击时挥手 | 不挥手，气泡与头部反馈仍生效 |
| `shadow` | 地面阴影，随呼吸缩放 | 不处理阴影 |

`eye-open` / `eye-closed` 可以各出现多次，动画会同时切换所有匹配节点。

## 3. 自定义锚点

默认角色把旋转中心写死在标记上；自定义角色请用以下属性声明，否则会退化为包围盒中心：

| 属性 | 写在哪个节点 | 含义 |
| --- | --- | --- |
| `data-rig-pivot="x y"` | `head`、`hair-back`、`lock-*`、`arm-*` | 旋转中心（用户坐标） |
| `data-rig-origin="x y"` | `rig` 根节点 | 呼吸缩放的锚点，通常是脚底中心 |
| `data-rig-gaze="x y"` | `<svg>` 或 `head` | 瞳孔最大位移，默认 `3.4 2.8` |

单位都是 SVG 用户坐标，不是像素。

## 4. 参数与动画

| 参数 | 行为 |
| --- | --- |
| 呼吸 | `sin(t * 1.5)`，整体纵向缩放 ±1.2%，并带 1.1px 的上下浮动 |
| 摆动 | `sin(t * 0.72)`，头发、侧发、手臂按各自权重跟随 |
| 眨眼 | 首次 1.8s 后开始，间隔 2.2–5.6s，单次 150ms；25% 概率连眨两下 |
| 视线 | 指针相对角色中心的偏移映射到 `[-1, 1]`，再乘以 `data-rig-gaze` |
| 点击 | 右臂抬到 -105° 并摆动约 1.7s，同时显示气泡、派发 `vakao-mascot:greet` |
| reduced-motion | 关闭呼吸、摆动、挥手，保留视线与眨眼 |

`prefers-reduced-motion: reduce` 下所有骨骼 transform 会被清除，回到静态姿势。

## 5. 注入方式

### 方式一：属性引用（推荐给静态页面）

可以指向注册名，也可以指向文档里的 `<template>` 或 `<svg>` 的 id：

```html
<template id="my-rig">
  <svg viewBox="0 0 220 260">…</svg>
</template>

<vakao-mascot rig="my-rig"></vakao-mascot>
```

### 方式二：JS 属性

```js
const mascot = document.querySelector('vakao-mascot');

// 直接给 SVG 字符串
mascot.rig = '<svg viewBox="0 0 220 260">…</svg>';

// 或者给一个现成的 <template> / <svg> 元素
mascot.rig = document.getElementById('my-rig');
```

### 方式三：注册函数

```js
import { defineVakaoMascotRig } from '@vakao/mascot';

defineVakaoMascotRig('mini', '<svg viewBox="0 0 100 120">…</svg>');

// 之后任何实例都可以引用
```

```html
<vakao-mascot rig="mini"></vakao-mascot>
```

恢复默认角色：

```js
mascot.resetRig();
```

切换角色时 Shadow DOM 会重建，已显示的泡泡、当前尺寸与事件监听会按现有规则重新应用。

## 6. 校验与安全

注入内容会先经过清洗，再校验必需节点：

- 删除 `<script>`、`<style>`、`<foreignObject>`、`<image>`、`<a>`、`<iframe>`、`<object>`、`<embed>` 与所有 SVG 动画元素；
- 删除所有 `on*` 事件属性；
- `href` / `xlink:href` / `src` / `data` 只允许 `#local-id`；
- 任意属性里的 `url(...)` 只允许指向文档内的 id；
- 含 `javascript:` 的属性直接删除；
- `<use>` 只保留指向当前 SVG 内 id 的引用。

以下情况会打印 `console.error` 并回退默认角色：

- 字符串无法解析为 SVG；
- 缺少 `head`、`eye-left`、`eye-right`；
- `rig` 指向的名称或 DOM id 不存在。

## 7. 最小示例

```html
<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <g data-rig="rig" data-rig-origin="50 118">
    <g data-rig="head" data-rig-pivot="50 45">
      <circle cx="50" cy="45" r="30" fill="#ffd9c2"/>
      <g data-rig="eye-left"><circle data-rig="iris-left" cx="42" cy="42" r="4" fill="#2f9e8c"/></g>
      <g data-rig="eye-right"><circle data-rig="iris-right" cx="58" cy="42" r="4" fill="#2f9e8c"/></g>
    </g>
    <rect x="42" y="76" width="16" height="42" rx="8" fill="#9ad"/>
    <g data-rig="arm-right" data-rig-pivot="70 80">
      <rect x="66" y="78" width="8" height="20" rx="4" fill="#ffd9c2"/>
    </g>
  </g>
</svg>
```

把这段字符串交给 `mascot.rig` 即可看到：头部随视线倾斜、瞳孔跟随、眼睛按节奏眨动、点击时右臂抬起并弹出气泡。
