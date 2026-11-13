import { createApp, h, nextTick, ref } from 'vue';
import type { App } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VakaoMascotElement } from './index';
import { VakaoMascot } from './vue';

let container: HTMLDivElement;
let app: App | null = null;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  app?.unmount();
  app = null;
  container.remove();
  vi.restoreAllMocks();
});

describe('VakaoMascot (Vue)', () => {
  it('renders the custom element and syncs props', async () => {
    app = createApp({
      render: () => h(VakaoMascot, { size: 180, greeting: '你好呀', theme: 'dark' }),
    });
    app.mount(container);
    await nextTick();

    const element = container.querySelector('vakao-mascot') as VakaoMascotElement;
    expect(element).toBeTruthy();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.size).toBe(180);
    expect(element.greeting).toBe('你好呀');
    expect(element.theme).toBe('dark');
  });

  it('emits greet when the character is clicked', async () => {
    const onGreet = vi.fn();
    app = createApp({
      render: () => h(VakaoMascot, { greeting: '欢迎', onGreet }),
    });
    app.mount(container);
    await nextTick();

    const element = container.querySelector('vakao-mascot') as VakaoMascotElement;
    const button = element.shadowRoot!.querySelector('.avatar') as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(onGreet).toHaveBeenCalledTimes(1);
    expect(onGreet.mock.calls[0][0].detail.greeting).toBe('欢迎');
  });

  it('updates the element when props change', async () => {
    const greeting = ref('第一次');
    app = createApp({
      render: () => h(VakaoMascot, { greeting: greeting.value }),
    });
    app.mount(container);
    await nextTick();

    const element = container.querySelector('vakao-mascot') as VakaoMascotElement;
    expect(element.greeting).toBe('第一次');

    greeting.value = '第二次';
    await nextTick();

    expect(element.greeting).toBe('第二次');
  });
});
