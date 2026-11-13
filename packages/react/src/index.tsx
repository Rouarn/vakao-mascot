import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import type { ForwardedRef, HTMLAttributes, MutableRefObject } from 'react';
import {
  DEFAULT_SIZE,
  MASCOT_EVENTS,
  VAKAO_MASCOT_TAG,
  defineVakaoMascot,
} from '@vakao/mascot';
import type {
  MascotGreetDetail,
  MascotReadyDetail,
  MascotTheme,
  VakaoMascotElement,
} from '@vakao/mascot';

export interface VakaoMascotProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 角色最大宽度，像素，默认 210。 */
  size?: number;
  /** 点击时气泡里的文字。 */
  greeting?: string;
  /** 气泡配色，默认跟随系统。 */
  theme?: MascotTheme;
  /** 聚焦描边与强调色。 */
  accent?: string;
  /** 角色按钮的无障碍名称。 */
  label?: string;
  /** 用户点击角色后触发。 */
  onGreet?: (event: CustomEvent<MascotGreetDetail>) => void;
  /** 自定义元素完成挂载后触发（下一帧）。 */
  onReady?: (event: CustomEvent<MascotReadyDetail>) => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * React 封装。
 *
 * 关键处理：
 * - React <19 不会把未知属性写到自定义元素的 JS 属性上，因此在 layout effect 里显式赋值；
 * - 事件通过 addEventListener 绑定，避免 React 合成事件对自定义元素无效；
 * - 服务端渲染时只输出标签与特性，不触碰 window / customElements。
 */
export const VakaoMascot = forwardRef<VakaoMascotElement, VakaoMascotProps>(
  function VakaoMascot(props, forwardedRef: ForwardedRef<VakaoMascotElement>) {
    const { size, greeting, theme, accent, label, onGreet, onReady, ...rest } = props;
    const elementRef = useRef<VakaoMascotElement | null>(null);

    const assignRef = useCallback(
      (node: VakaoMascotElement | null) => {
        elementRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as MutableRefObject<VakaoMascotElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    useIsomorphicLayoutEffect(() => {
      defineVakaoMascot();
      const element = elementRef.current;
      if (!element) return;

      if (size === undefined) {
        element.removeAttribute('size');
      } else {
        element.size = size;
      }
      element.greeting = greeting ?? '';
      element.theme = theme ?? 'auto';
      element.accent = accent ?? '';
      element.label = label ?? '';

      const handleGreet = (event: Event): void => {
        onGreet?.(event as CustomEvent<MascotGreetDetail>);
      };
      const handleReady = (event: Event): void => {
        onReady?.(event as CustomEvent<MascotReadyDetail>);
      };

      element.addEventListener(MASCOT_EVENTS.greet, handleGreet);
      element.addEventListener(MASCOT_EVENTS.ready, handleReady);

      return () => {
        element.removeEventListener(MASCOT_EVENTS.greet, handleGreet);
        element.removeEventListener(MASCOT_EVENTS.ready, handleReady);
      };
    }, [size, greeting, theme, accent, label, onGreet, onReady]);

    return createElement(VAKAO_MASCOT_TAG, {
      ...rest,
      ref: assignRef,
      size: size ?? DEFAULT_SIZE,
      greeting,
      theme,
      accent,
      label,
    });
  },
);

VakaoMascot.displayName = 'VakaoMascot';
