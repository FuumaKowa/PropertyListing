import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, RotateCcw, X, Mail, Building2, MapPin } from 'lucide-react';
import { Property } from '../types';

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  iconType?: 'trash' | 'reset' | 'clear' | 'alert';
  propertyPreview?: Property | null;
  countBadge?: number | string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  subtitle,
  message,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  variant = 'danger',
  iconType = 'trash',
  propertyPreview,
  countBadge,
  onConfirm,
  onClose
}: ConfirmModalConfig) {
  const [isExecuting, setIsExecuting] = useState(false);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isExecuting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isExecuting]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    try {
      setIsExecuting(true);
      await onConfirm();
    } catch (err) {
      console.error('Confirmation action error:', err);
    } finally {
      setIsExecuting(false);
      onClose();
    }
  };

  const getVariantStyles = () => {
    if (variant === 'warning') {
      return {
        iconBg: 'bg-amber-100 text-amber-600 border-amber-200/80',
        ring: 'shadow-amber-500/10',
        confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    if (variant === 'info') {
      return {
        iconBg: 'bg-blue-100 text-blue-600 border-blue-200/80',
        ring: 'shadow-blue-500/10',
        confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200',
        badge: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }
    // Danger (default)
    return {
      iconBg: 'bg-rose-100 text-rose-600 border-rose-200/80',
      ring: 'shadow-rose-500/10',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200',
      badge: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  };

  const styles = getVariantStyles();

  const renderIcon = () => {
    switch (iconType) {
      case 'reset':
        return <RotateCcw className="h-6 w-6" />;
      case 'clear':
        return <Mail className="h-6 w-6" />;
      case 'alert':
        return <AlertTriangle className="h-6 w-6" />;
      case 'trash':
      default:
        return <Trash2 className="h-6 w-6" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={isExecuting ? undefined : onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xl p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${styles.iconBg} shadow-xs`}>
                {renderIcon()}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Content Body / Message */}
            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {message}
              </p>

              {/* Count Badge highlight if present */}
              {countBadge !== undefined && (
                <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${styles.badge}`}>
                  <span>Affected items:</span>
                  <span className="font-mono">{countBadge}</span>
                </div>
              )}

              {/* Property Card Mini-Preview (if deleting a property) */}
              {propertyPreview && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 mt-2">
                  <img
                    src={propertyPreview.imageUrl}
                    alt={propertyPreview.title}
                    className="h-14 w-14 rounded-lg object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase tracking-wide">
                      {propertyPreview.propertyType} • {propertyPreview.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {propertyPreview.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      {propertyPreview.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-blue-600 font-mono">
                      RM {propertyPreview.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isExecuting}
                className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={isExecuting}
                className={`rounded-xl font-bold text-xs px-4 py-2.5 transition-all cursor-pointer flex items-center justify-center gap-2 ${styles.confirmBtn} disabled:opacity-50`}
              >
                {isExecuting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
