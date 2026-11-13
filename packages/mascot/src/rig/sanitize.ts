const BLOCKED_TAGS = new Set([
  'script',
  'style',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'image',
  'audio',
  'video',
  'canvas',
  'a',
  'animate',
  'animatetransform',
  'animatemotion',
  'set',
]);

const URL_ATTRIBUTES = new Set(['href', 'xlink:href', 'src', 'data']);

const SVG_NS = 'http://www.w3.org/2000/svg';

/** 读取属性，兼容 xlink:href 这种带命名空间的写法。 */
function readHref(element: Element): string | null {
  return (
    element.getAttribute('href') ??
    element.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ??
    element.getAttribute('xlink:href')
  );
}

function isLocalReference(value: string): boolean {
  return value.trim().startsWith('#');
}

/** url(...) 只允许指向文档内的局部 id。 */
function hasExternalUrl(value: string): boolean {
  const matches = value.match(/url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/gi);
  if (!matches) return false;
  return matches.some((match) => {
    const target = match.replace(/^url\s*\(\s*['"]?/i, '').replace(/['"]?\s*\)$/, '').trim();
    return !target.startsWith('#');
  });
}

function scrubAttributes(element: Element): void {
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (name.startsWith('on')) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (URL_ATTRIBUTES.has(name)) {
      if (!isLocalReference(value)) element.removeAttribute(attribute.name);
      continue;
    }

    if (/javascript:/i.test(value) || hasExternalUrl(value)) {
      element.removeAttribute(attribute.name);
    }
  }
}

function scrub(element: Element): void {
  for (const child of Array.from(element.children)) {
    const tag = child.tagName.toLowerCase();

    if (tag === 'use' && !isLocalReference(readHref(child) ?? '')) {
      child.remove();
      continue;
    }

    if (BLOCKED_TAGS.has(tag)) {
      child.remove();
      continue;
    }

    scrubAttributes(child);
    scrub(child);
  }
}

function parseSvg(source: string): SVGSVGElement | null {
  if (typeof DOMParser === 'undefined') return null;
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;
  return doc.documentElement as unknown as SVGSVGElement;
}

/**
 * 清洗外部传入的 SVG：
 * - 移除 script / style / foreignObject / image / a / 动画元素等可执行或可外链的标签；
 * - 移除所有 on* 事件属性；
 * - href / xlink:href / src / data 只保留文档内 #id 引用；
 * - 任意属性里的 url(...) 只保留局部引用，javascript: 一律删除。
 *
 * 返回 null 表示不是合法 SVG（调用方应回退默认角色）。
 */
export function sanitizeRigSvg(source: string | SVGElement): SVGSVGElement | null {
  let svg: SVGSVGElement | null = null;

  if (typeof source === 'string') {
    svg = parseSvg(source);
  } else if (source instanceof SVGElement) {
    svg = source.cloneNode(true) as SVGSVGElement;
  }

  if (!svg || svg.tagName.toLowerCase() !== 'svg') return null;

  scrubAttributes(svg);
  scrub(svg);
  return svg;
}

/** 新建 SVG 元素，供解析阶段包一层动画根节点使用。 */
export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}
