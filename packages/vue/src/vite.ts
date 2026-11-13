import { VAKAO_MASCOT_TAG } from '@vakao/mascot';

export interface VueCompilerOptionsLike {
  isCustomElement?: (tag: string) => boolean;
  [key: string]: unknown;
}

export interface VuePluginOptionsLike {
  template?: {
    compilerOptions?: VueCompilerOptionsLike;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function isVakaoMascotTag(tag: string): boolean {
  return tag === VAKAO_MASCOT_TAG;
}

/**
 * 给 @vitejs/plugin-vue 用的选项包装：
 *
 * ```ts
 * import vue from '@vitejs/plugin-vue';
 * import { withVakaoMascot } from '@vakao/mascot-vue/vite';
 *
 * export default defineConfig({ plugins: [vue(withVakaoMascot())] });
 * ```
 *
 * 这样在模板里直接写 `<vakao-mascot />` 不会出现 "Failed to resolve component" 告警，
 * 同时保留调用方已有的 isCustomElement 判断。
 */
export function withVakaoMascot<T extends VuePluginOptionsLike>(
  options: T = {} as T,
): T {
  const previous = options.template?.compilerOptions?.isCustomElement;

  return {
    ...options,
    template: {
      ...options.template,
      compilerOptions: {
        ...options.template?.compilerOptions,
        isCustomElement: (tag: string) =>
          isVakaoMascotTag(tag) || (previous ? previous(tag) : false),
      },
    },
  } as T;
}
