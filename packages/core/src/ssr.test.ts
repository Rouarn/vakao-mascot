// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { VAKAO_MASCOT_TAG, defineVakaoMascot } from './index';

describe('server environment', () => {
  it('imports and calls define without touching DOM globals', () => {
    expect(typeof HTMLElement).toBe('undefined');
    expect(() => defineVakaoMascot()).not.toThrow();
    expect(VAKAO_MASCOT_TAG).toBe('vakao-mascot');
  });
});
