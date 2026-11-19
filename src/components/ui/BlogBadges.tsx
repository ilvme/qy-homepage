import Image from 'next/image';

interface BlogBadge {
  /** 无障碍名称，同时用作列表 key */
  name: string;
  href: string;
  /** 悬停提示，写清这个链接通向哪个圈子 */
  title: string;
  /** 浅色背景用（深色文字版） */
  light: string;
  /** 深色背景用（浅色文字版） */
  dark: string;
  /** 声明宽高：必须与素材内容比例一致，否则 preserveAspectRatio 会留白 */
  width: number;
  height: number;
  /** 实际显示高度。各家素材内边距不同，需要单独调才能视觉等重 */
  displayHeight: number;
  /** SVG 交给浏览器渲染，不走图片优化（Next 默认不允许优化 SVG） */
  unoptimized?: boolean;
}

/**
 * 直接用官方托管的图，不存本地副本：标识的意义就是「我是这个圈子的成员」，
 * 官方换图时跟着变，也不会留一份没人记得更新的旧图。域名白名单在 next.config.ts。
 */
const BADGES: BlogBadge[] = [
  {
    name: '十年之约',
    href: 'https://www.foreverblog.cn/',
    title: '十年之约 · 成员博客',
    light: 'https://www.foreverblog.cn/assets/logo/logo_v2_black.png',
    dark: 'https://www.foreverblog.cn/assets/logo/logo_v2_light.png',
    width: 124,
    height: 32,
    // 官方示例给的是 32px，但比正文行高（28px）还高，压在标题下会盖过标题的层级
    displayHeight: 24,
  },
  {
    name: '博友圈',
    href: 'https://www.boyouquan.com/home',
    title: '博友圈 · 博客人的朋友圈',
    light: 'https://www.boyouquan.com/assets/images/sites/logo/logo.svg',
    dark: 'https://www.boyouquan.com/assets/images/sites/logo/logo-dark.svg',
    // viewBox 是 180×70，声明尺寸按同比例给，给成 107×32 会左右留白、logo 显小
    width: 82,
    height: 32,
    // 字重比十年之约细，同高时视觉偏轻，抬 2px 才等重
    displayHeight: 26,
    unoptimized: true,
  },
];

/**
 * 本站已加入的博客圈标识。
 *
 * 十年之约与博友圈都要求成员在自己的站上给出入口，友链页是两个平台明确允许的位置之一。
 * 两家各备亮/暗两版图，这里靠 dark: 变体切换——只挂一套的话，暗色模式下白底标识
 * 会在深色背景上糊成一块。读屏软件只会读到当前显示的那一张（另一张 display:none）。
 */
export default function BlogBadges({
  label = '本站已加入',
  className = '',
}: {
  /** 行首说明文案，传空串可只留图标 */
  label?: string;
  /** 外层附加类名（如页面内的间距修正） */
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 ${className}`.trim()}
    >
      {label && <span className="text-xs text-secondary">{label}</span>}
      {BADGES.map((badge) => (
        <a
          key={badge.name}
          href={badge.href}
          target="_blank"
          rel="noopener"
          title={badge.title}
        >
          <Image
            src={badge.light}
            alt={badge.name}
            width={badge.width}
            height={badge.height}
            style={{ height: badge.displayHeight }}
            className="w-auto dark:hidden"
            unoptimized={badge.unoptimized}
          />
          <Image
            src={badge.dark}
            alt={badge.name}
            width={badge.width}
            height={badge.height}
            style={{ height: badge.displayHeight }}
            className="hidden w-auto dark:block"
            unoptimized={badge.unoptimized}
          />
        </a>
      ))}
    </div>
  );
}
