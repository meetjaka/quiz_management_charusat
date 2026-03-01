import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  const colors = {
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      bg: 'bg-yellow-50',
    },
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      bg: 'bg-red-50',
    },
    info: {
      icon: 'text-primary',
      button: 'bg-primary hover:bg-[#1d4ed8]',
      bg: 'bg-primary/5',
    },
  };

  const currentColor = colors[type] || colors.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 backdrop-blur-sm p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 ${currentColor.bg} rounded-full p-3`}>
              <FiAlertTriangle className={`text-2xl ${currentColor.icon}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-secondary mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-card border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${currentColor.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
