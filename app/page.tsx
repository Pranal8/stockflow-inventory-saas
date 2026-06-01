'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/signup');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm font-medium text-gray-500">Redirecting to StockFlow setup portal...</p>
    </div>
  );
}