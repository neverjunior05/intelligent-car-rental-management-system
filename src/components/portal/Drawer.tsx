"use client";

import { useEffect, ReactNode } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-md",
}: DrawerProps) {
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${width} transform bg-elev border-l border-app shadow-2xl transition ease-in-out duration-300 flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-app p-5">
            <div>
              <h3 className="font-bold text-app text-base">{title}</h3>
              {subtitle && <p className="text-xs text-soft mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-soft hover:bg-soft hover:text-app cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
