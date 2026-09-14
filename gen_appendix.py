"""
生成附录 Notebook：
A1-convolution-basics: 卷积基础（2D卷积、可分离滤波、边界处理）
A2-additional-topics: 额外主题（模板匹配、Harris角点、图像分割、光流、SfM）
"""
import json
from pathlib import Path

def md_cell(source):
    if isinstance(source, str):
        source = source.split('\n')
        source = [s + '\n' for s in source]
        if source:
            source[-1] = source[-1].rstrip('\n')
    return {"cell_type": "markdown", "metadata": {}, "source": source}

def code_cell(source):
    cell = md_cell(source)
    cell["cell_type"] = "code"
    cell["execution_count"] = None
    cell["outputs"] = []
    return cell

def build_notebook(cells, kernel="python3"):
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": kernel},
            "language_info": {"name": "python", "version": "3.8"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }

# ============================================================
# 附录A1：卷积基础
# ============================================================
convolution_cells = [
    md_cell("""# 附录A1：卷积基础

> **本节定位**：导师路线的第4章（图像滤波）中已涉及高斯/双边滤波，但未单独展开"卷积"这一核心运算。本附录补充 2D 卷积的定义、性质与手写实现，作为滤波章节的理论基础。
>
> **参考来源**：上海交通大学《动手学习计算机视觉》第 2 章 [boyu-ai/Hands-on-CV](https://github.com/boyu-ai/Hands-on-CV)；Stanford CS231A L10 Low-Level Representations。

## 学习目标

1. 理解 2D 卷积的数学定义与物理含义
2. 区分卷积（convolution）与互相关（correlation）
3. 手写实现 2D 卷积运算
4. 理解可分离滤波器（separable filter）的加速原理
5. 掌握边界处理策略（zero-padding、reflect、constant）

## 一、直觉：卷积是什么

想象你拿一个 3×3 的小窗口（叫**卷积核**）在图像上滑动：

1. 把窗口对准某个像素
2. 将窗口内的 9 个像素值与卷积核的 9 个权重**逐个相乘再求和**
3. 把结果写到输出图像的对应位置
4. 滑动到下一个像素，重复

> **类比**：卷积核就像一个"模板"或"探针"——它在图像上逐位置"探测"局部特征。高斯核探测平滑区域，Sobel 核探测边缘，Laplacian 核探测角点。"""),

    md_cell("""## 二、数学定义

### 2.1 二维卷积

$$
(I * K)(x, y) = \\sum_{i=-a}^{a} \\sum_{j=-b}^{b} I(x-i, y-j) \\cdot K(i, j)
$$

其中 $K$ 是 $(2a+1) \\times (2b+1)$ 的卷积核。

### 2.2 互相关（Cross-Correlation）

$$
(I \\star K)(x, y) = \\sum_{i=-a}^{a} \\sum_{j=-b}^{b} I(x+i, y+j) \\cdot K(i, j)
$$

> ★ **关键区别**：卷积要翻转卷积核（$-i, -j$），互相关不翻转。OpenCV 的 `filter2D` 实际做的是互相关。对于对称核（如高斯核），两者等价。"""),

    md_cell("""### 2.3 手算验证

用 3×3 的均值核 $K = \\frac{1}{9}\\begin{bmatrix}1&1&1\\\\1&1&1\\\\1&1&1\\end{bmatrix}$ 对 3×3 图像 $I = \\begin{bmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{bmatrix}$ 做互相关：

$$
\\text{输出中心} = \\frac{1+2+3+4+5+6+7+8+9}{9} = \\frac{45}{9} = 5
$$

这就是均值滤波——把中心像素替换为邻域平均值。"""),

    code_cell("""# ==================== 手写 2D 卷积 ====================
import numpy as np

def convolve2d(image, kernel, mode='reflect'):
    \"\"\"
    手写 2D 卷积（实际做互相关，与 OpenCV filter2D 一致）

    参数:
        image: 输入灰度图 (H, W)，uint8 或 float
        kernel: 卷积核 (kH, kW)，float
        mode: 边界处理 'reflect'|'constant'|'zero'
    返回:
        输出图像，与输入同尺寸
    \"\"\"
    img = np.asarray(image, dtype=np.float64)
    kH, kW = kernel.shape
    # 确保核尺寸为奇数
    assert kH % 2 == 1 and kW % 2 == 1, "核尺寸必须为奇数"
    pad_h, pad_w = kH // 2, kW // 2

    # 边界填充
    if mode == 'reflect':
        padded = np.pad(img, ((pad_h, pad_h), (pad_w, pad_w)), mode='reflect')
    elif mode == 'constant':
        padded = np.pad(img, ((pad_h, pad_h), (pad_w, pad_w)), mode='constant', constant_values=0)
    else:
        padded = np.pad(img, ((pad_h, pad_h), (pad_w, pad_w)), mode='constant', constant_values=0)

    H, W = img.shape
    output = np.zeros((H, W), dtype=np.float64)

    # 三重循环：逐像素滑动卷积核
    for y in range(H):
        for x in range(W):
            region = padded[y:y+kH, x:x+kW]
            output[y, x] = np.sum(region * kernel)

    return output

# ---------- 手算验证 ----------
test_img = np.array([[1,2,3],[4,5,6],[7,8,9]], dtype=np.float64)
mean_kernel = np.ones((3,3)) / 9.0
result = convolve2d(test_img, mean_kernel, mode='constant')
print(f"中心像素值: {result[1,1]:.4f} (期望: 5.0000)")
assert abs(result[1,1] - 5.0) < 1e-10, "手算验证失败!"
print("✅ 手算验证通过")"""),

    md_cell("""## 三、可分离滤波器

如果卷积核 $K$ 可以分解为两个向量的外积 $K = v \\cdot h^T$，则 2D 卷积可拆成两次 1D 卷积：

$$
I * K = (I * v) * h^T
$$

> ★ **加速效果**：3×3 核从 9 次乘加降到 6 次（3+3）；5×5 核从 25 次降到 10 次。

高斯核天然可分离：$G_{2D}(x,y) = G_x(x) \\cdot G_y(y)$，这是 OpenCV `GaussianBlur` 快的关键原因之一。"""),

    code_cell("""# ==================== 可分离卷积验证 ====================
def gaussian_kernel_1d(size, sigma):
    \"\"\"生成 1D 高斯核\"\"\"
    half = size // 2
    x = np.arange(-half, half + 1)
    k = np.exp(-(x**2) / (2 * sigma**2))
    return k / k.sum()

def gaussian_kernel_2d(size, sigma):
    \"\"\"生成 2D 高斯核\"\"\"
    k1d = gaussian_kernel_1d(size, sigma)
    return np.outer(k1d, k1d)

# 5x5 高斯核
k2d = gaussian_kernel_2d(5, 1.0)
k1d = gaussian_kernel_1d(5, 1.0)

# 方法1：直接 2D 卷积
# 方法2：分两次 1D 卷积
# 两次 1D 卷积的中间结果
import numpy as np
test = np.random.rand(20, 20)
# 直接2D
r_2d = convolve2d(test, k2d, mode='reflect')
# 分离1D: 先对列卷积，再对行卷积
r_sep = convolve2d(test, k1d.reshape(1,-1), mode='reflect')  # 水平
r_sep = convolve2d(r_sep, k1d.reshape(-1,1), mode='reflect')  # 垂直

mae = np.mean(np.abs(r_2d - r_sep))
print(f"2D vs 分离1D 的 MAE: {mae:.2e}")
assert mae < 1e-12, "可分离验证失败!"
print("✅ 可分离滤波器验证通过")"""),

    md_cell("""## 四、边界处理对比

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| zero-padding | 边界补 0 | 通用，但边缘变暗 |
| reflect | 镜像反射 | 自然图像最常用 |
| constant | 补固定值 | 需要特定背景色 |
| wrap | 环绕 | 周期性信号 |

> 在实际工程中，`reflect`（镜像）是最常用的边界处理方式，因为它不会引入人为的亮度跳变。

## 五、与导师路线的关系

| 导师路线章节 | 本附录补充内容 |
|-------------|--------------|
| 第4章：图像滤波 | 卷积是滤波的数学基础；高斯核可分离是快速滤波的关键 |
| 第5章：特征提取 | Sobel 核是卷积；Canny 第一步就是用 Sobel 卷积 |

## 参考来源

1. **上海交通大学《动手学习计算机视觉》第 2 章** — [boyu-ai/Hands-on-CV](https://github.com/boyu-ai/Hands-on-CV)
2. **Stanford CS231A L10** — Low-Level Representations
3. **CMU 16-720A** — Filtering & Warping"""),

    md_cell("""## 练习

1. 实现一个拉普拉斯核 $\\begin{bmatrix}0&1&0\\\\1&-4&1\\\\0&1&0\\end{bmatrix}$ 的卷积，观察输出（提示：拉普拉斯是二阶导数，响应于边缘和角点）。
2. 验证 Sobel 核 $G_x = \\begin{bmatrix}-1&0&1\\\\-2&0&2\\\\-1&0&1\\end{bmatrix}$ 是否可分离（提示：$G_x = [1,2,1]^T \\cdot [-1,0,1]$）。
3. 比较不同边界处理策略对图像边缘 1 像素的影响。"""),
]

# ============================================================
# 附录A2：额外主题概览
# ============================================================
additional_cells = [
    md_cell("""# 附录A2：额外学习主题

> **本节定位**：导师路线的 9 章覆盖了图像处理→几何→三维重建的主线。以下主题在路线之外，但对深入理解计算机视觉很有价值，整理于此作为拓展学习指南。
>
> **参考来源**：上海交通大学《动手学习计算机视觉》[boyu-ai/Hands-on-CV](https://github.com/boyu-ai/Hands-on-CV) 第 4/6/9/17 章；Stanford CS231A L7/L9/L12。

## 学习目标

1. 了解模板匹配、Harris 角点检测、图像分割、光流、SfM 等额外主题
2. 理解它们与导师路线 9 章的关系
3. 获得进一步学习的参考资料和代码入口

---

## 一、模板匹配（Hands-on-CV 第 4 章）

### 直觉
模板匹配就是"拿着小图在大图上滑动找最像的位置"。是最简单的目标检测方法。

### 方法
- **滑动窗口 + NCC/SQDIFF**：逐位置计算模板与局部区域的相似度
- **归一化互相关（NCC）**：对亮度变化更鲁棒

$$
\\text{NCC}(x, y) = \\frac{\\sum_{i,j} (T(i,j) - \\bar{T})(I(x+i, y+j) - \\bar{I}_{xy})}{\\sqrt{\\sum (T-\\bar{T})^2 \\cdot \\sum (I-\\bar{I}_{xy})^2}}
$$

### 与导师路线的关系
- 第5章（特征提取）的 SIFT 匹配是模板匹配的"升级版"——用特征描述子代替原始像素
- 第7章（图像拼接）的特征点匹配也用到相似度度量

### 参考代码
- [boyu-ai/Hands-on-CV 第 4 章](https://github.com/boyu-ai/Hands-on-CV/tree/main/第4章%20模版匹配)
- OpenCV `cv2.matchTemplate`"""),

    md_cell("""## 二、Harris 角点检测（Hands-on-CV 第 6 章）

### 直觉
角点是在两个方向上都有强梯度的点——"不管往哪个方向移动，像素值都会剧烈变化"。

### 原理
1. 计算图像梯度 $I_x, I_y$
2. 构建局部自相关矩阵 $M = \\begin{bmatrix} \\sum I_x^2 & \\sum I_x I_y \\\\ \\sum I_x I_y & \\sum I_y^2 \\end{bmatrix}$
3. 计算角点响应 $R = \\det(M) - k \\cdot \\text{tr}(M)^2$
4. $R > \\text{threshold}$ 的位置为角点

### 与导师路线的关系
- 第5章（特征提取）中 SIFT 的第一步就是 DoG 角点检测
- Harris 角点是更基础的角点检测方法，SIFT 是其改进版

### 参考代码
- [boyu-ai/Hands-on-CV 第 6 章](https://github.com/boyu-ai/Hands-on-CV/tree/main/第6章%20角点检测)
- OpenCV `cv2.cornerHarris`
- 经典论文：Harris & Stephens, "A Combined Corner and Edge Detector", 1988"""),

    md_cell("""## 三、图像分割（Hands-on-CV 第 9 章）

### 直觉
图像分割就是把图像分成若干有意义的区域——"把猫和背景分开"。

### 主要方法

| 方法 | 原理 | 适用场景 |
|------|------|----------|
| 阈值分割 | 按灰度阈值分类 | 简单前景/背景分离 |
| K-Means | 聚类像素颜色 | 颜色相似的区域分割 |
| 分水岭 | 将图像视为地形，"洪水淹没" | 触摸的物体分离 |
| GraphCut | 图论能量最小化 | 交互式分割 |

### 与导师路线的关系
- 第3章（直方图统计）的均衡化可以辅助阈值选择
- 第5章（特征提取）的边缘检测是分割的基础

### 参考代码
- [boyu-ai/Hands-on-CV 第 9 章](https://github.com/boyu-ai/Hands-on-CV/tree/main/第9章%20图像分割)
- Stanford CS231A L9 Fitting/Matching"""),

    md_cell("""## 四、光流（Stanford CS231A L12）

### 直觉
光流是"像素的运动速度场"——视频两帧之间，每个像素移动了多少、往哪个方向。

### 原理
基于**亮度恒定假设**：同一物体点在两帧间亮度不变。

$$
I(x, y, t) = I(x + dx, y + dy, t + dt)
$$

泰勒展开后得到**光流约束方程**：

$$
I_x u + I_y v + I_t = 0
$$

其中 $(u, v)$ 是光流速度，$(I_x, I_y, I_t)$ 是时空梯度。

### 方法
- **Lucas-Kanade（LK）**：假设局部光流恒定，最小二乘求解
- **Horn-Schunck**：全局平滑约束
- **Farneback**：多项式展开（OpenCV 默认）

### 与导师路线的关系
- 第9章（立体视觉）的对极几何与光流密切相关
- 光流是单目相机运动估计的基础

### 参考
- [Stanford CS231A L12 Optical Flow](https://web.stanford.edu/class/cs231a/)
- [boyu-ai/Hands-on-CV 第 17 章 光流和运动场](https://github.com/boyu-ai/Hands-on-CV/tree/main/第17章%20光流和运动场)
- OpenCV `cv2.calcOpticalFlowFarneback`"""),

    md_cell("""## 五、Structure from Motion（Stanford CS231A L7）

### 直觉
SfM 是"从一组 2D 照片重建 3D 结构"——无需知道相机位置，同时估计相机位姿和场景结构。

### 流程
1. 特征提取与匹配（SIFT/ORB）
2. 基础矩阵 F 估计（RANSAC + 8 点法）
3. 本质矩阵 E 分解（相机位姿）
4. 三角化（3D 点云）
5. Bundle Adjustment（全局优化）

### 与导师路线的关系
- 第7章（图像拼接）的特征匹配是 SfM 第一步
- 第8章（相机标定）的内外参概念是 SfM 的基础
- 第9章（立体视觉）的双视图重建是 SfM 的核心步骤
- **SfM = 导师路线第二部分的"集大成者"**

### 参考
- [Stanford CS231A L7 SfM](https://web.stanford.edu/class/cs231a/)
- 经典论文：Snavely et al., "Photo Tourism: Exploring photo collections in 3D", 2006
- [boyu-ai/Hands-on-CV 第 19 章 三维重建](https://github.com/boyu-ai/Hands-on-CV/tree/main/第19章%20三维重建)"""),

    md_cell("""## 六、深度学习视觉概览（拓展视野）

> 导师路线聚焦古典计算机视觉。以下为深度学习方向的入门指引，供拓展视野。

| 任务 | 经典方法 | 论文 |
|------|---------|------|
| 图像分类 | ResNet, ViT | He et al. 2015; Dosovitskiy et al. 2020 |
| 目标检测 | YOLO, Faster R-CNN | Redmon et al. 2016; Ren et al. 2015 |
| 语义分割 | U-Net, DeepLab | Ronneberger et al. 2015; Chen et al. 2017 |
| 实例分割 | Mask R-CNN | He et al. 2017 |
| 姿态估计 | OpenPose, HRNet | Cao et al. 2017; Sun et al. 2019 |

### 参考
- [Stanford CS231N](https://cs231n.stanford.edu/) — 深度学习视觉
- [boyu-ai/Hands-on-CV 第 10-15 章](https://github.com/boyu-ai/Hands-on-CV) — 图像分类到动作识别
- [PyTorch 官方教程](https://pytorch.org/tutorials/)

---

## 参考来源汇总

| 主题 | 教材章节 | 大学课程 | OpenCV 函数 |
|------|---------|---------|------------|
| 模板匹配 | Hands-on-CV 第4章 | Stanford CS231A L9 | `cv2.matchTemplate` |
| Harris角点 | Hands-on-CV 第6章 | - | `cv2.cornerHarris` |
| 图像分割 | Hands-on-CV 第9章 | Stanford CS231A L9 | `cv2.kmeans`, `cv2.watershed` |
| 光流 | Hands-on-CV 第17章 | Stanford CS231A L12 | `cv2.calcOpticalFlowFarneback` |
| SfM | Hands-on-CV 第19章 | Stanford CS231A L7 | `cv2.findFundamentalMat` |
| 深度学习 | Hands-on-CV 第10-15章 | Stanford CS231N | PyTorch / TensorFlow |"""),
]

# Generate notebooks
base = Path(r'd:\CODE\Hands-On-Computer-Vision\notebooks\appendix')

# A1: Convolution
nb1 = build_notebook(convolution_cells)
path1 = base / 'A1-convolution-basics' / 'practice.ipynb'
path1.parent.mkdir(parents=True, exist_ok=True)
path1.write_text(json.dumps(nb1, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'Generated: {path1}')

# A2: Additional topics
nb2 = build_notebook(additional_cells)
path2 = base / 'A2-additional-topics' / 'practice.ipynb'
path2.parent.mkdir(parents=True, exist_ok=True)
path2.write_text(json.dumps(nb2, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'Generated: {path2}')

print(f'\nDone! Generated 2 appendix notebooks.')
