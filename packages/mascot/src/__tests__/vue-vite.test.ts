import { describe, expect, it } from 'vitest';
import { isVakaoMascotTag, withVakaoMascot } from '../vue-vite';

describe('withVakaoMascot', () => {
  it('marks the mascot tag as a custom element', () => {
    const options = withVakaoMascot();
    const predicate = options.template!.compilerOptions!.isCustomElement!;

    expect(isVakaoMascotTag('vakao-mascot')).toBe(true);
    expect(predicate('vakao-mascot')).toBe(true);
    expect(predicate('div')).toBe(false);
  });

  it('keeps a caller provided isCustomElement predicate', () => {
    const options = withVakaoMascot({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag === 'my-widget',
        },
      },
    });
    const predicate = options.template!.compilerOptions!.isCustomElement!;

    expect(predicate('my-widget')).toBe(true);
    expect(predicate('vakao-mascot')).toBe(true);
    expect(predicate('section')).toBe(false);
  });
});
