import React from 'react';

const OrbitingDots = () => {
  const style = `
    @keyframes orbit1 {
      from { transform: rotate(0deg) translateX(12px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
    }
    @keyframes orbit2 {
      from { transform: rotate(180deg) translateX(12px) rotate(-180deg); }
      to { transform: rotate(540deg) translateX(12px) rotate(-540deg); }
    }
    .dot1 { animation: orbit1 6s linear infinite; }
    .dot2 { animation: orbit2 6s linear infinite; }
  `;

  return (
    <div className="relative h-10 w-10">
      <style>{style}</style>
      <svg
        className="absolute inset-0 m-auto h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" strokeOpacity="0.1" strokeWidth="0.5" />
      </svg>
      <div
        className="dot1 absolute top-1/2 left-1/2 -mt-1 -ml-1 h-2 w-2 rounded-full bg-primary/80"
      />
      <div
        className="dot2 absolute top-1/2 left-1/2 -mt-1 -ml-1 h-2 w-2 rounded-full bg-primary/80"
      />
    </div>
  );
};

export default OrbitingDots;
