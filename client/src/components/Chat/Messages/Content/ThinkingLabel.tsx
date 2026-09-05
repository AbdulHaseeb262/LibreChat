import { useEffect, useState } from 'react';

/**
 * Solvane — the status word while a reply is on its way.
 * Shown in the reply's place from the moment you send until the first token
 * streams in. Cycles through a small set of verbs with a light shimmer; the
 * verb changes on a fixed beat so it reads as alive rather than random.
 */
const VERBS = [
  'Thinking',
  'Weighing',
  'Pondering',
  'Sifting',
  'Drafting',
  'Whistling',
  'Enumerating',
  'Musing',
  'Sketching',
  'Composing',
  'Considering',
  'Untangling',
];

export default function ThinkingLabel() {
  const [i, setI] = useState(() => Math.floor(Math.random() * VERBS.length));

  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % VERBS.length), 1700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="solvane-thinking" aria-live="polite">
      {VERBS[i]}…
    </span>
  );
}
