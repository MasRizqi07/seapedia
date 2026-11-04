'use client';

import * as React from 'react';
import { DriverJobCard, JobState } from '@/components/DriverJobCard';
import { MapPin, Search } from 'lucide-react';

export default function DriverDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<'available' | 'active' | 'completed'>(
    'available',
  );

  // Mock Jobs
  type Job = {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    fee: number;
    distance: string;
    state: JobState;
  };
  const [jobs, setJobs] = React.useState<Job[]>([
    {
      id: 'J-001',
      pickupLocation: 'Ocean Store #1',
      dropoffLocation: 'Jl. Sudirman No. 123',
      fee: 50000,
      distance: '3.2 km',
      state: 'available' as JobState,
    },
    {
      id: 'J-002',
      pickupLocation: 'Seafood Market Muara',
      dropoffLocation: 'Jl. Thamrin No. 45',
      fee: 45000,
      distance: '2.1 km',
      state: 'available' as JobState,
    },
    {
      id: 'J-003',
      pickupLocation: "Fisherman's Wharf",
      dropoffLocation: 'Kebayoran Baru',
      fee: 60000,
      distance: '5.5 km',
      state: 'active' as JobState,
    },
    {
      id: 'J-004',
      pickupLocation: 'Ocean Store #2',
      dropoffLocation: 'Kemang Raya',
      fee: 40000,
      distance: '1.8 km',
      state: 'completed' as JobState,
    },
  ]);

  const handleAccept = (id: string) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, state: 'active' } : j)));
    setActiveTab('active');
  };

  const handleComplete = (id: string) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, state: 'completed' } : j)));
    setActiveTab('completed');
  };

  const filteredJobs = jobs.filter((j) => j.state === activeTab);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-bg-void pb-24 relative">
      <div className="sticky top-0 z-20 bg-glass-fill-strong backdrop-blur-md border-b border-glass-border px-4 py-4">
        <h1 className="text-xl font-heading font-bold text-text-primary">Driver Portal</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Online &amp; Menerima Pesanan
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Tabs */}
        <div className="flex bg-bg-surface p-1 rounded-xl border border-glass-border mb-6">
          {(['available', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-accent-driver-500 text-bg-void shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              Tidak ada pekerjaan {activeTab}.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="animate-fade-in-up">
                <DriverJobCard
                  {...job}
                  onAccept={() => handleAccept(job.id)}
                  onComplete={() => handleComplete(job.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-bg-surface border-t border-glass-border flex justify-around p-3 z-20">
        <button className="flex flex-col items-center text-accent-driver-500">
          <MapPin className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Jobs</span>
        </button>
        <button className="flex flex-col items-center text-text-tertiary">
          <Search className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>
      </div>
    </div>
  );
}
