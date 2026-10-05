import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverted/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="bg-surface border border-border-light rounded-xl w-full max-w-lg z-10 flex flex-col shadow-2xl relative">
        <div className="flex justify-between items-center px-8 py-6 border-b border-border-light">
          <h3 className="text-xl font-semibold text-content">{title}</h3>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content transition-colors absolute top-6 right-6"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};
