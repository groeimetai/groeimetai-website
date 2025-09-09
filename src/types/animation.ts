// Animation Types for Beautiful API to MCP Animation Component

export interface Position {
  x: number;
  y: number;
}

export interface ApiNode {
  id: string;
  name: string;
  position: Position;
  angle: number;
}

export interface AnimationPhase {
  id: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface AnimationState {
  currentPhase: number;
  autoPlay: boolean;
  isPlaying: boolean;
}

export interface ConnectionPath {
  from: Position;
  to: Position;
  phase: number;
  delay?: number;
  animated?: boolean;
}

export interface NodeStyle {
  fill?: string;
  stroke?: string;
  opacity?: number;
  scale?: number;
}

export interface AnimationConfig {
  phases: {
    isolated: number;
    transforming: number;
    connected: number;
  };
  durations: {
    phase: number;
    transition: number;
    element: number;
  };
  easings: {
    smooth: string;
    bounce: string;
    gentle: string;
  };
}

export interface ColorSystem {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  background: {
    primary: string;
    secondary: string;
    glass: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

export interface BenefitCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

// Animation Hook Types
export type AnimationHookReturn = {
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
  reset: () => void;
};

export type UseAnimationStateProps = {
  autoPlay: boolean;
  phases: AnimationPhase[];
};

// Component Props
export interface BeautifulApiToMcpAnimationProps {
  className?: string;
  showControls?: boolean;
  autoStart?: boolean;
  locale?: string;
}

export interface IconProps {
  size?: number;
  className?: string;
}

export interface ConnectionPathProps extends ConnectionPath {
  key?: string;
}

// Accessibility Types
export interface AccessibilityOptions {
  reducedMotion?: boolean;
  highContrast?: boolean;
  screenReader?: boolean;
}

// Animation Performance Types
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
}

// Export constants
export const ANIMATION_PHASES = {
  ISOLATED: 0,
  TRANSFORMING: 1,
  CONNECTED: 2,
} as const;

export type AnimationPhaseType = typeof ANIMATION_PHASES[keyof typeof ANIMATION_PHASES];