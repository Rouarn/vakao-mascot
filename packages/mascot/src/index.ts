export {
  VAKAO_MASCOT_TAG,
  MASCOT_EVENTS,
  DEFAULT_GREETING,
  DEFAULT_LABEL,
  DEFAULT_SIZE,
} from './core/constants';

export { VakaoMascotElement, defineVakaoMascot } from './core/element';

export type {
  MascotTheme,
  MascotGreetDetail,
  MascotReadyDetail,
  MascotDebugState,
  VakaoMascotEventMap,
  VakaoMascotOptions,
} from './core/types';

export {
  defineVakaoMascotRig,
  getVakaoMascotRig,
  listVakaoMascotRigs,
} from './rig/registry';
