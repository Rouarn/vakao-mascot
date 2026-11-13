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
import { queryRig } from '../render/rig';
import type { MascotRig } from '../render/rig';
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
    return ['size', 'greeting', 'theme', 'accent', 'label'];
  }

  private _refs!: MascotRig;

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

  private _render(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(getMascotTemplate().content.cloneNode(true));
    this._refs = queryRig(root);
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
    this._refs.avatar.addEventListener('click', this._onClick);

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
    this._refs?.avatar?.removeEventListener('click', this._onClick);
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
