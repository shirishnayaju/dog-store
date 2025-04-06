import React from 'react';

export function Button({ children, className, asChild, ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
