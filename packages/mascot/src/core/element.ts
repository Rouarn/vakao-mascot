import {
  DEFAULT_GREETING,
  DEFAULT_LABEL,
  MASCOT_EVENTS,
  VAKAO_MASCOT_TAG,
} from './constants';
import type {
  MascotDebugState,
  MascotGreetDetail,
  MascotReadyDetail,
  MascotTheme,
} from './types';
import { clamp, toSize } from './utils';
import { getMascotTemplate } from '../render/template';
import { buildMascotRig, normalizeRigSvg } from '../rig/parse';
import type { MascotRig } from '../rig/parse';
import { RIG_CONTRACT_DOC } from '../rig/contract';
import { getVakaoMascotRig } from '../rig/registry';
import { sanitizeRigSvg } from '../rig/sanitize';
import { applyBlink, createBlinkState, updateBlink } from '../motion/blink';
import type { BlinkState } from '../motion/blink';
import { applyGaze, createGazeState, easeGaze, trackGaze } from '../motion/gaze';
import type { GazeState } from '../motion/gaze';
import { applyRigTransforms, clearRigTransforms } from '../motion/transforms';

/*
 * SSR 安全：模块顶层不能直接 class X extends HTMLElement。
 * 在 Node 环境用空基类占位，只有在浏览器里 define 后才会真正实例化。
 */
const HTMLElementBase = (
  typeof HTMLElement === 'undefined' ? class {} : HTMLElement
) as unknown as typeof HTMLElement;

export class VakaoMascotElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ['size', 'greeting', 'theme', 'accent', 'label', 'rig'];
  }

  private _refs!: MascotRig;
  private _rigSource: string | SVGElement | null = null;
  private _avatarListener: HTMLButtonElement | null = null;

  private _running = false;
  private _raf = 0;
  private _readyRaf = 0;
  private _bubbleTimer: ReturnType<typeof setTimeout> | undefined;
  private _reduced = false;
  private _transformsCleared = false;
  private _motionQuery: MediaQueryList | null = null;
  private _gaze: GazeState = createGazeState();
  private _blink: BlinkState = createBlinkState();
  private _waveUntil = 0;

  /** 自定义角色来源：SVG 字符串、SVG 元素，或已注册的名称。 */
  get rig(): string | SVGElement | null {
    return this._rigSource ?? this.getAttribute('rig');
  }

  set rig(value: string | SVGElement | null) {
    this._rigSource = value ?? null;
    if (this.isConnected) this._rebuild();
  }

  /** 恢复默认角色。 */
  resetRig(): void {
    this._rigSource = null;
    if (this.hasAttribute('rig')) this.removeAttribute('rig');
    if (this.isConnected) this._rebuild();
  }

  get size(): number {
    return toSize(this.getAttribute('size'));
  }

  set size(value: number) {
    if (Number.isFinite(value) && value > 0) {
      this.setAttribute('size', String(value));
    } else {
      this.removeAttribute('size');
    }
  }

  get greeting(): string {
    return this.getAttribute('greeting') || DEFAULT_GREETING;
  }

  set greeting(value: string) {
    if (value) {
      this.setAttribute('greeting', value);
    } else {
      this.removeAttribute('greeting');
    }
  }

  get theme(): MascotTheme {
    const value = this.getAttribute('theme');
    return value === 'light' || value === 'dark' ? value : 'auto';
  }

  set theme(value: MascotTheme) {
    if (value === 'light' || value === 'dark') {
      this.setAttribute('theme', value);
    } else {
      this.setAttribute('theme', 'auto');
    }
  }

  get accent(): string {
    return this.getAttribute('accent') || '';
  }

  set accent(value: string) {
    if (value) {
      this.setAttribute('accent', value);
    } else {
      this.removeAttribute('accent');
    }
  }

  get label(): string {
    return this.getAttribute('label') || DEFAULT_LABEL;
  }

  set label(value: string) {
    if (value) {
      this.setAttribute('label', value);
    } else {
      this.removeAttribute('label');
    }
  }

  connectedCallback(): void {
    if (!this.shadowRoot) this._render();
    this._applyStyles();
    this._start();
  }

  disconnectedCallback(): void {
    this._stop();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'size' || name === 'accent' || name === 'label') {
      this._applyStyles();
      return;
    }
    if (name === 'rig' && this.isConnected && this._rigSource === null) {
      this._rebuild();
    }
  }

  /** 触发挥手与气泡，并派发 greet 事件。 */
  greet(): void {
    const refs = this._refs;
    if (!refs?.bubble) return;

    const greeting = this.greeting;
    this._waveUntil = performance.now() + 1700;
    refs.bubble.textContent = greeting;
    refs.bubble.classList.add('show');
    clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => {
      refs.bubble.classList.remove('show');
    }, 2200);

    this.dispatchEvent(
      new CustomEvent<MascotGreetDetail>(MASCOT_EVENTS.greet, {
        detail: { greeting },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** 只读状态快照，主要用于测试与可视化回归。 */
  debugState(): MascotDebugState {
    const rect = this._refs?.avatar?.getBoundingClientRect();
    return {
      gaze: { x: Number(this._gaze.x.toFixed(3)), y: Number(this._gaze.y.toFixed(3)) },
      irisTransform: this._refs?.irisL?.getAttribute('transform') || '',
      blinkCount: this._blink.count,
      waving: performance.now() < this._waveUntil,
      bubbleVisible: Boolean(this._refs?.bubble?.classList.contains('show')),
      rect: rect
        ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        : { x: 0, y: 0, width: 0, height: 0 },
      zIndex: getComputedStyle(this).zIndex,
      pointerEvents: getComputedStyle(this).pointerEvents,
    };
  }

  /** 解析属性 / 属性值 / 注册表里的角色来源。 */
  private _resolveRigSource(): string | SVGElement | null {
    const input = this._rigSource ?? this.getAttribute('rig');
    if (!input) return null;

    if (typeof input !== 'string') return input;

    const value = input.trim();
    if (!value) return null;
    if (value.startsWith('<')) return input;

    const registered = getVakaoMascotRig(value);
    if (registered) return registered;

    const node = typeof document === 'undefined' ? null : document.getElementById(value);
    if (node instanceof HTMLTemplateElement) return node.innerHTML;
    if (node instanceof SVGElement) return node;

    console.error(
      `[vakao-mascot] 找不到名为 “${value}” 的自定义角色，已回退默认角色。` +
        `可使用 defineVakaoMascotRig() 注册，或让 rig 指向文档中的 <template> / <svg> id。契约见 ${RIG_CONTRACT_DOC}。`,
    );
    return null;
  }

  /** 把自定义 SVG 注入到角色按钮里；非法内容保持默认角色。 */
  private _injectCustomRig(root: ShadowRoot, source: string | SVGElement): boolean {
    const svg = sanitizeRigSvg(source);
    if (!svg) {
      console.error(
        `[vakao-mascot] 自定义角色不是合法的 SVG，已回退默认角色。契约见 ${RIG_CONTRACT_DOC}。`,
      );
      return false;
    }

    const shell = root.querySelector('.avatar svg');
    if (!shell) return false;

    shell.replaceWith(normalizeRigSvg(svg));
    return true;
  }

  private _render(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.replaceChildren(getMascotTemplate().content.cloneNode(true));

    const source = this._resolveRigSource();
    if (source) this._injectCustomRig(root, source);

    let result = buildMascotRig(root);

    if (!result.rig) {
      console.error(
        `[vakao-mascot] 自定义角色缺少必需节点：${result.missing.join('、')}，已回退默认角色。` +
          `契约见 ${RIG_CONTRACT_DOC}。`,
      );
      root.replaceChildren(getMascotTemplate().content.cloneNode(true));
      result = buildMascotRig(root);
    }

    this._refs = result.rig!;
    this._attachAvatar();
  }

  /** 角色切换后重建 Shadow DOM，并保留运行中的动画循环。 */
  private _rebuild(): void {
    this._detachAvatar();
    this._transformsCleared = false;
    this._render();
    this._applyStyles();
  }

  private _attachAvatar(): void {
    this._detachAvatar();
    this._refs.avatar.addEventListener('click', this._onClick);
    this._avatarListener = this._refs.avatar;
  }

  private _detachAvatar(): void {
    this._avatarListener?.removeEventListener('click', this._onClick);
    this._avatarListener = null;
  }

  private _applyStyles(): void {
    if (!this.isConnected && !this.shadowRoot) return;

    const size = clamp(this.size, 96, 420);
    this.style.setProperty('--vk-mascot-size', `${size}px`);

    if (this.accent) {
      this.style.setProperty('--vk-mascot-accent', this.accent);
    } else {
      this.style.removeProperty('--vk-mascot-accent');
    }

    this._refs?.avatar?.setAttribute('aria-label', this.label);
  }

  private _start(): void {
    if (this._running) return;
    this._running = true;
    this._applyStyles();

    if (!this._motionQuery && typeof window.matchMedia === 'function') {
      this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    }
    if (this._motionQuery) {
      this._reduced = this._motionQuery.matches;
      this._motionQuery.addEventListener?.('change', this._onMotionChange);
    }

    this._blink.next = performance.now() + 1800;
    this._transformsCleared = false;

    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    window.addEventListener('touchstart', this._onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibility);
    this._attachAvatar();

    this._readyRaf = requestAnimationFrame(this._emitReady);
    this._raf = requestAnimationFrame(this._tick);
  }

  private _stop(): void {
    this._running = false;
    cancelAnimationFrame(this._raf);
    cancelAnimationFrame(this._readyRaf);
    clearTimeout(this._bubbleTimer);

    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('touchstart', this._onPointerMove);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._detachAvatar();
    this._motionQuery?.removeEventListener?.('change', this._onMotionChange);
  }

  private _emitReady = (): void => {
    this.dispatchEvent(
      new CustomEvent<MascotReadyDetail>(MASCOT_EVENTS.ready, {
        detail: { element: this },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _onMotionChange = (event: MediaQueryListEvent): void => {
    this._reduced = event.matches;
    this._transformsCleared = false;
  };

  private _onVisibility = (): void => {
    if (document.hidden) {
      cancelAnimationFrame(this._raf);
    } else if (this._running) {
      this._blink.next = performance.now() + 1500;
      this._raf = requestAnimationFrame(this._tick);
    }
  };

  private _onClick = (): void => {
    this.greet();
  };

  private _onPointerMove = (event: Event): void => {
    trackGaze(this._gaze, event, this._refs.avatar.getBoundingClientRect());
  };

  private _tick = (now: number): void => {
    if (!this._running) return;

    easeGaze(this._gaze);

    if (this._reduced) {
      if (!this._transformsCleared) {
        this._transformsCleared = true;
        clearRigTransforms(this._refs);
      }
    } else {
      this._transformsCleared = false;
      applyRigTransforms(this._refs, now, this._gaze, this._waveUntil);
    }

    applyGaze(this._refs, this._gaze);

    const closed = updateBlink(this._blink, now);
    applyBlink(this._refs, closed);

    this._raf = requestAnimationFrame(this._tick);
  };
}

/** 幂等注册自定义元素；在非浏览器环境调用是安全的空操作。 */
export function defineVakaoMascot(tagName: string = VAKAO_MASCOT_TAG): void {
  if (typeof customElements === 'undefined') return;
  if (customElements.get(tagName)) return;

  const ctor =
    tagName === VAKAO_MASCOT_TAG
      ? VakaoMascotElement
      : class extends VakaoMascotElement {};

  customElements.define(tagName, ctor);
}
