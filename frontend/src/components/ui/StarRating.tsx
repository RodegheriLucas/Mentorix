import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly = false, size = 24 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: readonly ? 'default' : 'pointer',
            fontSize: size,
            color: star <= (hover || value) ? '#f59e0b' : 'var(--color-border)',
            transition: 'color 0.15s',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
};
