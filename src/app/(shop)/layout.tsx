import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        © 2026 EZShop
      </footer>
      <ChatWidget />
    </>
  );
}
