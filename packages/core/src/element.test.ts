import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MASCOT_EVENTS,
  VAKAO_MASCOT_TAG,
  VakaoMascotElement,
  defineVakaoMascot,
} from './index';

const mount = (attributes: Record<string, string | number> = {}): VakaoMascotElement => {
  const element = document.createElement(VAKAO_MASCOT_TAG) as VakaoMascotElement;
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  document.body.appendChild(element);
  return element;
};

const avatarOf = (element: VakaoMascotElement): HTMLButtonElement =>
  element.shadowRoot!.querySelector('.avatar') as HTMLButtonElement;

beforeEach(() => {
  defineVakaoMascot();
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('VakaoMascotElement', () => {
  it('registers idempotently and renders an isolated shadow tree', () => {
    defineVakaoMascot();
    const element = mount();

    expect(element).toBeInstanceOf(VakaoMascotElement);
    expect(element.shadowRoot).toBeTruthy();
    expect(avatarOf(element)).toBeTruthy();
    expect(avatarOf(element).getAttribute('aria-label')).toBe('和看板娘打个招呼');
    expect(element.shadowRoot!.querySelectorAll('.eye-open').length).toBe(2);
  });

  it('reflects size, greeting, theme, accent and label properties', () => {
    const element = mount();

    element.size = 300;
    expect(element.getAttribute('size')).toBe('300');
    expect(element.style.getPropertyValue('--vk-mascot-size')).toBe('300px');

    element.size = 10;
    expect(element.style.getPropertyValue('--vk-mascot-size')).toBe('96px');

    element.greeting = '欢迎回来';
    expect(element.greeting).toBe('欢迎回来');

    element.theme = 'dark';
    expect(element.theme).toBe('dark');

    element.accent = '#ff6600';
    expect(element.style.getPropertyValue('--vk-mascot-accent')).toBe('#ff6600');

    element.label = '打开小助手';
    expect(avatarOf(element).getAttribute('aria-label')).toBe('打开小助手');
  });

  it('greets with a bubble and a composed custom event', () => {
    const element = mount({ greeting: '今天也要开心哦' });
    const handler = vi.fn();
    document.addEventListener(MASCOT_EVENTS.greet, handler);

    avatarOf(element).dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent<{ greeting: string }>;
    expect(event.detail.greeting).toBe('今天也要开心哦');
    expect(element.debugState().bubbleVisible).toBe(true);
    expect(element.debugState().waving).toBe(true);

    document.removeEventListener(MASCOT_EVENTS.greet, handler);
  });

  it('tracks the pointer with the eyes', async () => {
    const element = mount();
    vi.spyOn(avatarOf(element), 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 100,
      width: 200,
      height: 240,
      top: 100,
      left: 100,
      right: 300,
      bottom: 340,
      toJSON: () => ({}),
    } as DOMRect);

    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 620, clientY: 620 }));
    await new Promise((resolve) => setTimeout(resolve, 180));

    const state = element.debugState();
    expect(state.gaze.x).toBeGreaterThan(0.4);
    expect(state.gaze.y).toBeGreaterThan(0.4);
    expect(state.irisTransform).toContain('translate(');
    expect(state.irisTransform).not.toBe('translate(0.00 0.00)');
  });

  it('keeps the rig still when reduced motion is requested', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );

    const element = mount();
    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(element.shadowRoot!.querySelector('#rig')!.getAttribute('transform')).toBeNull();
    expect(element.shadowRoot!.querySelector('#head')!.getAttribute('transform')).toBeNull();
  });
});
