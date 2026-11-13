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
    <svg viewBox="0 0 220 260" role="img" aria-hidden="true" focusable="false" data-rig-gaze="3.4 2.8">
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

      <ellipse id="groundShadow" data-rig="shadow" cx="110" cy="249" rx="48" ry="8" fill="#1e2836" opacity="0.16"/>

      <g id="rig" data-rig="rig" data-rig-origin="110 248">
        <g id="hairBack" data-rig="hair-back" data-rig-pivot="110 62">
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

        <g id="body" data-rig="body">
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

        <g id="head" data-rig="head" data-rig-pivot="110 152">
          <path d="M66 122 q-7 1 -6 7 q1 6 8 6 z" fill="#ffe0cc"/>
          <path d="M154 122 q7 1 6 7 q-1 6 -8 6 z" fill="#ffe0cc"/>

          <path d="M110 67 C 141 67 153 90 151 118 C 149 146 134 164 110 164
                   C 86 164 71 146 69 118 C 67 90 79 67 110 67 Z"
                fill="url(#faceGrad)"/>

          <ellipse cx="80" cy="140" rx="8" ry="4.5" fill="#f79c8e" opacity="0.42"/>
          <ellipse cx="140" cy="140" rx="8" ry="4.5" fill="#f79c8e" opacity="0.42"/>

          <g id="eyeL" class="eye" data-rig="eye-left">
            <g class="eye-open" data-rig="eye-open">
              <ellipse cx="91" cy="124" rx="11.5" ry="13.5" fill="#fffdf9"/>
              <g id="irisL" data-rig="iris-left">
                <circle cx="91" cy="124" r="9" fill="url(#irisGrad)"/>
                <circle cx="91" cy="125" r="4.4" fill="#173f3c"/>
                <circle cx="88" cy="120" r="3.1" fill="#ffffff" opacity="0.95"/>
                <circle cx="95" cy="128" r="1.5" fill="#ffffff" opacity="0.75"/>
              </g>
              <path d="M79.5 122.5 A 11.5 13.5 0 0 1 102.5 122.5"
                    fill="none" stroke="#4a3a38" stroke-width="3.4" stroke-linecap="round"/>
            </g>
            <path class="eye-closed" data-rig="eye-closed" d="M80 122 Q91 131 102 122" fill="none"
                  stroke="#4a3a38" stroke-width="3.2" stroke-linecap="round"/>
          </g>

          <g id="eyeR" class="eye" data-rig="eye-right">
            <g class="eye-open" data-rig="eye-open">
              <ellipse cx="129" cy="124" rx="11.5" ry="13.5" fill="#fffdf9"/>
              <g id="irisR" data-rig="iris-right">
                <circle cx="129" cy="124" r="9" fill="url(#irisGrad)"/>
                <circle cx="129" cy="125" r="4.4" fill="#173f3c"/>
                <circle cx="126" cy="120" r="3.1" fill="#ffffff" opacity="0.95"/>
                <circle cx="133" cy="128" r="1.5" fill="#ffffff" opacity="0.75"/>
              </g>
              <path d="M117.5 122.5 A 11.5 13.5 0 0 1 140.5 122.5"
                    fill="none" stroke="#4a3a38" stroke-width="3.4" stroke-linecap="round"/>
            </g>
            <path class="eye-closed" data-rig="eye-closed" d="M118 122 Q129 131 140 122" fill="none"
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

          <g id="lockL" data-rig="lock-left" data-rig-pivot="74 110">
            <path d="M66 94 C 56 118 56 148 61 176 C 68 176 75 172 78 166
                     C 71 144 71 118 76 96 Z" fill="url(#hairGrad)"/>
            <path d="M67 108 C 63 130 63 152 66 170" fill="none" stroke="#c87f53"
                  stroke-width="2" opacity="0.35" stroke-linecap="round"/>
          </g>
          <g id="lockR" data-rig="lock-right" data-rig-pivot="146 110">
            <path d="M154 94 C 164 118 164 148 159 176 C 152 176 145 172 142 166
                     C 149 144 149 118 144 96 Z" fill="url(#hairGrad)"/>
            <path d="M153 108 C 157 130 157 152 154 170" fill="none" stroke="#c87f53"
                  stroke-width="2" opacity="0.35" stroke-linecap="round"/>
          </g>

          <path d="M150 76 Q153 83 160 86 Q153 89 150 96 Q147 89 140 86 Q147 83 150 76 Z"
                fill="#f5c451"/>
          <circle cx="150" cy="86" r="2.4" fill="#fff6da"/>
        </g>

        <g id="armL" data-rig="arm-left" data-rig-pivot="87 172">
          <path d="M84 169 C 74 175 70 190 72 203 C 76 208 84 207 85 201 C 85 190 87 180 91 173 Z"
                fill="url(#hoodieGrad)"/>
          <path d="M84 170 C 75 176 71 190 73 202" fill="none" stroke="#e2d3ba" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M73 199 q6 4 11 1" fill="none" stroke="#e2d3ba" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="78" cy="206" r="6" fill="#ffe0cc"/>
        </g>
        <g id="armR" data-rig="arm-right" data-rig-pivot="133 172">
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

/**
 * 惰性创建模板，避免在模块顶层访问 document。
 * 同一份模板会被所有实例克隆复用。
 */
export function getMascotTemplate(): HTMLTemplateElement {
  if (!template) {
    template = document.createElement('template');
    template.innerHTML = TEMPLATE_HTML;
  }
  return template;
}
