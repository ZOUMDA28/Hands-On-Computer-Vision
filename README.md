# Hands-On Computer Vision - Tutorial Site

计算机视觉自学与实践交互式教程网站。

## 技术栈

- **前端框架**: React 19 + Vite
- **样式**: Tailwind CSS 4
- **数学公式**: KaTeX
- **代码高亮**: highlight.js
- **图标**: lucide-react

## 功能特性

- Jupyter Notebook 直接渲染
- 中英文双语切换
- 侧边栏目录导航
- 右侧大纲导航（TOC）
- 代码语法高亮（Python）
- Markdown 完整渲染
- KaTeX 数学公式
- 浅色/深色主题
- 字号调整
- 笔记和书签功能
- 代码块折叠/展开
- 图片灯箱查看器
- URL hash 路由
- 响应式设计

## 项目结构

```
cv-tutorial-site/
├── notebooks/                    # 中文教程笔记本（.ipynb 文件）
│   ├── part1-image-processing/   # 图像处理基础
│   └── part2-optimization-3d/    # 最优化算法与立体视觉
├── web/                          # React/Vite 前端网站
│   ├── src/
│   │   ├── components/           # React 组件
│   │   ├── data/                 # 数据配置
│   │   ├── hooks/                # 自定义 Hooks
│   │   ├── styles/               # 全局样式
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── .github/workflows/deploy.yml  # GitHub Pages 部署
```

## 开发

```bash
cd web
npm install
npm run dev
```

## 构建

```bash
cd web
npm run build
# 输出到 ../docs 目录
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 许可证

本项目基于 CC BY-NC-SA 4.0 协议，仅限非商业学习使用。
