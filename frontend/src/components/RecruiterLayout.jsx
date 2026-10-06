import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './ui/AppShell';
import { LayoutDashboard, Building2, BriefcaseBusiness, Users, Bell, User } from 'lucide-react';

const navigation = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { label: 'Company', href: '/recruiter/company', icon: Building2 },
  { label: 'Jobs', href: '/recruiter/jobs', icon: BriefcaseBusiness },
  { label: 'Notifications', href: '/recruiter/notifications', icon: Bell },
  { label: 'Profile', href: '/recruiter/profile', icon: User },
];

export default function RecruiterLayout() {
  return (
    <AppShell role="recruiter" navigation={navigation}>
      <Outlet />
    </AppShell>
  );
}
