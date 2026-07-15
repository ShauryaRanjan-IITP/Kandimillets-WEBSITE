import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Kandimillets Admin",
    default: "Kandimillets Admin",
  },
  description: "Kandimillets internal admin portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full bg-warm-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-green-100/40 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-[360px] w-[360px] rounded-full bg-gold-100/30 blur-3xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
