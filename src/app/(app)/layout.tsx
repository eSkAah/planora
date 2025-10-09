import { redirect } from 'next/navigation';

import { Sidebar } from '@/components/layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-[#071427]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pl-6">
          {children}
        </div>
      </main>
    </div>
  );
}
