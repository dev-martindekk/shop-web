"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircleIcon, XCircleIcon, XIcon } from "@/components/icons";

type ToastType = "error" | "success";
type ToastItem = { id: number; message: string; type: ToastType };

type ToastContextType = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastContextType>(() => {});

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl shadow-lg px-4 py-3 text-sm text-white max-w-sm w-full sm:w-auto ${
              toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" ? <XCircleIcon size={18} className="shrink-0" /> : <CheckCircleIcon size={18} className="shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-80 hover:opacity-100">
              <XIcon size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
