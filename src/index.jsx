// ============================================================
// Arena 早期消息缓冲
// ============================================================
// 平台（arena.bklim.app 的房间页/练习页）在 iframe onload 那一刻就发
// arena:init —— 而 React 挂载与 useEffect 注册监听是异步的，可能更晚。
// 不缓冲的话 init 会丢失，游戏永远停在「待命中」。
// 这里在模块加载的同步阶段就开始攒 arena:* 消息，
// ArenaGame 挂载后置 __arenaLive 并补发处理（见 ArenaGame.jsx）。
window.__arenaBuf = [];
window.addEventListener('message', (e) => {
  if (window.__arenaLive) return;
  const t = e.data && e.data.type;
  if (t && String(t).indexOf('arena:') === 0) window.__arenaBuf.push(e);
});

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)