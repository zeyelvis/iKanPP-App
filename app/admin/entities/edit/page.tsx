'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntityEditClient } from './EntityEditClient';

function EditPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  return <EntityEditClient id={id} />;
}

export default function AdminEntityEditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-neutral-400">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span>正在加载实体编辑器...</span>
          </div>
        </div>
      }
    >
      <EditPageInner />
    </Suspense>
  );
}
