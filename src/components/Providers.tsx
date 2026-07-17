"use client";

import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { UserProvider } from "@/lib/user";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <ConfirmProvider>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>
        </ConfirmProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
