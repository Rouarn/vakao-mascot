import type { Application } from 'pixi.js';
import type { Live2DModel } from 'pixi-live2d-display/cubism4';

export const VAKAO_LIVE2D_TAG = 'vakao-live2d';
export const LIVE2D_CORE_URL = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';
export const LIVE2D_DOC = 'docs/live2d.md';

const HTMLElementBase = (
  typeof HTMLElement === 'undefined' ? class {} : HTMLElement
) as unknown as typeof HTMLElement;

const HOST_STYLE = `
:host {
  position: fixed;
  right: calc(clamp(12px, 2vw, 20px) + env(safe-area-inset-right, 0px));
  bottom: calc(clamp(10px, 1.6vw, 16px) + env(safe-area-inset-bottom, 0px));
  width: min(var(--vk-live2d-size, 240px), 32vw);
  aspect-ratio: 3 / 4;
  z-index: 9999;
  display: block;
  pointer-events: none;
}
canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  pointer-events: auto;
  touch-action: manipulation;
  cursor: pointer;
}
`;

type CubismGlobal = { Live2DCubismCore?: unknown };

/**
 * Live2D 角色的按需入口。
 *
 * 该文件只在 @vakao/mascot/live2d 子路径里被引用，主包不会加载 pixi 与运行时。
 * Cubism Core 有独立授权，必须由使用方在页面里自行引入。
 */
export class VakaoLive2DElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ['src', 'size', 'motion', 'idle'];
  }

  private _app: Application | null = null;
  private _model: Live2DModel | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _bootToken = 0;
  private _resizeObserver: ResizeObserver | null = null;
  private _idleTimer: ReturnType<typeof setTimeout> | undefined;

  get model(): Live2DModel | null {
    return this._model;
  }

  get ready(): boolean {
    return Boolean(this._model);
  }

  get size(): number {
    const parsed = Number(this.getAttribute('size'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 240;
  }

  set size(value: number) {
    if (Number.isFinite(value) && value > 0) {
      this.setAttribute('size', String(value));
    } else {
      this.removeAttribute('size');
    }
  }

  /** 模型配置地址，通常是 .model3.json。 */
  get src(): string {
    return this.getAttribute('src') ?? '';
  }

  set src(value: string) {
    if (value) this.setAttribute('src', value);
    else this.removeAttribute('src');
  }

  /** 点击时播放的动作组，默认 TapBody。 */
  get motion(): string {
    return this.getAttribute('motion') || 'TapBody';
  }

  set motion(value: string) {
    if (value) this.setAttribute('motion', value);
    else this.removeAttribute('motion');
  }

  /** 待机动作组，默认 Idle；模型没有该组时静默跳过。 */
  get idle(): string {
    return this.getAttribute('idle') || 'Idle';
  }

  set idle(value: string) {
    if (value) this.setAttribute('idle', value);
    else this.removeAttribute('idle');
  }

  connectedCallback(): void {
    this._applySize();
    void this._boot();
  }

  disconnectedCallback(): void {
    this._destroy();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'size') {
      this._applySize();
      return;
    }
    if ((name === 'src' || name === 'motion' || name === 'idle') && this.isConnected) {
      void this._boot();
    }
  }

  private _applySize(): void {
    this.style.setProperty('--vk-live2d-size', `${this.size}px`);
  }

  private _prepareShadow(): ShadowRoot {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.replaceChildren();

    const style = document.createElement('style');
    style.textContent = HOST_STYLE;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', this.getAttribute('label') || 'Live2D 角色');

    root.append(style, canvas);
    this._canvas = canvas;
    return root;
  }

  private async _boot(): Promise<void> {
    if (!this.isConnected) return;
    if (!this.src) {
      console.error(`[vakao-live2d] 缺少 src 属性（.model3.json 地址）。说明见 ${LIVE2D_DOC}。`);
      return;
    }

    const core = (window as unknown as CubismGlobal).Live2DCubismCore;
    if (!core) {
      console.error(
        `[vakao-live2d] 未检测到 Cubism Core。请先自行引入 live2dcubismcore.min.js（${LIVE2D_CORE_URL}），` +
          `它受 Live2D 独立授权约束，不能随本包分发。说明见 ${LIVE2D_DOC}。`,
      );
      return;
    }

    const token = ++this._bootToken;
    this._destroyRenderer();

    try {
      const [{ Application, Ticker }, { Live2DModel: Model }] = await Promise.all([
        import('pixi.js'),
        import('pixi-live2d-display/cubism4'),
      ]);
      if (token !== this._bootToken) return;

      Model.registerTicker(Ticker);

      this._prepareShadow();
      const canvas = this._canvas!;
      const app = new Application({
        view: canvas,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        resizeTo: this,
      });
      this._app = app;

      const model = await Model.from(this.src, { autoInteract: false, autoUpdate: true });
      if (token !== this._bootToken) {
        model.destroy();
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        return;
      }

      model.anchor.set(0.5, 1);
      app.stage.addChild(model);
      this._model = model;

      this._fit();
      this._bindInteraction();
      this._startIdle();
    } catch (error) {
      console.error(
        `[vakao-live2d] 模型加载失败：${error instanceof Error ? error.message : String(error)}。` +
          `请确认 pixi.js / pixi-live2d-display 已安装、Cubism Core 已就位、模型地址可访问。说明见 ${LIVE2D_DOC}。`,
      );
    }
  }

  private _bindInteraction(): void {
    const canvas = this._canvas;
    const model = this._model;
    if (!canvas || !model) return;

    canvas.addEventListener('click', this._onClick);
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });

    if (!this._resizeObserver && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        this._app?.resize();
        this._fit();
      });
      this._resizeObserver.observe(this);
    }
  }

  private _fit(): void {
    const app = this._app;
    const model = this._model;
    if (!app || !model) return;

    const width = app.screen.width;
    const height = app.screen.height;
    if (!width || !height) return;

    // 用未缩放的局部包围盒计算，避免重复 fit 时拿缩放后的宽高互相放大。
    const bounds = model.getLocalBounds();
    const modelWidth = bounds.width || model.width;
    const modelHeight = bounds.height || model.height;
    if (!modelWidth || !modelHeight) return;

    const scale = Math.min(width / modelWidth, height / modelHeight);
    model.scale.set(scale);
    model.x = width / 2;
    model.y = height;
  }

  private _startIdle(): void {
    const model = this._model;
    if (!model) return;

    clearTimeout(this._idleTimer);
    const play = (): void => {
      model.motion(this.idle, undefined, 1).catch(() => {
        // 模型没有对应动作组时忽略，不打扰使用方。
      });
    };
    play();
    this._idleTimer = setTimeout(play, 12000);
  }

  private _onClick = (): void => {
    const model = this._model;
    if (!model) return;

    model.motion(this.motion, undefined, 3).catch(() => {
      // 没有该动作组时保持静态。
    });
  };

  private _onPointerMove = (event: PointerEvent): void => {
    const model = this._model;
    const canvas = this._canvas;
    if (!model || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    model.focus(event.clientX - rect.left, event.clientY - rect.top);
  };

  private _destroyRenderer(): void {
    const canvas = this._canvas;
    if (canvas) {
      canvas.removeEventListener('click', this._onClick);
      window.removeEventListener('pointermove', this._onPointerMove);
    }

    clearTimeout(this._idleTimer);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;

    this._model?.destroy();
    this._model = null;
    this._app?.destroy(true, { children: true, texture: true, baseTexture: true });
    this._app = null;
    this._canvas = null;
  }

  private _destroy(): void {
    this._bootToken += 1;
    this._destroyRenderer();
    if (this.shadowRoot) this.shadowRoot.replaceChildren();
  }
}

/** 幂等注册 <vakao-live2d>。 */
export function defineVakaoLive2D(tagName: string = VAKAO_LIVE2D_TAG): void {
  if (typeof customElements === 'undefined') return;
  if (customElements.get(tagName)) return;

  const ctor =
    tagName === VAKAO_LIVE2D_TAG
      ? VakaoLive2DElement
      : class extends VakaoLive2DElement {};

  customElements.define(tagName, ctor);
}

defineVakaoLive2D();
