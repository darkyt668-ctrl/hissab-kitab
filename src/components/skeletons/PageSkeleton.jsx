import React from 'react';
import DashboardSkeleton from './DashboardSkeleton';
import TableSkeleton from './TableSkeleton';
import SettingsSkeleton from './SettingsSkeleton';
import AdminPortalSkeleton from './AdminPortalSkeleton';

export default function PageSkeleton({ tab = 'dashboard' }) {
  switch (tab) {
    case 'dashboard':
      return <DashboardSkeleton />;

    case 'inventory':
      return (
        <TableSkeleton 
          titleWidth={210} 
          subtitleWidth={360} 
          showStats={true} 
          columns={6} 
          rows={7} 
        />
      );

    case 'invoices':
      return (
        <TableSkeleton 
          titleWidth={180} 
          subtitleWidth={300} 
          showStats={true} 
          columns={6} 
          rows={7} 
        />
      );

    case 'purchase_invoices':
      return (
        <TableSkeleton 
          titleWidth={230} 
          subtitleWidth={310} 
          showStats={true} 
          columns={6} 
          rows={7} 
        />
      );

    case 'returns':
      return (
        <TableSkeleton 
          titleWidth={170} 
          subtitleWidth={260} 
          showStats={false} 
          columns={5} 
          rows={6} 
        />
      );

    case 'parties':
      return (
        <TableSkeleton 
          titleWidth={190} 
          subtitleWidth={320} 
          showStats={true} 
          columns={5} 
          rows={7} 
        />
      );

    case 'expenses':
      return (
        <TableSkeleton 
          titleWidth={170} 
          subtitleWidth={280} 
          showStats={true} 
          columns={5} 
          rows={7} 
        />
      );

    case 'settings':
      return <SettingsSkeleton />;

    case 'admin_portal':
    case 'platform_settings':
      return <AdminPortalSkeleton />;

    default:
      return <DashboardSkeleton />;
  }
}
