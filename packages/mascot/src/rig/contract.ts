/**
 * 自定义 SVG 角色契约中的节点标记。
 * 使用方在 SVG 元素上写 data-rig="<标记名>" 即可被动画逻辑识别。
 */
export const RIG_MARKERS = {
  root: 'rig',
  head: 'head',
  body: 'body',
  eyeLeft: 'eye-left',
  eyeRight: 'eye-right',
  eyeOpen: 'eye-open',
  eyeClosed: 'eye-closed',
  irisLeft: 'iris-left',
  irisRight: 'iris-right',
  hairBack: 'hair-back',
  lockLeft: 'lock-left',
  lockRight: 'lock-right',
  armLeft: 'arm-left',
  armRight: 'arm-right',
  shadow: 'shadow',
} as const;

/** 缺少任意一个都会回退到默认角色。 */
export const REQUIRED_RIG_MARKERS = ['head', 'eye-left', 'eye-right'] as const;

export const RIG_CONTRACT_DOC = 'docs/rig-contract.md';

/** 默认视口尺寸，仅用于解析不到 viewBox 时的兜底。 */
export const DEFAULT_VIEWBOX = { x: 0, y: 0, width: 220, height: 260 };

/** 瞳孔随视线移动的最大像素偏移。 */
export const DEFAULT_GAZE_RANGE = { x: 3.4, y: 2.8 };
