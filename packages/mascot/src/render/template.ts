const TEMPLATE_HTML = `
<style>
  :host {
    --vk-mascot-size: 210px;
    --vk-mascot-accent: #f0995f;
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
  /* 墨色块面在深色背景上补一圈淡灰轮廓，避免糊进背景。 */
  .ink-edge { stroke: transparent; stroke-linejoin: round; }
  :host([theme="dark"]) .ink-edge { stroke: #8c877d; stroke-opacity: 0.5; }
  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) .ink-edge { stroke: #8c877d; stroke-opacity: 0.5; }
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
    <svg viewBox="0 0 220 260" role="img" aria-hidden="true" focusable="false" data-rig-gaze="1.6 1.4">
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
        <clipPath id="vkFaceClip">
          <path d="M 110 40
                   C 100.6 40 94.2 46.4 93.4 55.4
                   C 92.8 62.4 94.4 69.4 97.8 73.6
                   C 101.2 76.8 118.8 76.8 122.2 73.6
                   C 125.6 69.4 127.2 62.4 126.6 55.4
                   C 125.8 46.4 119.4 40 110 40 Z"/>
        </clipPath>
      </defs>

      <g id="rig" data-rig="rig" data-rig-origin="110 242">
        <ellipse id="shadow" data-rig="shadow" cx="110" cy="242" rx="29" ry="3.8" fill="#171512" opacity="0.16"/>

        <g id="legs">
          <path d="M 103.2 168 L 103.2 228" stroke="#171512" stroke-opacity="0.26" stroke-width="12.2" stroke-linecap="round"/>
          <path d="M 116.8 168 L 116.8 228" stroke="#171512" stroke-opacity="0.26" stroke-width="12.2" stroke-linecap="round"/>
          <path d="M 103.2 168 L 103.2 228" stroke="#faf9f5" stroke-width="10.4" stroke-linecap="round"/>
          <path d="M 116.8 168 L 116.8 228" stroke="#faf9f5" stroke-width="10.4" stroke-linecap="round"/>
          <rect x="95.9" y="226" width="14" height="10.5" rx="5.2" fill="#171512" class="ink-edge"/>
          <rect x="110.3" y="226" width="14" height="10.5" rx="5.2" fill="#171512" class="ink-edge"/>
        </g>

        <g id="body" data-rig="body">
          <path d="M 110 88
                   C 102.4 88 96.4 90.6 94.2 94.4
                   C 93.2 101 94 108.8 96 114.2
                   C 94.2 121 90.6 130 87.6 140
                   C 85 150 83.2 158 82.2 164.8
                   C 90.2 168.8 99.6 170.8 110 170.8
                   C 120.4 170.8 129.8 168.8 137.8 164.8
                   C 136.8 158 135 150 132.4 140
                   C 129.4 130 125.8 121 124 114.2
                   C 126 108.8 126.8 101 125.8 94.4
                   C 123.6 90.6 117.6 88 110 88 Z"
                fill="#efe7d9" stroke="#171512" stroke-opacity="0.5" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M 110 88
                   C 102.4 88 96.4 90.6 94.2 94.4
                   C 93.2 101 94 108.8 96 114.2
                   C 94.2 121 90.6 130 87.6 140
                   C 85 150 83.2 158 82.2 164.8
                   C 90.2 168.8 99.6 170.8 110 170.8
                   C 120.4 170.8 129.8 168.8 137.8 164.8
                   C 136.8 158 135 150 132.4 140
                   C 129.4 130 125.8 121 124 114.2
                   C 126 108.8 126.8 101 125.8 94.4
                   C 123.6 90.6 117.6 88 110 88 Z"
                fill="#8c877d" opacity="0.07"/>
          <path d="M 118.6 90
                   C 122.6 100 123.4 108.6 123.6 114.5
                   C 126 121 129.6 130 132.4 140
                   C 134.8 150 136.4 158 137 162.5
                   C 133 165.4 127.8 167.4 122.4 168.4
                   C 124.4 150 119.6 132 114 119.6
                   C 117 110 116.4 99.6 114.4 91.6 Z"
                fill="#171512" opacity="0.09"/>
          <path d="M 83.4 164.6
                   C 93.4 168.2 126.6 168.2 136.6 164.6
                   C 134.8 167 132.2 168.6 129 169.4
                   C 117 171.8 103 171.8 91 169.4
                   C 87.8 168.6 85.2 167 83.4 164.6 Z"
                fill="#171512" opacity="0.07"/>
          <path d="M 96.4 112.6
                   C 105 116.4 115 116.4 123.6 112.6
                   L 124.2 118.4
                   C 115 122.2 105 122.2 95.8 118.4 Z"
                fill="#a27fc2" opacity="0.88"/>
          <path d="M 102 90 C 105 93 115 93 118 90"
                stroke="#171512" stroke-opacity="0.3" stroke-width="1.2"
                fill="none" stroke-linecap="round"/>
          <path d="M 105 134 C 103.4 145 102.2 155 101.4 162" stroke="#171512" stroke-opacity="0.05"
                stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 115 133 C 116.4 144 117.4 155 117.8 162" stroke="#171512" stroke-opacity="0.05"
                stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>

        <g id="armL" data-rig="arm-left" data-rig-pivot="93 95">
          <path d="M 92.6 101
                   C 89.8 110 88.6 120 88.5 129.5
                   C 88.4 132.6 88.7 135.6 89.4 138.2
                   C 92.6 140.4 95.2 138.2 94.6 135.2
                   C 94 131.6 93.9 128 94.1 125
                   C 94.4 116 95.2 108 96.6 102 Z"
                fill="#faf9f5" stroke="#171512" stroke-opacity="0.3" stroke-width="1" stroke-linejoin="round"/>
          <path d="M 89.2 131.4 C 90.9 132.4 92.6 132.4 93.8 131.6" stroke="#8c877d"
                stroke-opacity="0.6" stroke-width="0.9" fill="none" stroke-linecap="round"/>
          <path d="M 96.2 90.2
                   C 90.2 91.4 87 96.6 87.6 102.4
                   C 88 106.6 91.8 108.2 94.8 105.6
                   C 97.6 103 98.2 96 96.6 90.8 Z"
                fill="#efe7d9" stroke="#171512" stroke-opacity="0.5" stroke-width="1.3" stroke-linejoin="round"/>
        </g>
        <g id="armR" data-rig="arm-right" data-rig-pivot="127 95">
          <path d="M 127.4 101
                   C 130.2 110 131.4 120 131.5 129.5
                   C 131.6 132.6 131.3 135.6 130.6 138.2
                   C 127.4 140.4 124.8 138.2 125.4 135.2
                   C 126 131.6 126.1 128 125.9 125
                   C 125.6 116 124.8 108 123.4 102 Z"
                fill="#faf9f5" stroke="#171512" stroke-opacity="0.3" stroke-width="1" stroke-linejoin="round"/>
          <path d="M 126.2 131.6 C 127.4 132.4 129.1 132.4 130.8 131.4" stroke="#8c877d"
                stroke-opacity="0.6" stroke-width="0.9" fill="none" stroke-linecap="round"/>
          <path d="M 123.8 90.2
                   C 129.8 91.4 133 96.6 132.4 102.4
                   C 132 106.6 128.2 108.2 125.2 105.6
                   C 122.4 103 121.8 96 123.4 90.8 Z"
                fill="#efe7d9" stroke="#171512" stroke-opacity="0.5" stroke-width="1.3" stroke-linejoin="round"/>
        </g>

        <g id="neck">
          <path d="M 103.9 68 L 103.9 89.6 Q 110 92.2 116.1 89.6 L 116.1 68 Z" fill="#faf9f5"/>
          <ellipse cx="110" cy="74.6" rx="4.8" ry="2.6" fill="#171512" opacity="0.07"/>
        </g>

        <g id="head" data-rig="head" data-rig-pivot="110 84">
          <g id="hairBack" data-rig="hair-back" data-rig-pivot="124 42">
            <ellipse cx="126" cy="42.5" rx="8.2" ry="7.6" fill="#171512" class="ink-edge" stroke-width="1.5"/>
            <path d="M 121 37.6 C 124 35.4 128 35.6 131 37.8"
                  stroke="#8c877d" stroke-opacity="0.22" stroke-width="2.4"
                  fill="none" stroke-linecap="round"/>
          </g>

          <path d="M 110 40
                   C 100.6 40 94.2 46.4 93.4 55.4
                   C 92.8 62.4 94.4 69.4 97.8 73.6
                   C 101.2 76.8 118.8 76.8 122.2 73.6
                   C 125.6 69.4 127.2 62.4 126.6 55.4
                   C 125.8 46.4 119.4 40 110 40 Z"
                fill="#faf9f5"/>
          <g clip-path="url(#vkFaceClip)">
            <path d="M 96.4 54 C 99.4 50 104 48 110 48.4 C 116 48 120.6 50 123.6 54
                     C 121 51 116.6 49.8 110 50.6 C 103.4 49.8 99 51 96.4 54 Z"
                  fill="#171512" opacity="0.07"/>
            <ellipse cx="122.4" cy="61" rx="5.2" ry="11" fill="#171512" opacity="0.05"/>
          </g>

          <ellipse cx="100.4" cy="68.6" rx="2.4" ry="1.4" fill="#f0995f" opacity="0.3"/>
          <ellipse cx="119.6" cy="68.6" rx="2.4" ry="1.4" fill="#f0995f" opacity="0.3"/>

          <g class="eye-open" data-rig="eye-left">
            <g data-rig="iris-left" clip-path="url(#vkFaceClip)">
              <ellipse cx="104.6" cy="60.6" rx="3.2" ry="4.2" fill="#171512"/>
              <circle cx="103.5" cy="58.8" r="1.1" fill="#faf9f5"/>
            </g>
          </g>
          <g class="eye-open" data-rig="eye-right">
            <g data-rig="iris-right" clip-path="url(#vkFaceClip)">
              <ellipse cx="115.4" cy="60.6" rx="3.2" ry="4.2" fill="#171512"/>
              <circle cx="114.3" cy="58.8" r="1.1" fill="#faf9f5"/>
            </g>
          </g>
          <g class="eye-closed" data-rig="eye-closed">
            <path d="M 101.4 60.4 Q 104.6 62.7 107.8 60.4" stroke="#171512" stroke-width="1.4"
                  fill="none" stroke-linecap="round"/>
            <path d="M 112.2 60.4 Q 115.4 62.7 118.6 60.4" stroke="#171512" stroke-width="1.4"
                  fill="none" stroke-linecap="round"/>
          </g>

          <path d="M 94.2 70
                   C 92.2 55 96.6 38.6 106.8 34.8
                   C 115.4 31.8 124.2 35.6 126.8 43.2
                   C 128 46.4 127.6 50 126.4 52.4
                   C 125.4 47.4 122.4 44.4 118.4 43.8
                   C 115.6 49.6 111.6 51.6 107 51.8
                   C 102.4 52 99.2 55.6 97.8 62.4
                   C 96.8 66.4 96 69.4 94.2 70 Z"
                fill="#171512" class="ink-edge" stroke-width="1.6"/>
          <path d="M 100 44.6 C 104 39.6 110 37.6 116.4 38.2"
                stroke="#8c877d" stroke-opacity="0.18" stroke-width="2.2"
                fill="none" stroke-linecap="round"/>

          <g id="hairPin">
            <use href="#vkStar4" transform="translate(130 40) scale(0.0054) translate(-1024 -1024)" style="color:#f0995f"/>
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
