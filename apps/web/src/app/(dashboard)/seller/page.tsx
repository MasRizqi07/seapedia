'use client';

import * as React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { DataTable, Column } from '@/components/DataTable';
import { StatusChip, OrderStatus } from '@/components/StatusChip';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Clock, Settings, Store, MoreVertical } from 'lucide-react';

type SellerOrder = {
  id: string;
  product: string;
  customer: string;
  status: OrderStatus;
  time: string;
};

export default function SellerDashboardPage() {
  const stats = [
    {
      label: 'Pendapatan Bulan Ini',
      value: 'Rp 12.500.000',
      icon: <TrendingUp className="w-5 h-5 text-success" />,
    },
    {
      label: 'Pesanan Aktif',
      value: '14',
      icon: <Clock className="w-5 h-5 text-warning" />,
    },
    {
      label: 'Produk Terjual',
      value: '156',
      icon: <Package className="w-5 h-5 text-accent-seller-500" />,
    },
  ];

  const [orders, setOrders] = React.useState<SellerOrder[]>([
    {
      id: 'ORD-9981A',
      product: 'Fresh Premium Tuna',
      customer: 'John D.',
      status: 'Sedang Dikemas' as OrderStatus,
      time: '10:30 AM',
    },
    {
      id: 'ORD-9982B',
      product: 'Tiger Shrimp',
      customer: 'Sarah M.',
      status: 'Sedang Dikemas' as OrderStatus,
      time: '09:15 AM',
    },
    {
      id: 'ORD-9983C',
      product: 'Live Crab',
      customer: 'Budi T.',
      status: 'Menunggu Pengirim' as OrderStatus,
      time: 'Yesterday',
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const columns: Column<SellerOrder>[] = [
    {
      header: 'Order ID',
      cell: (item: SellerOrder) => (
        <span className="font-mono text-xs font-medium text-text-primary">{item.id}</span>
      ),
    },
    { header: 'Produk', accessorKey: 'product', className: 'text-text-primary font-medium' },
    { header: 'Pembeli', accessorKey: 'customer', className: 'text-text-secondary' },
    { header: 'Waktu', accessorKey: 'time', className: 'text-text-secondary text-xs' },
    { header: 'Status', cell: (item: SellerOrder) => <StatusChip status={item.status} /> },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (item: SellerOrder) => {
        if (item.status === 'Sedang Dikemas') {
          return (
            <Button
              size="sm"
              className="bg-accent-seller-500 hover:bg-accent-seller-400 text-bg-void shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)] text-xs h-8"
              onClick={() => handleUpdateStatus(item.id, 'Menunggu Pengirim')}
            >
              Request Pickup
            </Button>
          );
        }
        return (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-text-secondary hover:text-text-primary"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
            <Store className="w-6 h-6 text-accent-seller-500" /> Ocean Store #1
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ringkasan performa toko dan pesanan masuk.
          </p>
        </div>
        <Button variant="outline" className="border-glass-border">
          <Settings className="w-4 h-4 mr-2" /> Pengaturan Toko
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} variant="solid" className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-bg-surface-raised border border-border flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
              <p className="text-xl font-heading font-bold text-text-primary mt-0.5">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Order Queue */}
      <GlassCard variant="glass" className="p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-heading font-semibold text-text-primary">Antrean Pesanan</h2>
          <Button variant="link" className="text-accent-seller-500">
            Lihat Semua
          </Button>
        </div>

        <DataTable data={orders} columns={columns} />
      </GlassCard>
    </div>
  );
}
