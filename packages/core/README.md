# @vakao/mascot

Dependency-free bottom-right mascot Web Component with breathing, blinking, gaze tracking, click-to-wave and a greeting bubble. Built with Shadow DOM and an inline SVG rig; no images, no model files, no runtime dependencies.

```bash
pnpm add @vakao/mascot
```

## Auto register

```html
<script type="module">
  import '@vakao/mascot/auto';
</script>

<vakao-mascot size="210" greeting="Hello!"></vakao-mascot>
```

## Manual register

```ts
import { defineVakaoMascot } from '@vakao/mascot';

defineVakaoMascot();
```

## Options

| Attribute | Type | Default |
| --- | --- | --- |
| `size` | number | `210` |
| `greeting` | string | `嗨～ 今天也要开心哦！` |
| `theme` | `auto` / `light` / `dark` | `auto` |
| `accent` | string | `#2f9e8c` |
| `label` | string | `和看板娘打个招呼` |

## Events

- `vakao-mascot:greet` — `detail: { greeting }`
- `vakao-mascot:ready` — `detail: { element }`

Both events are `bubbles` and `composed`, so they can be listened to on `document`.

Full documentation, React and Vue bindings: see the [repository README](../../README.md).

## License

MIT. The character artwork is original and drawn with SVG paths in this package.
