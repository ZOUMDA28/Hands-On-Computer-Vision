"""
为每个 Notebook 在末尾添加：
1. 对应的大学课程参考（Stanford CS231A / CMU 16-385 / MIT 6.801）
2. 高观看量技术文章参考
3. 对应作业题（含答案和解释）
"""
import json
import os
from pathlib import Path

def md_cell(source):
    if isinstance(source, str):
        source = source.split('\n')
        source = [s + '\n' for s in source]
        if source:
            source[-1] = source[-1].rstrip('\n')
    return {"cell_type": "markdown", "metadata": {}, "source": source}

# 每章的参考和作业内容
CHAPTER_REFERENCES = {
    "01-digital-image-acquisition": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| MIT 6.801 L2 | Image Formation, Perspective Projection | 数字图像的物理形成过程、透视投影模型 |
| CMU 16-385 L2 | Image Filtering | 像素矩阵的基本概念与采样量化 |

### 高观看量技术文章

1. [Gamma校正详解](https://blog.csdn.net/linqianbi/article/details/78617615) — 像素归一化→预补偿→反归一化三步流程，γ<1提亮暗部，γ>1压暗亮部
2. [sRGB色彩空间与Gamma校正](https://zh.wikipedia.org/wiki/SRGB) — sRGB标准中的Gamma 2.2曲线
3. [知乎@七月初 - 光的学习笔记](https://zhuanlan.zhihu.com/p/707814472) — 线性与非线性色彩空间的区别""",

        "homework": """## 对应课程作业与解答

### 作业来源：MIT 6.801 Problem Set 1（图像形成与基本操作）

**题目1：ISP管线中的Gamma环节**

> 某相机的ISP管线中，CMOS传感器输出的raw信号经过白平衡→去马赛克→色彩矩阵→Gamma校正→JPEG压缩。已知传感器的RAW数据是线性的（值与光子数成正比），问：

(a) 如果跳过Gamma校正步骤，直接保存为sRGB JPEG，会出现什么视觉问题？
(b) 如果显示器Gamma为2.2，存储时应用了Gamma 1/2.2的预校正，最终人眼看到的亮度是否线性？

**解答：**

(a) 跳过Gamma校正会导致暗部细节严重丢失。因为人眼对暗部变化更敏感（近似对数响应），线性编码在暗部分配的比特太少，导致banding（色带）和暗部灰蒙蒙。

(b) 是的。完整链路：线性RAW → Gamma^(1/2.2)预校正 → 存储 → 显示器Gamma^2.2 → 人眼。最终：$I_{display} = (I_{linear}^{1/2.2})^{2.2} = I_{linear}$，人眼看到近似线性的亮度。

> ★ **关键观察**：Gamma校正不是"让图像变亮"，而是把非线性显示器的物理特性与人眼的对数响应匹配起来，实现"等比例分配码值给各亮度区间"。

**题目2：手写Gamma校正与LUT对比**

> 用三重循环和LUT查表法分别实现Gamma=0.5的校正，比较速度差异。

**解答要点：**
- 三重循环：逐像素计算 $I_{out} = 255 \\times (I_{in}/255)^{2.0}$，速度慢但理解透彻
- LUT：预计算256个值的映射表，查表O(1)，速度快100x+
- 两者MAE应接近0（仅有round/truncate取整差异）

> 参考实现见本Notebook前面的代码单元格。""",
    },

    "02-color-space-conversion": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| CMU 16-385 L5 | Harris Corner Detection | 颜色信息在特征检测中的作用 |
| Stanford CS231A L10 | Low-Level Representations | 颜色作为低级视觉表示 |

### 高观看量技术文章

1. [RGB↔HSV/Lab转换详解](https://blog.csdn.net/yanxing_3/article/details/151065648) — RGB→XYZ→Lab两步转换（含D65白点矩阵），HSV三通道原理
2. [颜色空间转换公式总结](https://zhuanlan.zhihu.com/p/28575595) — 各颜色空间转换公式的完整推导
3. [Color Transfer between Images](https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf) — Reinhard et al.颜色传递算法原始论文""",

        "homework": """## 对应课程作业与解答

### 作业来源：CMU 16-385 Assignment 2（颜色处理）

**题目1：颜色传递算法实现**

> 给定源图像 $S$ 和目标图像 $T$，将 $T$ 的颜色风格传递到 $S$。算法步骤：
> 1. 将两张图转到Lab空间
> 2. 对 $S$ 的每个通道做标准化：$S'_L = (S_L - \\mu_{S_L}) / \\sigma_{S_L}$
> 3. 缩放到目标统计：$S''_L = S'_L \\times \\sigma_{T_L} + \\mu_{T_L}$
> 4. 转回RGB空间

**解答要点：**

```python
# 颜色传递核心代码
def color_transfer(source_img, target_img):
    # RGB -> Lab (手写转换)
    source_lab = rgb_to_lab_manual(source_img)
    target_lab = rgb_to_lab_manual(target_img)
    
    # 逐通道统计迁移
    result_lab = source_lab.copy()
    for ch in range(3):
        s_mean, s_std = source_lab[:,:,ch].mean(), source_lab[:,:,ch].std()
        t_mean, t_std = target_lab[:,:,ch].mean(), target_lab[:,:,ch].std()
        result_lab[:,:,ch] = (source_lab[:,:,ch] - s_mean) / s_std * t_std + t_mean
        result_lab[:,:,ch] = np.clip(result_lab[:,:,ch], 0, 255)
    
    # Lab -> RGB (手写转换)
    return lab_to_rgb_manual(result_lab)
```

> ★ **关键观察**：颜色传递的本质是在Lab空间做"统计量匹配"——让源图像的均值和标准差与目标图像对齐。这和直方图匹配的思想一致，只是从灰度1通道扩展到了Lab 3通道。

**题目2：HSV空间的目标检测**

> 为什么在HSV空间中检测红色物体比在RGB空间更鲁棒？

**解答：** 在HSV空间中，色相H直接编码颜色类型，与亮度V和饱和度S解耦。红色对应H≈0°或360°，只需检查H值范围，不受光照变化影响。而在RGB空间，红色物体的R值会随光照变化，需要复杂的阈值调整。""",
    },

    "03-histogram-processing": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| MIT 6.801 L12 | Binary Image Processing, Blob Analysis | 直方图阈值化的理论基础 |
| CMU 16-385 L2 | Image Filtering | 直方图在图像分析中的应用 |

### 高观看量技术文章

1. [直方图均衡化原理详解](https://blog.csdn.net/qq_15971883/article/details/88699218) — "析分布→算累积→做映射→生结果"四步流程
2. [直方图匹配（规定化）教程](https://zhuanlan.zhihu.com/p/447998562) — 源图CDF和参考图CDF的反向映射
3. [Histogram Equalization - Wikipedia](https://en.wikipedia.org/wiki/Histogram_equalization) — 标准定义和数学推导""",

        "homework": """## 对应课程作业与解答

### 作业来源：MIT 6.801 Problem Set 3（图像统计分析）

**题目1：直方图均衡化的数学推导**

> 给定一幅8位灰度图像，其归一化直方图为 $p_r(k)$，$k=0,1,...,7$。证明直方图均衡化后的输出 $s_k = T(r_k) = \\sum_{j=0}^{k} p_r(j)$ 满足均匀分布。

**证明：**

直方图均衡化的映射函数 $T$ 是累积分布函数（CDF）。由概率论，如果 $X$ 是连续随机变量，$Y = F_X(X)$（其中 $F_X$ 是CDF），则 $Y \\sim U(0,1)$。

对离散情况，$s_k = \\text{round}((L-1) \\cdot \\sum_{j=0}^{k} p_r(j))$，其中 $L=256$。虽然离散情况下不能完全均匀化（因为多个灰度级可能映射到同一输出），但近似均匀化。

**题目2：手算直方图匹配**

> 源图直方图：$p_s = [0.2, 0.3, 0.1, 0.2, 0.2]$（5个灰度级）
> 参考图直方图：$p_t = [0.1, 0.1, 0.3, 0.3, 0.2]$
> 求匹配后的映射表。

**解答：**

步骤1：计算源图CDF
$$S = [0.2, 0.5, 0.6, 0.8, 1.0]$$

步骤2：计算参考图CDF  
$$T = [0.1, 0.2, 0.5, 0.8, 1.0]$$

步骤3：对每个 $S$ 值找最近的 $T$ 值
- $S_0=0.2 → T_1=0.2 →$ 灰度1
- $S_1=0.5 → T_2=0.5 →$ 灰度2  
- $S_2=0.6 → T_3=0.8 →$ 灰度3
- $S_3=0.8 → T_3=0.8 →$ 灰度3
- $S_4=1.0 → T_4=1.0 →$ 灰度4

> ★ **关键观察**：直方图匹配通过"源CDF → 参考CDF的逆映射"实现，本质是将源图的灰度分布拉伸/压缩到目标分布。""",
    },

    "04-image-filtering": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| CMU 16-385 L2 | Image Filtering (卷积、梯度、LoG) | 高斯核、拉普拉斯、DoG |
| MIT 6.801 L2 | Filtering, Derivatives | 导数/积分卷积 |
| Stanford CS231A L10 | Low-Level Representations | 滤波作为低级表示的基础 |

### 高观看量技术文章

1. [高斯滤波与双边滤波详解](https://blog.csdn.net/gitblog_01172/article/details/160298766) — 空间距离权重 vs 空间+灰度双权重对比
2. [双边滤波原理与实现](https://zhuanlan.zhihu.com/p/127815798) — 边缘保持滤波的数学推导
3. [Gaussian Filter - Wikipedia](https://en.wikipedia.org/wiki/Gaussian_blur) — 2D高斯核的数学性质""",

        "homework": """## 对应课程作业与解答

### 作业来源：CMU 16-385 Assignment 2（图像滤波）

**题目1：高斯核的可分离性验证**

> 证明2D高斯核 $G(x,y) = \\frac{1}{2\\pi\\sigma^2}e^{-\\frac{x^2+y^2}{2\\sigma^2}}$ 可以分解为两个1D高斯核的乘积，并计算加速比。

**证明：**

$$G(x,y) = \\frac{1}{2\\pi\\sigma^2}e^{-\\frac{x^2+y^2}{2\\sigma^2}} = \\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{x^2}{2\\sigma^2}} \\cdot \\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{y^2}{2\\sigma^2}} = G_x(x) \\cdot G_y(y)$$

因此 $I * G_{2D} = (I * G_x) * G_y$（先沿x方向卷积，再沿y方向）。

加速比：$k \\times k$ 核从 $k^2$ 次乘加降到 $2k$ 次。对5×5核：25→10，加速2.5倍。

**题目2：双边滤波保边去噪实验**

> 对一张含高斯噪声的图像，分别用高斯滤波和双边滤波处理，比较边缘保持效果。

**解答要点：**

```python
# 双边滤波核心：空间权重 × 灰度权重
def bilateral_filter(image, d=5, sigma_space=1.0, sigma_color=30.0):
    pad = d // 2
    padded = np.pad(image, pad, mode='reflect')
    output = np.zeros_like(image, dtype=np.float64)
    
    for y in range(image.shape[0]):
        for x in range(image.shape[1]):
            region = padded[y:y+d, x:x+d]
            # 空间高斯权重
            gy, gx = np.mgrid[-pad:pad+1, -pad:pad+1]
            w_space = np.exp(-(gx**2 + gy**2) / (2 * sigma_space**2))
            # 灰度高斯权重（中心像素的灰度差）
            w_color = np.exp(-((region - image[y, x])**2) / (2 * sigma_color**2))
            # 联合权重
            weights = w_space * w_color
            output[y, x] = np.sum(region * weights) / np.sum(weights)
    
    return output
```

> ★ **关键观察**：高斯滤波对边缘和噪声同等平滑（"一刀切"），而双边滤波在灰度差大的区域（边缘）自动降低权重，实现"保边去噪"。这就是为什么双边滤波在人像美颜中广泛使用。""",
    },

    "05-feature-extraction": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L9 | Fitting/Matching: RANSAC, Harris, SIFT/HOG | 特征检测与匹配 |
| CMU 16-385 L5 | Harris Corner Detection | 角点检测理论 |
| CMU 16-385 L6 | Feature Descriptors: SIFT, HOG | SIFT描述子 |

### 高观看量技术文章

1. [Canny边缘检测+SIFT完整流程](https://blog.csdn.net/m0_68926749/article/details/154545745) — Canny四步流程+ SIFT六步流程+全景拼接应用
2. [SIFT特征提取详解](https://zhuanlan.zhihu.com/p/80373248) — DoG尺度空间、关键点定位、方向分配、描述子生成
3. [Lowe, "Distinctive Image Features" (2004)](https://www.cs.ubc.ca/~lowe/papers/ijcv04.pdf) — SIFT原始论文""",

        "homework": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 1（特征提取与匹配）

**题目1：Canny边缘检测的五步流程**

> 实现Canny边缘检测的完整流程，解释每一步的作用和参数影响。

**五步流程：**

1. **高斯平滑**：$G_{smooth} = G_{\\sigma} * I$，降低噪声对梯度的影响。$\\sigma$ 越大噪声越小但边缘也越模糊。
2. **梯度计算**：$G_x = \\partial G_{smooth}/\\partial x$，$G_y = \\partial G_{smooth}/\\partial y$，梯度幅值 $|\\nabla G| = \\sqrt{G_x^2+G_y^2}$，方向 $\\theta = \\arctan(G_y/G_x)$
3. **非极大值抑制（NMS）**：沿梯度方向，保留局部最大值。将梯度方向量化为4个方向（0°, 45°, 90°, 135°），对比像素与同方向两邻居，非最大者置零。
4. **双阈值检测**：高阈值 $T_h$ 确定强边缘，低阈值 $T_l$ 连接弱边缘。$T_h/T_l ≈ 2:1$ 到 $3:1$。
5. **滞后连接**：弱边缘只有与强边缘连通时才保留。

> ★ **关键观察**：Canny的核心创新是NMS+双阈值——NMS让边缘变细（1像素宽），双阈值让边缘连续不断裂。

**题目2：SIFT特征匹配的比率测试**

> 解释Lowe的比率测试（ratio test）：如果最近邻/次近邻距离比 > 0.8，则拒绝该匹配。为什么？

**解答：**

比率测试的核心思想是"好的匹配应该是独一无二的"。如果一个特征点的最近邻和次近邻距离差不多，说明该特征在参考图中不唯一（可能是重复纹理），匹配不可靠。0.8是Lowe经验得出的阈值。

```python
# 比率测试
ratio = dist1 / dist2  # dist1=最近邻距离, dist2=次近邻距离
if ratio < 0.8:
    good_matches.append(match)  # 保留该匹配
```

> 参考：Lowe, "Distinctive Image Features from Scale-Invariant Keypoints", IJCV 2004. [论文链接](https://www.cs.ubc.ca/~lowe/papers/ijcv04.pdf)""",
    },

    "06-geometric-transformation": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L2 | Camera Models | 齐次坐标与投影变换 |
| Stanford CS231A L4 | Single-View Metrology | 仿射与单应变换 |
| CMU 16-385 L8 | DLT + RANSAC（单应矩阵） | 直接线性变换 |

### 高观看量技术文章

1. [仿射变换vs单应变换对比](https://www.cnblogs.com/jimchen1218/p/17983923) — 仿射6自由度保持平行性，单应8自由度保线不保平行
2. [图像几何变换详解](https://zhuanlan.zhihu.com/p/24591737) — 相似/仿射/投影变换的层次关系
3. [Homography - Wikipedia](https://en.wikipedia.org/wiki/Homography) — 单应矩阵的数学定义""",

        "homework": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 1（几何变换与单应）

**题目1：DLT单应矩阵求解**

> 给定4对对应点（每点提供2个方程），用直接线性变换（DLT）求解3×3单应矩阵 $H$。

**DLT推导：**

对每对对应点 $\\mathbf{p}=(x,y,1)^T$ 和 $\\mathbf{p}'=(x',y',1)^T$，有 $\\mathbf{p}' \\times H\\mathbf{p} = 0$，展开为：

$$\\begin{bmatrix} 0 & 0 & 0 & -x & -y & -1 & y'x & y'y & y' \\\\ x & y & 1 & 0 & 0 & 0 & -x'x & -x'y & -x' \\\\ -y'x & -y'y & -y' & x'x & x'y & x' & 0 & 0 & 0 \\end{bmatrix} \\mathbf{h} = 0$$

4对点给出8个独立方程（9个未知数减1个尺度因子），用SVD求解 $\\mathbf{h}$。

```python
def dlt_homography(src_pts, dst_pts):
    # 每对点提供2个方程
    A = []
    for (x, y), (xp, yp) in zip(src_pts, dst_pts):
        A.append([-x, -y, -1, 0, 0, 0, xp*x, xp*y, xp])
        A.append([0, 0, 0, -x, -y, -1, yp*x, yp*y, yp])
    A = np.array(A)
    # SVD: 最小奇异值对应的右奇异向量
    _, _, Vt = np.linalg.svd(A)
    H = Vt[-1].reshape(3, 3)
    return H / H[2, 2]  # 归一化
```

**题目2：反向映射+双线性插值**

> 为什么图像warp要用反向映射（从输出图找输入图）而非正向映射？

**解答：** 正向映射会导致输出图像出现"空洞"（多个输入像素映射到同一输出位置，有些输出位置无输入覆盖）。反向映射遍历输出图的每个像素，反向找到输入图的对应位置（可能不是整数坐标），用插值填充，保证输出图无空洞。

> ★ **关键观察**：反向映射是"先有输出格子再找输入值"，保证输出完整；双线性插值用4个邻居加权平均，比最近邻更平滑。""",
    },

    "07-image-stitching": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L9 | RANSAC, Fitting, Matching | RANSAC鲁棒估计 |
| CMU 16-385 L8 | DLT + RANSAC | 单应矩阵估计与RANSAC |
| Stanford CS131 L5 | RANSAC slide | RANSAC算法详解 |

### 高观看量技术文章

1. [RANSAC与图像拼接详解](https://blog.csdn.net/maxhn0/article/details/159005770) — 随机抽4点→DLT估候选H→内点评分→重估
2. [最小二乘法原理](https://zhuanlan.zhihu.com/p/38107448) — 正规方程$\\mathbf{X}^T\\mathbf{X}\\boldsymbol{\\beta} = \\mathbf{X}^T\\mathbf{y}$的推导
3. [RANSAC - Wikipedia](https://en.wikipedia.org/wiki/Random_sample_consensus) — 标准算法流程与参数选择""",

        "homework": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 1（图像拼接）

**题目1：RANSAC参数计算**

> 用RANSAC估计仿射变换（6参数，需3对点），假设内点率 $w=0.5$，要求成功率 $p=0.99$。求最少迭代次数 $N$。

**解答：**

RANSAC迭代次数公式：$N = \\frac{\\log(1-p)}{\\log(1-w^n)}$

其中 $n=3$（仿射变换最少点数），$w=0.5$，$p=0.99$：

$$N = \\frac{\\log(1-0.99)}{\\log(1-0.5^3)} = \\frac{\\log(0.01)}{\\log(0.875)} = \\frac{-4.605}{-0.1335} ≈ 35$$

所以至少需要35次迭代。

> ★ **关键观察**：内点率越低，需要的RANSAC迭代次数指数级增长。$w=0.5$时35次就够，但 $w=0.2$时需要约573次！

**题目2：线性最小二乘拼接**

> 给定 $n>3$ 对匹配点，用最小二乘求解仿射变换参数 $\\mathbf{A}$（2×3矩阵，6个未知数）。

**解答：**

仿射变换 $\\begin{bmatrix}x'\\\\y'\\end{bmatrix} = \\begin{bmatrix}a_{11}&a_{12}\\\\a_{21}&a_{22}\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix} + \\begin{bmatrix}t_x\\\\t_y\\end{bmatrix}$

写成 $\\mathbf{X}\\boldsymbol{\\beta} = \\mathbf{y}$ 形式，其中 $\\mathbf{X}$ 是 $2n \\times 6$ 矩阵：

```python
def affine_lstsq(src_pts, dst_pts):
    n = len(src_pts)
    X = np.zeros((2*n, 6))
    y = np.zeros(2*n)
    for i, ((x, y_), (xp, yp)) in enumerate(zip(src_pts, dst_pts)):
        X[2*i]   = [x, y_, 0, 0, 1, 0]
        X[2*i+1] = [0, 0, x, y_, 0, 1]
        y[2*i]   = xp
        y[2*i+1] = yp
    # 正规方程: beta = (X^T X)^{-1} X^T y
    beta = np.linalg.lstsq(X, y, rcond=None)[0]
    A = np.array([[beta[0], beta[1], beta[4]],
                  [beta[2], beta[3], beta[5]]])
    return A
```

> 参考：Stanford CS231A [L9 RANSAC slides](http://vision.stanford.edu/teaching/cs131_fall1920/slides/05_ransac.pdf)""",
    },

    "08-camera-calibration": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L2 | Camera Models | 针孔模型、内参外参、畸变 |
| Stanford CS231A L3 | Camera Calibration | 张正友标定、DLT |
| [CS231A PS1](https://web.stanford.edu/class/cs231a/) | Problem Set 1 | 相机标定作业 |

### 参考PDF

- [CS231A Lecture 2: Camera Models](https://stanford.edu/class/cs231a/lectures_2025/lecture2_camera_models.pdf)
- [CS231A Lecture 3: Camera Calibration](https://cvgl.stanford.edu/teaching/cs231a_winter1415/lecture/lecture3_camera_calibration-2_note.pdf)

### 高观看量技术文章

1. [张正友标定完整流程](https://blog.csdn.net/Zlyzjiabjw547479/article/details/146041677) — 棋盘格角点检测→单应H→B矩阵→Cholesky反推内参→非线性优化
2. [相机标定原理详解](https://zhuanlan.zhihu.com/p/24673260) — 从针孔模型到畸变校正
3. [Zhang, "Flexible Camera Calibration" (2000)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr98-71.pdf) — 张正友原始论文""",

        "homework": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 1（相机标定）

**题目1：DLT单应矩阵与内参提取**

> 拍摄$N$张棋盘格图像，每张检测到角点。用DLT求解每张图的单应矩阵$H_i$，然后提取相机内参$K$。

**解答流程：**

步骤1：对每张图，用DLT求$H_i = K[r_1 \\, r_2 \\, t]$（其中$r_1, r_2$是旋转矩阵前两列，$t$是平移）

步骤2：利用$H = K[r_1 \\, r_2 \\, t]$，令$H = K \\cdot R_{ext}$，则$H^{-T} K^{-T} K^{-1} H^{-1} = [r_1 \\, r_2 \\, t]^{-T} [r_1 \\, r_2 \\, t]^{-1}$

定义 $B = K^{-T}K^{-1}$（对称正定，6个独立参数），由$H$的列向量构成约束方程：

$$h_i^T B h_j = 0 \\quad (i \\neq j), \\quad h_i^T B h_i = h_j^T B h_j$$

步骤3：堆叠$N$张图的约束，用SVD求$B$

步骤4：Cholesky分解 $B = K^{-T}K^{-1}$ → 反推$K$

步骤5（非线性优化）：用Levenberg-Marquardt最小化重投影误差

```python
def zhang_calibration(H_list):
    # 步骤2: 构建B的约束方程
    V = []
    for H in H_list:
        h1, h2, h3 = H[:, 0], H[:, 1], H[:, 2]
        # v_12 和 v_11 - v_22
        v12 = _v_ij(h1, h2)
        v11_minus_v22 = _v_ij(h1, h1) - _v_ij(h2, h2)
        V.append(v12)
        V.append(v11_minus_v22)
    V = np.array(V)
    # SVD求B (b = [B11,B12,B22,B13,B23,B33])
    _, _, Vt = np.linalg.svd(V)
    b = Vt[-1]
    B = np.array([[b[0], b[1], b[3]],
                  [b[1], b[2], b[4]],
                  [b[3], b[4], b[5]]])
    # Cholesky: B = K^{-T} K^{-1} -> 恢复K
    # ... (见notebook完整实现)
    return K
```

> ★ **关键观察**：张正友标定的核心洞察是"用平面棋盘格的特殊几何（$Z=0$）将3D标定问题降维为2D单应问题"，然后通过$B=K^{-T}K^{-1}$的代数约束闭式求解内参。

**题目2：Rodrigues公式**

> 用Rodrigues公式将旋转向量 $\\mathbf{r}=(r_x, r_y, r_z)$ 转换为旋转矩阵 $R$。

$$R = I + \\frac{\\sin\\theta}{\\theta}[\\mathbf{r}]_\\times + \\frac{1-\\cos\\theta}{\\theta^2}[\\mathbf{r}]_\\times^2$$

其中 $\\theta = |\\mathbf{r}|$，$[\\mathbf{r}]_\\times$ 是反对称矩阵。

> 参考：[Zhang, "Flexible Camera Calibration by Viewing a Plane from Unknown Orientations"](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr98-71.pdf), IEEE TPAMI 2000.""",
    },

    "09-stereo-reconstruction": {
        "course_refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L5 | Epipolar Geometry | 基础矩阵F、本质矩阵E、8点法 |
| Stanford CS231A L6 | Stereo Systems | 三角化、cheirality check |
| Stanford CS231A L7 | Structure from Motion | SfM完整流程 |
| [CS231A PS2](https://web.stanford.edu/class/cs231a/) | Problem Set 2 | 双视图重建作业 |

### 参考PDF

- [CS231A Lecture 5: Epipolar Geometry](https://web.stanford.edu/class/cs231a/lectures/lecture5_epipolar_geometry_2024.pdf)
- [CS231A Lecture 7: SFM](https://web.stanford.edu/class/cs231a/lectures/lecture7_SFM_silvio_2023.pdf)

### 高观看量技术文章

1. [对极几何与三维重建三步法](https://blog.csdn.net/m0_37755875/article/details/146854834) — RANSAC剔误匹配→8点法求F→线性三角化
2. [Essential Matrix详解](https://zhuanlan.zhihu.com/p/377792783) — E=[T×]R的推导与分解
3. [Hartley & Zisserman, "Multiple View Geometry"](https://www.robots.ox.ac.uk/~vgg/hzbook/) | [Snavely, "Photo Tourism" (2006)](https://research.microsoft.com/en-us/um/people/hoppe/phototourism/phototourism.pdf)""",

        "homework": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 2（双视图重建）

**题目1：8点法求基础矩阵**

> 给定$N \\geq 8$对匹配点，用8点法求解基础矩阵$F$。

**8点法推导：**

对每对点 $\\mathbf{p}=(u,v,1)^T$ 和 $\\mathbf{p}'=(u',v',1)^T$，对极约束 $\\mathbf{p}'^T F \\mathbf{p} = 0$ 展开为：

$$u'u f_{11} + u'v f_{12} + u' f_{13} + v'u f_{21} + v'v f_{22} + v' f_{23} + u f_{31} + v f_{32} + f_{33} = 0$$

写成 $\\mathbf{A}\\mathbf{f} = 0$，$N$ 对点给出 $N$ 个方程，用SVD求$\\mathbf{f}$。

```python
def eight_point_fundamental(pts1, pts2):
    # 归一化（Hartley normalization提高数值稳定性）
    pts1_n, T1 = normalize_points(pts1)
    pts2_n, T2 = normalize_points(pts2)
    
    A = np.zeros((len(pts1), 9))
    for i, ((u, v), (up, vp)) in enumerate(zip(pts1_n, pts2_n)):
        A[i] = [up*u, up*v, up, vp*u, vp*v, vp, u, v, 1]
    
    # SVD: 最小奇异值对应的右奇异向量
    _, _, Vt = np.linalg.svd(A)
    F = Vt[-1].reshape(3, 3)
    
    # 强制秩2约束: F = U diag(s1,s2,0) V^T
    U, S, Vt2 = np.linalg.svd(F)
    S[-1] = 0
    F = U @ np.diag(S) @ Vt2
    
    # 反归一化
    F = T2.T @ F @ T1
    return F / F[2, 2]
```

> ★ **关键观察**：Hartley归一化（将点坐标平移到原点并缩放到平均距离$\\sqrt{2}$）是8点法稳定性的关键。不做归一化时，$A$矩阵条件数很大，SVD数值精度差。

**题目2：本质矩阵分解与cheirality check**

> 从本质矩阵$E$分解出4组$(R, T)$解，用cheirality约束选出正确解。

**四组解推导：**

$E = U \\Sigma V^T$（SVD），则4组解为：
- $(R, T) = (U W V^T, U[:, 2])$
- $(R, T) = (U W V^T, -U[:, 2])$  
- $(R, T) = (U W^T V^T, U[:, 2])$
- $(R, T) = (U W^T V^T, -U[:, 2])$

其中 $W = \\begin{bmatrix}0&-1&0\\\\1&0&0\\\\0&0&1\\end{bmatrix}$

**Cheirality check（正深度约束）：**

对每组$(R, T)$，三角化一对匹配点得到3D点$P$。正确的$(R, T)$应使$P$在两个相机前方（深度$Z>0$）。选择使最多点深度为正的解。

```python
def decompose_essential(E):
    U, _, Vt = np.linalg.svd(E)
    W = np.array([[0, -1, 0], [1, 0, 0], [0, 0, 1]])
    
    solutions = [
        (U @ W @ Vt,  U[:, 2]),
        (U @ W @ Vt, -U[:, 2]),
        (U @ W.T @ Vt,  U[:, 2]),
        (U @ W.T @ Vt, -U[:, 2]),
    ]
    
    # Cheirality check: 选使三角化点深度为正的解
    best_count = -1
    best_sol = None
    for R, T in solutions:
        count = 0
        for p1, p2 in zip(pts1, pts2):
            P = triangulate(p1, p2, R, T)
            if P[2] > 0:  # 正深度
                count += 1
        if count > best_count:
            best_count = count
            best_sol = (R, T)
    return best_sol
```

> 参考：[CS231A Lecture 5: Epipolar Geometry](https://web.stanford.edu/class/cs231a/lectures/lecture5_epipolar_geometry_2024.pdf) | [Hartley & Zisserman, MVG Ch.9-11](https://www.robots.ox.ac.uk/~vgg/hzbook/)

**题目3：线性三角化**

> 给定两视图匹配点和相机参数，用线性SVD三角化求3D点坐标。

**线性三角化推导：**

$P = \\begin{bmatrix}X\\\\Y\\\\Z\\\\1\\end{bmatrix}$，$P_1 = K_1[R_1|T_1]P$，$P_2 = K_2[R_2|T_2]P$

由 $\\mathbf{x} \\times (P_1 P) = 0$ 和 $\\mathbf{x}' \\times (P_2 P) = 0$ 得到4个线性方程 $A\\mathbf{P} = 0$，SVD求最小奇异值向量。

```python
def triangulate_linear(p1, p2, P1, P2):
    A = np.zeros((4, 4))
    A[0] = p1[0] * P1[2] - P1[0]
    A[1] = p1[1] * P1[2] - P1[1]
    A[2] = p2[0] * P2[2] - P2[0]
    A[3] = p2[1] * P2[2] - P2[1]
    _, _, Vt = np.linalg.svd(A)
    X = Vt[-1]
    return X[:3] / X[3]  # 非齐次化
```

> ★ **关键观察**：三角化是SfM（Structure from Motion）的核心步骤——从2D匹配点"反推"3D坐标。整个SfM流程就是"匹配→F矩阵→E分解→三角化→Bundle Adjustment"的迭代精化。""",
    },
}

def add_references_to_notebook(nb_path):
    """在Notebook末尾添加课程参考和作业"""
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
    
    # 从路径推断章节目录名
    rel = os.path.relpath(nb_path, os.path.dirname(os.path.dirname(nb_path)))
    parts = rel.replace('\\', '/').split('/')
    
    # 找到章节目录名（如 01-digital-image-acquisition）
    chapter_dir = None
    for p in parts:
        if p in CHAPTER_REFERENCES:
            chapter_dir = p
            break
    
    if not chapter_dir:
        return False, "No matching chapter"
    
    # 只给 practice.ipynb 添加（不给 practice_extra 添加）
    basename = os.path.basename(nb_path)
    if 'extra' in basename:
        return False, "Skipping extra notebook"
    
    refs = CHAPTER_REFERENCES[chapter_dir]
    
    # 检查是否已经有参考内容
    existing_text = ''
    for cell in nb['cells']:
        if cell['cell_type'] == 'markdown':
            src = ''.join(cell['source']) if isinstance(cell['source'], list) else cell['source']
            if '课程参考与拓展阅读' in src:
                return False, "Already has references"
    
    # 添加课程参考cell
    nb['cells'].append(md_cell(refs["course_refs"]))
    
    # 添加作业cell
    nb['cells'].append(md_cell(refs["homework"]))
    
    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
    
    return True, f"Added references for {chapter_dir}"

def main():
    base = Path(r'd:\CODE\Hands-On-Computer-Vision\notebooks')
    notebooks = list(base.rglob('*.ipynb'))
    
    added = 0
    skipped = 0
    for nb_path in sorted(notebooks):
        ok, msg = add_references_to_notebook(str(nb_path))
        rel = os.path.relpath(str(nb_path), str(base))
        if ok:
            print(f'  ✓ {rel}: {msg}')
            added += 1
        else:
            print(f'  - {rel}: {msg}')
            skipped += 1
    
    print(f'\nDone: {added} notebooks updated, {skipped} skipped')

if __name__ == '__main__':
    main()
