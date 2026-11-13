# @vakao/mascot-vue

Vue 3 binding for [`@vakao/mascot`](../core), plus a compiler helper for using the raw custom element in templates.

```bash
pnpm add @vakao/mascot @vakao/mascot-vue
```

```vue
<script setup lang="ts">
import { VakaoMascot } from '@vakao/mascot-vue';
import type { MascotGreetDetail } from '@vakao/mascot';

function handleGreet(event: CustomEvent<MascotGreetDetail>) {
  console.log(event.detail.greeting);
}
</script>

<template>
  <VakaoMascot :size="210" greeting="Hello!" @greet="handleGreet" />
</template>
```

## Raw tag in templates

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { withVakaoMascot } from '@vakao/mascot-vue/vite';

export default defineConfig({
  plugins: [vue(withVakaoMascot())],
});
```

This teaches the Vue compiler that `<vakao-mascot>` is a custom element and preserves any existing `isCustomElement` predicate.

## Props and events

Props: `size`, `greeting`, `theme`, `accent`, `label`.
Events: `@greet` (`CustomEvent<{ greeting: string }>`) and `@ready` (`CustomEvent<{ element }>`).

## Peer dependency

`vue ^3.3`.

Full documentation: see the [repository README](../../README.md).

## License

MIT.
