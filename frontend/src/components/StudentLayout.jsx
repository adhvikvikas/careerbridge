import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './ui/AppShell';
import { LayoutDashboard, Search, FileText, Bookmark, User, Bell } from 'lucide-react';

const navigation = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', href: '/student/jobs', icon: Search },
  { label: 'Applications', href: '/student/applications', icon: FileText },
  { label: 'Saved Jobs', href: '/student/saved-jobs', icon: Bookmark },
  { label: 'Notifications', href: '/student/notifications', icon: Bell },
  { label: 'Profile', href: '/student/profile', icon: User },
];

export default function StudentLayout() {
  return (
    <AppShell role="student" navigation={navigation}>
      <Outlet />
    </AppShell>
  );
}
