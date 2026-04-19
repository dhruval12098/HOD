'use client';

import { useEffect, useRef, useState } from 'react';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let n = 0;
    intervalRef.current = setInterval(() => {
      n += Math.random() * 12;
      if (n >= 100) {
        n = 100;
        clearInterval(intervalRef.current!);
        setTimeout(() => setHidden(true), 200);
      }
      setProgress(n);
    }, 80);

    const fallback = setTimeout(() => setHidden(true), 3000);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(fallback);
    };
  }, []);

  if (hidden) return null;

  return (
    <div id="loader" aria-hidden="true">
      <div className="loader-diamond">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <polygon
            points="30,5 50,20 45,50 15,50 10,20"
            stroke="#B8922A" strokeWidth="1" fill="none"
          />
          <polygon
            points="30,15 42,22 38,42 22,42 18,22"
            stroke="#B8922A" strokeWidth="0.6" fill="rgba(184,146,42,0.08)"
          />
          <line x1="30" y1="5" x2="15" y2="50" stroke="#B8922A" strokeWidth="0.4" opacity=".5"/>
          <line x1="30" y1="5" x2="45" y2="50" stroke="#B8922A" strokeWidth="0.4" opacity=".5"/>
          <line x1="10" y1="20" x2="50" y2="20" stroke="#B8922A" strokeWidth="0.4" opacity=".5"/>
        </svg>
      </div>
      <div className="loader-brand">House of Diams</div>
      <div className="loader-tagline">Crafted in Light</div>
      <div className="loader-bar">
        <div className="loader-progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
