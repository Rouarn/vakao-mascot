import type { MascotRig } from '../render/rig';
import { clamp } from '../core/utils';

/** 视线状态：tx / ty 是目标，x / y 是阻尼后的当前值。 */
export interface GazeState {
  tx: number;
  ty: number;
  x: number;
  y: number;
}

export const createGazeState = (): GazeState => ({ tx: 0, ty: 0, x: 0, y: 0 });

/**
 * 把指针（含触摸）位置换算成 [-1, 1] 的视线目标。
 * rect 为角色本体的包围盒，宽度为 0 时直接忽略。
 */
export function trackGaze(gaze: GazeState, event: Event, rect: DOMRect): void {
  const source = event as PointerEvent & { touches?: TouchList };
  const touch = source.touches && source.touches[0] ? source.touches[0] : null;
  const clientX = touch ? touch.clientX : source.clientX;
  const clientY = touch ? touch.clientY : source.clientY;
  if (!rect.width) return;

  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.42;
  gaze.tx = clamp((clientX - cx) / 320, -1, 1);
  gaze.ty = clamp((clientY - cy) / 320, -1, 1);
}

/** 每帧向目标值做指数逼近。 */
export function easeGaze(gaze: GazeState): void {
  gaze.x += (gaze.tx - gaze.x) * 0.085;
  gaze.y += (gaze.ty - gaze.y) * 0.085;
}

/** 把当前视线值写到两只瞳孔的 transform 上。 */
export function applyGaze(
  refs: Pick<MascotRig, 'irisL' | 'irisR'>,
  gaze: GazeState,
): void {
  const dx = (gaze.x * 3.4).toFixed(2);
  const dy = (gaze.y * 2.8).toFixed(2);
  refs.irisL.setAttribute('transform', `translate(${dx} ${dy})`);
  refs.irisR.setAttribute('transform', `translate(${dx} ${dy})`);
}
