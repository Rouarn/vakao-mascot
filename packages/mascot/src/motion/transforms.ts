import type { MascotRig } from '../rig/parse';

const transformNodes = (rig: MascotRig) =>
  [rig.root, rig.head, rig.hairBack, rig.lockL, rig.lockR, rig.armL, rig.armR].filter(
    (node): node is NonNullable<typeof node> => Boolean(node),
  );

/** 清除所有动画 transform，恢复到静态姿势（reduced-motion 用）。 */
export function clearRigTransforms(rig: MascotRig): void {
  transformNodes(rig).forEach((node) => node.removeAttribute('transform'));

  if (rig.shadow) {
    rig.shadow.setAttribute('rx', String(rig.shadowRx));
    rig.shadow.setAttribute('opacity', '0.16');
  }
}

/**
 * 按时间与视线参数写入整套骨骼 transform：
 * 呼吸、身体摆动、头部倾斜、头发与手臂跟随、挥手。
 */
export function applyRigTransforms(
  rig: MascotRig,
  now: number,
  gaze: { x: number; y: number },
  waveUntil: number,
): void {
  const t = now / 1000;
  const breath = Math.sin(t * 1.5);
  const sway = Math.sin(t * 0.72);
  const wave = now < waveUntil;
  const wavePhase = wave ? Math.sin((waveUntil - now) / 52) : 0;
  const scaleY = 1 + breath * 0.012;
  const origin = rig.origin;

  rig.root.setAttribute(
    'transform',
    `translate(0 ${(-Math.abs(breath) * 1.1).toFixed(2)}) ` +
      `translate(${origin.x} ${origin.y}) scale(1 ${scaleY.toFixed(4)}) ` +
      `translate(${-origin.x} ${-origin.y})`,
  );

  const headPivot = rig.headPivot;
  const headTilt = gaze.x * 6 + sway * 0.9 + (wave ? -2 : 0);
  rig.head.setAttribute(
    'transform',
    `rotate(${headTilt.toFixed(2)} ${headPivot.x} ${headPivot.y})`,
  );

  if (rig.hairBack) {
    rig.hairBack.setAttribute(
      'transform',
      `rotate(${(sway * 0.7 - gaze.x * 0.8).toFixed(2)} ${rig.hairPivot.x} ${rig.hairPivot.y})`,
    );
  }

  if (rig.lockL) {
    rig.lockL.setAttribute(
      'transform',
      `rotate(${(sway * 1.1).toFixed(2)} ${rig.lockLPivot.x} ${rig.lockLPivot.y})`,
    );
  }

  if (rig.lockR) {
    rig.lockR.setAttribute(
      'transform',
      `rotate(${(sway * 1.1).toFixed(2)} ${rig.lockRPivot.x} ${rig.lockRPivot.y})`,
    );
  }

  if (rig.shadow) {
    rig.shadow.setAttribute('rx', (rig.shadowRx + breath * 1.6).toFixed(2));
    rig.shadow.setAttribute('opacity', (0.16 - breath * 0.015).toFixed(3));
  }

  if (rig.armL) {
    rig.armL.setAttribute(
      'transform',
      `rotate(${(Math.sin(t * 1.1) * 1.6 + sway * 0.8).toFixed(2)} ${rig.armLPivot.x} ${rig.armLPivot.y})`,
    );
  }

  if (rig.armR) {
    rig.armR.setAttribute(
      'transform',
      wave
        ? `rotate(${(-105 + wavePhase * 11).toFixed(2)} ${rig.armRPivot.x} ${rig.armRPivot.y})`
        : `rotate(${(Math.sin(t * 1.1) * 1.6 - sway * 0.8).toFixed(2)} ${rig.armRPivot.x} ${rig.armRPivot.y})`,
    );
  }
}
