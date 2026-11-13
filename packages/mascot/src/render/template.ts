const TEMPLATE_HTML = `
<style>
  :host {
    --vk-mascot-size: 210px;
    --vk-mascot-accent: #46a6c6;
    --vk-mascot-halo: #46a6c6;
    --vk-mascot-ring: rgba(23, 21, 18, 0.26);
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
    --vk-mascot-ring: rgba(242, 239, 231, 0.3);
    --vk-mascot-bubble-bg: #171512;
    --vk-mascot-bubble-fg: #f2efe7;
    --vk-mascot-bubble-border: rgba(242, 239, 231, 0.16);
    --vk-mascot-bubble-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) {
      --vk-mascot-ring: rgba(242, 239, 231, 0.3);
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
  .eye-open, .eye-closed { transition: opacity 70ms linear; }
  .eye-closed { opacity: 0; }

  .halo-stop { stop-color: var(--vk-mascot-halo); }
  .ring { fill: none; stroke: var(--vk-mascot-ring); stroke-width: 1; }
  .comet { fill: none; stroke: var(--vk-mascot-accent); stroke-width: 1.6; stroke-linecap: round; }
  .spark { fill: var(--vk-mascot-accent); }
  .ripple-ring { fill: none; stroke: var(--vk-mascot-accent); stroke-width: 1.4; }
  .aura {
    transform-box: fill-box;
    transform-origin: center;
    transition: opacity 90ms linear, transform 90ms ease;
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
    .bubble, .eye-open, .eye-closed, .aura { transition: none; }
  }
</style>

<div class="stage">
  <div class="bubble" role="status" aria-live="polite"></div>
  <button class="avatar" type="button" aria-label="和 VaKao 星芒打个招呼">
    <svg viewBox="0 0 220 260" role="img" aria-hidden="true" focusable="false"
         data-rig-gaze="3.4 2.8" data-rig-mode="abstract">
      <defs>
        <radialGradient id="vkHalo" cx="0.5" cy="0.5" r="0.5">
          <stop class="halo-stop" offset="0" stop-opacity="0.26"/>
          <stop class="halo-stop" offset="0.46" stop-opacity="0.11"/>
          <stop class="halo-stop" offset="1" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="vkStarClip" clipPathUnits="userSpaceOnUse">
          <use href="#vkStarShape"/>
        </clipPath>
      </defs>

      <g id="rig" data-rig="rig" data-rig-origin="110 124">
        <g class="aura" data-rig="blink">
          <g id="halo" data-rig="halo">
            <ellipse cx="110" cy="124" rx="92" ry="88" fill="url(#vkHalo)"/>
          </g>

          <g id="orbit" data-rig="orbit" data-rig-pivot="110 124">
            <circle class="ring" cx="110" cy="124" r="74"/>
            <path class="comet" d="M 75.3 58.7 A 74 74 0 0 1 149.2 61.2"/>
            <circle class="spark" cx="149.2" cy="61.2" r="2.2" opacity="0.9"/>
            <circle class="spark" cx="29.2" cy="94.6" r="1.5" opacity="0.4"/>
            <circle class="spark" cx="185.9" cy="83.6" r="1.5" opacity="0.32"/>
            <circle class="spark" cx="83.4" cy="205.8" r="1.5" opacity="0.36"/>
          </g>
        </g>

        <g id="head" data-rig="head" data-rig-pivot="110 124">
          <g id="vkStarShape" transform="translate(110 124) scale(0.061035) translate(-1024 -1024)">
            <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                     C 855.936 508.605 957.886 282.875 1024 40.96
                     C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                     C 1329.85 718.15 1024 1024 1024 1024 Z" fill="#f0995f"/>
            <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                     C 855.936 508.605 957.886 282.875 1024 40.96
                     C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                     C 1329.85 718.15 1024 1024 1024 1024 Z" fill="#5fbedc"
                  transform="rotate(90 1024 1024)"/>
            <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                     C 855.936 508.605 957.886 282.875 1024 40.96
                     C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                     C 1329.85 718.15 1024 1024 1024 1024 Z" fill="#a27fc2"
                  transform="rotate(180 1024 1024)"/>
            <path d="M 1024 1024 C 1024 1024 718.15 718.15 718.15 718.15
                     C 855.936 508.605 957.886 282.875 1024 40.96
                     C 1090.114 282.875 1192.064 508.605 1329.85 718.15
                     C 1329.85 718.15 1024 1024 1024 1024 Z" fill="#eddf55"
                  transform="rotate(270 1024 1024)"/>
          </g>

          <g clip-path="url(#vkStarClip)">
            <g id="eyeL" data-rig="eye-left">
              <circle data-rig="iris-left" cx="72" cy="124" r="2.1" fill="#faf9f5" opacity="0.9"/>
            </g>
            <g id="eyeR" data-rig="eye-right">
              <circle data-rig="iris-right" cx="148" cy="124" r="2.1" fill="#faf9f5" opacity="0.9"/>
            </g>
          </g>
        </g>

        <g id="ripple" data-rig="ripple" opacity="0">
          <circle class="ripple-ring" cx="110" cy="124" r="60"/>
          <circle class="ripple-ring" cx="110" cy="124" r="60"/>
        </g>

        <g id="burst" data-rig="burst" opacity="0">
          <circle class="spark" cx="110" cy="62" r="2.1"/>
          <circle class="spark" cx="163.7" cy="93" r="2.1"/>
          <circle class="spark" cx="163.7" cy="155" r="2.1"/>
          <circle class="spark" cx="110" cy="186" r="2.1"/>
          <circle class="spark" cx="56.3" cy="155" r="2.1"/>
          <circle class="spark" cx="56.3" cy="93" r="2.1"/>
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
