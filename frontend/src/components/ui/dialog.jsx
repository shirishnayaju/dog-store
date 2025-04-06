import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const DialogContext = React.createContext();

export const Dialog = ({ children, open: controlledOpen, onOpenChange }) => {
  const [open, setOpen] = useState(controlledOpen || false);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const toggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open, toggle }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children }) => {
  const { toggle } = React.useContext(DialogContext);
  return React.cloneElement(children, { onClick: toggle });
};

export const DialogContent = ({ children, className = '', ...props }) => {
  const { open, toggle } = React.useContext(DialogContext);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md ${className}`}
        {...props}
      >
        {children}
        <button
          onClick={toggle}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};

export const DialogHeader = ({ className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props} />
);

export const DialogTitle = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold ${className}`} {...props} />
);

export const DialogDescription = ({ className = '', ...props }) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props} />
);

export const DialogFooter = ({ className = '', ...props }) => (
  <div className={`mt-6 flex justify-end space-x-2 ${className}`} {...props} />
);

