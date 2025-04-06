import React, { useState, useEffect } from 'react';

export function Toast({ title, description, duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
      {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}

