import React, { useState, createContext, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';

// Toast Component
const Toast = ({ id, title, description, duration = 3000, onClose, type = 'success' }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Different styles based on toast type
  const getTypeStyles = () => {
    switch(type) {
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800';
      case 'success':
      default:
        return 'bg-green-50 border-green-400 text-green-800';
    }
  };

  return (
    <div className={`w-72 p-4 rounded-md shadow-lg border-l-4 mb-2 ${getTypeStyles()}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm">{description}</p>
        </div>
        <button 
          onClick={() => onClose(id)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={16} />
        </button>
      </div>
    </div>
  );
};

// Create Toast Context
const ToastContext = createContext();

// Creating the provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, ...toast }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            duration={toast.duration}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}