'use client';

export default function SubtleTilePattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay - from top-right (0%) to bottom-left (70%) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.7) 100%)',
          maskImage: `
            repeating-linear-gradient(45deg, transparent 0px, transparent 30px, black 30px, black 60px),
            repeating-linear-gradient(-45deg, transparent 0px, transparent 30px, black 30px, black 60px)
          `,
          maskComposite: 'intersect',
          WebkitMaskImage: `
            repeating-linear-gradient(45deg, transparent 0px, transparent 30px, black 30px, black 60px),
            repeating-linear-gradient(-45deg, transparent 0px, transparent 30px, black 30px, black 60px)
          `,
          WebkitMaskComposite: 'source-in',
          opacity: 0.1
        }}
      />
      
      {/* Random tile overlay for variation */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] right-[10%] w-20 h-20 bg-white/[0.01] rounded-lg transform rotate-12"></div>
        <div className="absolute top-[30%] right-[20%] w-24 h-16 bg-white/[0.02] rounded-lg transform -rotate-6"></div>
        <div className="absolute top-[50%] right-[15%] w-18 h-24 bg-white/[0.025] rounded-lg transform rotate-8"></div>
        <div className="absolute bottom-[30%] left-[20%] w-22 h-22 bg-white/[0.04] rounded-lg transform -rotate-10"></div>
        <div className="absolute bottom-[15%] left-[10%] w-26 h-20 bg-white/[0.05] rounded-lg transform rotate-5"></div>
        <div className="absolute bottom-[40%] left-[35%] w-20 h-28 bg-white/[0.045] rounded-lg transform -rotate-3"></div>
        <div className="absolute top-[70%] left-[60%] w-24 h-18 bg-white/[0.04] rounded-lg transform rotate-15"></div>
        <div className="absolute bottom-[25%] right-[40%] w-16 h-20 bg-white/[0.03] rounded-lg transform -rotate-12"></div>
      </div>
    </div>
  );
}