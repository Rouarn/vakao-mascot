import {
  ABSTRACT_MODE_ATTRIBUTE,
  ABSTRACT_MODE_VALUE,
  DEFAULT_GAZE_RANGE,
  DEFAULT_VIEWBOX,
  REQUIRED_RIG_MARKERS,
  RIG_MARKERS,
} from './contract';
import { createSvgElement } from './sanitize';

export interface Point {
  x: number;
  y: number;
}

export interface MascotRig {
  svg: SVGSVGElement;
  /** 呼吸缩放所作用的根节点：优先 data-rig="rig"，否则为整张 svg。 */
  root: SVGGElement | SVGSVGElement;
  avatar: HTMLButtonElement;
  bubble: HTMLDivElement;
  head: SVGGElement;
  eyeLeft: SVGGElement;
  eyeRight: SVGGElement;
  eyeOpen: SVGGElement[];
  eyeClosed: SVGPathElement[];
  irisL: SVGGElement | null;
  irisR: SVGGElement | null;
  hairBack: SVGGElement | null;
  lockL: SVGGElement | null;
  lockR: SVGGElement | null;
  armL: SVGGElement | null;
  armR: SVGGElement | null;
  shadow: SVGGraphicsElement | null;
  /** 抽象角色可选节点：光晕、轨道、眨眼脉冲层、点击波纹与粒子。 */
  halo: SVGGraphicsElement | null;
  orbit: SVGGElement | null;
  blinkLayer: SVGGElement | null;
  ripple: SVGGElement | null;
  burst: SVGGElement | null;
  /** 抽象形态：不做头部倾斜，改为轨道旋转、光晕脉冲。 */
  abstract: boolean;
  origin: Point;
  headPivot: Point;
  hairPivot: Point;
  lockLPivot: Point;
  lockRPivot: Point;
  armLPivot: Point;
  armRPivot: Point;
  shadowRx: number;
  gazeRange: Point;
  /** 没有 eye-closed 时改用缩放眼睛组来实现眨眼。 */
  blinkFallback: boolean;
}

export interface RigBuildResult {
  rig: MascotRig | null;
  missing: string[];
}

function parsePair(value: string | null): Point | null {
  if (!value) return null;
  const numbers = value
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (numbers.length !== 2 || numbers.some((item) => !Number.isFinite(item))) return null;
  return { x: numbers[0], y: numbers[1] };
}

function viewBoxOf(svg: SVGSVGElement): { x: number; y: number; width: number; height: number } {
  const parsed = (svg.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parsed.length === 4 && parsed.every((item) => Number.isFinite(item)) && parsed[2] > 0) {
    return { x: parsed[0], y: parsed[1], width: parsed[2], height: parsed[3] };
  }
  return { ...DEFAULT_VIEWBOX };
}

/** 标记节点可选；缺失时返回 null。 */
function marker<T extends Element>(scope: ParentNode, name: string): T | null {
  return scope.querySelector(`[data-rig="${name}"]`) as T | null;
}

function markers<T extends Element>(scope: ParentNode, name: string): T[] {
  return Array.from(scope.querySelectorAll(`[data-rig="${name}"]`)) as T[];
}

/**
 * 读取节点自带的旋转中心；没有声明时用包围盒中心，
 * 再不济回落到视图中心。
 */
function pivotOf(node: Element | null, fallback: Point): Point {
  const declared = parsePair(node?.getAttribute('data-rig-pivot') ?? null);
  if (declared) return declared;

  if (node && typeof (node as SVGGraphicsElement).getBBox === 'function') {
    try {
      const box = (node as SVGGraphicsElement).getBBox();
      if (box.width || box.height) {
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }
    } catch {
      // 未挂载或环境不支持 getBBox 时忽略，走默认值。
    }
  }

  return fallback;
}

/**
 * 把外部 SVG 规范成可动画结构：
 * 尺寸交给宿主 CSS，补齐 data-rig="rig" 根节点。
 */
export function normalizeRigSvg(svg: SVGSVGElement): SVGSVGElement {
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  if (!svg.getAttribute('preserveAspectRatio')) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
  }

  if (!marker(svg, RIG_MARKERS.root)) {
    const root = createSvgElement('g');
    root.setAttribute('data-rig', RIG_MARKERS.root);
    while (svg.firstChild) root.appendChild(svg.firstChild);
    svg.appendChild(root);
  }

  return svg;
}

/**
 * 在 Shadow DOM 里建立一套骨骼引用。
 * 返回 missing 时调用方应打印错误并回退默认角色。
 */
export function buildMascotRig(shadowRoot: ShadowRoot): RigBuildResult {
  const svg = shadowRoot.querySelector('.avatar svg') as SVGSVGElement | null;
  const avatar = shadowRoot.querySelector('.avatar') as HTMLButtonElement | null;
  const bubble = shadowRoot.querySelector('.bubble') as HTMLDivElement | null;

  if (!svg || !avatar || !bubble) {
    return { rig: null, missing: ['avatar', 'bubble', 'svg'] };
  }

  const missing = REQUIRED_RIG_MARKERS.filter((name) => !marker(svg, name));

  if (missing.length > 0) {
    return { rig: null, missing: [...missing] };
  }

  const box = viewBoxOf(svg);
  const center: Point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const bottom: Point = { x: center.x, y: box.y + box.height };

  const root = (marker(svg, RIG_MARKERS.root) ?? svg) as SVGGElement | SVGSVGElement;
  const head = marker<SVGGElement>(svg, RIG_MARKERS.head)!;
  const eyeLeft = marker<SVGGElement>(svg, RIG_MARKERS.eyeLeft)!;
  const eyeRight = marker<SVGGElement>(svg, RIG_MARKERS.eyeRight)!;
  const eyeClosed = markers<SVGPathElement>(svg, RIG_MARKERS.eyeClosed);
  const shadow = marker<SVGGraphicsElement>(svg, RIG_MARKERS.shadow);
  const armR = marker<SVGGElement>(svg, RIG_MARKERS.armRight);

  const gazeRange =
    parsePair(svg.getAttribute('data-rig-gaze')) ??
    parsePair(head.getAttribute('data-rig-gaze')) ??
    { ...DEFAULT_GAZE_RANGE };

  const origin = parsePair(root.getAttribute('data-rig-origin')) ?? bottom;
  const shadowRx = Number.parseFloat(shadow?.getAttribute('rx') ?? '');
  const blinkFallback = eyeClosed.length === 0;

  if (blinkFallback) {
    for (const eye of [eyeLeft, eyeRight]) {
      eye.style.transformBox = 'fill-box';
      eye.style.transformOrigin = 'center';
    }
  }

  const rig: MascotRig = {
    svg,
    root,
    avatar,
    bubble,
    head,
    eyeLeft,
    eyeRight,
    eyeOpen: markers<SVGGElement>(svg, RIG_MARKERS.eyeOpen),
    eyeClosed,
    irisL: marker<SVGGElement>(svg, RIG_MARKERS.irisLeft),
    irisR: marker<SVGGElement>(svg, RIG_MARKERS.irisRight),
    hairBack: marker<SVGGElement>(svg, RIG_MARKERS.hairBack),
    lockL: marker<SVGGElement>(svg, RIG_MARKERS.lockLeft),
    lockR: marker<SVGGElement>(svg, RIG_MARKERS.lockRight),
    armL: marker<SVGGElement>(svg, RIG_MARKERS.armLeft),
    armR,
    shadow,
    halo: marker<SVGGraphicsElement>(svg, RIG_MARKERS.halo),
    orbit: marker<SVGGElement>(svg, RIG_MARKERS.orbit),
    blinkLayer: marker<SVGGElement>(svg, RIG_MARKERS.blink),
    ripple: marker<SVGGElement>(svg, RIG_MARKERS.ripple),
    burst: marker<SVGGElement>(svg, RIG_MARKERS.burst),
    abstract: svg.getAttribute(ABSTRACT_MODE_ATTRIBUTE) === ABSTRACT_MODE_VALUE,
    origin,
    headPivot: pivotOf(head, center),
    hairPivot: pivotOf(marker(svg, RIG_MARKERS.hairBack), center),
    lockLPivot: pivotOf(marker(svg, RIG_MARKERS.lockLeft), center),
    lockRPivot: pivotOf(marker(svg, RIG_MARKERS.lockRight), center),
    armLPivot: pivotOf(marker(svg, RIG_MARKERS.armLeft), center),
    armRPivot: pivotOf(armR, center),
    shadowRx: Number.isFinite(shadowRx) ? shadowRx : 0,
    gazeRange,
    blinkFallback,
  };

  return { rig, missing: [] };
}
