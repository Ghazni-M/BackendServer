// src/components/ConfirmDialog.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isDanger?: boolean;
  isLoading?: boolean; // Optional external loading override
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
  isLoading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  // Combined loading state (external + internal during promise)
  const isBusy = internalLoading || externalLoading;

  const handleConfirm = async () => {
    if (isBusy) return;

    setInternalLoading(true);
    try {
      await onConfirm(); // Supports both sync & async
    } catch (err) {
      console.error('Confirm action failed:', err);
      // Optional: show error toast here if you have one
    } finally {
      setInternalLoading(false);
      // Do NOT auto-close — let parent decide (e.g. after success)
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="p-8 text-center relative">
              {/* Icon */}
              <div
                className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${
                  isDanger ? 'bg-red-50 text-red-500' : 'bg-brand-gold/10 text-brand-gold'
                }`}
              >
                <AlertTriangle className="w-10 h-10" />
              </div>

              {/* Title */}
              <h3
                id="confirm-dialog-title"
                className="text-2xl font-serif font-bold text-brand-navy mb-3"
              >
                {title}
              </h3>

              {/* Message */}
              <p className="text-gray-600 leading-relaxed mb-8">{message}</p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isBusy}
                  className="flex-1 py-4 px-6 rounded-2xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </button>

                {/* Confirm */}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isBusy}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    isDanger
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                      : 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-brand-navy/20'
                  }`}
                  aria-busy={isBusy}
                >
                  {isBusy ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>

              {/* Close X */}
              <button
                onClick={onCancel}
                disabled={isBusy}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};