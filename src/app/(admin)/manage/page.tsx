import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { DeployButton } from './_components/DeployButton';

export const metadata: Metadata = {
  title: '管理',
  robots: 'noindex, nofollow',
};

const tools = [
  {
    title: '发布说说',
    description: '快速发布一条说说到网站',
    href: '/manage/publish',
  },
];

export default function ManagePage() {
  return (
    <div className="py-8 max-w-xl">
      <PageHero title="管理" description="选择一个功能" />

      <ul className="space-y-3">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block border border-border rounded-lg px-5 py-4 bg-card hover:border-foreground/20 transition-colors"
            >
              <span className="font-medium">{tool.title}</span>
              <span className="text-sm text-secondary block mt-0.5">
                {tool.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <hr className="my-8 border-border" />

      <DeployButton />
    </div>
  );
}
