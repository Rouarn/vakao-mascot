import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { MASCOT_EVENTS, VAKAO_MASCOT_TAG, defineVakaoMascot } from './index';
import type {
  MascotGreetDetail,
  MascotReadyDetail,
  MascotTheme,
  VakaoMascotElement,
} from './index';

/**
 * Vue 3 封装。
 *
 * 关键处理：
 * - props 既作为特性输出（SSR 首屏就带上），也在挂载后同步到元素 JS 属性；
 * - greet / ready 通过 addEventListener 绑定后 emit，避免 Vue 把 onXxx 当成普通特性；
 * - 挂载前先注册自定义元素，卸载时清理监听与动画。
 */
export const VakaoMascot = defineComponent({
  name: 'VakaoMascot',
  inheritAttrs: false,
  props: {
    size: {
      type: Number,
      default: undefined,
    },
    greeting: {
      type: String,
      default: undefined,
    },
    theme: {
      type: String as PropType<MascotTheme>,
      default: undefined,
    },
    accent: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
  },
  emits: {
    greet: (_event: CustomEvent<MascotGreetDetail>) => true,
    ready: (_event: CustomEvent<MascotReadyDetail>) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const element = ref<VakaoMascotElement | null>(null);
    const cleanups: Array<() => void> = [];

    const applyProps = (): void => {
      const node = element.value;
      if (!node) return;

      if (props.size === undefined) {
        node.removeAttribute('size');
      } else {
        node.size = props.size;
      }
      node.greeting = props.greeting ?? '';
      node.theme = props.theme ?? 'auto';
      node.accent = props.accent ?? '';
      node.label = props.label ?? '';
    };

    onMounted(() => {
      const node = element.value;
      if (!node) return;

      const handleGreet = (event: Event): void => {
        emit('greet', event as CustomEvent<MascotGreetDetail>);
      };
      const handleReady = (event: Event): void => {
        emit('ready', event as CustomEvent<MascotReadyDetail>);
      };

      node.addEventListener(MASCOT_EVENTS.greet, handleGreet);
      node.addEventListener(MASCOT_EVENTS.ready, handleReady);
      cleanups.push(() => {
        node.removeEventListener(MASCOT_EVENTS.greet, handleGreet);
        node.removeEventListener(MASCOT_EVENTS.ready, handleReady);
      });

      defineVakaoMascot();
      applyProps();
    });

    watch(
      () => [props.size, props.greeting, props.theme, props.accent, props.label] as const,
      () => applyProps(),
    );

    onBeforeUnmount(() => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups.length = 0;
    });

    expose({ element });

    return () =>
      h(VAKAO_MASCOT_TAG, {
        ...attrs,
        ref: element,
        size: props.size,
        greeting: props.greeting,
        theme: props.theme,
        accent: props.accent,
        label: props.label,
      });
  },
});

export type VakaoMascotInstance = InstanceType<typeof VakaoMascot>;
