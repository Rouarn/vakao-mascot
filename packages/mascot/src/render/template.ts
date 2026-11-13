const TEMPLATE_HTML = `
<style>
  :host {
    --vk-mascot-size: 210px;
    --vk-mascot-accent: #46a6c6;
    --vk-mascot-offset-x: clamp(12px, 2vw, 20px);
    --vk-mascot-offset-y: clamp(10px, 1.6vw, 16px);
    --vk-mascot-bubble-bg: #faf9f5;
    --vk-mascot-bubble-fg: #171512;
    --vk-mascot-bubble-border: rgba(23, 21, 18, 0.12);
    --vk-mascot-bubble-shadow: 0 6px 18px rgba(23, 21, 18, 0.12);
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
    --vk-mascot-bubble-bg: #171512;
    --vk-mascot-bubble-fg: #f2efe7;
    --vk-mascot-bubble-border: rgba(242, 239, 231, 0.16);
    --vk-mascot-bubble-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) {
      --vk-mascot-bubble-bg: #171512;
      --vk-mascot-bubble-fg: #f2efe7;
      --vk-mascot-bubble-border: rgba(242, 239, 231, 0.16);
      --vk-mascot-bubble-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
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
  }
  .avatar:focus-visible {
    outline: 2px solid var(--vk-mascot-accent);
    outline-offset: 6px;
    border-radius: 24px;
  }
  .avatar svg { display: block; width: 100%; height: 100%; overflow: visible; }
  .eye-open { transition: opacity 70ms linear; }
  .eye-closed { opacity: 0; transition: opacity 70ms linear; }
  .hair-edge { stroke: transparent; }
  :host([theme="dark"]) .hair-edge { stroke: #8c877d; stroke-opacity: 0.5; }
  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) .hair-edge { stroke: #8c877d; stroke-opacity: 0.5; }
  }

  .bubble {
    position: absolute;
    right: 4px;
    bottom: 88%;
    max-width: 210px;
    padding: 9px 13px;
    border-radius: 16px 16px 4px 16px;
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
    .bubble, .eye-open, .eye-closed { transition: none; }
  }
</style>

<div class="stage">
  <div class="bubble" role="status" aria-live="polite"></div>
  <button class="avatar" type="button" aria-label="和星芒少女打个招呼">
    <svg viewBox="0 0 220 260" role="img" aria-hidden="true" focusable="false" data-rig-gaze="3.4 2.8">
      <defs>
        <g id="vkStar4" fill="currentColor">
          <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                   C 855.936 508.605 957.886 282.875 1024 40.96
                   C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                   C 1329.85 718.15 1024 1024 1024 1024 Z"/>
          <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                   C 855.936 508.605 957.886 282.875 1024 40.96
                   C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                   C 1329.85 718.15 1024 1024 1024 1024 Z" transform="rotate(90 1024 1024)"/>
          <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                   C 855.936 508.605 957.886 282.875 1024 40.96
                   C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                   C 1329.85 718.15 1024 1024 1024 1024 Z" transform="rotate(180 1024 1024)"/>
          <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                   C 855.936 508.605 957.886 282.875 1024 40.96
                   C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                   C 1329.85 718.15 1024 1024 1024 1024 Z" transform="rotate(270 1024 1024)"/>
        </g>
        <clipPath id="vkEyeClipL"><circle cx="95" cy="110" r="5.8"/></clipPath>
        <clipPath id="vkEyeClipR"><circle cx="125" cy="110" r="5.8"/></clipPath>
      </defs>

      <g id="rig" data-rig="rig" data-rig-origin="110 240">
        <ellipse id="shadow" data-rig="shadow" cx="110" cy="247" rx="44" ry="5.5" fill="#171512" opacity="0.16"/>

        <g id="hairBack" data-rig="hair-back" data-rig-pivot="110 138">
          <path d="M 110 50 C 141 50 161 71 161 104 C 161 124 156 141 150 156
                   C 145 150 141 144 138 138 C 135 147 131 155 127 162
                   C 123 152 119 143 116 136 C 112 145 108 154 104 162
                   C 100 152 96 143 92 136 C 88 144 84 150 79 156
                   C 72 140 59 123 59 104 C 59 71 79 50 110 50 Z"
                fill="#171512"/>
          <path d="M 110 50 C 141 50 161 71 161 104 C 161 124 156 141 150 156
                   C 145 150 141 144 138 138 C 135 147 131 155 127 162
                   C 123 152 119 143 116 136 C 112 145 108 154 104 162
                   C 100 152 96 143 92 136 C 88 144 84 150 79 156
                   C 72 140 59 123 59 104 C 59 71 79 50 110 50 Z"
                class="hair-edge" fill="none" stroke-width="1.4"/>
        </g>

        <g id="body" data-rig="body">
          <rect x="102" y="126" width="16" height="22" rx="8" fill="#faf9f5" stroke="#8c877d" stroke-opacity="0.3"/>
          <path d="M 86 146 L 134 146 L 151 214 Q 110 227 69 214 Z" fill="#46a6c6"/>
          <circle cx="86" cy="153" r="13.5" fill="#46a6c6"/>
          <circle cx="134" cy="153" r="13.5" fill="#46a6c6"/>
          <path d="M 96 146 L 110 161 L 124 146 Z" fill="#faf9f5"/>
          <path d="M 76 186 Q 110 195 144 186 L 144 193 Q 110 202 76 193 Z" fill="#a27fc2"/>
          <path d="M 70 208 Q 110 220 150 208 L 151 214 Q 110 227 69 214 Z" fill="#faf9f5" opacity="0.92"/>
          <use href="#vkStar4" transform="translate(91 216) scale(0.0043) translate(-1024 -1024)" style="color:#a27fc2"/>
          <use href="#vkStar4" transform="translate(129 216) scale(0.0043) translate(-1024 -1024)" style="color:#eddf55"/>
          <use href="#vkStar4" transform="translate(110 171) scale(0.0062) translate(-1024 -1024)" style="color:#eddf55"/>
          <path d="M 100 220 L 100 234" stroke="#faf9f5" stroke-width="9" stroke-linecap="round"/>
          <path d="M 120 220 L 120 234" stroke="#faf9f5" stroke-width="9" stroke-linecap="round"/>
          <ellipse cx="100" cy="238" rx="9" ry="5" fill="#171512"/>
          <ellipse cx="120" cy="238" rx="9" ry="5" fill="#171512"/>
        </g>

        <g id="armL" data-rig="arm-left" data-rig-pivot="86 154">
          <path d="M 86 154 L 77 192" stroke="#8c877d" stroke-opacity="0.28" stroke-width="11.6" stroke-linecap="round"/>
          <path d="M 86 154 L 77 192" stroke="#faf9f5" stroke-width="9.5" stroke-linecap="round"/>
          <circle cx="77" cy="196" r="6.4" fill="#8c877d" fill-opacity="0.28"/>
          <circle cx="77" cy="196" r="5.4" fill="#faf9f5"/>
        </g>
        <g id="armR" data-rig="arm-right" data-rig-pivot="134 154">
          <path d="M 134 154 L 143 192" stroke="#8c877d" stroke-opacity="0.28" stroke-width="11.6" stroke-linecap="round"/>
          <path d="M 134 154 L 143 192" stroke="#faf9f5" stroke-width="9.5" stroke-linecap="round"/>
          <circle cx="143" cy="196" r="6.4" fill="#8c877d" fill-opacity="0.28"/>
          <circle cx="143" cy="196" r="5.4" fill="#faf9f5"/>
        </g>

        <g id="head" data-rig="head" data-rig-pivot="110 138">
          <ellipse cx="110" cy="104" rx="33" ry="32" fill="#faf9f5" stroke="#8c877d" stroke-opacity="0.32"/>
          <ellipse cx="86" cy="120" rx="5.5" ry="2.8" fill="#f0995f" opacity="0.32"/>
          <ellipse cx="134" cy="120" rx="5.5" ry="2.8" fill="#f0995f" opacity="0.32"/>
          <path d="M 105 123 Q 110 127.5 115 123" stroke="#171512" stroke-width="1.7" fill="none" stroke-linecap="round"/>

          <path d="M 110 58 C 133 58 149 73 150 97
                   C 144 90 139 86 134 84 C 131 91 126 93 122 89
                   C 118 95 112 96 107 91 C 103 96 96 95 92 88
                   C 87 93 79 93 74 98 C 75 73 89 58 110 58 Z"
                fill="#171512"/>

          <g class="eye-open" data-rig="eye-left">
            <circle cx="95" cy="110" r="5.8" fill="#46a6c6"/>
            <g data-rig="iris-left" clip-path="url(#vkEyeClipL)">
              <circle cx="95.4" cy="111.2" r="2.7" fill="#171512"/>
              <circle cx="93.9" cy="109.4" r="1.25" fill="#faf9f5"/>
              <use href="#vkStar4" transform="translate(97.8 108.4) scale(0.0019) translate(-1024 -1024)" style="color:#faf9f5"/>
            </g>
            <path d="M 88.6 106.2 Q 95 102 101.4 106.2" stroke="#171512" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </g>
          <g class="eye-open" data-rig="eye-right">
            <circle cx="125" cy="110" r="5.8" fill="#46a6c6"/>
            <g data-rig="iris-right" clip-path="url(#vkEyeClipR)">
              <circle cx="125.4" cy="111.2" r="2.7" fill="#171512"/>
              <circle cx="123.9" cy="109.4" r="1.25" fill="#faf9f5"/>
              <use href="#vkStar4" transform="translate(127.8 108.4) scale(0.0019) translate(-1024 -1024)" style="color:#faf9f5"/>
            </g>
            <path d="M 118.6 106.2 Q 125 102 131.4 106.2" stroke="#171512" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </g>
          <g class="eye-closed" data-rig="eye-closed">
            <path d="M 88.8 110.5 Q 95 115.2 101.2 110.5" stroke="#171512" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <path d="M 118.8 110.5 Q 125 115.2 131.2 110.5" stroke="#171512" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          </g>

          <g id="hairPin">
            <use href="#vkStar4" transform="translate(151 74) scale(0.0153) translate(-1024 -1024)" style="color:#f0995f"/>
          </g>
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
