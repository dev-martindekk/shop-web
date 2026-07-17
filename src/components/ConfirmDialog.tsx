"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AlertTriangleIcon } from "@/components/icons";

type ConfirmOptions = {
  message: string;
  danger?: boolean;
};

type ConfirmContextType = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType>(async () => false);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(null);

  const confirmDialog = useCallback((options: ConfirmOptions | string) => {
    setState(typeof options === "string" ? { message: options } : options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    setState(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirmDialog}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={() => close(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                state.danger !== false ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
              }`}>
                <AlertTriangleIcon size={20} />
              </div>
              <p className="text-sm text-slate-700">{state.message}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => close(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  state.danger !== false ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
