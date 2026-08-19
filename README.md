# 计算机视觉自学与实践

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.0+-5C3EE8?logo=opencv)](https://opencv.org/)
[![NumPy](https://img.shields.io/badge/NumPy-1.18+-013243?logo=numpy)](https://numpy.org/)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37726?logo=jupyter)](https://jupyter.org/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-00A98F)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

本项目围绕计算机视觉核心知识体系，提供从像素基础到立体视觉重建的完整编程实践教程。每个章节均包含**概念详解**、**手写代码实现**和**可视化对比**，帮助你真正吃透每一个算法。

> **核心理念**：能手写的不调库，能推导的不跳过。从零实现 Gamma 校正、颜色空间转换、最小二乘、Levenberg-Marquardt 优化等关键算法。

---

## 📋 目录

- [✨ 项目亮点](#-项目亮点)
- [📚 课程大纲](#-课程大纲)
  - [第一部分：图像处理基础](#第一部分图像处理基础)
  - [第二部分：最优化算法与立体视觉重建](#第二部分最优化算法与立体视觉重建)
  - [第三部分：EXTRA 进阶章节](#第三部分extra-进阶章节)
- [⚙️ 环境配置](#-环境配置)
  - [前置要求](#前置要求)
  - [安装步骤](#安装步骤)
  - [依赖说明](#依赖说明)
- [🚀 快速开始](#-快速开始)
  - [启动 Jupyter Notebook](#启动-jupyter-notebook)
  - [选择章节学习](#选择章节学习)
  - [运行示例](#运行示例)
- [📐 实践规范](#-实践规范)
  - [代码要求](#代码要求)
  - [文件结构](#文件结构)
  - [中文路径兼容](#中文路径兼容)
- [📖 学习路径](#-学习路径)
  - [推荐顺序](#推荐顺序)
  - [扩展练习](#扩展练习)
- [🆘 常见问题](#-常见问题)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

---

## ✨ 项目亮点

| 特性 | 说明 |
|------|------|
| 🧠 **纯手写核心算法** | Gamma 校正、颜色转换、最小二乘、LM 优化等均手写实现 |
| 📝 **概念 + 代码双轨** | 每章包含详细原理推导和对应的手写代码实现 |
| 🖼️ **可视化结果** | 使用 matplotlib 展示处理前后对比、残差分布、3D 点云等 |
| 🔧 **真实场景实践** | 图像拼接、相机标定、立体视觉等均为工程级实践 |
| 🌍 **中文路径兼容** | 内置 `cv_imread` / `cv_imwrite` 函数解决 Windows 中文路径问题 |
| 📦 **零外部数据依赖** | 所有测试图像由程序自动生成，开箱即用 |
| ✏️ **每章练习 + 详解** | 每个 Notebook 末尾包含手写练习题目、完整解决方案和逐步解释 |
| 🔬 **可复现性保证** | 所有 24 个 Notebook 内置固定随机种子（seed=42），确保噪声、RANSAC 等操作结果可复现 |
| 📂 **24 个 Notebook** | 覆盖图像处理、立体视觉、深度学习等 24 个编程实践 Notebook（含 EXTRA 进阶章节） |
| 🖼️ **本地图像零依赖** | 所有测试图像均已本地化，无需联网下载即可开箱运行 |

---

## 📚 课程大纲

### 第一部分：图像处理基础

> 从零开始理解数字图像的本质，掌握像素级操作和经典图像处理算法。

| 章节 | 目录 | 核心内容 | 手写算法 |
|:----:|:-----|:---------|:---------|
| 1 | `数字图像的获取和表示` | 图像读取、像素操作、Gamma 校正 | Gamma 校正（三重循环） |
| 2 | `颜色空间的转换` | RGB/HSV/Lab 空间转换、颜色传递 | RGB↔HSV、RGB↔Lab 转换 |
| 3 | `基于直方图统计的处理` | 直方图计算、直方图均衡化、直方图匹配 | 直方图统计、均衡化、匹配 |
| 4 | `图像滤波` | 高斯滤波、双边滤波原理与实现 | 高斯权重计算、双边滤波 |
| 5 | `特征提取` | Canny 边缘检测、SIFT 特征提取与匹配 | Canny 梯度计算、SIFT 描述子 |
| 6 | `几何变换` | 相似变换、仿射变换、单应变换 | 变换矩阵求解、 warp 实现 |

### 第二部分：最优化算法与立体视觉重建

> 将图像处理知识拓展到三维视觉，理解最优化算法和多视图几何。

| 章节 | 目录 | 核心内容 | 手写算法 |
|:----:|:-----|:---------|:---------|
| 1 | `图像拼接模型` | 线性最小二乘、仿射变换、RANSAC、全景拼接 | 高斯消元解最小二乘 |
| 2 | `相机参数标定` | 针孔模型、张氏标定法、LM 非线性优化 | LM 算法、重投影误差 |
| 3 | `立体视觉点云重建` | SFM 流程、本质矩阵分解、三角化 | SVD 分解 E、线性三角化 |

### 第三部分：EXTRA 进阶章节

> 拓展计算机视觉的前沿主题，涵盖传统算法与深度学习方法。

| 章节 | 目录 | 核心内容 |
|:----:|:-----|:---------|
| 1 | `卷积` | 图像卷积操作的手写实现与深入理解 |
| 2 | `模板匹配` | 基于模板的图像匹配算法（SAD/SSD/NCC） |
| 3 | `图像分割` | 阈值分割、区域生长、图割算法 |
| 4 | `图像分类` | 词袋模型、ResNet、深度学习分类 |
| 5 | `语义分割` | 基于深度学习的像素级语义分割 |
| 6 | `目标检测` | 现代目标检测算法（R-CNN、YOLO、SSD） |
| 7 | `实例分割` | Mask R-CNN 等实例分割算法 |
| 8 | `人体姿态估计` | OpenPose、HRNet 等姿态估计模型 |
| 9 | `动作识别` | 视频动作识别（双流网络、3D CNN） |
| 10 | `光流和运动场` | 稀疏光流、稠密光流计算与运动分析 |

> **📌 每章均包含**：原有内容（来自 Hands-on-CV-main）+ 手写练习 + 完整解决方案 + 详细代码解释

---

## ⚙️ 环境配置

### 前置要求

- **操作系统**：Windows 10/11（本项目在 Windows 下开发测试）
- **Python**：3.8 或更高版本
- **包管理器**：Conda（推荐）或 pip

### 安装步骤

**方式一：Conda 虚拟环境（推荐）**

```bash
# 1. 创建虚拟环境
conda create -n llm python=3.8 -y

# 2. 激活环境
conda activate llm

# 3. 安装核心依赖（含 SIFT 支持）
pip install opencv-contrib-python numpy matplotlib jupyter Pillow

# 4. （可选）安装扩展依赖
pip install scipy scikit-learn

# 5. （可选）安装深度学习依赖（EXTRA 进阶章节）
pip install torch torchvision
```

**方式二：pip 直接安装**

```bash
# 基础功能（不含 SIFT）
pip install opencv-python numpy matplotlib jupyter Pillow

# 含 SIFT 支持（推荐）
pip install opencv-contrib-python numpy matplotlib jupyter Pillow
```

### 依赖说明

| 包名 | 版本要求 | 用途 | 必要性 |
|------|:--------:|------|:------:|
| `opencv-python` | ≥ 4.0 | 图像读写、基础函数 | 必需 |
| `opencv-contrib-python` | ≥ 4.0 | SIFT/SURF 等特征提取（替代 `opencv-python`） | SIFT 章节必需 |
| `numpy` | ≥ 1.18 | 矩阵运算、数据处理 | 必需 |
| `matplotlib` | ≥ 3.0 | 结果可视化 | 必需 |
| `jupyter` | ≥ 1.0 | Notebook 运行环境 | 必需 |
| `scipy` | ≥ 1.5 | 科学计算（扩展练习用） | 可选 |
| `scikit-learn` | ≥ 0.24 | 机器学习（扩展练习用） | 可选 |
| `torch` | ≥ 1.9 | 深度学习（EXTRA 进阶章节） | EXTRA-DL 章节必需 |
| `torchvision` | ≥ 0.10 | 视觉模型库（EXTRA 进阶章节） | EXTRA-DL 章节必需 |
| `Pillow` | ≥ 8.0 | 图像基础处理 | EXTRA 章节必需 |

> **⚠️ 重要**：SIFT 在 OpenCV 4.x 中已移至 `contrib` 模块。如需运行特征提取、图像拼接、立体视觉等章节，必须安装 `opencv-contrib-python` 替代 `opencv-python`。

> **📌 EXTRA 深度学习章节**：图像分类、语义分割、目标检测、实例分割、人体姿态估计、动作识别等章节依赖 PyTorch。建议在 CUDA 环境下运行以加速模型训练。

---

## 🚀 快速开始

### 启动 Jupyter Notebook

```bash
# 确保已激活虚拟环境
conda activate llm

# 进入项目目录
cd d:\CODE\Hands-On-Computer-Vision

# 启动 Jupyter
jupyter notebook
```

### 选择章节学习

在浏览器中打开 Jupyter 后，你会看到如下目录结构：

```
Hands-On-Computer-Vision/
├── 图像处理基础/
│   ├── 数字图像的获取和表示/
│   │   └── 编程实践.ipynb  ← 从这里开始
│   ├── 颜色空间的转换/
│   │   └── 编程实践.ipynb
│   ├── 基于直方图统计的处理/
│   │   └── 编程实践.ipynb
│   ├── 图像滤波/
│   │   ├── 编程实践.ipynb
│   │   └── 编程实践_补充.ipynb
│   ├── 特征提取/
│   │   ├── 编程实践.ipynb
│   │   └── 编程实践_补充.ipynb
│   └── 几何变换/
│       └── 编程实践.ipynb
├── 最优化算法与立体视觉重建/
│   ├── 图像拼接模型/
│   │   ├── 编程实践.ipynb
│   │   └── 编程实践_补充.ipynb
│   ├── 相机参数标定/
│   │   ├── 编程实践.ipynb
│   │   └── 编程实践_补充.ipynb
│   └── 立体视觉点云重建/
│       ├── 编程实践.ipynb
│       └── 编程实践_补充.ipynb
└── EXTRA/                          ← 进阶章节
    ├── 卷积/
    │   └── 编程实践_补充.ipynb
    ├── 模板匹配/
    │   └── 编程实践_补充.ipynb
    ├── 图像分割/
    │   └── 编程实践_补充.ipynb
    ├── 图像分类/
    │   └── 编程实践_补充.ipynb
    ├── 语义分割/
    │   └── 编程实践_补充.ipynb
    ├── 目标检测/
    │   └── 编程实践_补充.ipynb
    ├── 实例分割/
    │   └── 编程实践_补充.ipynb
    ├── 人体姿态估计/
    │   └── 编程实践_补充.ipynb
    ├── 动作识别/
    │   └── 编程实践_补充.ipynb
    └── 光流和运动场/
        └── 编程实践_补充.ipynb
```

**建议**：从 `图像处理基础/数字图像的获取和表示/编程实践.ipynb` 开始，按顺序学习。

### 运行示例

每个 Notebook 都包含以下结构：

```markdown
# 第X章：XXX算法

## 一、算法原理
[详细的数学推导和概念解释]

## 二、实现要求
[编程任务说明和约束条件]

## 三、代码实现
[分步骤的手写代码，每个 Cell 独立可运行]

## 四、结果分析
[可视化对比和误差分析]

## 五、扩展练习
[思考题和进阶任务]
```

**典型代码示例**（以 Gamma 校正为例）：

```python
# ===== 手写 Gamma 校正 =====
# 原理: output = input^(1/gamma)
# gamma > 1: 图像变亮; gamma < 1: 图像变暗

import cv2
import numpy as np

# 读取图像 (支持中文路径)
def cv_imread(filepath, flags=cv2.IMREAD_COLOR):
    with open(filepath, 'rb') as f:
        buf = np.frombuffer(f.read(), dtype=np.uint8)
    return cv2.imdecode(buf, flags)

img = cv_imread('color_image.jpg')

# 逐像素 Gamma 校正 (三重循环, 全部手写)
h, w, c = img.shape
result = img.copy().astype('float32')

for y in range(h):
    for x in range(w):
        for ch in range(c):
            # 归一化 → Gamma 变换 → 反归一化
            normalized = result[y, x, ch] / 255.0
            corrected = normalized ** (1.0 / 2.2)  # gamma=2.2
            result[y, x, ch] = corrected * 255.0

result = result.astype('uint8')
```

**预期输出**：
- 控制台打印图像尺寸和 Gamma 值
- 显示处理前后对比图
- 保存结果为 `gamma_corrected.jpg`

---

## 📐 实践规范

### 代码要求

每个 Notebook 遵循统一的编程约束：

| 类别 | 允许 | 说明 |
|------|:----:|------|
| 图像读写 | ✅ | 使用 `cv_imread` / `cv_imwrite`（中文路径兼容版） |
| 矩阵运算 | ✅ | 使用 numpy 基础运算（加减乘除、转置等） |
| 特征提取 | ✅ | SIFT/ORB、FLANN 匹配等 OpenCV 函数 |
| 核心算法 | ❌ | **必须手写**：Gamma 校正、颜色转换、最小二乘等 |
| 线性求解 | ✅ | `np.linalg.solve` / `np.linalg.lstsq` 求解线性方程组 |
| SVD 分解 | ✅ | `np.linalg.svd` 用于三角化等场景 |
| 可复现性 | ✅ | 涉及随机操作的代码必须设置随机种子（`random.seed(42)` / `np.random.seed(42)`） |

### 文件结构

每个章节目录包含：

```
章节名/
├── 编程实践.ipynb          # Jupyter Notebook（核心，含练习）
├── 编程实践_补充.ipynb     # 补充 Notebook（来自 Hands-on-CV-main）
├── 测试图像1.jpg           # 运行时自动生成或预生成
├── 测试图像2.jpg           # ...
└── 输出结果.jpg            # 运行 Notebook 后生成
```

> **注意**：`编程实践_补充.ipynb` 包含来自 Hands-on-CV-main 的原始内容和对应的练习题目

### 中文路径兼容

由于 OpenCV 在 Windows 中文路径下会失败，所有 Notebook 内置了兼容函数：

```python
# ===== 中文路径兼容的图像读写函数 =====
def cv_imread(filepath, flags=cv2.IMREAD_COLOR):
    """支持中文路径的图像读取"""
    import numpy as np
    with open(filepath, 'rb') as f:
        buf = np.frombuffer(f.read(), dtype=np.uint8)
    return cv2.imdecode(buf, flags)

def cv_imwrite(filepath, img):
    """支持中文路径的图像写入"""
    ext = os.path.splitext(filepath)[1]
    success, buf = cv2.imencode(ext, img)
    if success:
        with open(filepath, 'wb') as f:
            f.write(buf.tobytes())
        return True
    return False
```

> **注意**：即使你在英文路径下运行，这两个函数也完全兼容，可放心使用。

---

## 📖 学习路径

### 推荐顺序

```
第一部分：图像处理基础
│
├── 第1章：数字图像的获取和表示    ← 入门起点
│   └── Gamma 校正 → 理解像素操作
│
├── 第2章：颜色空间的转换
│   └── RGB↔HSV/Lab → 理解颜色模型
│
├── 第3章：基于直方图统计的处理
│   └── 直方图均衡化/匹配 → 理解灰度分布
│
├── 第4章：图像滤波
│   └── 高斯/双边滤波 → 理解卷积操作
│
├── 第5章：特征提取
│   └── Canny/SIFT → 理解局部特征
│
└── 第6章：几何变换
    └── 相似/仿射/单应 → 理解坐标变换

            ↓ 进阶 ↓

第二部分：最优化算法与立体视觉重建
│
├── 第1章：图像拼接模型
│   └── 最小二乘 + RANSAC → 鲁棒估计
│
├── 第2章：相机参数标定
│   └── 张氏标定 + LM → 非线性优化
│
└── 第3章：立体视觉点云重建
    └── SFM + 三角化 → 三维重建

            ↓ 前沿拓展 ↓

第三部分：EXTRA 进阶章节
│
├── 传统算法（无需深度学习框架）
│   ├── 卷积 → 深入理解卷积操作
│   ├── 模板匹配 → SAD/SSD/NCC 算法
│   ├── 图像分割 → 阈值/区域生长/图割
│   └── 光流和运动场 → 稀疏/稠密光流
│
└── 深度学习方法（需 PyTorch）
    ├── 图像分类 → 词袋模型 + ResNet
    ├── 语义分割 → 像素级语义理解
    ├── 目标检测 → R-CNN/YOLO/SSD
    ├── 实例分割 → Mask R-CNN
    ├── 人体姿态估计 → OpenPose/HRNet
    └── 动作识别 → 双流网络/3D CNN
```

### 扩展练习

每章末尾均提供：

- **思考题**：检验对核心概念的理解
- **编码练习**：将算法应用到新场景
- **进阶任务**：如实现光束法平差、移动端拍摄标定等

---

## 🆘 常见问题

### Q1：运行时报 `ModuleNotFoundError: No module named 'cv2'`

```bash
# 确保在 llm 虚拟环境中
conda activate llm
# 推荐安装 opencv-contrib-python（含 SIFT 支持）
pip install opencv-contrib-python numpy matplotlib
```

### Q2：报 `can't open/read file` 读取图像失败

这是中文路径问题。请确保：
1. Notebook 第一个 Cell 包含 `cv_imread` / `cv_imwrite` 辅助函数
2. 运行第一个 Cell 后再执行后续代码
3. 测试图像已在对应目录中（运行时自动生成）

### Q3：报 `No module named 'cv2'` 但已安装

```bash
# 检查 Python 解释器是否正确
conda run -n llm python -c "import cv2; print(cv2.__version__)"
# 在 Jupyter 中选择 llm 环境作为 Kernel
```

### Q4：中文字体显示为方框

```python
# Notebook 中已预置
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False
```

### Q5：SIFT 无法使用（OpenCV 4.x 版本问题）

SIFT 在 OpenCV 4.x 中已移入 `contrib` 模块：
```bash
pip install opencv-contrib-python
```

### Q6：如何使用自己的图片？

将图片放入对应章节目录，修改 Notebook 中的文件路径即可。所有 `cv_imread` 调用支持相对路径。

### Q7：运行 EXTRA 深度学习章节时报 `ModuleNotFoundError: No module named 'torch'`

EXTRA 进阶章节中的图像分类、语义分割、目标检测等深度学习章节依赖 PyTorch：

```bash
# 安装 PyTorch 和 torchvision
pip install torch torchvision

# 如果有 GPU，可安装 CUDA 版本（速度更快）
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Q8：为什么每次运行结果都不一样？

所有 Notebook 的练习解决方案已内置固定随机种子（`random.seed(42)` / `np.random.seed(42)`），理论上结果应该完全一致。如果出现差异，可能的原因：

1. **未从第一个 Cell 开始运行**：请使用 `Kernel → Restart & Run All` 从头执行
2. **多次执行修改了状态**：Restart Kernel 后重新运行
3. **PyTorch 未设置全局种子**：在 Notebook 开头添加：
   ```python
   import torch
   torch.manual_seed(42)
   ```

### Q9：cv.imread() 在我的系统上可以用，还需要 cv_imread() 吗？

建议始终使用 `cv_imread()` / `cv_imwrite()`，原因：
1. 在 Windows 中文路径下 `cv2.imread()` 会静默返回 `None`
2. `cv_imread()` 在所有平台上行为一致
3. 代码更明确地表达了"图像读写"的意图

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

### 提交 Issue

- 描述清楚遇到的问题或建议
- 附上错误信息和复现步骤
- 如涉及代码，贴出相关片段

### 提交 Pull Request

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 保持代码风格一致（中文注释、有意义的变量名）
4. 确保所有 Notebook 代码可运行
5. 提交 PR 并说明变更内容

### 贡献方向

- 📚 **新增章节**：如目标检测、图像分割、深度学习等
- 🔧 **修复 Bug**：报告的问题修复
- ✨ **优化算法**：更高效的手写实现
- 🌐 **国际化**：英文翻译或多语言支持

---

## 📄 许可证

本项目基于 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可证开放。

**你可以**：
- ✅ 分享、复制、引用本项目内容
- ✅ 以非商业目的使用和学习
- ✅ 在相同许可下改编和分享

**你必须**：
- ✏️ 注明原作者和来源
- 🚫 不得用于商业用途
- 🔄 改编后以相同许可证发布

---

## 致谢

- 课程内容基于华中科技大学软件学院《计算机视觉》课程体系
- 测试图像由程序自动生成，可自由使用
- 所有代码均在 Python 3.8 + OpenCV 5.0 环境下验证通过

---

<div align="center">

**祝学习愉快！** 🎓✨

_从零开始，手写每一个算法，真正掌握计算机视觉_

</div>