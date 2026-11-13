import type { VakaoMascotElement } from './element';
import { MASCOT_EVENTS } from './constants';

export type MascotTheme = 'auto' | 'light' | 'dark';

export interface MascotGreetDetail {
  greeting: string;
}

export interface MascotReadyDetail {
  element: VakaoMascotElement;
}

export interface MascotDebugState {
  gaze: { x: number; y: number };
  irisTransform: string;
  blinkCount: number;
  waving: boolean;
  bubbleVisible: boolean;
  rect: { x: number; y: number; width: number; height: number };
  zIndex: string;
  pointerEvents: string;
}

export interface VakaoMascotEventMap {
  [MASCOT_EVENTS.greet]: CustomEvent<MascotGreetDetail>;
  [MASCOT_EVENTS.ready]: CustomEvent<MascotReadyDetail>;
}

/** 组件可配置项，React / Vue 封装共用。 */
export interface VakaoMascotOptions {
  /** 角色最大宽度，像素，默认 210，限制在 96–420。 */
  size?: number;
  /** 点击时气泡里的文字。 */
  greeting?: string;
  /** 气泡配色模式，默认 auto（跟随系统）。 */
  theme?: MascotTheme;
  /** 键盘聚焦描边与强调色。 */
  accent?: string;
  /** 角色按钮的无障碍名称。 */
  label?: string;
}
