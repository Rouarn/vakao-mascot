import type { MascotRig } from '../rig/parse';

const transformNodes = (rig: MascotRig) =>
  [
    rig.root,
    rig.head,
    rig.hairBack,
    rig.lockL,
    rig.lockR,
    rig.armL,
    rig.armR,
    rig.orbit,
    rig.halo,
  ].filter((node): node is NonNullable<typeof node> => Boolean(node));

/** 品牌动效 token：星芒旋转一圈 2.4s，呼吸脉冲 1.8s。 */
const SPIN_MS = 2400;
const PULSE_SECONDS = 1.8;
const WAVE_MS = 1700;
const RIPPLE_MS = 620;
const BURST_MS = 760;

/** 清除所有动画 transform，恢复到静态姿势（reduced-motion 用）。 */
export function clearRigTransforms(rig: MascotRig): void {
  transformNodes(rig).forEach((node) => node.removeAttribute('transform'));

  if (rig.shadow) {
    rig.shadow.setAttribute('rx', String(rig.shadowRx));
    rig.shadow.setAttribute('opacity', '0.16');
  }

  if (rig.halo) {
    rig.halo.setAttribute('opacity', '1');
  }

  if (rig.blinkLayer) {
    rig.blinkLayer.style.opacity = '1';
    rig.blinkLayer.style.transform = '';
  }

  [rig.ripple, rig.burst].forEach((group) => group?.setAttribute('opacity', '0'));
}

const easeOut = (value: number): number => 1 - (1 - value) ** 3;

/**
 * 按时间与视线参数写入整套骨骼 transform：
 * 呼吸、身体摆动、头部倾斜、头发与手臂跟随、挥手。
 * 抽象角色只做缩放呼吸、轨道旋转、光晕脉冲与点击波纹，不倾斜主体。
 */
export function applyRigTransforms(
  rig: MascotRig,
  now: number,
  gaze: { x: number; y: number },
  waveUntil: number,
): void {
  if (rig.abstract) {
    applyAbstractTransforms(rig, now, gaze, waveUntil);
    return;
  }

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

/**
 * 抽象角色的动作载体：
 * 整体统一缩放呼吸（1.8s 脉冲）、轨道匀速旋转（2.4s 一圈，带视线视差）、
 * 光晕明暗脉动，以及点击时扩散的波纹与粒子。
 */
function applyAbstractTransforms(
  rig: MascotRig,
  now: number,
  gaze: { x: number; y: number },
  waveUntil: number,
): void {
  const t = now / 1000;
  const pulse = Math.sin((t * Math.PI * 2) / PULSE_SECONDS);
  const origin = rig.origin;
  const scale = 1 + pulse * 0.014;

  rig.root.setAttribute(
    'transform',
    `translate(${origin.x} ${origin.y}) scale(${scale.toFixed(4)}) translate(${-origin.x} ${-origin.y})`,
  );

  if (rig.halo) {
    rig.halo.setAttribute('opacity', (0.76 + 0.24 * (pulse * 0.5 + 0.5)).toFixed(3));
    rig.halo.setAttribute(
      'transform',
      `translate(${(gaze.x * 2.4).toFixed(2)} ${(gaze.y * 1.8).toFixed(2)})`,
    );
  }

  rig.head.setAttribute(
    'transform',
    `translate(${(gaze.x * 4).toFixed(2)} ${(gaze.y * 3).toFixed(2)})`,
  );

  if (rig.orbit) {
    const degrees = ((now % SPIN_MS) / SPIN_MS) * 360;
    rig.orbit.setAttribute(
      'transform',
      `translate(${(-gaze.x * 2).toFixed(2)} ${(-gaze.y * 1.6).toFixed(2)}) ` +
        `rotate(${degrees.toFixed(2)} ${origin.x} ${origin.y})`,
    );
  }

  const elapsed = now < waveUntil ? WAVE_MS - (waveUntil - now) : Number.POSITIVE_INFINITY;

  if (rig.ripple) {
    const rings = Array.from(rig.ripple.children) as SVGCircleElement[];
    rings.forEach((ring, index) => {
      const progress =
        elapsed === Number.POSITIVE_INFINITY ? 1 : Math.min(Math.max((elapsed - index * 130) / RIPPLE_MS, 0), 1);
      ring.setAttribute('r', (58 + easeOut(progress) * 50).toFixed(2));
      ring.setAttribute('opacity', (1 - progress).toFixed(3));
    });
    rig.ripple.setAttribute('opacity', elapsed === Number.POSITIVE_INFINITY ? '0' : '1');
  }

  if (rig.burst) {
    const progress = elapsed === Number.POSITIVE_INFINITY ? 1 : Math.min(elapsed / BURST_MS, 1);
    const push = easeOut(progress) * 26;
    Array.from(rig.burst.children).forEach((dot, index) => {
      const angle = ((-90 + index * 60) * Math.PI) / 180;
      dot.setAttribute(
        'transform',
        `translate(${(Math.cos(angle) * push).toFixed(2)} ${(Math.sin(angle) * push).toFixed(2)})`,
      );
      dot.setAttribute('opacity', (1 - progress).toFixed(3));
    });
    rig.burst.setAttribute('opacity', elapsed === Number.POSITIVE_INFINITY ? '0' : '1');
  }
}
