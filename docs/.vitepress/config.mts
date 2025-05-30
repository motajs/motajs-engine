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

    locales: {
        root: {
            label: '简体中文',
            lang: 'zh-CN',
            title: 'Motajs Engine',
            link: '/zh/',
            themeConfig: {
                // https://vitepress.dev/reference/default-theme-config
                outline: [2, 3],
                nav: [
                    { text: '主页', link: '/zh/' },
                    { text: '指南', link: '/zh/guide/' },
                    { text: 'API', link: '/zh/api/' }
                ],
                sidebar: {
                    '/zh/guide/': [
                        {
                            text: '深度指南',
                            items: [
                                {
                                    text: '安装',
                                    link: '/zh/guide/'
                                },
                                {
                                    text: '渲染系统',
                                    collapsed: false,
                                    items: [
                                        {
                                            text: '基本使用',
                                            link: '/zh/guide/render'
                                        },
                                        {
                                            text: '渲染元素',
                                            link: '/zh/guide/render-elements'
                                        },
                                        {
                                            text: '渲染优化',
                                            link: '/zh/guide/render-perf'
                                        },
                                        {
                                            text: '常见问题',
                                            link: '/zh/guide/render-faq'
                                        },
                                        {
                                            text: 'UI 系统',
                                            link: '/zh/guide/ui-system'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    '/zh/api/': [
                        {
                            text: 'API 列表',
                            items: api.zh
                        }
                    ]
                },
                socialLinks: [
                    {
                        icon: 'github',
                        link: 'https://github.com/unanmed/HumanBreak'
                    }
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
            }
        },
        en: {
            label: 'English',
            lang: 'en-US',
            title: 'Motajs Engine',
            link: '/en/',
            themeConfig: {
                // https://vitepress.dev/reference/default-theme-config
                outline: [2, 3],
                nav: [
                    { text: 'Home', link: '/en/' },
                    { text: 'Guide', link: '/en/guide/' },
                    { text: 'API', link: '/en/api/' }
                ],
                sidebar: {
                    '/en/guide/': [
                        {
                            text: 'Guide',
                            items: [
                                {
                                    text: 'Installation',
                                    link: '/en/guide/'
                                },
                                {
                                    text: 'Render System',
                                    collapsed: false,
                                    items: [
                                        {
                                            text: 'Basic usage',
                                            link: '/en/guide/render'
                                        },
                                        {
                                            text: 'Elements',
                                            link: '/en/guide/render-elements'
                                        },
                                        {
                                            text: 'Optimization',
                                            link: '/en/guide/render-perf'
                                        },
                                        {
                                            text: 'FAQ',
                                            link: '/en/guide/render-faq'
                                        },
                                        {
                                            text: 'UI System',
                                            link: '/en/guide/ui-system'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    '/en/api/': [
                        {
                            text: 'API List',
                            items: api.en
                        }
                    ]
                },
                socialLinks: [
                    {
                        icon: 'github',
                        link: 'https://github.com/unanmed/HumanBreak'
                    }
                ],
                search: {
                    provider: 'local'
                }
            }
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
