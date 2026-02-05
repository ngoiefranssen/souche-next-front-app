'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RewardsPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la première page du sous-menu
    router.replace('/rewards/reseller-overview');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  );
}
