import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
