import React from 'react';
import { Star } from 'lucide-react';

export default function Rating({ rating, setRating }) {
  const handleRating = (rate) => {
    setRating(rate);
  };

  return (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          onClick={() => handleRating(star)}
        />
      ))}
    </div>
  );
}
