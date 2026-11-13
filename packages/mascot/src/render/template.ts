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
  /* 墨色块面在深色背景上整体提亮一档，只留下剪影轮廓，不会变成一团黑。 */
  .ink-solid { transition: fill 180ms ease; }
  :host([theme="dark"]) .ink-solid { fill: #453d33; }
  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) .ink-solid { fill: #453d33; }
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

        <!-- 丝网第二版：橙色网点，用作裙摆折面与脸部暗面 -->
        <pattern id="vkDots" width="3.4" height="3.4" patternUnits="userSpaceOnUse">
          <circle cx="1.7" cy="1.7" r="0.78" fill="#f0995f"/>
        </pattern>
        <!-- 纸感颗粒，覆盖全身 -->
        <filter id="vkGrain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.24"/></feComponentTransfer>
        </filter>
        <!-- 发顶唯一一道柔光 -->
        <filter id="vkSoft" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="2.6"/>
        </filter>

        <clipPath id="vkFaceClip">
          <path d="M 110 25
                   C 100.2 25 92.6 31.6 91.8 41.6
                   C 91.2 49.6 93 59 97 63.8
                   C 100.2 67.4 104.4 69.2 110 69.2
                   C 115.6 69.2 119.8 67.4 123 63.8
                   C 127 59 128.8 49.6 128.2 41.6
                   C 127.4 31.6 119.8 25 110 25 Z"/>
        </clipPath>

        <clipPath id="vkBodyClip">
          <path d="M 110 76
                   C 100.4 76 91.4 78.4 88.2 84
                   C 86.2 87.6 86.6 94.4 87.4 101
                   C 87.8 105 88.2 108 88.6 110.6
                   C 85.2 126 80.4 166 79.6 178.4
                   C 88.8 184 98.8 186 110 186
                   C 121.2 186 131.2 184 140.4 178.4
                   C 139.6 166 134.8 126 131.4 110.6
                   C 131.8 108 132.2 105 132.6 101
                   C 133.4 94.4 133.8 87.6 131.8 84
                   C 128.6 78.4 119.6 76 110 76 Z"/>
          <path d="M 110 18.4
                   C 96 18.4 86 27.8 85.6 40.4
                   C 85.2 51 86.8 61.4 89.2 68.2
                   C 91 73.4 95 76.4 99.6 77
                   C 103.2 77.5 106.4 75.4 107.2 71.4
                   C 108 67.4 108.2 61 108.2 54
                   C 108.2 44 108.4 34 110 30
                   C 111.6 34 111.8 44 111.8 54
                   C 111.8 61 112 67.4 112.8 71.4
                   C 113.6 75.4 116.8 77.5 120.4 77
                   C 125 76.4 129 73.4 130.8 68.2
                   C 133.2 61.4 134.8 51 134.4 40.4
                   C 134 27.8 124 18.4 110 18.4 Z"/>
          <path d="M 127.6 26.6
                   C 139.4 25.4 150.2 33.6 153 45.4
                   C 155.2 54.8 151.4 65.2 144.2 71.4
                   C 140.6 74.6 136.2 73.4 135.6 69
                   C 134.8 62.6 138.4 55 139.6 47.6
                   C 140.6 40.4 134.8 33.6 127.6 33.4 Z"/>
          <path d="M 110 25
                   C 100.2 25 92.6 31.6 91.8 41.6
                   C 91.2 49.6 93 59 97 63.8
                   C 100.2 67.4 104.4 69.2 110 69.2
                   C 115.6 69.2 119.8 67.4 123 63.8
                   C 127 59 128.8 49.6 128.2 41.6
                   C 127.4 31.6 119.8 25 110 25 Z"/>
          <rect x="96.4" y="178" width="11.8" height="48" rx="5.9"/>
          <rect x="111.8" y="178" width="11.8" height="48" rx="5.9"/>
          <rect x="92.6" y="224.6" width="15.8" height="13.4" rx="6.7"/>
          <rect x="111.6" y="224.6" width="15.8" height="13.4" rx="6.7"/>
          <rect x="80.2" y="88" width="16" height="46" rx="8"/>
          <rect x="123.8" y="88" width="16" height="46" rx="8"/>
          <circle cx="82" cy="130.4" r="5.6"/>
          <circle cx="138" cy="130.4" r="5.6"/>
        </clipPath>
      </defs>

      <g id="rig" data-rig="rig" data-rig-origin="110 242">
        <ellipse id="shadow" data-rig="shadow" cx="110" cy="241" rx="29" ry="3.8" fill="#171512" opacity="0.12"/>

        <g id="legs">
          <rect x="96.4" y="178" width="11.8" height="48" rx="5.9" fill="#faf9f5"
                stroke="#171512" stroke-width="1.6"/>
          <rect x="111.8" y="178" width="11.8" height="48" rx="5.9" fill="#faf9f5"
                stroke="#171512" stroke-width="1.6"/>
          <rect x="92.6" y="224.6" width="15.8" height="13.4" rx="6.7" fill="#171512" class="ink-edge ink-solid"/>
          <rect x="111.6" y="224.6" width="15.8" height="13.4" rx="6.7" fill="#171512" class="ink-edge ink-solid"/>
        </g>

        <g id="body" data-rig="body">
          <!-- 裙身：纸色 + 一版墨线 -->
          <path d="M 110 76
                   C 100.4 76 91.4 78.4 88.2 84
                   C 86.2 87.6 86.6 94.4 87.4 101
                   C 87.8 105 88.2 108 88.6 110.6
                   C 85.2 126 80.4 166 79.6 178.4
                   C 88.8 184 98.8 186 110 186
                   C 121.2 186 131.2 184 140.4 178.4
                   C 139.6 166 134.8 126 131.4 110.6
                   C 131.8 108 132.2 105 132.6 101
                   C 133.4 94.4 133.8 87.6 131.8 84
                   C 128.6 78.4 119.6 76 110 76 Z"
                fill="#faf9f5" stroke="#171512" stroke-width="1.6" stroke-linejoin="round"/>
          <!-- 第二版橙：裙摆右下的折面 -->
          <path d="M 110 136
                   C 118 141 127.6 143 134.6 140.4
                   C 138 152 140 168 140.4 178.4
                   C 131.2 184 121.2 186 110 186 Z"
                fill="url(#vkDots)" opacity="0.45"/>
          <!-- 领口：把头颈接进身体的那条线 -->
          <path d="M 99.8 77 C 99.8 82.4 103.8 84.8 110 84.8 C 116.2 84.8 120.2 82.4 120.2 77"
                fill="#faf9f5" stroke="#171512" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M 88.8 107.4 C 100 112 120 112 131.2 107.4 L 131.8 114.4
                   C 120 119 100 119 88.2 114.4 Z" fill="#171512" class="ink-edge ink-solid"/>
        </g>

        <g id="armL" data-rig="arm-left" data-rig-pivot="91 92">
          <path d="M 90.6 92 C 89.2 99 87.2 108 84.4 114.4 C 83.6 118.4 83 122 82.4 126"
                stroke="#171512" stroke-width="11.2" stroke-linecap="round" fill="none"/>
          <path d="M 90.6 92 C 89.2 99 87.2 108 84.4 114.4 C 83.6 118.4 83 122 82.4 126"
                stroke="#faf9f5" stroke-width="8.2" stroke-linecap="round" fill="none"/>
          <ellipse cx="82" cy="130.4" rx="5.6" ry="6.6" fill="#171512"/>
          <ellipse cx="82" cy="130.4" rx="4.8" ry="5.8" fill="#faf9f5"/>
        </g>
        <g id="armR" data-rig="arm-right" data-rig-pivot="129 92">
          <path d="M 129.4 92 C 130.8 99 132.8 108 135.6 114.4 C 136.4 118.4 137 122 137.6 126"
                stroke="#171512" stroke-width="11.2" stroke-linecap="round" fill="none"/>
          <path d="M 129.4 92 C 130.8 99 132.8 108 135.6 114.4 C 136.4 118.4 137 122 137.6 126"
                stroke="#faf9f5" stroke-width="8.2" stroke-linecap="round" fill="none"/>
          <ellipse cx="138" cy="130.4" rx="5.6" ry="6.6" fill="#171512"/>
          <ellipse cx="138" cy="130.4" rx="4.8" ry="5.8" fill="#faf9f5"/>
        </g>

        <g id="head" data-rig="head" data-rig-pivot="110 78">
          <!-- 后发：侧马尾，橙色版先错位印一遍 -->
          <g id="hairBack" data-rig="hair-back" data-rig-pivot="124 42">
            <path d="M 127.6 26.6
                     C 139.4 25.4 150.2 33.6 153 45.4
                     C 155.2 54.8 151.4 65.2 144.2 71.4
                     C 140.6 74.6 136.2 73.4 135.6 69
                     C 134.8 62.6 138.4 55 139.6 47.6
                     C 140.6 40.4 134.8 33.6 127.6 33.4 Z"
                  transform="translate(1.4 -1.2)" fill="#f0995f" opacity="0.42"/>
            <path d="M 127.6 26.6
                     C 139.4 25.4 150.2 33.6 153 45.4
                     C 155.2 54.8 151.4 65.2 144.2 71.4
                     C 140.6 74.6 136.2 73.4 135.6 69
                     C 134.8 62.6 138.4 55 139.6 47.6
                     C 140.6 40.4 134.8 33.6 127.6 33.4 Z"
                  fill="#171512" class="ink-edge ink-solid"/>
          </g>

          <path d="M 110 18.4
                   C 96 18.4 86 27.8 85.6 40.4
                   C 85.2 51 86.8 61.4 89.2 68.2
                   C 91 73.4 95 76.4 99.6 77
                   C 103.2 77.5 106.4 75.4 107.2 71.4
                   C 108 67.4 108.2 61 108.2 54
                   C 108.2 44 108.4 34 110 30
                   C 111.6 34 111.8 44 111.8 54
                   C 111.8 61 112 67.4 112.8 71.4
                   C 113.6 75.4 116.8 77.5 120.4 77
                   C 125 76.4 129 73.4 130.8 68.2
                   C 133.2 61.4 134.8 51 134.4 40.4
                   C 134 27.8 124 18.4 110 18.4 Z"
                transform="translate(1.4 -1.2)" fill="#f0995f" opacity="0.42"/>
          <path d="M 110 18.4
                   C 96 18.4 86 27.8 85.6 40.4
                   C 85.2 51 86.8 61.4 89.2 68.2
                   C 91 73.4 95 76.4 99.6 77
                   C 103.2 77.5 106.4 75.4 107.2 71.4
                   C 108 67.4 108.2 61 108.2 54
                   C 108.2 44 108.4 34 110 30
                   C 111.6 34 111.8 44 111.8 54
                   C 111.8 61 112 67.4 112.8 71.4
                   C 113.6 75.4 116.8 77.5 120.4 77
                   C 125 76.4 129 73.4 130.8 68.2
                   C 133.2 61.4 134.8 51 134.4 40.4
                   C 134 27.8 124 18.4 110 18.4 Z"
                fill="#171512" class="ink-edge ink-solid"/>

          <g id="neck">
            <path d="M 104.8 56 L 104.8 82 Q 110 84.8 115.2 82 L 115.2 56 Z" fill="#faf9f5"/>
          </g>

          <path d="M 110 25
                   C 100.2 25 92.6 31.6 91.8 41.6
                   C 91.2 49.6 93 59 97 63.8
                   C 100.2 67.4 104.4 69.2 110 69.2
                   C 115.6 69.2 119.8 67.4 123 63.8
                   C 127 59 128.8 49.6 128.2 41.6
                   C 127.4 31.6 119.8 25 110 25 Z"
                fill="#faf9f5"/>
          <g clip-path="url(#vkFaceClip)">
            <path d="M 116 26 C 124 30 128.6 38 128.4 48
                     C 128.2 58 125 66 119 71 L 132 71 L 132 26 Z"
                  fill="url(#vkDots)" opacity="0.35"/>
          </g>

          <circle cx="98.6" cy="57.2" r="3.1" fill="#f0995f" opacity="0.42"/>
          <circle cx="121.4" cy="57.2" r="3.1" fill="#f0995f" opacity="0.42"/>

          <g class="eye-open" data-rig="eye-left">
            <g data-rig="iris-left" clip-path="url(#vkFaceClip)">
              <circle cx="103.4" cy="51.6" r="3.6" fill="#171512"/>
              <circle cx="102.2" cy="50.2" r="1.1" fill="#faf9f5"/>
            </g>
          </g>
          <g class="eye-open" data-rig="eye-right">
            <g data-rig="iris-right" clip-path="url(#vkFaceClip)">
              <circle cx="116.6" cy="51.6" r="3.6" fill="#171512"/>
              <circle cx="115.4" cy="50.2" r="1.1" fill="#faf9f5"/>
            </g>
          </g>
          <g class="eye-closed" data-rig="eye-closed">
            <path d="M 99.8 51.6 Q 103.4 54.8 107 51.6" stroke="#171512" stroke-width="1.8"
                  fill="none" stroke-linecap="round"/>
            <path d="M 113 51.6 Q 116.6 54.8 120.2 51.6" stroke="#171512" stroke-width="1.8"
                  fill="none" stroke-linecap="round"/>
          </g>

          <path d="M 107.4 59.8 Q 110 62 112.6 59.8" stroke="#171512" stroke-width="1.6"
                fill="none" stroke-linecap="round" opacity="0.75"/>

          <path d="M 92.2 45.2
                   C 91.6 34 97.8 26.2 107.2 24.8
                   C 115.4 23.6 123 28 126 34.8
                   C 127.6 38.6 127.8 43 127 46.4
                   C 125 40.8 121.2 37 116.2 35.8
                   C 112.8 41 108.2 44.2 102.6 45
                   C 98.2 45.6 94.6 47.2 93 50.8
                   C 92.6 49 92.2 47.2 92.2 45.2 Z"
                fill="#171512" class="ink-edge ink-solid"/>
          <path d="M 97.2 42.4 C 99.2 33.2 105 27.4 112.2 25.6
                   C 106.8 29.4 103 35.2 101.2 43.2 Z"
                fill="#8c877d" opacity="0.35"/>
          <!-- 全平之后唯一还留着的一道柔光 -->
          <path d="M 95.6 44.6 C 97 33 103.4 26.6 111 25" stroke="#ffffff" stroke-width="3.4"
                stroke-linecap="round" fill="none" opacity="0.32" filter="url(#vkSoft)"/>

          <g id="hairPin">
            <use href="#vkStar4" transform="translate(131.6 37.8) scale(0.0072) translate(-1024 -1024)" style="color:#f0995f"/>
            <use href="#vkStar4" transform="translate(133 39.2) scale(0.0072) translate(-1024 -1024)" style="color:#171512" opacity="0.3"/>
            <use href="#vkStar4" transform="translate(130.2 36.6) scale(0.0072) translate(-1024 -1024)" style="color:#f0995f"/>
          </g>
        </g>

        <g clip-path="url(#vkBodyClip)">
          <rect x="0" y="0" width="220" height="260" filter="url(#vkGrain)" opacity="0.5"/>
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
