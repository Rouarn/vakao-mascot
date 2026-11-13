# @vakao/mascot-react

React binding for [`@vakao/mascot`](../core). Handles property assignment (React < 19 included), `addEventListener`-based events, ref forwarding and SSR safety.

```bash
pnpm add @vakao/mascot @vakao/mascot-react
```

```tsx
import { useRef } from 'react';
import { VakaoMascot } from '@vakao/mascot-react';
import type { VakaoMascotElement } from '@vakao/mascot';

export function Layout() {
  const mascot = useRef<VakaoMascotElement>(null);

  return (
    <VakaoMascot
      ref={mascot}
      size={210}
      greeting="Hello!"
      theme="auto"
      onGreet={(event) => console.log(event.detail.greeting)}
    />
  );
}
```

## Props

`size`, `greeting`, `theme`, `accent`, `label` — same as the Web Component.

## Events

- `onGreet` — `CustomEvent<{ greeting: string }>`
- `onReady` — `CustomEvent<{ element: VakaoMascotElement }>`

## Peer dependency

`react >= 18` (tested with React 19).

Full documentation: see the [repository README](../../README.md).

## License

MIT.
