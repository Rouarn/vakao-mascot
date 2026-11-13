import type { MascotRig } from '../rig/parse';

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

/**
 * 用透明度切换睁眼 / 闭眼两组图形。
 * 自定义角色只有眼睛组、没有闭眼图形时，退化为纵向压缩眼睛组。
 * 抽象角色可用可选的 blink 层做光晕脉冲，作为眨眼的等价节律。
 */
export function applyBlink(rig: MascotRig, closed: boolean): void {
  if (rig.blinkLayer) {
    rig.blinkLayer.style.opacity = closed ? '0.5' : '1';
    rig.blinkLayer.style.transform = closed ? 'scale(0.95)' : '';
  }

  if (rig.blinkFallback) {
    const transform = closed ? 'scaleY(0.12)' : '';
    rig.eyeLeft.style.transform = transform;
    rig.eyeRight.style.transform = transform;
    return;
  }

  rig.eyeOpen.forEach((node) => {
    node.style.opacity = closed ? '0' : '1';
  });
  rig.eyeClosed.forEach((node) => {
    node.style.opacity = closed ? '1' : '0';
  });
}
