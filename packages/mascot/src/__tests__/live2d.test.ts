import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VAKAO_LIVE2D_TAG, defineVakaoLive2D } from '../live2d';

beforeEach(() => {
  defineVakaoLive2D();
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Live2D 子路径', () => {
  it('自动注册 <vakao-live2d>', () => {
    expect(customElements.get(VAKAO_LIVE2D_TAG)).toBeTruthy();
  });

  it('缺少 src 时打印错误且不渲染画布', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const element = document.createElement(VAKAO_LIVE2D_TAG);
    document.body.appendChild(element);

    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toContain('缺少 src');
    expect(element.shadowRoot?.querySelector('canvas')).toBeFalsy();
  });

  it('缺少 Cubism Core 时给出明确提示', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const element = document.createElement(VAKAO_LIVE2D_TAG);
    element.setAttribute('src', '/model.model3.json');
    document.body.appendChild(element);

    expect(error).toHaveBeenCalledTimes(1);
    const message = String(error.mock.calls[0][0]);
    expect(message).toContain('Cubism Core');
    expect(message).toContain('live2dcubismcore.min.js');
    expect(element.shadowRoot?.querySelector('canvas')).toBeFalsy();
  });
});
