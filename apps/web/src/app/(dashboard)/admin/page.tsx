'use client';

import * as React from 'react';
import { AdminSimulateClockCard } from '@/components/AdminSimulateClockCard';
import { DataTable, Column } from '@/components/DataTable';
import { RoleBadge, Role as BadgeRole } from '@/components/RoleBadge';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShieldAlert, Users, TrendingUp } from 'lucide-react';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: BadgeRole;
  status: string;
  joined: string;
}

export default function AdminDashboardPage() {
  const [simulatedTime, setSimulatedTime] = React.useState(new Date());

  const handleSimulateNextDay = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setSimulatedTime(new Date(simulatedTime.getTime() + 24 * 60 * 60 * 1000));
        resolve();
      }, 1500);
    });
  };

  // Mock Users
  const users: AdminUserRow[] = [
    {
      id: 'USR-001',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'buyer',
      status: 'Active',
      joined: '2023-01-15',
    },
    {
      id: 'USR-002',
      name: 'Ocean Store #1',
      email: 'ocean1@example.com',
      role: 'seller',
      status: 'Active',
      joined: '2023-02-20',
    },
    {
      id: 'USR-003',
      name: 'Budi Trans',
      email: 'budi@example.com',
      role: 'driver',
      status: 'Suspended',
      joined: '2023-03-10',
    },
    {
      id: 'USR-004',
      name: 'Sarah M.',
      email: 'sarah@example.com',
      role: 'buyer',
      status: 'Active',
      joined: '2023-04-05',
    },
    {
      id: 'USR-005',
      name: 'Seafood Market',
      email: 'market@example.com',
      role: 'seller',
      status: 'Pending Verification',
      joined: '2023-05-12',
    },
  ];

  const columns: Column<AdminUserRow>[] = [
    { header: 'User ID', accessorKey: 'id', className: 'font-mono text-xs text-text-secondary' },
    { header: 'Name', accessorKey: 'name', className: 'font-medium text-text-primary' },
    { header: 'Email', accessorKey: 'email', className: 'text-text-secondary' },
    {
      header: 'Role',
      cell: (item: AdminUserRow) => <RoleBadge role={item.role} />,
    },
    {
      header: 'Status',
      cell: (item: AdminUserRow) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            item.status === 'Active'
              ? 'bg-success/10 text-success'
              : item.status === 'Suspended'
                ? 'bg-danger/10 text-danger'
                : 'bg-warning/10 text-warning'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    { header: 'Joined', accessorKey: 'joined', className: 'text-text-secondary text-sm' },
    {
      header: 'Actions',
      cell: () => (
        <Button variant="link" size="sm" className="text-accent-admin-500">
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 space-y-6 w-full">
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              Admin Control Center
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Platform overview and user management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard variant="solid" className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-buyer-500/10 text-accent-buyer-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">Total Users</p>
                <p className="text-lg font-heading font-bold text-text-primary">12,450</p>
              </div>
            </GlassCard>
            <GlassCard variant="solid" className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">Platform GMV (Today)</p>
                <p className="text-lg font-heading font-bold text-text-primary">Rp 45.2M</p>
              </div>
            </GlassCard>
            <GlassCard variant="solid" className="p-4 flex items-center gap-4 border-danger/20">
              <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">Flagged Reports</p>
                <p className="text-lg font-heading font-bold text-danger">24</p>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="w-full xl:w-[450px] shrink-0">
          <AdminSimulateClockCard
            currentSimulatedTime={simulatedTime}
            onSimulateNextDay={handleSimulateNextDay}
          />
        </div>
      </div>

      {/* User Management Table */}
      <GlassCard variant="glass" className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-heading font-semibold text-text-primary">System Users</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search users..."
              className="w-full pl-9 bg-bg-surface border-glass-border focus-visible:ring-accent-admin-500"
            />
          </div>
        </div>

        <DataTable data={users} columns={columns} />
      </GlassCard>
    </div>
  );
}
