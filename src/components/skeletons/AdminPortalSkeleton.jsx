import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export default function AdminPortalSkeleton() {
  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton variant="text" width={220} height={36} animation="wave" />
          <Skeleton variant="text" width={320} height={18} animation="wave" />
        </div>
        <Skeleton variant="rounded" width={160} height={42} sx={{ borderRadius: '0.75rem' }} animation="wave" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={120} height={38} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        <Skeleton variant="rounded" width={120} height={38} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: '0.75rem' }} animation="wave" />
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <Skeleton variant="text" width="50%" height={16} animation="wave" />
            <Skeleton variant="text" width="75%" height={32} animation="wave" />
          </div>
        ))}
      </div>

      {/* Grid of shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="circular" width={40} height={40} animation="wave" />
              <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: '9999px' }} animation="wave" />
            </div>
            <Skeleton variant="text" width="60%" height={22} animation="wave" />
            <Skeleton variant="text" width="80%" height={16} animation="wave" />
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <Skeleton variant="text" width="30%" height={18} animation="wave" />
              <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: '0.5rem' }} animation="wave" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
