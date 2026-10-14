import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export default function TableSkeleton({ titleWidth = 180, subtitleWidth = 280, showStats = true, columns = 6, rows = 6 }) {
  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton variant="text" width={titleWidth} height={36} animation="wave" />
          <Skeleton variant="text" width={subtitleWidth} height={18} animation="wave" />
        </div>
        <Skeleton variant="rounded" width={160} height={42} sx={{ borderRadius: '0.75rem' }} animation="wave" />
      </div>

      {/* Summary KPI Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '0.75rem' }} animation="wave" />
              <div className="flex-1 space-y-1.5">
                <Skeleton variant="text" width="45%" height={14} animation="wave" />
                <Skeleton variant="text" width="70%" height={26} animation="wave" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton variant="rounded" width="100%" height={40} sx={{ maxWidth: 360, borderRadius: '0.75rem' }} animation="wave" />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Skeleton variant="rounded" width={100} height={38} sx={{ borderRadius: '0.75rem' }} animation="wave" />
          <Skeleton variant="rounded" width={110} height={38} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Row */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1">
              <Skeleton variant="text" width="60%" height={16} animation="wave" />
            </div>
          ))}
        </div>

        {/* Table Data Rows */}
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="px-6 py-4 flex items-center justify-between gap-4">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <div key={colIdx} className="flex-1 flex items-center gap-2.5">
                  {colIdx === 0 && (
                    <Skeleton variant="circular" width={28} height={28} animation="wave" />
                  )}
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="text" width={colIdx === 0 ? '75%' : '50%'} height={18} animation="wave" />
                    {colIdx === 0 && (
                      <Skeleton variant="text" width="40%" height={12} animation="wave" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
