import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import { DefaultTheme } from 'vitepress';

const langs = ['zh', 'en'];

const sidebarConfigPath = path.resolve('./docs/.vitepress/apiSidebar.ts');

const weight: Record<string, number> = {
    index: 10,
    functions: 5
};

const nameMap: Record<string, Record<string, string>> = {
    zh: {
        index: '主页',
        functions: '函数'
    },
    en: {
        index: 'Main Page',
        functions: 'Functions'
    }
};

function generateSidebar(): void {
    const sidebars: Record<string, DefaultTheme.SidebarItem[]> = {};

    for (const lang of langs) {
        const dir = path.resolve('./docs', lang, 'api');
        const sidebar: DefaultTheme.SidebarItem[] = [
            { text: nameMap[lang]['index'], link: `/${lang}/api/` }
        ];

        // 遍历 api 目录，查找 package 目录
        const packages = fs
            .readdirSync(dir)
            .filter(pkg => fs.statSync(path.join(dir, pkg)).isDirectory());

        packages.forEach(pkg => {
            const pkgPath = path.join(dir, pkg);
            const files = fs
                .readdirSync(pkgPath)
                .filter(file => file.endsWith('.md'));

            const items: DefaultTheme.SidebarItem[] = files.map(file => {
                const filePath = `${lang}/api/${pkg}/${file}`;
                const fileName = path.basename(file, '.md');

                return {
                    text: fileName,
                    link: `/${filePath.replace(/\\/g, '/')}` // 兼容 Windows 路径
                };
            });

            items.sort((a, b) => {
                const titleA = a.text ?? '';
                const titleB = b.text ?? '';
                return (weight[titleB] ?? 0) - (weight[titleA] ?? 0);
            });

            items.forEach(v => {
                if (!v.text) return;
                if (v.text in nameMap[lang]) {
                    v.text = nameMap[lang][v.text];
                }
            });

            sidebar.push({
                text: pkg,
                collapsed: true,
                items
            });

            sidebars[lang] = sidebar;
        });
    }
    // 生成 sidebar.ts
    const sidebarContent = `import { DefaultTheme } from 'vitepress';

export default ${JSON.stringify(
        sidebars,
        null,
        4
    )} as Record<string, DefaultTheme.SidebarItem[]>;`;
    fs.writeFileSync(sidebarConfigPath, sidebarContent);
    console.log('✅ Sidebar 配置已更新');
}

function watch(lang: string) {
    const dir = path.resolve('./docs', lang, 'api');
    // 监听文件变动
    chokidar
        .watch(dir, { ignoreInitial: true })
        .on('add', filePath => {
            console.log(`📄 文件新增: ${filePath}`);
            generateSidebar();
        })
        .on('unlink', filePath => {
            console.log(`❌ 文件删除: ${filePath}`);
            generateSidebar();
        })
        .on('addDir', dirPath => {
            console.log(`📁 目录新增: ${dirPath}`);
            generateSidebar();
        })
        .on('unlinkDir', dirPath => {
            console.log(`📁 目录删除: ${dirPath}`);
            generateSidebar();
        })
        .on('raw', (event, path, details) => {
            if (event === 'rename') {
                console.log(`🔄 文件或文件夹重命名: ${path}`);
                generateSidebar();
            }
        });
}

// 初次运行
generateSidebar();

langs.forEach(v => watch(v));
