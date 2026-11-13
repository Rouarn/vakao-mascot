<script setup lang="ts">
import { ref } from 'vue';
import { VakaoMascot } from '@vakao/mascot/vue';
import type { MascotGreetDetail } from '@vakao/mascot';

const count = ref(0);
const last = ref('—');

function handleGreet(event: CustomEvent<MascotGreetDetail>): void {
  count.value += 1;
  last.value = event.detail.greeting;
}
</script>

<template>
  <header>
    <div class="wrap bar">
      <div class="brand"><span class="dot" /> vakao-mascot</div>
      <span class="tag">Vue 3 / @vakao/mascot/vue</span>
    </div>
  </header>

  <main class="wrap">
    <section class="hero">
      <span class="kicker">Vue 封装</span>
      <h1>用 <em>v-model 式的直觉</em>，接一个看板娘。</h1>
      <p class="lede">
        属性走正常的 props，greet 事件用 <code>@greet</code> 接收；如果要在模板里直接写原生标签，
        <code>withVakaoMascot()</code> 已经处理掉自定义元素的编译告警。
      </p>
    </section>

    <section class="status">
      <strong>greet 事件</strong>
      <span>触发次数：<b id="greet-count">{{ count }}</b></span>
      <span>最近问候：<b id="greet-last">{{ last }}</b></span>
    </section>

    <section class="cards">
      <article class="card">
        <h2>属性映射</h2>
        <p>size、greeting、theme、accent 作为 props 声明，同时输出为元素特性。</p>
      </article>
      <article class="card">
        <h2>事件映射</h2>
        <p>greet / ready 通过 addEventListener 绑定后再 emit，行为与普通 Vue 事件一致。</p>
      </article>
      <article class="card">
        <h2>SSR 安全</h2>
        <p>onMounted 之前不访问 DOM，服务端渲染只输出自定义元素标签。</p>
      </article>
    </section>
  </main>

  <footer>
    <div class="wrap">构建产物：@vakao/mascot/vue · peer 依赖 vue ^3.3</div>
  </footer>

  <VakaoMascot
    :size="210"
    greeting="嗨～ Vue 这边也一切正常！"
    @greet="handleGreet"
  />
</template>
