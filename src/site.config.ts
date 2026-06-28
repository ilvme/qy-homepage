export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ikangjia.cn',

  title: '和光同尘',
  description: '个人主页 — 记录生活与技术，分享思考与创造。',

  author: {
    name: 'kangjia',
    displayName: '林深时觉寒',
  },

  keywords: ['博客', '技术', '生活', '前端', '个人主页'],

  /** RSS 订阅 */
  rss: {
    path: '/rss.xml',
    cacheMaxAge: 3600,
  },

  /** 分页 */
  pagination: {
    pageSize: 7,
    cookingPageSize: 8,
  },

  /** 导航 */
  navLinks: [
    { href: '/posts', label: '文章' },
    { href: '/archives', label: '归档' },
    { href: '/words', label: '说说' },
    { href: '/cooking', label: '品尝' },
    { href: '/share', label: '分享' },
  ],

  /** 首页 Hero 文案 */
  hero: {
    greeting: '你好，我是林深时觉寒',
    intro:
      '欢迎来到我的小站。这里是我记录生活感悟、技术笔记、读书观影心得的地方。希望在数字世界里，找到一片属于自己的宁静角落。',
  },
} as const;
