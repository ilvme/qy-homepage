import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';

export default async function SharePage() {
  return (
    <div className="py-8 space-y-12">
      <PageHero title="分享" description="分享一些有意义的东西。" />
      <EmptyShower />
    </div>
  );
}
