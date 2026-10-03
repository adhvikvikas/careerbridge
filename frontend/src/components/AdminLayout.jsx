import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './ui/AppShell';
import { LayoutDashboard, Building2, BriefcaseBusiness, FileText } from 'lucide-react';

const navigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Jobs', href: '/admin/jobs', icon: BriefcaseBusiness },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
];

export default function AdminLayout() {
  return (
    <AppShell role="admin" navigation={navigation}>
      <Outlet />
    </AppShell>
  );
}
