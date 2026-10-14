import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export default function SettingsSkeleton() {
  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
      <div className="space-y-1">
        <Skeleton variant="text" width={200} height={36} animation="wave" />
        <Skeleton variant="text" width={300} height={18} animation="wave" />
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: '0.75rem' }} animation="wave" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="space-y-2">
          <Skeleton variant="text" width={180} height={24} animation="wave" />
          <Skeleton variant="text" width={280} height={16} animation="wave" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton variant="text" width="30%" height={16} animation="wave" />
              <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: '0.75rem' }} animation="wave" />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        </div>
      </div>
    </div>
  );
}
