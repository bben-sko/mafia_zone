'use client';

import { useGame } from '@/context/game-context';
import GrainOverlay from '@/components/grain-overlay';
import Fireflies from '@/components/fireflies';
import Lobby from '@/screens/lobby';
import Setup from '@/screens/setup';
import Turn from '@/screens/turn';
import Handoff from '@/screens/handoff';
import CardScreen from '@/screens/card';
import Discussion from '@/screens/discussion';
import End from '@/screens/end';

export default function LocalGame() {
  const { state } = useGame();
  const { screen } = state;

  return (
    <>
      <GrainOverlay />
      <Fireflies />
      {screen === 'lobby' && <Lobby />}
      {screen === 'setup' && <Setup />}
      {screen === 'turn' && <Turn />}
      {screen === 'handoff' && <Handoff />}
      {screen === 'card' && <CardScreen />}
      {screen === 'discussion' && <Discussion />}
      {screen === 'end' && <End />}
    </>
  );
}
