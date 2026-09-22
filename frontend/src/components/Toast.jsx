import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Toast = () => {
  const { toast } = useAuth();

  if (!toast.visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: '#ef4444' }} />;
      default:
        return <Info size={18} style={{ color: '#6366f1' }} />;
    }
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type || 'info'}`}>
        {getIcon()}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
