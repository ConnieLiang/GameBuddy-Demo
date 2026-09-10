import { useEffect, useRef, useState } from 'react';
import games from '../data/signin-games.json';

// Three disjoint pools keep matches at least three columns apart,
// even as columns scroll at different speeds and in opposite directions.
function columnGames(index) {
  const ordered = games.filter((_, gameIndex) => gameIndex % 3 === index % 3);
  let seed = 7319 + index * 7919;
  for (let i = ordered.length - 1; i > 0; i -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  return ordered;
}

// Adapted from David Haz's Svelte Bits LogoLoop.
// License: public/licenses/svelte-bits.txt
function LogoColumn({ index }) {
  const track = useRef(null);
  const sequence = useRef(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    let last = null;
    let offset = 0;
    let velocity = 0;
    let size = 0;
    const measure = () => { size = sequence.current.offsetHeight; };
    const observer = new ResizeObserver(measure);
    observer.observe(sequence.current);
    measure();
    const animate = time => {
      const dt = last === null ? 0 : Math.min((time - last) / 1000, .05);
      last = time;
      const target = (index % 2 ? -1 : 1) * (13 + index * 2) * 0.3;
      velocity += (target - velocity) * (1 - Math.exp(-dt / .25));
      if (size > 0) {
        offset = ((offset + velocity * dt) % size + size) % size;
        track.current.style.transform = `translate3d(0, ${-offset}px, 0)`;
      }
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      last = null;
      if (!media.matches) frame = requestAnimationFrame(animate);
    };
    start();
    media.addEventListener('change', start);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener('change', start);
    };
  }, [index]);
  const ordered = columnGames(index);
  return <div className="signin-loop-column">
    <div className="signin-loop-track" ref={track}>
      {[0, 1, 2].map(copy => <div className="signin-loop-sequence" ref={copy === 0 ? sequence : undefined} key={copy}>
        {ordered.map(game => <img key={game.file} src={`${import.meta.env.BASE_URL}assets/signin-icons/${game.file}`} alt="" draggable="false" width="100" height="100"/>)}
      </div>)}
    </div>
  </div>;
}

export default function GameLogoLoop() {
  const container = useRef(null);
  const [columnCount, setColumnCount] = useState(6);
  useEffect(() => {
    const measure = () => setColumnCount(Math.ceil(container.current.clientWidth / 112) + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(container.current);
    measure();
    return () => observer.disconnect();
  }, []);
  return <div className="signin-logo-loop" ref={container} aria-hidden="true">
    {Array.from({ length: columnCount }, (_, index) => <LogoColumn key={index} index={index}/>)}
  </div>;
}
