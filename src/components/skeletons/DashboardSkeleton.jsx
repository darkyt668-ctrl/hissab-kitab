import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
      {/* Banner Skeleton */}
      <div className="bg-slate-200/70 rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <Skeleton variant="rounded" width={140} height={24} sx={{ borderRadius: '9999px' }} animation="wave" />
            <Skeleton variant="text" width={220} height={38} animation="wave" />
            <Skeleton variant="text" width={320} height={20} animation="wave" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '0.75rem' }} animation="wave" />
            <Skeleton variant="rounded" width={120} height={42} sx={{ borderRadius: '0.75rem' }} animation="wave" />
          </div>
        </div>
      </div>

      {/* Low stock strip skeleton */}
      <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: '1rem' }} animation="wave" />

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 pr-3">
                <Skeleton variant="text" width="60%" height={16} animation="wave" />
                <Skeleton variant="text" width="80%" height={32} animation="wave" />
                <Skeleton variant="text" width="45%" height={14} animation="wave" />
              </div>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '0.75rem' }} animation="wave" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '0.75rem' }} animation="wave" />
              <div className="flex-1 space-y-1.5">
                <Skeleton variant="text" width="50%" height={14} animation="wave" />
                <Skeleton variant="text" width="70%" height={24} animation="wave" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Columns: Recent Invoices & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <div key={col} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <Skeleton variant="text" width={150} height={24} animation="wave" />
              <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '0.5rem' }} animation="wave" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="circular" width={36} height={36} animation="wave" />
                    <div className="space-y-1 flex-1">
                      <Skeleton variant="text" width="55%" height={18} animation="wave" />
                      <Skeleton variant="text" width="35%" height={14} animation="wave" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton variant="text" width={70} height={18} animation="wave" />
                    <Skeleton variant="rounded" width={50} height={18} sx={{ borderRadius: '9999px' }} animation="wave" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
