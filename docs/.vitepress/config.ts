import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Mini Hermes Agent 教程',
  description: '从零到一实现一个教学版 Hermes Agent',
  lang: 'zh-CN',
  cleanUrls: true,
  themeConfig: {
    logo: '☤',
    nav: [
      { text: '原理', link: '/guide/01-what-is-hermes' },
      { text: 'Demo', link: '/demo/01-toy-tool-call' },
      { text: 'Mini 项目', link: '/project/01-architecture' },
      { text: '资料', link: '/reference/sources' }
    ],
    sidebar: [
      {
        text: '学习路线',
        items: [{ text: '课程总览', link: '/' }]
      },
      {
        text: '核心原理',
        items: [
          { text: 'Hermes Agent 是什么', link: '/guide/01-what-is-hermes' },
          { text: 'Function Calling 机制', link: '/guide/02-function-calling' },
          { text: 'System Prompt 结构', link: '/guide/03-system-prompt' },
          { text: '记忆管理与任务规划', link: '/guide/04-memory-planning' }
        ]
      },
      {
        text: '渐进式 Demo',
        items: [
          { text: 'Demo 1：玩具工具调用', link: '/demo/01-toy-tool-call' },
          { text: 'Demo 2：Agent Loop', link: '/demo/02-agent-loop' }
        ]
      },
      {
        text: '最终项目',
        items: [
          { text: '项目架构', link: '/project/01-architecture' },
          { text: '核心实现', link: '/project/02-implementation' },
          { text: '运行与扩展', link: '/project/03-run' }
        ]
      },
      {
        text: '参考',
        items: [{ text: '资料来源', link: '/reference/sources' }]
      }
    ],
    outline: [2, 3],
    socialLinks: [{ icon: 'github', link: 'https://github.com/NousResearch/hermes-agent' }]
  },
  markdown: {
    lineNumbers: true
  }
});
