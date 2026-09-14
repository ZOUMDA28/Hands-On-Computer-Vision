# 计算机视觉基础 — 自学与实践教程

> 华中科技大学 · 软件学院 · 生成智能组内部培训资料（2025.12）

本仓库提供从像素基础到三维重建的**交互式编程实践教程**，包含 9 章 Notebook 和配套的在线教程网站。每个 Notebook 均包含概念推导、手写代码实现、与 OpenCV 的数值对比、结果可视化和练习解答。

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

## 📚 课程大纲（严格遵循导师路线）

### 第一部分：图像处理基础（6 章）

| 章 | 目录 | 手写核心 | 参考课程 |
|:--:|------|----------|----------|
| 1 | 数字图像的获取和表示 | Gamma 校正、灰度化、二值化、翻转、亮度 | Stanford CS231A L1, MIT 6.801 |
| 2 | 颜色空间的转换 | RGB↔HSV、RGB↔Lab、RGB→lαβ、Reinhard 统计量颜色传递 | CMU 16-720A, [Reinhard et al. 2001](https://users.cs.northwestern.edu/~bgooch/PDFs/ColorTransfer.pdf) |
| 3 | 基于直方图统计的处理 | 直方图统计、均衡化、匹配 | MIT 6.801 |
| 4 | 图像滤波 | 高斯核、高斯滤波、双边滤波、均值/中值滤波 | CMU 16-720A, MIT 6.801 |
| 5 | 特征提取 | Canny、SIFT 关键点/描述子/匹配 | Stanford CS231A L9-L10 |
| 6 | 几何变换 | 相似/仿射/单应矩阵、手写 warp | Stanford CS231A L2, CMU 16-720A |

### 第二部分：最优化算法与立体视觉重建（3 章）

| 章 | 目录 | 手写核心 | 参考课程 |
|:--:|------|----------|----------|
| 7 | 图像拼接模型 | 线性最小二乘、RANSAC、仿射/单应拼接 | Stanford CS231A L9 |
| 8 | 相机参数标定 | 单应 DLT、张正友闭式解、Rodrigues、LM 优化 | Stanford CS231A L2-L3 |
| 9 | 立体视觉点云重建 | 8 点法 F、E 分解、cheirality、三角化 | Stanford CS231A L5-L7 |

### 附录（拓展主题）

| 编号 | 目录 | 内容 |
|:--:|------|------|
| A1 | 卷积基础 | 2D 卷积定义、手算验证、可分离滤波、边界处理 |
| A2 | 额外学习主题 | Harris 角点、图像分割、光流、Structure from Motion、深度学习视觉概览 |

> **约定**：每个学习要点对应**一个** `practice.ipynb`，不设多个重复 Notebook。
> 与导师主线关系较远的拓展内容统一收进附录。

---

## 🌐 在线教程网站

本项目包含一个基于 React + Vite 的交互式教程网站，支持：

- **直接渲染 .ipynb 文件** — 无需后端，前端直接解析 Notebook
- **侧边栏目录导航** — 按章节正序排列
- **代码语法高亮** — Python 代码智能高亮
- **数学公式渲染** — KaTeX 渲染 LaTeX 公式
- **浅色/深色主题** — 主题模式切换
- **图片灯箱** — 点击放大查看
- **响应式设计** — 移动端适配

### 本地运行

```bash
cd web
npm install
npm run dev
```

### 构建部署

```bash
cd web
npm run build
# 输出到 ../docs 目录
```

推送到 main 分支即可通过 GitHub Actions 自动部署到 GitHub Pages。

---

## 📂 项目结构

```
Hands-On-Computer-Vision/
├── notebooks/                         # 教程 Notebook（网站内容源）
│   ├── part1-image-processing/        # 第一部分：图像处理基础
│   │   ├── 01-digital-image-acquisition/
│   │   ├── 02-color-space-conversion/
│   │   ├── 03-histogram-processing/
│   │   ├── 04-image-filtering/
│   │   ├── 05-feature-extraction/
│   │   └── 06-geometric-transformation/
│   ├── part2-optimization-3d/         # 第二部分：最优化与立体视觉
│   │   ├── 07-image-stitching/
│   │   ├── 08-camera-calibration/
│   │   └── 09-stereo-reconstruction/
│   └── appendix/                      # 附录：拓展主题
│       ├── A1-convolution-basics/
│       └── A2-additional-topics/
├── web/                               # React + Vite 前端
│   ├── src/
│   │   ├── components/               # React 组件
│   │   ├── data/                     # 数据配置
│   │   ├── hooks/                    # 自定义 Hooks
│   │   ├── styles/                   # 全局样式
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── utils.py                            # 基础设施
├── requirements.txt
└── .github/workflows/deploy.yml       # GitHub Pages 部署
```

---

## 📖 参考来源

### 教材与课程

| 来源 | 说明 |
|------|------|
| [上海交通大学《动手学习计算机视觉》](https://github.com/boyu-ai/Hands-on-CV) | 原始教学 Notebook（第 2~19 章），图片、公式与代码的主要参考 |
| [Stanford CS231A](https://web.stanford.edu/class/cs231a/) | 古典计算机视觉课程，覆盖相机模型、标定、对极几何、立体视觉、SfM |
| [CMU 16-720A](https://vision.cs.cmu.edu/courses.html) | 滤波、特征描述、相机几何、光流、立体匹配 |
| [MIT 6.801](https://ocw.mit.edu/courses/6-801-machine-vision-fall-2000/) | 图像形成物理、二值图像处理、滤波 |
| [UC Berkeley CS280](https://www2.eecs.berkeley.edu/Courses/CS280/) | 图像处理、特征检测、多视图几何 |
| [walkinglabs/modern-llm-notebook](https://github.com/walkinglabs/modern-llm-notebook) | 前端模板参考 |

### 图片、公式与代码来源

- 图片（`lena.jpeg`、`lenaface.jpg`、`chong.png`、`test1.png`、`test2.png`、`stitch1.jpg`、`stitch2.jpg` 等）来自 Hands-on-CV 原始仓库
- 公式推导与实现思路主要参考 Hands-on-CV 原始教学资料
- Gamma 校正公式参考[知乎@七月初《光的学习笔记》](https://zhuanlan.zhihu.com/p/707814472)
- `utils.py` 只提供基础设施（中文路径读写、中文字体、随机种子），不包含任何算法

---

## ⚙️ 环境配置

- Python 3.8+，推荐使用 conda 环境 `llm`：

```bash
conda activate llm
pip install -r requirements.txt
```

- SIFT 需要 `opencv-contrib-python`；如果已在其他环境安装 `opencv-python`，请先卸载后再装 contrib 版。

## 🚀 快速开始

### 运行 Notebook

打开 `notebooks/` 对应章节目录下的 `practice.ipynb`，执行 `Kernel → Restart & Run All`。

### 运行教程网站

```bash
cd web
npm install
npm run dev
```

### 构建

```bash
cd web
npm run build
# 输出到 ../docs 目录
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

---

## 📝 编码规范

1. **手写实现 + 库对比验证**：算法函数自己写，另起验证单元格与 OpenCV/NumPy 结果做 MAE/RMSE 对比
2. **函数化与文档化**：核心逻辑封装为带中文 docstring 的函数
3. **可复现**：统一 `set_random_seed(42)`
4. **中文路径兼容**：统一使用 `utils.cv_imread` / `utils.cv_imwrite`
5. **可视化与算法分离**：`matplotlib` 仅用于显示，不参与算法计算

---

## 🆘 常见问题

- **`No module named 'cv2'`**：确认使用 `llm` 环境并已 `pip install opencv-contrib-python`
- **读图失败**：先运行 Notebook 第一个代码单元格，确认输入图片在章节目录中
- **中文字体显示方框**：`utils.setup_plot_chinese()` 已预置 `SimHei / Microsoft YaHei`
- **SIFT 不可用**：OpenCV 4.x 的 SIFT 在 `opencv-contrib-python` 中
- **网站侧边栏为空**：检查 `notebooks/` 目录是否存在且包含 `.ipynb` 文件

---

## 📄 许可证与致谢

本项目基于 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议，仅限非商业学习使用。

课程内容参考华中科技大学软件学院《计算机视觉》课程体系，并以以下来源作为图片、公式、代码与教学设计的参考：
- 上海交通大学《动手学习计算机视觉》[Hands-on-CV](https://github.com/boyu-ai/Hands-on-CV)
- 斯坦福大学 [CS231A](https://web.stanford.edu/class/cs231a/)
- CMU [16-720A](https://vision.cs.cmu.edu/courses.html)
- MIT [6.801](https://ocw.mit.edu/courses/6-801-machine-vision-fall-2020/)
- UC Berkeley [CS280](https://www2.eecs.berkeley.edu/Courses/CS280/)
