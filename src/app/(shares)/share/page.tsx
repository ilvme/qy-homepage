import { EmptyState } from '@/components/ui/EmptyState';

export default async function SharePage() {
  return (
    <div className="py-8 space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">分享</h1>
        <p className="text-secondary text-base mt-1">分享一些有意义的东西。</p>
      </header>

      <EmptyState />
    </div>
  );
}
