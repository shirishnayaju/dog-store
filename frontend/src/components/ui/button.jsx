import React from 'react';

export function Button({ children, className, asChild, ...props }) {
  /* From Uiverse.io by carlosepcc */
  return (
    <button
      className={`cursor-pointer transition-all bg-blue-500 text-white px-4 py-2 rounded-lg
      border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
      active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
