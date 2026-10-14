import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import DashboardSkeleton from './DashboardSkeleton';

export default function AppSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative w-full max-w-full overflow-x-hidden">
      {/* Top Navbar Skeleton */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-2.5 sm:px-6 py-2 sm:py-2.5 w-full">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          {/* Brand & Store Selector */}
          <div className="flex items-center gap-3">
            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '0.75rem' }} animation="wave" />
            <Skeleton variant="text" width={110} height={28} animation="wave" />
            <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: '0.5rem' }} animation="wave" />
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: '9999px' }} animation="wave" />
            <Skeleton variant="circular" width={34} height={34} animation="wave" />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
        {/* Sidebar Skeleton (hidden on small screens, shown on md+) */}
        <aside className="hidden md:flex flex-col w-64 p-4 border-r border-slate-200/80 bg-white/70 space-y-2 shrink-0">
          <div className="px-3 py-2">
            <Skeleton variant="text" width="40%" height={14} animation="wave" />
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <div key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <Skeleton variant="rounded" width={22} height={22} sx={{ borderRadius: '0.375rem' }} animation="wave" />
              <Skeleton variant="text" width="60%" height={18} animation="wave" />
            </div>
          ))}
        </aside>

        {/* Content Skeleton */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 w-full max-w-full overflow-x-hidden">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}
