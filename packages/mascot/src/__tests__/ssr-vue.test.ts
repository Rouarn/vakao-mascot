// @vitest-environment node

import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { VakaoMascot } from '../vue';

describe('VakaoMascot (Vue SSR)', () => {
  it('renders markup without touching DOM globals', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof HTMLElement).toBe('undefined');

    const app = createSSRApp({
      render: () => h(VakaoMascot, { size: 180, greeting: '服务端', theme: 'dark' }),
    });
    const html = await renderToString(app);

    expect(html).toContain('<vakao-mascot');
    expect(html).toContain('size="180"');
    expect(html).toContain('greeting="服务端"');
    expect(html).toContain('theme="dark"');
  });
});
