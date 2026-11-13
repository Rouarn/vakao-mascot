import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VAKAO_MASCOT_TAG } from './index';
import type { VakaoMascotElement } from './index';
import { VakaoMascot } from './react';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe('VakaoMascot (React)', () => {
  it('renders the custom element, forwards the ref and applies properties', () => {
    const ref = createRef<VakaoMascotElement>();

    act(() => {
      root.render(<VakaoMascot ref={ref} size={180} greeting="你好呀" theme="dark" />);
    });

    const element = ref.current;
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element!.tagName.toLowerCase()).toBe(VAKAO_MASCOT_TAG);
    expect(element!.shadowRoot).toBeTruthy();
    expect(element!.size).toBe(180);
    expect(element!.greeting).toBe('你好呀');
    expect(element!.theme).toBe('dark');
  });

  it('forwards greet events to onGreet', () => {
    const onGreet = vi.fn();
    const ref = createRef<VakaoMascotElement>();

    act(() => {
      root.render(<VakaoMascot ref={ref} greeting="欢迎" onGreet={onGreet} />);
    });

    const button = ref.current!.shadowRoot!.querySelector('.avatar') as HTMLButtonElement;
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onGreet).toHaveBeenCalledTimes(1);
    expect(onGreet.mock.calls[0][0].detail.greeting).toBe('欢迎');
  });

  it('syncs prop updates to element properties', () => {
    const ref = createRef<VakaoMascotElement>();

    act(() => {
      root.render(<VakaoMascot ref={ref} greeting="第一次" />);
    });
    expect(ref.current!.greeting).toBe('第一次');

    act(() => {
      root.render(<VakaoMascot ref={ref} greeting="第二次" size={260} />);
    });
    expect(ref.current!.greeting).toBe('第二次');
    expect(ref.current!.size).toBe(260);
  });
});
