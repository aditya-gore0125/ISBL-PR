import { Suspense } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[1.25rem] bg-gold/10" />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
