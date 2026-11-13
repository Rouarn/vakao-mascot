import { DEFAULT_SIZE } from './constants';

/** 把数值限制在 [min, max] 区间内。 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** 解析 size 特性；非法值回落到默认尺寸。 */
export const toSize = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SIZE;
};
