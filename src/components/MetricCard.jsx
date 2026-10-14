import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export default function MetricCard({ title, value, subtext, icon: Icon, color = 'blue', trend, loading = false }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 pr-3">
            <Skeleton variant="text" width="60%" height={16} animation="wave" />
            <Skeleton variant="text" width="80%" height={32} animation="wave" />
            {subtext && <Skeleton variant="text" width="45%" height={14} animation="wave" />}
          </div>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '0.75rem' }} animation="wave" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
    </div>
  );
}
