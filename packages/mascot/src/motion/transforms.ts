import type { MascotRig } from '../render/rig';
import type { GazeState } from './gaze';

const RESTING_NODES = ['rig', 'head', 'hairBack', 'lockL', 'lockR', 'armL', 'armR'] as const;

/** 清除所有动画 transform，恢复到静态姿势（reduced-motion 用）。 */
export function clearRigTransforms(refs: MascotRig): void {
  RESTING_NODES.forEach((key) => refs[key].removeAttribute('transform'));
  refs.groundShadow.setAttribute('rx', '48');
  refs.groundShadow.setAttribute('opacity', '0.16');
}

/**
 * 按时间与视线参数写入整套骨骼 transform：
 * 呼吸、身体摆动、头部倾斜、头发与手臂跟随、挥手。
 */
export function applyRigTransforms(
  refs: MascotRig,
  now: number,
  gaze: GazeState,
  waveUntil: number,
): void {
  const t = now / 1000;
  const breath = Math.sin(t * 1.5);
  const sway = Math.sin(t * 0.72);
  const wave = now < waveUntil;
  const wavePhase = wave ? Math.sin((waveUntil - now) / 52) : 0;
  const scaleY = 1 + breath * 0.012;

  refs.rig.setAttribute(
    'transform',
    `translate(0 ${(-Math.abs(breath) * 1.1).toFixed(2)}) ` +
      `translate(110 248) scale(1 ${scaleY.toFixed(4)}) translate(-110 -248)`,
  );

  const headTilt = gaze.x * 6 + sway * 0.9 + (wave ? -2 : 0);
  refs.head.setAttribute('transform', `rotate(${headTilt.toFixed(2)} 110 152)`);
  refs.hairBack.setAttribute(
    'transform',
    `rotate(${(sway * 0.7 - gaze.x * 0.8).toFixed(2)} 110 62)`,
  );
  refs.lockL.setAttribute('transform', `rotate(${(sway * 1.1).toFixed(2)} 74 110)`);
  refs.lockR.setAttribute('transform', `rotate(${(sway * 1.1).toFixed(2)} 146 110)`);
  refs.groundShadow.setAttribute('rx', (48 + breath * 1.6).toFixed(2));
  refs.groundShadow.setAttribute('opacity', (0.16 - breath * 0.015).toFixed(3));

  refs.armL.setAttribute(
    'transform',
    `rotate(${(Math.sin(t * 1.1) * 1.6 + sway * 0.8).toFixed(2)} 87 172)`,
  );
  refs.armR.setAttribute(
    'transform',
    wave
      ? `rotate(${(-105 + wavePhase * 11).toFixed(2)} 133 172)`
      : `rotate(${(Math.sin(t * 1.1) * 1.6 - sway * 0.8).toFixed(2)} 133 172)`,
  );
}
