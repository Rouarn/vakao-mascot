export const VAKAO_MASCOT_TAG = 'vakao-mascot';

export const MASCOT_EVENTS = {
  ready: 'vakao-mascot:ready',
  greet: 'vakao-mascot:greet',
} as const;

export const DEFAULT_GREETING = '嗨～ 今天也要开心哦！';
export const DEFAULT_LABEL = '和看板娘打个招呼';
export const DEFAULT_SIZE = 210;

export type MascotTheme = 'auto' | 'light' | 'dark';

export interface MascotGreetDetail {
  greeting: string;
}

export interface MascotReadyDetail {
  element: VakaoMascotElement;
}

export interface MascotDebugState {
  gaze: { x: number; y: number };
  irisTransform: string;
  blinkCount: number;
  waving: boolean;
  bubbleVisible: boolean;
  rect: { x: number; y: number; width: number; height: number };
  zIndex: string;
  pointerEvents: string;
}

export interface VakaoMascotEventMap {
  [MASCOT_EVENTS.greet]: CustomEvent<MascotGreetDetail>;
  [MASCOT_EVENTS.ready]: CustomEvent<MascotReadyDetail>;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const toSize = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SIZE;
};

/*
 * SSR 安全：模块顶层不能直接 class X extends HTMLElement。
 * 在 Node 环境用空基类占位，只有在浏览器里 define 后才会真正实例化。
 */
const HTMLElementBase = (
  typeof HTMLElement === 'undefined' ? class {} : HTMLElement
) as unknown as typeof HTMLElement;

const TEMPLATE_HTML = `
<style>
  :host {
    --vk-mascot-size: 210px;
    --vk-mascot-accent: #2f9e8c;
    --vk-mascot-offset-x: clamp(12px, 2vw, 20px);
    --vk-mascot-offset-y: clamp(10px, 1.6vw, 16px);
    --vk-mascot-bubble-bg: #fffdf8;
    --vk-mascot-bubble-fg: #4a3f36;
    --vk-mascot-bubble-border: rgba(74, 63, 54, 0.08);
    --vk-mascot-bubble-shadow: 0 6px 18px rgba(30, 40, 60, 0.16);
    position: fixed;
    right: calc(var(--vk-mascot-offset-x) + env(safe-area-inset-right, 0px));
    bottom: calc(var(--vk-mascot-offset-y) + env(safe-area-inset-bottom, 0px));
    width: min(var(--vk-mascot-size), 30vw);
    aspect-ratio: 220 / 260;
    z-index: 9999;
    display: block;
    pointer-events: none;
    contain: layout style;
  }
  :host([theme="dark"]) {
    --vk-mascot-bubble-bg: #232a33;
    --vk-mascot-bubble-fg: #f4eee4;
    --vk-mascot-bubble-border: rgba(255, 255, 255, 0.12);
    --vk-mascot-bubble-shadow: 0 8px 24px rgba(0, 0, 0, 0.42);
  }
  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) {
      --vk-mascot-bubble-bg: #232a33;
      --vk-mascot-bubble-fg: #f4eee4;
      --vk-mascot-bubble-border: rgba(255, 255, 255, 0.12);
      --vk-mascot-bubble-shadow: 0 8px 24px rgba(0, 0, 0, 0.42);
    }
  }
  .stage { position: relative; width: 100%; height: 100%; }
  .avatar {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    pointer-events: auto;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    filter: drop-shadow(0 10px 16px rgba(24, 32, 48, 0.18));
    transition: filter 0.2s ease;
  }
  .avatar:hover { filter: drop-shadow(0 12px 20px rgba(24, 32, 48, 0.24)); }
  .avatar:focus-visible {
    outline: 2px solid var(--vk-mascot-accent);
    outline-offset: 6px;
    border-radius: 18px;
  }
  .avatar svg { display: block; width: 100%; height: 100%; overflow: visible; }
  .eye-open, .eye-closed { transition: opacity 70ms linear; }
  .eye-closed { opacity: 0; }

  .bubble {
    position: absolute;
    right: 4px;
    bottom: 92%;
    max-width: 210px;
    padding: 9px 13px;
    border-radius: 14px 14px 4px 14px;
    background: var(--vk-mascot-bubble-bg);
    color: var(--vk-mascot-bubble-fg);
    border: 1px solid var(--vk-mascot-bubble-border);
    box-shadow: var(--vk-mascot-bubble-shadow);
    font: 500 13px/1.45 -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    opacity: 0;
    transform: translateY(6px) scale(0.92);
    transform-origin: 100% 100%;
    transition: opacity 0.18s ease, transform 0.18s ease;
    pointer-events: none;
    white-space: normal;
    width: max-content;
  }
  .bubble.show { opacity: 1; transform: translateY(0) scale(1); }

  @media (max-width: 640px) {
    .bubble { max-width: 160px; font-size: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .avatar, .bubble, .eye-open, .eye-closed { transition: none; }
  }
</style>

<div class="stage">
  <div class="bubble" role="status" aria-live="polite"></div>
  <button class="avatar" type="button" aria-label="和看板娘打个招呼">
    <svg viewBox="0 0 220 260" role="img" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stop-color="#ffd3ae"/>
          <stop offset="0.55" stop-color="#f3b184"/>
          <stop offset="1" stop-color="#dc9364"/>
        </linearGradient>
        <linearGradient id="faceGrad" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0" stop-color="#fff0e4"/>
          <stop offset="1" stop-color="#ffdcc8"/>
        </linearGradient>
        <radialGradient id="irisGrad" cx="0.4" cy="0.32" r="0.75">
          <stop offset="0" stop-color="#7fe0cd"/>
          <stop offset="0.55" stop-color="#34ab98"/>
          <stop offset="1" stop-color="#166e66"/>
        </radialGradient>
        <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0" stop-color="#fffaf0"/>
          <stop offset="1" stop-color="#efe3cd"/>
        </linearGradient>
        <linearGradient id="skirtGrad" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stop-color="#5b7183"/>
          <stop offset="1" stop-color="#3f4f5e"/>
        </linearGradient>
      </defs>

      <ellipse id="groundShadow" cx="110" cy="249" rx="48" ry="8" fill="#1e2836" opacity="0.16"/>

      <g id="rig">
        <g id="hairBack">
          <path d="M110 36 C 73 36 55 66 58 108 C 60 142 64 166 70 181 C 78 185 88 181 92 174
                   C 84 156 80 132 82 108 C 84 82 94 66 110 66 C 126 66 136 82 138 108
                   C 140 132 136 156 128 174 C 132 181 142 185 150 181 C 156 166 160 142 162 108
                   C 165 66 147 36 110 36 Z"
                fill="url(#hairGrad)"/>
          <path d="M74 150 C 78 164 84 174 90 179 C 86 181 80 182 74 180 C 70 172 68 160 68 148 Z"
                fill="#c87f53" opacity="0.45"/>
          <path d="M146 150 C 142 164 136 174 130 179 C 134 181 140 182 146 180 C 150 172 152 160 152 148 Z"
                fill="#c87f53" opacity="0.45"/>
        </g>

        <g id="body">
          <g id="legs">
            <rect x="93" y="212" width="13" height="28" rx="6.5" fill="#ffe0cc"/>
            <rect x="114" y="212" width="13" height="28" rx="6.5" fill="#ffe0cc"/>
            <rect x="93" y="226" width="13" height="10" rx="4" fill="#fffdf7"/>
            <rect x="114" y="226" width="13" height="10" rx="4" fill="#fffdf7"/>
            <path d="M91 239 q0 -5 6 -5 h11 q5 0 5 6 v3 q0 3 -3 3 h-16 q-3 0 -3 -3 z" fill="#8b5a46"/>
            <path d="M114 239 q0 -5 6 -5 h11 q5 0 5 6 v3 q0 3 -3 3 h-16 q-3 0 -3 -3 z" fill="#8b5a46"/>
            <path d="M91 244 h22 v2.5 q0 1.5 -2 1.5 h-18 q-2 0 -2 -1.5 z" fill="#6d4434"/>
            <path d="M114 244 h22 v2.5 q0 1.5 -2 1.5 h-18 q-2 0 -2 -1.5 z" fill="#6d4434"/>
          </g>

          <path d="M82 198 L138 198 L149 224 Q110 231 71 224 Z" fill="url(#skirtGrad)"/>
          <path d="M92 200 L84 226" stroke="#33414e" stroke-width="1.4" opacity="0.55"/>
          <path d="M110 200 L110 229" stroke="#33414e" stroke-width="1.4" opacity="0.55"/>
          <path d="M128 200 L136 226" stroke="#33414e" stroke-width="1.4" opacity="0.55"/>
          <path d="M71 224 Q110 231 149 224" fill="none" stroke="#2f3c48" stroke-width="1.2" opacity="0.4"/>

          <path d="M84 168 C 90 158 130 158 136 168 C 126 175 94 175 84 168 Z" fill="#eee2cc"/>
          <path d="M84 167 C 92 161 128 161 136 167 C 142 175 144 190 143 202
                   C 128 208 92 208 77 202 C 76 190 78 175 84 167 Z"
                fill="url(#hoodieGrad)"/>
          <path d="M84 167 C 92 161 128 161 136 167 L134 173 C 124 168 96 168 86 173 Z"
                fill="#ffffff" opacity="0.6"/>
          <path d="M78 202 C 92 208 128 208 142 202 L141 206 C 127 212 93 212 79 206 Z"
                fill="#e6d8c0"/>
          <path d="M93 187 Q110 193 127 187 L125 199 Q110 204 95 199 Z" fill="#efe1ca" opacity="0.9"/>
          <path d="M101 170 L99 184" stroke="#8fcbbd" stroke-width="2" stroke-linecap="round"/>
          <path d="M119 170 L121 184" stroke="#8fcbbd" stroke-width="2" stroke-linecap="round"/>
          <circle cx="99" cy="185.5" r="1.8" fill="#5fae9c"/>
          <circle cx="121" cy="185.5" r="1.8" fill="#5fae9c"/>
          <path d="M126 176 Q129 177 130 180 Q129 183 126 184 Q123 183 122 180 Q123 177 126 176 Z"
                fill="#f5c451"/>

          <path d="M93 163 Q110 171 127 163 Q131 168 128 172 Q110 181 92 172 Q89 168 93 163 Z"
                fill="#ee8e70"/>
          <path d="M104 174 Q110 179 116 174" fill="none" stroke="#d97658" stroke-width="1.4" stroke-linecap="round"/>
        </g>

        <g id="head">
          <path d="M66 122 q-7 1 -6 7 q1 6 8 6 z" fill="#ffe0cc"/>
          <path d="M154 122 q7 1 6 7 q-1 6 -8 6 z" fill="#ffe0cc"/>

          <path d="M110 67 C 141 67 153 90 151 118 C 149 146 134 164 110 164
                   C 86 164 71 146 69 118 C 67 90 79 67 110 67 Z"
                fill="url(#faceGrad)"/>

          <ellipse cx="80" cy="140" rx="8" ry="4.5" fill="#f79c8e" opacity="0.42"/>
          <ellipse cx="140" cy="140" rx="8" ry="4.5" fill="#f79c8e" opacity="0.42"/>

          <g id="eyeL" class="eye">
            <g class="eye-open">
              <ellipse cx="91" cy="124" rx="11.5" ry="13.5" fill="#fffdf9"/>
              <g id="irisL">
                <circle cx="91" cy="124" r="9" fill="url(#irisGrad)"/>
                <circle cx="91" cy="125" r="4.4" fill="#173f3c"/>
                <circle cx="88" cy="120" r="3.1" fill="#ffffff" opacity="0.95"/>
                <circle cx="95" cy="128" r="1.5" fill="#ffffff" opacity="0.75"/>
              </g>
              <path d="M79.5 122.5 A 11.5 13.5 0 0 1 102.5 122.5"
                    fill="none" stroke="#4a3a38" stroke-width="3.4" stroke-linecap="round"/>
            </g>
            <path class="eye-closed" d="M80 122 Q91 131 102 122" fill="none"
                  stroke="#4a3a38" stroke-width="3.2" stroke-linecap="round"/>
          </g>

          <g id="eyeR" class="eye">
            <g class="eye-open">
              <ellipse cx="129" cy="124" rx="11.5" ry="13.5" fill="#fffdf9"/>
              <g id="irisR">
                <circle cx="129" cy="124" r="9" fill="url(#irisGrad)"/>
                <circle cx="129" cy="125" r="4.4" fill="#173f3c"/>
                <circle cx="126" cy="120" r="3.1" fill="#ffffff" opacity="0.95"/>
                <circle cx="133" cy="128" r="1.5" fill="#ffffff" opacity="0.75"/>
              </g>
              <path d="M117.5 122.5 A 11.5 13.5 0 0 1 140.5 122.5"
                    fill="none" stroke="#4a3a38" stroke-width="3.4" stroke-linecap="round"/>
            </g>
            <path class="eye-closed" d="M118 122 Q129 131 140 122" fill="none"
                  stroke="#4a3a38" stroke-width="3.2" stroke-linecap="round"/>
          </g>

          <path d="M109 137 q2 1.4 4 0" fill="none" stroke="#d99a88" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M104 147 Q110 153 116 147" fill="none" stroke="#b4675b" stroke-width="2.2" stroke-linecap="round"/>

          <path d="M60 114 C 56 74 82 45 110 45 C 142 45 164 72 160 114
                   C 152 104 148 92 146 82 C 138 98 120 106 106 100
                   C 100 108 88 110 78 104 C 74 110 68 112 60 114 Z"
                fill="url(#hairGrad)"/>
          <path d="M84 62 C 96 49 124 47 138 59" fill="none" stroke="#ffe0c4"
                stroke-width="3.4" stroke-linecap="round" opacity="0.45"/>

          <g id="lockL">
            <path d="M66 94 C 56 118 56 148 61 176 C 68 176 75 172 78 166
                     C 71 144 71 118 76 96 Z" fill="url(#hairGrad)"/>
            <path d="M67 108 C 63 130 63 152 66 170" fill="none" stroke="#c87f53"
                  stroke-width="2" opacity="0.35" stroke-linecap="round"/>
          </g>
          <g id="lockR">
            <path d="M154 94 C 164 118 164 148 159 176 C 152 176 145 172 142 166
                     C 149 144 149 118 144 96 Z" fill="url(#hairGrad)"/>
            <path d="M153 108 C 157 130 157 152 154 170" fill="none" stroke="#c87f53"
                  stroke-width="2" opacity="0.35" stroke-linecap="round"/>
          </g>

          <path d="M150 76 Q153 83 160 86 Q153 89 150 96 Q147 89 140 86 Q147 83 150 76 Z"
                fill="#f5c451"/>
          <circle cx="150" cy="86" r="2.4" fill="#fff6da"/>
        </g>

        <g id="armL">
          <path d="M84 169 C 74 175 70 190 72 203 C 76 208 84 207 85 201 C 85 190 87 180 91 173 Z"
                fill="url(#hoodieGrad)"/>
          <path d="M84 170 C 75 176 71 190 73 202" fill="none" stroke="#e2d3ba" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M73 199 q6 4 11 1" fill="none" stroke="#e2d3ba" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="78" cy="206" r="6" fill="#ffe0cc"/>
        </g>
        <g id="armR">
          <path d="M136 169 C 146 175 150 190 148 203 C 144 208 136 207 135 201 C 135 190 133 180 129 173 Z"
                fill="url(#hoodieGrad)"/>
          <path d="M136 170 C 145 176 149 190 147 202" fill="none" stroke="#e2d3ba" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M147 199 q-6 4 -11 1" fill="none" stroke="#e2d3ba" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="142" cy="206" r="6" fill="#ffe0cc"/>
        </g>
      </g>
    </svg>
  </button>
</div>`;

let template: HTMLTemplateElement | null = null;

function getTemplate(): HTMLTemplateElement {
  if (!template) {
    template = document.createElement('template');
    template.innerHTML = TEMPLATE_HTML;
  }
  return template;
}

export class VakaoMascotElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ['size', 'greeting', 'theme', 'accent', 'label'];
  }

  private _avatar!: HTMLButtonElement;
  private _bubble!: HTMLDivElement;
  private _rig!: SVGGElement;
  private _head!: SVGGElement;
  private _hairBack!: SVGGElement;
  private _eyeOpen!: NodeListOf<SVGGElement>;
  private _eyeClosed!: NodeListOf<SVGPathElement>;
  private _irisL!: SVGGElement;
  private _irisR!: SVGGElement;
  private _armL!: SVGGElement;
  private _armR!: SVGGElement;
  private _groundShadow!: SVGEllipseElement;
  private _lockL!: SVGGElement;
  private _lockR!: SVGGElement;

  private _running = false;
  private _raf = 0;
  private _readyRaf = 0;
  private _bubbleTimer: ReturnType<typeof setTimeout> | undefined;
  private _reduced = false;
  private _transformsCleared = false;
  private _motionQuery: MediaQueryList | null = null;
  private _gaze = { tx: 0, ty: 0, x: 0, y: 0 };
  private _blink = { next: 0, start: 0, count: 0, double: false };
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
    if (!this._bubble) return;

    const greeting = this.greeting;
    this._waveUntil = performance.now() + 1700;
    this._bubble.textContent = greeting;
    this._bubble.classList.add('show');
    clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => {
      this._bubble.classList.remove('show');
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
    const rect = this._avatar?.getBoundingClientRect();
    return {
      gaze: { x: Number(this._gaze.x.toFixed(3)), y: Number(this._gaze.y.toFixed(3)) },
      irisTransform: this._irisL?.getAttribute('transform') || '',
      blinkCount: this._blink.count,
      waving: performance.now() < this._waveUntil,
      bubbleVisible: Boolean(this._bubble?.classList.contains('show')),
      rect: rect
        ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        : { x: 0, y: 0, width: 0, height: 0 },
      zIndex: getComputedStyle(this).zIndex,
      pointerEvents: getComputedStyle(this).pointerEvents,
    };
  }

  private _render(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(getTemplate().content.cloneNode(true));

    this._avatar = root.querySelector('.avatar') as HTMLButtonElement;
    this._bubble = root.querySelector('.bubble') as HTMLDivElement;
    this._rig = root.querySelector('#rig') as SVGGElement;
    this._head = root.querySelector('#head') as SVGGElement;
    this._hairBack = root.querySelector('#hairBack') as SVGGElement;
    this._eyeOpen = root.querySelectorAll<SVGGElement>('.eye-open');
    this._eyeClosed = root.querySelectorAll<SVGPathElement>('.eye-closed');
    this._irisL = root.querySelector('#irisL') as SVGGElement;
    this._irisR = root.querySelector('#irisR') as SVGGElement;
    this._armL = root.querySelector('#armL') as SVGGElement;
    this._armR = root.querySelector('#armR') as SVGGElement;
    this._groundShadow = root.querySelector('#groundShadow') as SVGEllipseElement;
    this._lockL = root.querySelector('#lockL') as SVGGElement;
    this._lockR = root.querySelector('#lockR') as SVGGElement;
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

    this._avatar?.setAttribute('aria-label', this.label);
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
    this._avatar.addEventListener('click', this._onClick);

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
    this._avatar?.removeEventListener('click', this._onClick);
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
    const source = event as PointerEvent & { touches?: TouchList };
    const touch = source.touches && source.touches[0] ? source.touches[0] : null;
    const clientX = touch ? touch.clientX : source.clientX;
    const clientY = touch ? touch.clientY : source.clientY;
    const rect = this._avatar.getBoundingClientRect();
    if (!rect.width) return;

    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.42;
    this._gaze.tx = clamp((clientX - cx) / 320, -1, 1);
    this._gaze.ty = clamp((clientY - cy) / 320, -1, 1);
  };

  private _blinkUpdate(now: number): boolean {
    const blink = this._blink;
    if (!blink.start && now >= blink.next) {
      blink.start = now;
      blink.count += 1;
      blink.double = Math.random() < 0.25;
    }
    if (!blink.start) return false;

    const elapsed = now - blink.start;
    let closed = elapsed < 110 || (blink.double && elapsed >= 200 && elapsed < 310);
    const end = blink.double ? 340 : 150;
    if (elapsed >= end) {
      blink.start = 0;
      blink.next = now + 2200 + Math.random() * 3400;
      closed = false;
    }
    return closed;
  }

  private _clearTransforms(): void {
    if (this._transformsCleared) return;
    this._transformsCleared = true;
    [this._rig, this._head, this._hairBack, this._lockL, this._lockR, this._armL, this._armR].forEach(
      (node) => node.removeAttribute('transform'),
    );
    this._groundShadow.setAttribute('rx', '48');
    this._groundShadow.setAttribute('opacity', '0.16');
  }

  private _tick = (now: number): void => {
    if (!this._running) return;

    const gaze = this._gaze;
    gaze.x += (gaze.tx - gaze.x) * 0.085;
    gaze.y += (gaze.ty - gaze.y) * 0.085;

    if (this._reduced) {
      this._clearTransforms();
    } else {
      this._transformsCleared = false;

      const t = now / 1000;
      const breath = Math.sin(t * 1.5);
      const sway = Math.sin(t * 0.72);
      const wave = now < this._waveUntil;
      const wavePhase = wave ? Math.sin((this._waveUntil - now) / 52) : 0;
      const scaleY = 1 + breath * 0.012;

      this._rig.setAttribute(
        'transform',
        `translate(0 ${(-Math.abs(breath) * 1.1).toFixed(2)}) ` +
          `translate(110 248) scale(1 ${scaleY.toFixed(4)}) translate(-110 -248)`,
      );

      const headTilt = gaze.x * 6 + sway * 0.9 + (wave ? -2 : 0);
      this._head.setAttribute('transform', `rotate(${headTilt.toFixed(2)} 110 152)`);
      this._hairBack.setAttribute(
        'transform',
        `rotate(${(sway * 0.7 - gaze.x * 0.8).toFixed(2)} 110 62)`,
      );
      this._lockL.setAttribute('transform', `rotate(${(sway * 1.1).toFixed(2)} 74 110)`);
      this._lockR.setAttribute('transform', `rotate(${(sway * 1.1).toFixed(2)} 146 110)`);
      this._groundShadow.setAttribute('rx', (48 + breath * 1.6).toFixed(2));
      this._groundShadow.setAttribute('opacity', (0.16 - breath * 0.015).toFixed(3));

      this._armL.setAttribute(
        'transform',
        `rotate(${(Math.sin(t * 1.1) * 1.6 + sway * 0.8).toFixed(2)} 87 172)`,
      );
      this._armR.setAttribute(
        'transform',
        wave
          ? `rotate(${(-105 + wavePhase * 11).toFixed(2)} 133 172)`
          : `rotate(${(Math.sin(t * 1.1) * 1.6 - sway * 0.8).toFixed(2)} 133 172)`,
      );
    }

    const dx = (gaze.x * 3.4).toFixed(2);
    const dy = (gaze.y * 2.8).toFixed(2);
    this._irisL.setAttribute('transform', `translate(${dx} ${dy})`);
    this._irisR.setAttribute('transform', `translate(${dx} ${dy})`);

    const closed = this._blinkUpdate(now);
    this._eyeOpen.forEach((node) => {
      node.style.opacity = closed ? '0' : '1';
    });
    this._eyeClosed.forEach((node) => {
      node.style.opacity = closed ? '1' : '0';
    });

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
