interface NavItem {
  icon?: string | object;
  title: string;
  desc?: string;
  link: string;
  badge?: string;
}

interface NavData {
  title: string;
  items: NavItem[];
}

export const NAV_DATA: NavData[] = [
  {
    title: '在线工具',
    items: [
      {
        icon: 'https://caniuse.com/img/favicon-128.png',
        title: 'Can I use',
        desc: '前端 API 兼容性查询',
        link: 'https://caniuse.com',
      },
      {
        icon: 'https://devtool.tech/logo.svg',
        title: '开发者武器库',
        desc: '开发者武器库，做开发者最专业最好用的专业工具箱',
        link: 'https://devtool.tech',
      },
      {
        icon: 'https://tool.lu/favicon.ico',
        title: '在线工具',
        desc: '开发人员的工具箱',
        link: 'https://tool.lu',
      },
      {
        icon: 'https://transform.tools/static/favicon.png',
        title: 'transform',
        desc: '一个支持多语言的在线转换器',
        link: 'https://transform.tools/json-schema-to-typescript',
      },
      {
        icon: 'https://excalidraw.com/favicon-32x32.png',
        title: 'Excalidraw',
        desc: '手绘风格流程图',
        link: 'https://excalidraw.com',
      },
    ],
  },
  {
    title: '资讯&社区&摸鱼',
    items: [
      {
        title: 'OSChina',
        icon: 'https://www.oschina.net/favicon.ico',
        desc: '一个面向开源及私有软件项目的托管平台',
        link: 'https://www.oschina.net',
      },
      {
        title: 'Github',
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
        },
        desc: '一个面向开源及私有软件项目的托管平台',
        link: 'https://github.com',
      },
      {
        title: 'HelloGitHub',
        icon: 'https://hello.github.com/favicon.ico',
        desc: '一个帮助你发现 GitHub 上优秀项目的地方',
        link: 'https://hello.github.com',
      },
      {
        icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png?v=c78bd457575a',
        title: 'Stack Overflow',
        desc: '全球最大的技术问答网站',
        link: 'https://stackoverflow.com',
      },
      {
        title: '稀土掘金',
        icon: 'https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web//static/favicons/apple-touch-icon.png',
        desc: '面向全球中文开发者的技术内容分享与交流平台',
        link: 'https://juejin.cn',
      },
      {
        title: '博客园',
        icon: 'https://common.cnblogs.com/favicon.ico',
        desc: '博客园是一个面向开发者的知识分享社区',
        link: 'https://www.cnblogs.com',
      },
      {
        title: 'V2EX',
        icon: 'https://www.v2ex.com/static/icon-192.png',
        desc: '一个关于分享和探索的地方',
        link: 'https://www.v2ex.com',
      },
      {
        badge: '周五更新',
        icon: 'https://www.ruanyifeng.com/blog/images/person2_s.jpg',
        title: '科技爱好者周刊',
        desc: '阮一峰的科技爱好者周刊',
        link: 'https://www.ruanyifeng.com/blog/archives.html',
      },
      {
        icon: 'https://xiaolincoding.com/logo.webp',
        title: '小林coding',
        desc: '小林 x 图解计算机基础（计算机网络、操作系统、计算机组成、数据库）',
        link: 'https://xiaolincoding.com',
      },
      {
        icon: 'https://antfu.me/favicon.svg',
        title: 'Blog - Anthony Fu',
        desc: 'Vue, Vite, Nuxt 核心团队成员 | VueUse, Slidev, Vitest, UnoCSS 作者',
        link: 'https://antfu.me/posts',
      },
      {
        icon: 'https://image.zhangxinxu.com/image/blog/zxx_240_0818.jpg',
        title: '鑫空间-鑫生活',
        desc: '张鑫旭的个人博客',
        link: 'https://www.zhangxinxu.com/wordpress',
      },
      {
        title: '知乎',
        icon: 'https://static.zhihu.com/heifetz/assets/apple-touch-icon-60.362a8eac.png',
        desc: '中文互联网高质量的问答社区和创作者聚集的原创内容平台',
        link: 'https://zhihu.com',
      },
      {
        title: '今日热榜',
        icon: 'https://rebang.today/favicon.ico',
        desc: '全栈热榜',
        link: 'https://rebang.today/',
      },
      {
        title: '博友圈',
        icon: 'https://www.boyouquan.com/assets/favicon.ico',
        desc: '博友圈是博客人的专属朋友圈',
        link: 'https://www.boyouquan.com/home',
      },
      {
        title: '十年之约',
        icon: '',
        desc: '一个人的寂寞，一群人的狂欢',
        link: 'https://www.foreverblog.cn/',
      },
    ],
  },

  //  前端生态
  {
    title: 'React 生态',
    items: [
      {
        icon: 'https://zh-hans.reactjs.org/favicon.ico',
        title: 'React',
        desc: '用于构建用户界面的 JavaScript 库',
        link: 'https://zh-hans.reactjs.org',
      },
      {
        icon: 'https://reactrouter.com/favicon-light.png',
        title: 'React Router',
        desc: 'React 的声明式路由',
        link: 'https://reactrouter.com',
      },
      {
        icon: 'https://nextjs.org/favicon.ico?favicon.38folom4sz_yx.ico',
        title: 'Next.js',
        desc: '一个用于 Web 的 React 框架',
        link: 'https://nextjs.org',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
        title: 'Ant Design',
        desc: '一套企业级 UI 设计语言和 React 组件库',
        link: 'https://ant.design',
      },
      {
        icon: 'https://docs.pmnd.rs/apple-touch-icon.png',
        title: 'Zustand',
        desc: '一个小型、快速、可扩展的 React 状态管理解决方案',
        link: 'https://docs.pmnd.rs/zustand/getting-started/introduction',
      },
      {
        icon: 'https://cn.redux.js.org/img/redux.svg',
        title: 'Redux',
        desc: 'JavaScript 应用的状态容器，提供可预测的状态管理',
        link: 'https://cn.redux.js.org',
      },
      {
        icon: 'https://zh.mobx.js.org/assets/mobx.png',
        title: 'MobX',
        desc: '一个小型、快速、可扩展的 React 状态管理解决方案',
        link: 'https://zh.mobx.js.org',
      },
      {
        icon: 'https://ahooks.js.org/simple-logo.svg',
        title: 'ahooks',
        desc: '一套高质量可靠的 React Hooks 库',
        link: 'https://ahooks.js.org/zh-CN',
      },
    ],
  },
  {
    title: 'Vue 生态',
    items: [
      {
        icon: 'https://cn.vuejs.org/logo.svg',
        title: 'Vue',
        desc: '渐进式 JavaScript 框架',
        link: 'https://cn.vuejs.org',
      },
      {
        icon: 'https://cn.vuejs.org/logo.svg',
        title: 'Vue Router',
        desc: 'Vue.js 的官方路由\n为 Vue.js 提供富有表现力、可配置的、方便的路由',
        link: 'https://router.vuejs.org/zh',
      },
      {
        icon: 'https://pinia.vuejs.org/logo.svg',
        title: 'Pinia',
        desc: '符合直觉的 Vue.js 状态管理库',
        link: 'https://pinia.vuejs.org/zh',
      },
      {
        icon: 'https://nuxt.com/icon.png',
        title: 'Nuxt.js',
        desc: '一个基于 Vue.js 的通用应用框架',
        link: 'https://nuxt.com',
      },
      {
        icon: 'https://vueuse.org/favicon.svg',
        title: 'VueUse',
        desc: 'Vue Composition API 的常用工具集',
        link: 'https://vueuse.org',
      },
      {
        icon: 'https://element-plus.org/images/element-plus-logo-small.svg',
        title: 'Element Plus',
        desc: '基于 Vue 3，面向设计师和开发者的组件库',
        link: 'https://element-plus.org',
      },
      {
        icon: 'https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg',
        title: 'Naive UI',
        desc: '一个基于 Vue 3 的 UI 组件库',
        link: 'https://www.naiveui.com/zh-CN',
      },
    ],
  },
  {
    title: '工程化与现代化前端开发',
    items: [
      {
        title: 'Bun',
        desc: '一个快速、简单、模块化的 JavaScript 运行时',
        link: 'https://bun.sh',
        icon: 'https://bun.sh/favicon.ico',
      },
      {
        title: 'Deno',
        desc: '一个现代的 JavaScript 运行时',
        link: 'https://deno.com',
        icon: 'https://deno.com/favicon.ico',
      },
      {
        icon: 'https://www.webpackjs.com/icon_180x180.png',
        title: 'Webpack',
        desc: '一个用于现代 JavaScript 应用程序的静态模块打包工具',
        link: 'https://www.webpackjs.com',
      },
      {
        icon: 'https://cn.vitejs.dev/logo.svg',
        title: 'Vite',
        desc: '下一代前端工具链',
        link: 'https://cn.vitejs.dev',
      },
      {
        icon: 'https://svelte.dev/svelte-logo-horizontal.svg',
        title: 'Svelte',
        desc: '将声明性组件转换为精准高效更新 DOM 的 JavaScript 代码',
        link: 'https://svelte.dev',
      },
      {
        icon: 'https://developer.mozilla.org/favicon.ico',
        title: 'MDN | Web 开发者指南',
        desc: 'Mozilla 的开发者平台，提供了大量关于 HTML、CSS 和 JavaScript 的详细文档以及广泛的 Web API 参考资',
        link: 'https://developer.mozilla.org/zh-CN',
      },
      {
        icon: 'https://www.typescriptlang.org/icons/icon-72x72.png?v=8944a05a8b601855de116c8a56d3b3ae',
        title: 'TypeScript',
        desc: 'TypeScript 是具有类型语法的 JavaScript',
        link: 'https://www.typescriptlang.org/zh/',
      },
      {
        icon: 'https://tailwindcss.com/favicons/favicon-32x32.png?v=4',
        title: 'TailwindCSS',
        desc: '一个功能类优先的 CSS 框架',
        link: 'https://tailwindcss.com',
      },
      {
        icon: 'https://unocss.dev/logo.svg',
        title: 'UnoCSS',
        desc: '一个即时的原子化 CSS 引擎',
        link: 'https://unocss.dev',
      },
      {
        icon: 'https://echarts.apache.org/zh/images/favicon.png?_v_=20240226',
        title: 'ECharts',
        desc: '一个基于 JavaScript 的开源可视化图表库',
        link: 'https://echarts.apache.org/zh/index.html',
      },
      {
        icon: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*7svFR6wkPMoAAAAAAAAAAAAADmJ7AQ/original',
        title: 'AntV',
        desc: '蚂蚁集团全新一代数据可视化解决方案，致力于提供一套简单方便、专业可靠、无限可能的数据可视化最佳实践。',
        link: 'https://antv.vision/zh/',
      },
      {
        icon: 'https://d3js.org/logo.png',
        title: 'D3.js',
        desc: '一个遵循 Web 标准用于可视化数据的 JavaScript 库',
        link: 'https://d3js.org',
      },
      {
        icon: 'https://www.chartjs.org/favicon.ico',
        title: 'Chart.js',
        desc: '一个简单而灵活的 JavaScript 图表库',
        link: 'https://www.chartjs.org',
      },
      {
        icon: 'https://threejs.org/files/favicon.ico',
        // icon: 'https://threejs.org/files/favicon_white.ico',
        title: 'Three.js',
        desc: 'JavaScript 3d 库',
        link: 'https://threejs.org',
      },
    ],
  },
  {
    title: 'Node 框架',
    items: [
      {
        icon: 'https://nodejs.org/static/images/favicons/favicon.png',
        title: 'Node.js',
        desc: 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境',
        link: 'https://nodejs.org/zh-cn',
      },
      {
        icon: 'https://expressjs.com/favicon.ico',
        title: 'Express',
        desc: '基于 Node.js 平台，快速、开放、极简的 Web 开发框架',
        link: 'https://expressjs.com',
      },
      {
        title: 'Koa',
        desc: '基于 Node.js 平台的下一代 web 开发框架',
        link: 'https://koajs.com',
      },
      {
        icon: 'https://www.eggjs.org/favicon.png',
        title: 'Egg',
        desc: '为企业级框架和应用而生',
        link: 'https://www.eggjs.org/zh-CN',
      },
      {
        icon: 'https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg',
        title: 'Nest.js 中文文档',
        desc: '用于构建高效且可伸缩的服务端应用程序的渐进式 Node.js 框架',
        link: 'https://docs.nestjs.cn',
      },
      {
        title: 'Hono',
        desc: '一个高性能的 Node.js Web 框架',
        link: 'https://hono.dev',
        icon: 'https://hono.dev/favicon.ico',
      },
    ],
  },

  {
    title: '跨平台',
    items: [
      {
        icon: 'https://www.electronjs.org/assets/img/favicon.ico',
        title: 'Electron',
        desc: '使用 Web 技术构建跨平台桌面应用程序',
        link: 'https://www.electronjs.org/zh/',
      },
      {
        icon: 'https://tauri.app/favicon.svg',
        title: 'Tauri',
        desc: '使用 Web 技术构建更小、更快、更安全的桌面应用程序',
        link: 'https://tauri.app/zh-cn/',
      },
      {
        icon: 'https://flutter.dev/assets/favicon.26abda3864324ef4ac32dd0d3ce28907.png',
        title: 'Flutter',
        desc: '一个用于构建移动、桌面和 Web 应用程序的框架',
        link: 'https://flutter.dev',
      },
      {
        icon: 'https://web-assets.dcloud.net.cn/unidoc/zh/icon.png',
        title: 'uni-app',
        desc: '一个使用 Vue.js 开发所有前端应用的框架',
        link: 'https://uniapp.dcloud.net.cn',
      },
      {
        icon: 'https://mpxjs.cn/favicon.ico',
        title: 'Mpx',
        desc: '增强型跨端小程序框架',
        link: 'https://mpxjs.cn',
      },
    ],
  },

  // 后端生态，Java
  {
    title: 'Java 后端生态',
    items: [
      {
        title: 'Spring',
        desc: 'Spring makes Java simple.modern.productive.reactive',
        link: 'https://spring.io/',
        icon: 'https://spring.io/favicon.svg',
      },
      {
        title: 'Mybatis Plus',
        desc: 'Mybatis Plus 是 Mybatis 的增强工具',
        link: 'https://mybatis.plus',
        icon: 'https://mybatis.plus/favicon.ico',
      },
      {
        title: 'Quartz',
        desc: 'Quartz 是一个功能强大的作业调度框架',
        link: 'https://quartz-scheduler.org',
        icon: 'https://quartz-scheduler.org/images/favicon.ico',
      },
    ],
  },

  //  其他
  {
    title: 'AI',
    items: [
      {
        title: 'Open AI Codex',
        desc: 'Codex，一个基于 AI 的代码生成工具',
        link: 'https://openai.com/zh-Hans-CN/',
        icon: 'https://openai.com/favicon.ico',
      },
      {
        title: 'Claude Code',
        desc: 'Claude Code，一个基于 AI 的代码生成工具',
        link: 'https://claude.ai/code',
        icon: 'https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/689f4a9aff1f63fde75cf733_favicon.png',
      },
      {
        title: 'DeepSeek',
        desc: 'DeepSeek，一个基于 AI 的智能代理工具',
        link: 'https://deepseek.com',
        icon: 'https://deepseek.com/favicon.ico',
      },
      {
        title: 'Qoder',
        desc: 'Qoder，阿里出品的面向真实工作的智能体平台',
        link: 'https://qoder.com/zh',
        icon: 'https://img.alicdn.com/imgextra/i3/O1CN01KliT1u1jEq947NlKH_!!6000000004517-55-tps-180-180.svg',
      },
      {
        title: 'WorkBuddy',
        desc: 'WorkBuddy 是腾讯出品的全场景 AI 办公工作台',
        link: 'https://www.workbuddy.ai/',
        icon: '//codebuddy-1328495429.cos.accelerate.myqcloud.com/web/workbuddy/d1d0b9329b771f020a1025d11661a33296390d7c/assets/logo.svg',
      },
      {
        title: 'ZCode',
        desc: '智谱，ZCode 将最强大的 AI Agents 与现有工具链结合，让你在熟悉的流程中完成规划、编码、评审与上线。',
        link: 'https://zcode.z.ai/cn',
        icon: 'https://zcode.z.ai/icon.svg',
      },
      {
        title: '豆包',
        desc: '字节跳动旗下 AI 智能助手',
        link: 'https://www.doubao.com',
        icon: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/new-doubao/64x64.png',
      },
    ],
  },
  {
    title: '博客搭建&部署',
    items: [
      {
        icon: 'https://vercel.com/favicon.ico',
        title: 'Vercel',
        desc: '一个用于构建、部署和托管静态网站的平台',
        link: 'https://vercel.com',
      },
      {
        icon: 'https://docusaurus.io/img/docusaurus.png',
        title: 'Docusaurus',
        desc: '一个用于构建文档网站的框架',
        link: 'https://docusaurus.io',
      },
      {
        icon: 'https://www.netlify.com/favicon.ico',
        title: 'Netlify',
        desc: '一个用于静态网站托管和部署的平台',
        link: 'https://www.netlify.com',
      },
      {
        title: 'WordPress',
        desc: '一个用于创建网站和博客的开源内容管理系统',
        link: 'https://wordpress.org',
        icon: 'https://wordpress.org/favicon.ico',
      },
      {
        title: 'Astro',
        desc: '一个快速、简洁且高效的静态网站生成器',
        link: 'https://astro.build',
        icon: 'https://astro.build/favicon.svg',
      },
      {
        title: 'VitePress',
        desc: '一个基于 Vite 的静态网站生成器',
        link: 'https://vitepress.vuejs.org',
        icon: 'https://vitepress.dev/vitepress-logo-mini.png',
      },
      {
        title: 'Hexo',
        desc: '一个快速、简洁且高效的博客框架',
        link: 'https://hexo.io',
        icon: 'https://hexo.io/favicon.ico',
      },
      {
        icon: 'https://jekyllrb.com/favicon.ico',
        title: 'Jekyll',
        desc: '一个静态站点生成器',
        link: 'https://jekyllrb.com',
      },
      {
        icon: 'https://gohugo.io/favicon-32x32.png',
        title: 'Hugo',
        desc: '一个快速的静态站点生成器',
        link: 'https://gohugo.io',
      },
      {
        badge: '评论系统',
        title: 'Giscus',
        desc: '一个用于在网站上添加评论功能的 GitHub 聚合讨论平台',
        link: 'https://giscus.app',
        icon: 'https://giscus.app/favicon.ico',
      },
    ],
  },
];
