import '@vakao/mascot/auto';
import '../../shared/demo.css';
import type { MascotGreetDetail } from '@vakao/mascot';

const countElement = document.querySelector<HTMLElement>('#greet-count');
const lastElement = document.querySelector<HTMLElement>('#greet-last');

let count = 0;

document.addEventListener('vakao-mascot:greet', (event) => {
  const detail = (event as CustomEvent<MascotGreetDetail>).detail;
  count += 1;
  if (countElement) countElement.textContent = String(count);
  if (lastElement) lastElement.textContent = detail.greeting;
});
