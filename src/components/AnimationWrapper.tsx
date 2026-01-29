
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimationWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
}

export function AnimationWrapper({ 
  children, 
  className, 
  delay = 0, 
  type = 'fade' 
}: AnimationWrapperProps) {
  const animationClass = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-right',
    scale: 'animate-scale-in',
    bounce: 'animate-bounce'
  }[type];

  return (
    <div 
      className={cn(animationClass, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
