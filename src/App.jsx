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

export default function App() {
  const [screen, setScreen] = useState(isTournamentMode() ? 'game' : 'menu');

  if (isArenaMode()) {
    return <ArenaGame />;
  }

  if (screen === 'game') {
    return <Game onBack={() => setScreen('menu')} onLeaderboard={() => setScreen('leaderboard')} />;
  }

  if (screen === 'solo') {
    return <SoloGame onBack={() => setScreen('menu')} onLeaderboard={() => setScreen('leaderboard')} />;
  }

  if (screen === 'leaderboard') {
    return <Leaderboard onBack={() => setScreen('menu')} />;
  }

  return (
    <Menu
      onStartSolo={() => setScreen('solo')}
      onStartDuo={() => setScreen('game')}
      onLeaderboard={() => setScreen('leaderboard')}
    />
  );
}
