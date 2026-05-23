import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 8 }) => (
  <div
    className="animate-pulse"
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, var(--color-bg-glass) 25%, rgba(255,255,255,0.08) 50%, var(--color-bg-glass) 75%)',
      backgroundSize: '200% 100%',
    }}
  />
);
