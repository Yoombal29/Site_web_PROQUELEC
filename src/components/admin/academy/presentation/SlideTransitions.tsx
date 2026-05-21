import React from 'react';
import { cn } from '@/lib/utils';


interface SlideTransitionsProps {
  children: React.ReactNode;
  transition: TransitionType;
  direction: 'next' | 'prev';
  slideKey: number;
}

export const SlideTransitions: React.FC<SlideTransitionsProps> = ({
  children,
  transition,
  direction,
  slideKey
}) => {
  const getTransitionClass = () => {
    switch (transition) {
      case 'fade':
        return 'animate-[fadeIn_0.5s_ease-out]';
      case 'slide':
        return direction === 'next' ?
        'animate-[slideInRight_0.5s_ease-out]' :
        'animate-[slideInLeft_0.5s_ease-out]';
      case 'zoom':
        return 'animate-[zoomIn_0.4s_ease-out]';
      case 'flip':
        return 'animate-[flipIn_0.6s_ease-out]';
      case 'cube':
        return direction === 'next' ?
        'animate-[cubeRotateIn_0.6s_ease-out]' :
        'animate-[cubeRotateOut_0.6s_ease-out]';
      default:
        return '';
    }
  };

  return (
    <div
      key={slideKey}
      className={cn("w-full h-full", getTransitionClass())}
      style={{ transformStyle: 'preserve-3d' }}>
      
      {children}
    </div>);

};

// CSS keyframes to add to index.css
export const transitionKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes flipIn {
  from { transform: perspective(1000px) rotateY(90deg); opacity: 0; }
  to { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
}

@keyframes cubeRotateIn {
  from { transform: perspective(1000px) rotateY(-90deg) translateZ(100px); opacity: 0; }
  to { transform: perspective(1000px) rotateY(0deg) translateZ(0); opacity: 1; }
}

@keyframes cubeRotateOut {
  from { transform: perspective(1000px) rotateY(90deg) translateZ(100px); opacity: 0; }
  to { transform: perspective(1000px) rotateY(0deg) translateZ(0); opacity: 1; }
}
`;