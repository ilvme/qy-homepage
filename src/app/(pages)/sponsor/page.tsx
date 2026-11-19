import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/ui/PageHero';
import { getNavTitle } from '@/site.config';

/** 页面副标题与 SEO 描述共用一份，避免两处各写 */
const SPONSOR_DESCRIPTION = '如果你喜欢我的文字，就给我的小猫买个罐头吧~ 🥫';

export const metadata: Metadata = {
  // 此前该页完全没有 metadata，分享出去只有默认标题；顺带把 h1 从英文 Sponsor 归一到导航文案
  title: getNavTitle('/sponsor'),
  description: SPONSOR_DESCRIPTION,
};

export default function SponsorPage() {
  return (
    <div className="py-8">
      <PageHero
        title={getNavTitle('/sponsor')}
        description={SPONSOR_DESCRIPTION}
      />

      <div className="max-w-xs mx-auto text-center space-y-4">
        <Image
          src="/images/wechat-sponsor-qr.jpg"
          alt="微信赞赏码"
          width={400}
          height={400}
          className="w-full rounded-xl border border-border"
          priority
        />
        <p className="text-xs text-secondary">打开微信扫一扫，识别赞赏码</p>
      </div>
    </div>
  );
}
