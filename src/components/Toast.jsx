import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bgColor: '#d1fae5',
          borderColor: '#10b981'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          bgColor: '#fee2e2',
          borderColor: '#ef4444'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#f59e0b',
          bgColor: '#fef3c7',
          borderColor: '#f59e0b'
        };
      default:
        return {
          icon: Info,
          color: '#3b82f6',
          bgColor: '#dbeafe',
          borderColor: '#3b82f6'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      minWidth: '300px',
      maxWidth: '400px',
      padding: '16px 20px',
      background: 'white',
      borderRadius: '12px',
      borderLeft: `4px solid ${config.borderColor}`,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 10000,
      animation: 'slideInRight 0.3s ease-out',
      transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
      transition: 'transform 0.3s ease-out'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: config.bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={22} color={config.color} />
      </div>

      <p style={{
        flex: 1,
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5',
        color: '#333'
      }}>
        {message}
      </p>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => {
            if (onClose) onClose();
          }, 300);
        }}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: 'none',
          background: '#f5f5f5',
          color: '#666',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#e5e5e5'}
        onMouseOut={(e) => e.currentTarget.style.background = '#f5f5f5'}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration)
  };
}

// Toast Container Component
export function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}

export default Toast;