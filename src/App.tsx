import { useEffect, useState } from 'react';
import { TRAINING_DOT, type Dot } from './data/modules.ts';
import { buildTraining } from './engine/training.ts';
import type { Task } from './engine/series.ts';
import { LESSONS, type LessonId } from './data/lessons.ts';
import { loadProgress, recordSeries, requestPersistentStorage, saveProgress, type Progress } from './engine/storage.ts';
import Home from './components/Home.tsx';
import Exercise from './components/Exercise.tsx';
import Stats from './components/Stats.tsx';
import Learn from './components/Learn.tsx';
import Knowledge from './components/Knowledge.tsx';
import { UpdateBanner } from './components/PwaBanners.tsx';

type Screen =
  | { name: 'home' }
  | { name: 'dot'; dot: Dot; tasks?: Task[] }
  | { name: 'stats' }
  | { name: 'knowledge' }
  | { name: 'lesson'; id: LessonId };

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const home = () => setScreen({ name: 'home' });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);
  useEffect(() => {
    void requestPersistentStorage();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      {screen.name === 'home' && (
        <Home
          progress={progress}
          onPlay={(dot) => setScreen({ name: 'dot', dot })}
          onStats={() => setScreen({ name: 'stats' })}
          onKnowledge={() => setScreen({ name: 'knowledge' })}
          onTraining={() => setScreen({ name: 'dot', dot: TRAINING_DOT, tasks: buildTraining(progress) })}
        />
      )}
      {screen.name === 'dot' && screen.dot.kind === 'learn' && (
        <Learn
          title={screen.dot.title}
          lessons={screen.dot.lessons}
          doneLabel="Rozumiem! Do ćwiczeń"
          onDone={() => {
            const dot = screen.dot;
            setProgress((p) => recordSeries(p, dot.id, 1, 1, []));
            home();
          }}
          onExit={home}
        />
      )}
      {screen.name === 'dot' && screen.dot.kind !== 'learn' && (
        <Exercise key={screen.dot.id} dot={screen.dot} tasks={screen.tasks} progress={progress} onFinish={setProgress} onExit={home} />
      )}
      {screen.name === 'stats' && <Stats progress={progress} onReset={setProgress} onBack={home} />}
      {screen.name === 'knowledge' && <Knowledge onOpen={(id) => setScreen({ name: 'lesson', id })} onBack={home} />}
      {screen.name === 'lesson' && (
        <Learn
          title={LESSONS[screen.id]?.title ?? ''}
          lessons={[screen.id]}
          doneLabel="Wróć do wiedzy"
          onDone={() => setScreen({ name: 'knowledge' })}
          onExit={() => setScreen({ name: 'knowledge' })}
        />
      )}
      {/* W trakcie ćwiczenia nie przeszkadzamy: powiadomienie pojawi się po powrocie na ścieżkę. */}
      {screen.name !== 'dot' && <UpdateBanner />}
    </div>
  );
}
