import React from 'react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-base z-[100] flex flex-col items-center justify-center">
      <div className="font-serif text-3xl text-text mb-6 flex items-center tracking-wider font-light">
        Luxe<span className="text-accent">Shop</span>
      </div>
      <div className="relative w-40 h-px bg-base-border overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-accent animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
