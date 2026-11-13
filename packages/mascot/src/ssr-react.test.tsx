// @vitest-environment node

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VakaoMascot } from './react';

describe('VakaoMascot (React SSR)', () => {
  it('renders markup without touching DOM globals', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof HTMLElement).toBe('undefined');

    const html = renderToString(<VakaoMascot size={180} greeting="服务端" theme="dark" />);

    expect(html).toContain('<vakao-mascot');
    expect(html).toContain('size="180"');
    expect(html).toContain('greeting="服务端"');
    expect(html).toContain('theme="dark"');
  });
});
