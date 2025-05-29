import { defineConfig } from 'vitepress';
import { MermaidMarkdown, MermaidPlugin } from 'vitepress-plugin-mermaid';
import api from './apiSidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Motajs Engine',
    description: 'A fast 2D game Engine',
    base: '/motajs-engine/',
    markdown: {
        math: true,
        config(md) {
            md.use(MermaidMarkdown);
        }
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        outline: [2, 3],
        nav: [
            { text: '主页', link: '/' },
            { text: '指南', link: '/guide/' },
            { text: 'API', link: '/api/' }
        ],
        sidebar: {
            '/guide/': [
                {
                    text: '深度指南',
                    items: [
                        {
                            text: '安装',
                            link: '/guide/'
                        },
                        {
                            text: '渲染系统',
                            collapsed: false,
                            items: [
                                { text: '基本使用', link: '/guide/render' },
                                {
                                    text: '渲染优化',
                                    link: '/guide/render-perf'
                                },
                                {
                                    text: '渲染元素',
                                    link: '/guide/render-elements'
                                },
                                { text: '常见问题', link: '/guide/render-faq' },
                                { text: 'UI 系统', link: '/guide/ui-system' }
                            ]
                        }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'API 列表',
                    items: api
                }
            ]
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/unanmed/HumanBreak' }
        ],
        search: {
            provider: 'local',
            options: {
                locales: {
                    zh: {
                        translations: {
                            button: {
                                buttonText: '搜索文档',
                                buttonAriaLabel: '搜索文档'
                            },
                            modal: {
                                noResultsText: '无法找到相关结果',
                                resetButtonTitle: '清除查询条件',
                                footer: {
                                    selectText: '选择',
                                    navigateText: '切换'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    locales: {
        root: {
            lang: 'zh',
            label: '中文'
        }
    },
    vite: {
        plugins: [MermaidPlugin()],
        optimizeDeps: {
            include: ['mermaid']
        },
        ssr: {
            noExternal: ['mermaid']
        }
    }
});
