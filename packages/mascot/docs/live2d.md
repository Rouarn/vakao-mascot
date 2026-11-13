# Live2D 子路径

`@vakao/mascot/live2d` 是可选入口，用 Live2D Cubism 4 模型替换内置的 SVG 角色。主包不会因为引用这个子路径而变大：`pixi.js` 与 `pixi-live2d-display` 都通过动态 `import()` 加载，且主入口不引用它们。

## 1. 安装

```bash
pnpm add @vakao/mascot
pnpm add pixi.js@^6.5.0 pixi-live2d-display@^0.4.0
```

这两个包是**可选 peer 依赖**：只用 SVG 角色或 React / Vue 封装时不需要安装，不装也不影响主入口。

当前验证组合：`pixi.js@6.5.10` + `pixi-live2d-display@0.4.0` + Cubism 4 模型。

## 2. 自行引入 Cubism Core

Cubism Core（`live2dcubismcore.min.js`）由 Live2D 官方分发，**有独立授权，不能打包进本包，也不能随仓库分发**。使用前请自行下载并放在你的静态资源目录：

```html
<script src="/live2dcubismcore.min.js"></script>
```

官方地址：<https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js>

加载顺序：Core 必须先于 `@vakao/mascot/live2d` 执行，否则组件会打印错误并且不渲染。

## 3. 使用

```html
<script src="/live2dcubismcore.min.js"></script>
<script type="module">
  import '@vakao/mascot/live2d';
</script>

<vakao-live2d
  src="/models/haru/haru_greeter_t03.model3.json"
  motion="Tap"
  size="260"></vakao-live2d>
```

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `src` | 无（必需） | `.model3.json` 地址 |
| `size` | `240` | 最大宽度（px），窄屏自动缩到 `32vw` |
| `motion` | `TapBody` | 点击时播放的动作组，需与模型的 `Motions` 分组名一致 |
| `idle` | `Idle` | 待机动作组，模型没有该组时静默跳过 |

也可以手动注册：

```ts
import { defineVakaoLive2D } from '@vakao/mascot/live2d';
defineVakaoLive2D(); // <vakao-live2d>
```

尺寸与定位沿用 SVG 角色：固定右下角、`z-index: 9999`、适配 `safe-area-inset-*`，宽度为 `min(size, 32vw)`，模型按比例缩放到底部居中。

交互：

- 指针移动 → `model.focus()`，视线跟随；
- 点击 → 播放 `motion` 指定的动作组；
- 待机 → 播放 `idle` 动作组（模型自身也会自动播放待机动作）。

## 4. 授权说明（重要）

- **运行时**：Cubism Core 归 Live2D 所有，适用 Live2D Cubism SDK 的授权条款；本项目不包含、不分发该文件。
- **模型素材**：每个 `.model3.json` 与贴图、动作文件都有自己的授权。Live2D 官方示例模型（如 Hiyori、Haru）只允许在其条款范围内使用，**“能加载”不等于“可商用”**。
- 使用第三方模型前请确认作者许可；商用场景需要自行取得模型与 Cubism SDK 的相应授权。
- 本项目代码本身仍是 MIT，但不覆盖 Cubism Core 与任何模型素材。

## 5. 本次验证说明

验证环境无法从官方渠道直接下载 Hiyori 模型（示例包需要同意条款后获取），因此改用同样属于 Live2D 官方免费示例的 **Haru**（`haru_greeter_t03`，Cubism 4）完成实测：

- 模型成功加载并渲染，固定右下角；
- 点击触发 `Tap` 动作；
- 指针移动调用 `focus()`；
- 控制台无错误。

验证用的 Core 与模型只存在于临时目录，没有进入仓库、没有随包发布。
