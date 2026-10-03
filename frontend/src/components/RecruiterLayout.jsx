import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './ui/AppShell';
import { LayoutDashboard, User, BriefcaseBusiness, Users } from 'lucide-react';

const navigation = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/recruiter/profile', icon: User },
  { label: 'My Jobs', href: '/recruiter/jobs', icon: BriefcaseBusiness },
];

export default function RecruiterLayout() {
  return (
    <AppShell role="recruiter" navigation={navigation}>
      <Outlet />
    </AppShell>
  );
}
