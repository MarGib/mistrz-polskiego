import { useEffect, useState } from 'react';
import type { Dot } from './data/modules.ts';
import { loadProgress, requestPersistentStorage, saveProgress, type Progress } from './engine/storage.ts';
import Home from './components/Home.tsx';
import Exercise from './components/Exercise.tsx';
import Stats from './components/Stats.tsx';

type Screen = { name: 'home' } | { name: 'exercise'; dot: Dot } | { name: 'stats' };

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => void requestPersistentStorage(), []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      {screen.name === 'home' && (
        <Home progress={progress} onPlay={(dot) => setScreen({ name: 'exercise', dot })} onStats={() => setScreen({ name: 'stats' })} />
      )}
      {screen.name === 'exercise' && (
        <Exercise
          key={screen.dot.id}
          dot={screen.dot}
          progress={progress}
          onFinish={setProgress}
          onExit={() => setScreen({ name: 'home' })}
        />
      )}
      {screen.name === 'stats' && (
        <Stats progress={progress} onReset={setProgress} onBack={() => setScreen({ name: 'home' })} />
      )}
    </div>
  );
}
