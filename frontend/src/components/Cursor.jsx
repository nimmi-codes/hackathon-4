import { useEffect, useRef } from 'react';

const HOVER = 'a, button, [role="button"], select, summary, .card, .hoverable';
const TEXT = 'input, textarea, [contenteditable="true"]';

// Soft green dot that follows the mouse + a ring that trails behind.
// Disabled on touch devices; the normal cursor is kept over text inputs.
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('custom-cursor');

    let x = -100, y = -100, rx = -100, ry = -100, raf;
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.current.style.transform = `translate(${x}px, ${y}px)`;
      const t = e.target;
      const onText = !!t.closest?.(TEXT);
      document.documentElement.classList.toggle('on-text', onText);
      ring.current.classList.toggle('grow', !!t.closest?.(HOVER));
    };
    const tick = () => {
      rx += (x - rx) * 0.15;
      ry += (y - ry) * 0.15;
      ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    if (!reduce) raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor', 'on-text');
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true"><span /></div>
      <div ref={dot} className="cursor-dot" aria-hidden="true"><span /></div>
    </>
  );
}
