import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-soft border border-primary-100 transition-all duration-300',
        hover && 'hover:shadow-medium hover:-translate-y-1 hover:border-primary-200',
        className
      )}
    >
      {children}
    </div>
  );
};