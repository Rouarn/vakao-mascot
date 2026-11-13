import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  VAKAO_MASCOT_TAG,
  VakaoMascotElement,
  defineVakaoMascot,
  defineVakaoMascotRig,
  listVakaoMascotRigs,
} from '../index';

const CUSTOM_RIG = `
<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="miniGrad"><stop offset="0" stop-color="#9ad"/></linearGradient>
  </defs>
  <g data-rig="rig" data-rig-origin="50 118">
    <g data-rig="head" data-rig-pivot="50 45">
      <circle cx="50" cy="45" r="30" fill="url(#miniGrad)"/>
      <g data-rig="eye-left"><circle data-rig="iris-left" cx="42" cy="42" r="4"/></g>
      <g data-rig="eye-right"><circle data-rig="iris-right" cx="58" cy="42" r="4"/></g>
    </g>
    <g data-rig="arm-right" data-rig-pivot="70 80">
      <rect x="68" y="78" width="8" height="20"/>
    </g>
  </g>
</svg>`;

const mount = (rig?: string): VakaoMascotElement => {
  const element = document.createElement(VAKAO_MASCOT_TAG) as VakaoMascotElement;
  if (rig) element.rig = rig;
  document.body.appendChild(element);
  return element;
};

const waitFor = async (predicate: () => boolean, timeout = 3200): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

beforeEach(() => {
  defineVakaoMascot();
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('自定义 SVG 角色', () => {
  it('注入后复用视线与眨眼动画', async () => {
    const element = mount(CUSTOM_RIG);
    const shadow = element.shadowRoot!;

    expect(shadow.querySelector('#head')).toBeNull();
    expect(shadow.querySelector('[data-rig="head"]')).toBeTruthy();

    const avatar = shadow.querySelector('.avatar') as HTMLButtonElement;
    vi.spyOn(avatar, 'getBoundingClientRect').mockReturnValue({
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
    await waitFor(() => element.debugState().gaze.x > 0.4, 1000);

    const iris = shadow.querySelector('[data-rig="iris-left"]')!;
    expect(iris.getAttribute('transform')).toContain('translate(');

    await waitFor(() => element.debugState().blinkCount > 0);
    expect(element.debugState().blinkCount).toBeGreaterThan(0);
  });

  it('缺少必需节点时报错并回退默认角色', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const element = mount('<svg viewBox="0 0 20 20"><g data-rig="head"></g></svg>');

    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toContain('缺少必需节点');
    expect(element.shadowRoot!.querySelector('#head')).toBeTruthy();
    expect(element.shadowRoot!.querySelector('[data-rig="eye-left"]')).toBeTruthy();
  });

  it('清洗脚本、事件属性与外部引用', () => {
    const element = mount(`
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <script>alert(1)</script>
        <image href="https://evil.example/x.png"/>
        <use href="https://evil.example/sprite.svg#x"/>
        <g data-rig="head" data-rig-pivot="50 40" onload="alert(1)">
          <a href="javascript:alert(2)"><circle cx="50" cy="45" r="25"/></a>
          <g data-rig="eye-left"><circle data-rig="iris-left" cx="42" cy="42" r="4"/></g>
          <g data-rig="eye-right"><circle data-rig="iris-right" cx="58" cy="42" r="4"/></g>
        </g>
      </svg>`);

    const shadow = element.shadowRoot!;
    expect(shadow.querySelector('script')).toBeNull();
    expect(shadow.querySelector('image')).toBeNull();
    expect(shadow.querySelector('use')).toBeNull();
    expect(shadow.querySelector('a')).toBeNull();
    expect(shadow.querySelector('[onload]')).toBeNull();
    expect(shadow.querySelector('[href^="javascript"]')).toBeNull();
    expect(shadow.querySelector('[data-rig="head"]')).toBeTruthy();
  });

  it('支持按名称注册角色并用 rig 特性引用', () => {
    defineVakaoMascotRig('mini-rig', CUSTOM_RIG);
    expect(listVakaoMascotRigs()).toContain('mini-rig');

    const element = document.createElement(VAKAO_MASCOT_TAG) as VakaoMascotElement;
    element.setAttribute('rig', 'mini-rig');
    document.body.appendChild(element);

    expect(element.shadowRoot!.querySelector('#head')).toBeNull();
    expect(element.shadowRoot!.querySelector('[data-rig="head"]')).toBeTruthy();
  });
});
