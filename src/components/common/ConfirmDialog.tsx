import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="flex items-start gap-3">
        {isDestructive && (
          <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-hidden"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-medium text-white rounded focus:outline-hidden ${
            isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
