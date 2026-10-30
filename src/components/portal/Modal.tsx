"use client";

import { useEffect, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-xl",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Body */}
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl border border-app bg-elev p-6 shadow-2xl animate-fade-up z-10`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-app">
          <div>
            <h3 className="text-lg font-black text-app tracking-tight">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-soft">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-soft hover:bg-soft hover:text-app transition cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
