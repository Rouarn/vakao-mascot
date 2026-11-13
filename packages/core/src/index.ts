export {
  VAKAO_MASCOT_TAG,
  MASCOT_EVENTS,
  DEFAULT_GREETING,
  DEFAULT_LABEL,
  DEFAULT_SIZE,
  VakaoMascotElement,
  defineVakaoMascot,
} from './element';

export type {
  MascotTheme,
  MascotGreetDetail,
  MascotReadyDetail,
  MascotDebugState,
  VakaoMascotEventMap,
} from './element';

import type { MascotTheme } from './element';

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
