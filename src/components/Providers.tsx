"use client";

import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { UserProvider } from "@/lib/user";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <UserProvider>
        <CartProvider>{children}</CartProvider>
      </UserProvider>
    </I18nProvider>
  );
}
