/** 导航可出现的三处位置：顶栏主干 / 页脚元信息 / 首页探索卡片 */
export type NavSurface = 'header' | 'footer' | 'home';

export interface NavLink {
  href: string;
  label: string;
  /** 首页探索卡片的一句话说明 */
  desc?: string;
  surfaces: NavSurface[];
}

const navLinks: NavLink[] = [
  {
    href: '/posts',
    label: '文章',
    desc: '博文笔记',
    surfaces: ['header', 'home'],
  },
  {
    href: '/words',
    label: '说说',
    desc: '随笔心情',
    surfaces: ['header', 'home'],
  },
  {
    href: '/cooking',
    label: '食者',
    desc: '下厨记录',
    surfaces: ['header', 'home'],
  },
  { href: '/taste', label: '书影音', desc: '书影音收藏', surfaces: ['home'] },
  { href: '/awaken', label: '分享', desc: '语录与感悟', surfaces: ['home'] },

  { href: '/about', label: '关于', desc: '我与小站', surfaces: ['home'] },
  { href: '/friends', label: '友链', desc: '一些朋友', surfaces: ['home'] },
  { href: '/sponsor', label: '赞赏', desc: '谢谢～', surfaces: ['home'] },

  // 文章子页面：入口收敛到 /posts 与 /archives 内部，不占顶栏、首页与页脚
  // 标签、分类已由 /archives 的聚合区承载，页面本身保留但不单独展示
  { href: '/archives', label: '归档', surfaces: [] },
  { href: '/tags', label: '标签', surfaces: [] },
  { href: '/categories', label: '分类', surfaces: [] },
];

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
    wordsPath: '/words/rss.xml',
    cacheMaxAge: 3600,
    /** 文章 feed 条数上限（全文输出，限制条数以控制体积与生成开销） */
    maxItems: 20,
    /** 说说 feed 条数上限（单条内容短，可多输出一些） */
    wordsMaxItems: 50,
  },

  /** 分页 */
  pagination: {
    pageSize: 12,
    cookingPageSize: 12,
    wordsPageSize: 30,
    tastePageSize: 12,
    awakenPageSize: 10,
  },

  /** 导航 */
  navLinks,

  /** 首页 Hero 文案 */
  hero: {
    greeting: '你好，我是林深时觉寒',
    intro:
      '欢迎来到我的小站。这里是我记录生活感悟、技术笔记、读书观影心得的地方。',
  },

  /** Giscus 评论 */
  giscus: {
    enabled: true,
    repo: 'ilvme/site-comments',
    repoId: 'R_kgDOQGPClw',
    category: 'Announcements',
    categoryId: 'DIC_kwDOQGPCl84Cw4yK',
  },
} as const;
