import { useState } from 'react';
import Menu from './components/Menu.jsx';
import Game from './components/Game.jsx';
import SoloGame from './components/SoloGame.jsx';
import ArenaGame from './components/ArenaGame.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import './App.css';

function isTournamentMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'tournament';
}

// Arena 平台模式（arena.bklim.app 以 iframe 嵌入）：?mode=arena
function isArenaMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'arena';
}

// 难度（只影响出题范围）：默认进阶（即原本的出题范围）；
// 需要基础题目时在菜单切换，或由链接显式指定 ?level=easy。
function getLevelParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('level') === 'easy' ? 'easy' : 'normal';
}

export default function App() {
  const [screen, setScreen] = useState(isTournamentMode() ? 'game' : 'menu');
  const [difficulty, setDifficulty] = useState(getLevelParam());

  if (isArenaMode()) {
    return <ArenaGame difficulty={difficulty} />;
  }

  if (screen === 'game') {
    return <Game difficulty={difficulty} onBack={() => setScreen('menu')} onLeaderboard={() => setScreen('leaderboard')} />;
  }

  if (screen === 'solo') {
    return <SoloGame difficulty={difficulty} onBack={() => setScreen('menu')} onLeaderboard={() => setScreen('leaderboard')} />;
  }

  if (screen === 'leaderboard') {
    return <Leaderboard onBack={() => setScreen('menu')} />;
  }

  return (
    <Menu
      difficulty={difficulty}
      onSelectDifficulty={setDifficulty}
      onStartSolo={() => setScreen('solo')}
      onStartDuo={() => setScreen('game')}
      onLeaderboard={() => setScreen('leaderboard')}
    />
  );
}
