"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Global Toast Overlay Container */}
      <div 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none select-none"
        aria-live="assertive"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 bg-white border border-[#d5dbdb] p-4 shadow-md rounded-sm border-l-4 pointer-events-auto transition-all ${
              toast.type === "success" ? "border-l-emerald-500" : "border-l-[#d13212]"
            }`}
          >
            {/* Type Indicator Icon */}
            {toast.type === "success" ? (
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            ) : (
              <AlertCircle className="text-[#d13212] shrink-0 mt-0.5" size={16} />
            )}

            {/* Notification Text */}
            <div className="flex-1 text-xs font-semibold text-zinc-800 pr-2 leading-relaxed">
              {toast.message}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 mt-0.5 cursor-pointer"
              title="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
