import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A1A2F] text-white'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,233,78,0.25)_0,rgba(10,26,47,0.9)_55%)]' />
      <div className='absolute inset-x-0 top-0 flex justify-between px-10 pt-10 text-sm tracking-[0.3em] text-white/40 uppercase'>
        <span>Planora</span>
        <span>Smart Workforce Planning</span>
      </div>
      <div className='relative z-10 flex w-full max-w-3xl flex-col gap-8 rounded-[32px] border border-white/10 bg-white/6 px-8 py-10 shadow-[0_20px_80px_rgba(10,26,47,0.45)] backdrop-blur-xl sm:px-16 sm:py-14'>
        {children}
      </div>
      <div className='absolute bottom-10 flex items-center gap-3 text-xs text-white/40'>
        <span>© {new Date().getFullYear()} Planora</span>
        <span className='h-1 w-1 rounded-full bg-white/30' />
        <span>Premium Scheduling Intelligence</span>
      </div>
    </div>
  );
}
