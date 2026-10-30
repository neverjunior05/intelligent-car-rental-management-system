"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: "info", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container in top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl animate-fade-down transition-all duration-300 ${
              t.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-100"
                : t.type === "error"
                  ? "border-red-500/30 bg-red-950/90 text-red-100"
                  : t.type === "warning"
                    ? "border-amber-500/30 bg-amber-950/90 text-amber-100"
                    : "border-orange/30 bg-zinc-900/90 text-white"
            }`}
          >
            <span className="text-lg">
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <div className="flex-1 text-xs">
              <h5 className="font-bold">{t.title}</h5>
              {t.message && <p className="mt-0.5 opacity-85 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return ctx;
}
