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
        'bg-white rounded-lg shadow-sm border border-gray-100',
        hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};