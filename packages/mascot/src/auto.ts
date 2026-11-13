import { defineVakaoMascot } from './core/element';

/**
 * 副作用入口：只负责注册 <vakao-mascot>，便于原生页面直接引入。
 * 主入口保持无副作用，方便打包器按需摇树。
 */
defineVakaoMascot();
