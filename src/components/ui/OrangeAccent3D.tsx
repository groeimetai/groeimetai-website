'use client';

interface OrangeAccent3DProps {
  variant?: 'small' | 'medium' | 'large';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  rotation?: number;
  opacity?: number;
  delay?: number;
}

export default function OrangeAccent3D({ 
  variant = 'medium',
  position = 'top-right',
  rotation = 45,
  opacity = 15,
  delay = 0
}: OrangeAccent3DProps) {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8'
  };

  const positions = {
    'top-left': 'top-20 left-1/4',
    'top-right': 'top-1/4 right-1/4',
    'bottom-left': 'bottom-1/4 left-1/3',
    'bottom-right': 'bottom-20 right-1/3',
    'center': 'top-1/2 left-1/2'
  };

  const delayClasses = {
    0: '',
    200: 'animation-delay-200',
    300: 'animation-delay-300',
    500: 'animation-delay-500'
  };

  return (
    <div 
      className={`absolute ${positions[position]} ${sizes[variant]} transform animate-float ${delayClasses[delay as keyof typeof delayClasses]} pointer-events-none`}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        opacity: opacity / 100,
        background: 'linear-gradient(135deg, #F87315, #FF8533)',
        boxShadow: `0 ${variant === 'large' ? '8px 16px' : variant === 'medium' ? '6px 12px' : '4px 8px'} rgba(248, 115, 21, 0.3)`
      }}
    />
  );
}