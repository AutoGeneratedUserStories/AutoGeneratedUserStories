import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  duration?: number; // Duration in milliseconds, default is 3000ms
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the toast on mount
    setVisible(true);

    // Set up a timer to hide the toast after the specified duration
    const timer = setTimeout(() => {
      setVisible(false);
      // Optionally call the onClose callback when the toast hides
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
      <style jsx>{`
        .toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 12px 24px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          z-index: 1000;
        }
        .toast.show {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Toast;
