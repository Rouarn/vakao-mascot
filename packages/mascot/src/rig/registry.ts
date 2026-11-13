/** 已注册的自定义角色来源，按名称索引。 */
const registry = new Map<string, string | SVGElement>();

/** 注册/覆盖一个具名角色，之后可用 rig="名称" 引用。 */
export function defineVakaoMascotRig(name: string, source: string | SVGElement): void {
  if (!name) throw new Error('[vakao-mascot] 角色名称不能为空');
  registry.set(name, source);
}

/** 读取具名角色；不存在时返回 null。 */
export function getVakaoMascotRig(name: string): string | SVGElement | null {
  return registry.get(name) ?? null;
}

/** 列出已注册的角色名称。 */
export function listVakaoMascotRigs(): string[] {
  return Array.from(registry.keys());
}
