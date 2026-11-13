import { useState } from 'react';
import { VakaoMascot } from '@vakao/mascot/react';

export default function App() {
  const [count, setCount] = useState(0);
  const [last, setLast] = useState('—');

  return (
    <>
      <header>
        <div className="wrap bar">
          <div className="brand"><span className="dot" /> vakao-mascot</div>
          <span className="tag">React 19 / @vakao/mascot/react</span>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <span className="kicker">React 封装</span>
          <h1>属性、事件、<em>ref</em> 都按 React 的方式工作。</h1>
          <p className="lede">
            封装内部在 layout effect 里把 props 写到自定义元素属性上，并用 addEventListener
            绑定 greet 事件，兼容 React 18 与 19。
          </p>
        </section>

        <section className="status">
          <strong>greet 事件</strong>
          <span>触发次数：<b id="greet-count">{count}</b></span>
          <span>最近问候：<b id="greet-last">{last}</b></span>
        </section>

        <section className="cards">
          <article className="card">
            <h2>ref 转发</h2>
            <p>ref 指向真实的 <code>VakaoMascotElement</code>，可直接调用 <code>greet()</code>。</p>
          </article>
          <article className="card">
            <h2>SSR 安全</h2>
            <p>服务端只输出标签与特性，不访问 window / customElements。</p>
          </article>
          <article className="card">
            <h2>属性同步</h2>
            <p>size、greeting、theme、accent 变化时会同步到元素。</p>
          </article>
        </section>
      </main>

      <footer>
        <div className="wrap">构建产物：@vakao/mascot/react · peer 依赖 react &gt;= 18</div>
      </footer>

      <VakaoMascot
        size={210}
        greeting="嗨～ React 这边也一切正常！"
        onGreet={(event) => {
          setCount((value) => value + 1);
          setLast(event.detail.greeting);
        }}
      />
    </>
  );
}
