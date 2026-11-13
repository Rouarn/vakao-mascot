import type { MascotRig } from '../render/rig';

/** 眨眼调度状态。start 为 0 表示当前没有进行中的眨眼。 */
export interface BlinkState {
  next: number;
  start: number;
  count: number;
  double: boolean;
}

export const createBlinkState = (): BlinkState => ({
  next: 0,
  start: 0,
  count: 0,
  double: false,
});

/**
 * 推进一次眨眼状态机，返回当前帧眼睛是否闭合。
 * 单次眨眼 150ms；25% 概率连眨两下，总时长 340ms。
 */
export function updateBlink(state: BlinkState, now: number): boolean {
  if (!state.start && now >= state.next) {
    state.start = now;
    state.count += 1;
    state.double = Math.random() < 0.25;
  }
  if (!state.start) return false;

  const elapsed = now - state.start;
  let closed = elapsed < 110 || (state.double && elapsed >= 200 && elapsed < 310);
  const end = state.double ? 340 : 150;
  if (elapsed >= end) {
    state.start = 0;
    state.next = now + 2200 + Math.random() * 3400;
    closed = false;
  }
  return closed;
}

/** 用透明度切换睁眼 / 闭眼两组图形。 */
export function applyBlink(
  refs: Pick<MascotRig, 'eyeOpen' | 'eyeClosed'>,
  closed: boolean,
): void {
  refs.eyeOpen.forEach((node) => {
    node.style.opacity = closed ? '0' : '1';
  });
  refs.eyeClosed.forEach((node) => {
    node.style.opacity = closed ? '1' : '0';
  });
}
