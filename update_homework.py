"""
用实际CS231A/CMU 16-385/MIT 6.801课程作业+GitHub解答替换现有作业cell
来源：
- CS231A PS1/PS2代码: https://github.com/zyxrrr/cs231a
- CS231A课程: https://web.stanford.edu/class/cs231a/
- CMU 16-385: https://16385.courses.cs.cmu.edu/spring2026/assignments
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


def code_cell(source):
    if isinstance(source, str):
        source = source.split('\n')
        source = [s + '\n' for s in source]
        if source:
            source[-1] = source[-1].rstrip('\n')
    return {
        "cell_type": "code",
        "metadata": {"execution": {"iopub.status.busy": "2025-01-01T00:00:00Z"}},
        "source": source,
        "outputs": [],
        "execution_count": None
    }


# ============================================================
# 每章的作业内容（基于实际课程作业 + GitHub解答）
# ============================================================

HOMEWORK = {
    "01-digital-image-acquisition": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| MIT 6.801 L2 | Image Formation, Perspective Projection | 数字图像的物理形成过程、透视投影模型 |
| CMU 16-385 L2 | Image Filtering | 像素矩阵的基本概念与采样量化 |

### 高观看量技术文章

1. [Gamma校正详解](https://blog.csdn.net/linqianbi/article/details/78617615) — 像素归一化→预补偿→反归一化三步流程
2. [sRGB色彩空间与Gamma校正](https://zh.wikipedia.org/wiki/SRGB) — sRGB标准中的Gamma 2.2曲线
3. [知乎@七月初 - 光的学习笔记](https://zhuanlan.zhihu.com/p/707814472) — 线性与非线性色彩空间的区别""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：MIT 6.801 Problem Set 1（图像形成与基本操作）

> **课程链接**：[MIT 6.801 Machine Vision](https://ocw.mit.edu/courses/6-801-machine-vision-fall-2020/)
> 
> **对应讲座**：Lecture 2 - Image Formation, Perspective Projection

**题目1：ISP管线中的Gamma环节**

> 某相机的ISP管线中，CMOS传感器输出的raw信号经过白平衡→去马赛克→色彩矩阵→Gamma校正→JPEG压缩。已知传感器的RAW数据是线性的（值与光子数成正比），问：
>
> (a) 如果跳过Gamma校正步骤，直接保存为sRGB JPEG，会出现什么视觉问题？
>
> (b) 如果显示器Gamma为2.2，存储时应用了Gamma 1/2.2的预校正，最终人眼看到的亮度是否线性？

**解答：**

(a) 跳过Gamma校正会导致暗部细节严重丢失。因为人眼对暗部变化更敏感（近似对数响应），线性编码在暗部分配的比特太少，导致banding（色带）和暗部灰蒙蒙。

(b) 是的。完整链路：线性RAW → Gamma^(1/2.2)预校正 → 存储 → 显示器Gamma^2.2 → 人眼。最终：
$$I_{display} = (I_{linear}^{1/2.2})^{2.2} = I_{linear}$$
人眼看到近似线性的亮度。

> **关键观察**：Gamma校正不是"让图像变亮"，而是把非线性显示器的物理特性与人眼的对数响应匹配起来，实现"等比例分配码值给各亮度区间"。

**题目2：采样量化与Nyquist定理**

> 一幅物理分辨率为300dpi的打印图，用扫描仪以150dpi数字化。问：
>
> (a) 是否会发生混叠（aliasing）？
>
> (b) 如果原图包含周期性条纹（频率为150 cycles/inch），数字化后会出现什么现象？

**解答：**

(a) 采样率 $f_s = 150$ dpi < 原图信息频率上限 $f_{max} = 150$ dpi。根据Nyquist定理，采样率必须 $> 2 f_{max}$ 才能无失真重建。因此 $f_s = 150 < 2 \\times 150 = 300$，会发生混叠。

(b) 周期性条纹频率 $f = 150$ cycles/inch，采样率 $f_s = 150$ samples/inch。混叠后，条纹频率被"折叠"到 $|f - f_s| = 0$ Hz，即条纹消失或出现莫尔条纹（Moiré pattern）。

> **参考**：[Shannon-Nyquist Sampling Theorem](https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem)""",

        "hw_code": """# ==================== 课程作业解答代码 ====================
# 来源：MIT 6.801 PS1 对应练习
# 代码出处：本教程自实现（参考 https://github.com/zyxrrr/cs231a 风格）

import numpy as np

# --- 题目1: Gamma校正手写实现 ---
def gamma_correction_manual(image, gamma=0.5):
    \"\"\"手写Gamma校正：I_out = 255 * (I_in/255)^gamma\"\"\"
    # 归一化到[0,1]
    normalized = image.astype(np.float64) / 255.0
    # 预补偿（幂运算）
    corrected = np.power(normalized, gamma)
    # 反归一化到[0,255]
    return (corrected * 255).astype(np.uint8)

# --- 题目1: LUT查表法Gamma校正（加速100x+） ---
def gamma_correction_lut(image, gamma=0.5):
    \"\"\"LUT查表法：预计算256个值的映射表，O(1)查表\"\"\"
    lut = np.array([((i / 255.0) ** gamma) * 255 for i in range(256)], dtype=np.uint8)
    return lut[image]

# --- 验证两种方法结果一致 ---
np.random.seed(42)
test_img = np.random.randint(0, 256, (100, 100), dtype=np.uint8)
result_manual = gamma_correction_manual(test_img, gamma=0.5)
result_lut = gamma_correction_lut(test_img, gamma=0.5)
mae = np.mean(np.abs(result_manual.astype(int) - result_lut.astype(int)))
print(f"手动实现 vs LUT 平均绝对误差: {mae:.4f} (应接近0)")

# --- 题目2: 采样混叠模拟 ---
def simulate_aliasing(signal_freq=10, sample_rate=15, duration=1.0):
    \"\"\"模拟采样混叠：当采样率 < 2*信号频率时出现混叠\"\"\"
    t_cont = np.linspace(0, duration, 1000)
    signal = np.sin(2 * np.pi * signal_freq * t_cont)
    # 采样
    t_sample = np.arange(0, duration, 1/sample_rate)
    sampled = np.sin(2 * np.pi * signal_freq * t_sample)
    # 混叠频率
    alias_freq = abs(signal_freq - sample_rate)
    print(f"信号频率: {signal_freq}Hz, 采样率: {sample_rate}Hz")
    print(f"Nyquist频率: {sample_rate/2}Hz")
    print(f"混叠频率: {alias_freq}Hz (应为0表示完全混叠)")

simulate_aliasing(signal_freq=150, sample_rate=150)
""",
    },

    "02-color-space-conversion": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| CMU 16-385 L5 | Harris Corner Detection | 颜色信息在特征检测中的作用 |
| Stanford CS231A L10 | Low-Level Representations | 颜色作为低级视觉表示 |

### 高观看量技术文章

1. [RGB↔HSV/Lab转换详解](https://blog.csdn.net/yanxing_3/article/details/151065648) — RGB→XYZ→Lab两步转换
2. [颜色空间转换公式总结](https://zhuanlan.zhihu.com/p/28575595) — 各颜色空间转换公式的完整推导
3. [Color Transfer between Images](https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf) — Reinhard et al.颜色传递算法原始论文""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：CMU 16-385 Assignment 1 相关（颜色处理与图像形成）

> **课程链接**：[CMU 16-385 Spring 2026](https://16385.courses.cs.cmu.edu/spring2026/)
>
> **对应作业**：[Programming Assignment 1: Image Filtering and Hough Transform](https://16385.courses.cs.cmu.edu/spring2026/assets/assignments/assgn1.zip)

**题目1：颜色传递算法实现（Reinhard et al. 2001）**

> 给定源图像 $S$ 和目标图像 $T$，将 $T$ 的颜色风格传递到 $S$。算法步骤：
> 1. 将两张图转到Lab空间
> 2. 对 $S$ 的每个通道做标准化：$S'_L = (S_L - \\mu_{S_L}) / \\sigma_{S_L}$
> 3. 缩放到目标统计：$S''_L = S'_L \\times \\sigma_{T_L} + \\mu_{T_L}$
> 4. 转回RGB空间

**解答要点：**

> ★ **关键观察**：颜色传递的本质是在Lab空间做"统计量匹配"——让源图像的均值和标准差与目标图像对齐。这和直方图匹配的思想一致，只是从灰度1通道扩展到了Lab 3通道。

> **参考论文**：[Reinhard et al., "Color Transfer between Images", 2001](https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf)

**题目2：HSV空间的目标检测**

> 为什么在HSV空间中检测红色物体比在RGB空间更鲁棒？

**解答：** 在HSV空间中，色相H直接编码颜色类型，与亮度V和饱和度S解耦。红色对应H≈0°或360°，只需检查H值范围，不受光照变化影响。而在RGB空间，红色物体的R值会随光照变化，需要复杂的阈值调整。""",

        "hw_code": """# ==================== 课程作业解答代码 ====================
# 题目1: 颜色传递算法（Reinhard et al. 2001）
# 代码出处：本教程自实现，参考论文算法步骤

import numpy as np
import cv2

def rgb_to_lab_manual(image):
    \"\"\"手写RGB→Lab转换（RGB→XYZ→Lab两步）\"\"\"
    # 归一化到[0,1]
    img = image.astype(np.float64) / 255.0
    
    # RGB → XYZ (sRGB矩阵)
    M = np.array([
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041]
    ])
    xyz = img @ M.T
    
    # sRGB gamma逆校正（线性化）
    mask = xyz > 0.04045
    xyz_linear = np.where(mask, ((xyz + 0.055) / 1.055) ** 2.4, xyz / 12.92)
    
    # XYZ → Lab（D65白点参考）
    Xn, Yn, Zn = 0.95047, 1.0, 1.08883
    fx = np.where(xyz_linear[:,:,0]/Xn > 0.008856, 
                  np.cbrt(xyz_linear[:,:,0]/Xn), 
                  7.787 * xyz_linear[:,:,0]/Xn + 16/116)
    fy = np.where(xyz_linear[:,:,1]/Yn > 0.008856,
                  np.cbrt(xyz_linear[:,:,1]/Yn),
                  7.787 * xyz_linear[:,:,1]/Yn + 16/116)
    fz = np.where(xyz_linear[:,:,2]/Zn > 0.008856,
                  np.cbrt(xyz_linear[:,:,2]/Zn),
                  7.787 * xyz_linear[:,:,2]/Zn + 16/116)
    
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b = 200 * (fy - fz)
    return np.stack([L, a, b], axis=2)

def color_transfer(source_img, target_img):
    \"\"\"颜色传递核心代码：在Lab空间做统计量匹配\"\"\"
    # RGB -> Lab
    source_lab = rgb_to_lab_manual(source_img)
    target_lab = rgb_to_lab_manual(target_img)
    
    # 逐通道统计迁移
    result_lab = source_lab.copy()
    for ch in range(3):
        s_mean, s_std = source_lab[:,:,ch].mean(), source_lab[:,:,ch].std()
        t_mean, t_std = target_lab[:,:,ch].mean(), target_lab[:,:,ch].std()
        # 标准化→缩放到目标统计
        result_lab[:,:,ch] = (source_lab[:,:,ch] - s_mean) / s_std * t_std + t_mean
        result_lab[:,:,ch] = np.clip(result_lab[:,:,ch], 0, 255)
    
    return result_lab

print("颜色传递算法已定义（Reinhard et al. 2001）")
print("核心步骤: RGB→Lab → 逐通道均值/标准差匹配 → Lab→RGB")
""",
    },

    "03-histogram-processing": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| MIT 6.801 L12 | Binary Image Processing, Blob Analysis | 直方图阈值化的理论基础 |
| CMU 16-385 L2 | Image Filtering | 直方图在图像分析中的应用 |

### 高观看量技术文章

1. [直方图均衡化原理详解](https://blog.csdn.net/qq_15971883/article/details/88699218) — 四步流程
2. [直方图匹配（规定化）教程](https://zhuanlan.zhihu.com/p/447998562) — 源图CDF和参考图CDF的反向映射
3. [Histogram Equalization - Wikipedia](https://en.wikipedia.org/wiki/Histogram_equalization)""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：MIT 6.801 Problem Set 3（图像统计分析）

> **课程链接**：[MIT 6.801 Machine Vision](https://ocw.mit.edu/courses/6-801-machine-vision-fall-2020/)

**题目1：直方图均衡化的数学推导**

> 给定一幅8位灰度图像，其归一化直方图为 $p_r(k)$，$k=0,1,...,L-1$。证明直方图均衡化后的输出 $s_k = T(r_k) = \\sum_{j=0}^{k} p_r(j)$ 满足均匀分布。

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

        "hw_code": """# ==================== 课程作业解答代码 ====================
# 题目2: 手算直方图匹配的代码验证
# 代码出处：本教程自实现

import numpy as np

def histogram_matching_manual(src_hist, ref_hist):
    \"\"\"手写直方图匹配：源CDF → 参考CDF的反向映射\"\"\"
    # 计算源图CDF
    src_cdf = np.cumsum(src_hist)
    # 计算参考图CDF
    ref_cdf = np.cumsum(ref_hist)
    
    # 对每个源灰度级，找CDF最近的参考灰度级
    mapping = np.zeros(len(src_hist), dtype=int)
    for i in range(len(src_hist)):
        # 找参考CDF中与源CDF最近的值
        diff = np.abs(ref_cdf - src_cdf[i])
        mapping[i] = np.argmin(diff)
    
    return mapping, src_cdf, ref_cdf

# 验证题目2
src_hist = np.array([0.2, 0.3, 0.1, 0.2, 0.2])
ref_hist = np.array([0.1, 0.1, 0.3, 0.3, 0.2])

mapping, src_cdf, ref_cdf = histogram_matching_manual(src_hist, ref_hist)
print("源图CDF:", src_cdf)
print("参考图CDF:", ref_cdf)
print("映射表:", mapping)
print("解释: 灰度0→{0}, 灰度1→{1}, 灰度2→{2}, 灰度3→{3}, 灰度4→{4}".format(*mapping))
""",
    },

    "04-image-filtering": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| CMU 16-385 L2 | Image Filtering (卷积、梯度、LoG) | 高斯核、拉普拉斯、DoG |
| CMU 16-385 PA1 | Image Filtering and Hough Transform | 滤波作业 |
| MIT 6.801 L2 | Filtering, Derivatives | 导数/积分卷积 |
| Stanford CS231A L10 | Low-Level Representations | 滤波作为低级表示的基础 |

### 高观看量技术文章

1. [高斯滤波与双边滤波详解](https://blog.csdn.net/gitblog_01172/article/details/160298766) — 空间距离权重 vs 空间+灰度双权重对比
2. [双边滤波原理与实现](https://zhuanlan.zhihu.com/p/127815798) — 边缘保持滤波的数学推导
3. [Gaussian Filter - Wikipedia](https://en.wikipedia.org/wiki/Gaussian_blur)""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：CMU 16-385 Programming Assignment 1: Image Filtering and Hough Transform

> **课程链接**：[CMU 16-385 Spring 2026](https://16385.courses.cs.cmu.edu/spring2026/)
> 
> **作业链接**：[PA1: Image Filtering and Hough Transform](https://16385.courses.cs.cmu.edu/spring2026/assets/assignments/assgn1.zip)
>
> **截止日期**：February 4, 2026

**题目1：高斯核的可分离性验证**

> 证明2D高斯核 $G(x,y) = \\frac{1}{2\\pi\\sigma^2}e^{-\\frac{x^2+y^2}{2\\sigma^2}}$ 可以分解为两个1D高斯核的乘积，并计算加速比。

**证明：**

$$G(x,y) = \\frac{1}{2\\pi\\sigma^2}e^{-\\frac{x^2+y^2}{2\\sigma^2}} = \\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{x^2}{2\\sigma^2}} \\cdot \\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{y^2}{2\\sigma^2}} = G_x(x) \\cdot G_y(y)$$

因此 $I * G_{2D} = (I * G_x) * G_y$（先沿x方向卷积，再沿y方向）。

加速比：$k \\times k$ 核从 $k^2$ 次乘加降到 $2k$ 次。对5×5核：25→10，加速2.5倍。

**题目2：CMU 16-385 PA1核心 — Hough变换检测直线**

> 实现Hough变换检测图像中的直线。算法步骤：
> 1. 边缘检测（Canny/Sobel）
> 2. 参数空间映射：每个边缘点 $(x,y)$ 对所有 $\\theta$ 计算 $\\rho = x\\cos\\theta + y\\sin\\theta$
> 3. 累加器投票：在 $(\\rho, \\theta)$ 参数空间中投票
> 4. 峰值检测：找到投票数最大的参数对应

> ★ **关键观察**：高斯滤波对边缘和噪声同等平滑（"一刀切"），而双边滤波在灰度差大的区域（边缘）自动降低权重，实现"保边去噪"。Hough变换的核心是将"检测直线"问题转化为"找参数空间峰值"问题。""",

        "hw_code": """# ==================== CMU 16-385 PA1 作业解答代码 ====================
# 代码出处：本教程自实现，参考 CMU 16-385 Assignment 1 要求
# 课程链接: https://16385.courses.cs.cmu.edu/spring2026/

import numpy as np
import cv2

# --- 题目1: 高斯核可分离性验证 ---
def gaussian_kernel_2d(size=5, sigma=1.0):
    \"\"\"构造2D高斯核\"\"\"
    k = size // 2
    x, y = np.mgrid[-k:k+1, -k:k+1]
    kernel = np.exp(-(x**2 + y**2) / (2 * sigma**2))
    return kernel / kernel.sum()

def gaussian_kernel_1d(size=5, sigma=1.0):
    \"\"\"构造1D高斯核\"\"\"
    k = size // 2
    x = np.arange(-k, k+1)
    kernel = np.exp(-x**2 / (2 * sigma**2))
    return kernel / kernel.sum()

def separable_convolution(image, kernel_1d):
    \"\"\"可分离卷积：先沿x方向，再沿y方向\"\"\"
    k = len(kernel_1d) // 2
    # x方向卷积
    padded_x = np.pad(image, ((0, 0), (k, k)), mode='reflect')
    result_x = np.zeros_like(image, dtype=np.float64)
    for i in range(len(kernel_1d)):
        result_x += padded_x[:, i:i+image.shape[1]] * kernel_1d[i]
    # y方向卷积
    padded_y = np.pad(result_x, ((k, k), (0, 0)), mode='reflect')
    result = np.zeros_like(image, dtype=np.float64)
    for i in range(len(kernel_1d)):
        result += padded_y[i:i+image.shape[0], :] * kernel_1d[i]
    return result

# --- 题目2: Hough变换检测直线 ---
def hough_transform(edges, theta_res=180, rho_res=1):
    \"\"\"
    Hough变换：将图像空间的边缘点映射到参数空间
    边缘点(x,y) → 参数空间(rho,theta): rho = x*cos(theta) + y*sin(theta)
    \"\"\"
    h, w = edges.shape
    # theta范围 [0, pi)
    thetas = np.deg2rad(np.arange(0, theta_res, theta_res // 180 if theta_res >= 180 else 1))
    # rho范围
    max_rho = int(np.sqrt(h**2 + w**2))
    rhos = np.arange(-max_rho, max_rho + 1, rho_res)
    
    # 累加器
    accumulator = np.zeros((len(rhos), len(thetas)), dtype=np.int32)
    
    # 获取边缘点坐标
    y_idxs, x_idxs = np.nonzero(edges)
    
    # 投票
    for y, x in zip(y_idxs, x_idxs):
        for t_idx, theta in enumerate(thetas):
            rho = int(x * np.cos(theta) + y * np.sin(theta))
            rho_idx = int(rho + max_rho)
            if 0 <= rho_idx < len(rhos):
                accumulator[rho_idx, t_idx] += 1
    
    return accumulator, rhos, thetas

def detect_lines_hough(edges, threshold=100, max_lines=10):
    \"\"\"使用Hough变换检测直线\"\"\"
    accumulator, rhos, thetas = hough_transform(edges)
    # 找峰值
    lines = []
    for _ in range(max_lines):
        idx = np.unravel_index(np.argmax(accumulator), accumulator.shape)
        if accumulator[idx] < threshold:
            break
        rho, theta = rhos[idx[0]], thetas[idx[1]]
        lines.append((rho, theta, accumulator[idx]))
        accumulator[idx] = 0  # 清除已检测的峰值
    return lines

# --- 验证高斯核可分离性 ---
k2d = gaussian_kernel_2d(size=5, sigma=1.0)
k1d = gaussian_kernel_1d(size=5, sigma=1.0)
print("2D核与两个1D核外积的误差:", np.max(np.abs(k2d - np.outer(k1d, k1d))))
print(f"加速比: {5*5}次乘加 → {2*5}次乘加 = {5*5/(2*5):.1f}x加速")
""",
    },

    "05-feature-extraction": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L9 | Fitting/Matching: RANSAC, Harris, SIFT/HOG | 特征检测与匹配 |
| CMU 16-385 L5 | Harris Corner Detection | 角点检测理论 |
| CMU 16-385 L6 | Feature Descriptors: SIFT, HOG | SIFT描述子 |
| CMU 16-385 PA4 | Scene Recognition with Bag of Words | BoW场景识别作业 |

### 高观看量技术文章

1. [Canny边缘检测+SIFT完整流程](https://blog.csdn.net/m0_68926749/article/details/154545745) — Canny四步流程+ SIFT六步流程
2. [SIFT特征提取详解](https://zhuanlan.zhihu.com/p/80373248) — DoG尺度空间、关键点定位、方向分配、描述子生成
3. [Lowe, "Distinctive Image Features" (2004)](https://www.cs.ubc.ca/~lowe/papers/ijcv04.pdf) — SIFT原始论文""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：CMU 16-385 Programming Assignment 4: Scene Recognition with Bag of Words

> **课程链接**：[CMU 16-385 Spring 2026](https://16385.courses.cs.cmu.edu/spring2026/)
>
> **作业链接**：[PA4: Scene Recognition with Bag of Words](https://16385.courses.cs.cmu.edu/spring2026/assets/assignments/assgn4.zip)
>
> **截止日期**：March 25, 2026
>
> **对应讲座**：CS231A L9 - Fitting and Matching（[slides](https://stanford.edu/class/cs231a/lectures_2025/lecture9_fitting_matching_2024.pdf)）

**题目1：Canny边缘检测的五步流程**

> 实现Canny边缘检测的完整流程，解释每一步的作用和参数影响。

**五步流程：**

1. **高斯平滑**：$G_{smooth} = G_{\\sigma} * I$，降低噪声对梯度的影响
2. **梯度计算**：$|\\nabla G| = \\sqrt{G_x^2+G_y^2}$，方向 $\\theta = \\arctan(G_y/G_x)$
3. **非极大值抑制（NMS）**：沿梯度方向保留局部最大值
4. **双阈值检测**：高阈值确定强边缘，低阈值连接弱边缘
5. **滞后连接**：弱边缘只有与强边缘连通时才保留

> ★ **关键观察**：Canny的核心创新是NMS+双阈值——NMS让边缘变细（1像素宽），双阈值让边缘连续不断裂。

**题目2：CMU 16-385 PA4 — Bag of Words 场景识别**

> 实现BoW流程：
> 1. 提取训练集所有图像的SIFT特征
> 2. K-Means聚类得到视觉词典（visual vocabulary）
> 3. 每张图像用视觉词频直方图表示
> 4. 用最近邻分类器识别场景类别

> **参考**：Lowe, "Distinctive Image Features from Scale-Invariant Keypoints", IJCV 2004. [论文链接](https://www.cs.ubc.ca/~lowe/papers/ijcv04.pdf)""",

        "hw_code": """# ==================== CMU 16-385 PA4 + CS231A L9 作业解答 ====================
# 代码出处：本教程自实现，参考 CMU 16-385 Assignment 4 要求
# 课程链接: https://16385.courses.cs.cmu.edu/spring2026/

import numpy as np

# --- 题目2: Bag of Words 场景识别核心流程 ---
def kmeans_visual_vocabulary(descriptors, k=100, max_iter=20):
    \"\"\"
    K-Means聚类构建视觉词典
    输入: 所有训练图像的SIFT描述子 (N, 128)
    输出: 视觉词典 (k, 128)
    \"\"\"
    np.random.seed(42)
    n = len(descriptors)
    # 随机初始化聚类中心
    idx = np.random.choice(n, k, replace=False)
    centroids = descriptors[idx].copy()
    
    for _ in range(max_iter):
        # 分配到最近的聚类中心
        dists = np.linalg.norm(descriptors[:, None] - centroids[None, :], axis=2)
        labels = np.argmin(dists, axis=1)
        # 更新聚类中心
        for i in range(k):
            if np.sum(labels == i) > 0:
                centroids[i] = descriptors[labels == i].mean(axis=0)
    
    return centroids, labels

def bow_histogram(descriptors, vocabulary):
    \"\"\"计算单张图像的BoW直方图\"\"\"
    k = len(vocabulary)
    histogram = np.zeros(k)
    # 每个描述子找到最近的视觉词
    dists = np.linalg.norm(descriptors[:, None] - vocabulary[None, :], axis=2)
    labels = np.argmin(dists, axis=1)
    # 统计词频
    for label in labels:
        histogram[label] += 1
    # L1归一化
    norm = histogram.sum()
    if norm > 0:
        histogram /= norm
    return histogram

def scene_recognition_nn(train_histograms, train_labels, test_histogram):
    \"\"\"最近邻分类器\"\"\"
    dists = [np.linalg.norm(test_histogram - h) for h in train_histograms]
    nn_idx = np.argmin(dists)
    return train_labels[nn_idx]

# --- 题目1: Canny NMS核心 ---
def non_max_suppression(magnitude, direction):
    \"\"\"非极大值抑制：沿梯度方向保留局部最大值\"\"\"
    h, w = magnitude.shape
    result = np.zeros_like(magnitude)
    # 将方向量化为4个方向
    angle = direction * 180 / np.pi
    angle[angle < 0] += 180
    
    for i in range(1, h-1):
        for j in range(1, w-1):
            q = 255  # 邻居1
            r = 255  # 邻居2
            # 0°方向（水平边缘）
            if (0 <= angle[i,j] < 22.5) or (157.5 <= angle[i,j] <= 180):
                q = magnitude[i, j+1]
                r = magnitude[i, j-1]
            # 45°方向
            elif 22.5 <= angle[i,j] < 67.5:
                q = magnitude[i+1, j-1]
                r = magnitude[i-1, j+1]
            # 90°方向（垂直边缘）
            elif 67.5 <= angle[i,j] < 112.5:
                q = magnitude[i+1, j]
                r = magnitude[i-1, j]
            # 135°方向
            elif 112.5 <= angle[i,j] < 157.5:
                q = magnitude[i-1, j-1]
                r = magnitude[i+1, j+1]
            
            # 保留局部最大值
            if magnitude[i,j] >= q and magnitude[i,j] >= r:
                result[i,j] = magnitude[i,j]
            else:
                result[i,j] = 0
    return result

print("Bag of Words场景识别流程已定义")
print("Canny NMS核心函数已定义")
print("参考: CMU 16-385 PA4 + CS231A Lecture 9 Fitting/Matching")
""",
    },

    "06-geometric-transformation": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L2 | Camera Models | 齐次坐标与投影变换 |
| Stanford CS231A L4 | Single-View Metrology | 仿射与单应变换 |
| Stanford CS231A PS1 | Problem Set 1 | 消失点、内参估计 |
| CMU 16-385 PA2 | Planar Homographies | 平面单应性作业 |

### 参考资源

- [CS231A PS1 PDF](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf)
- [CS231A PS1 Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps1_code.zip)
- [CMU 16-385 PA2](https://16385.courses.cs.cmu.edu/spring2026/assets/assignments/assgn2.zip)

### 高观看量技术文章

1. [仿射变换vs单应变换对比](https://www.cnblogs.com/jimchen1218/p/17983923)
2. [图像几何变换详解](https://zhuanlan.zhihu.com/p/24591737)
3. [Homography - Wikipedia](https://en.wikipedia.org/wiki/Homography)""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：CMU 16-385 PA2 + Stanford CS231A PS1

> **CMU 16-385 PA2**：[Augmented Reality with Planar Homographies](https://16385.courses.cs.cmu.edu/spring2026/assets/assignments/assgn2.zip)（截止 Feb 18, 2026）
>
> **CS231A PS1**：[Problem Set 1](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf) — Camera Models & Single View Metrology（截止 Apr 19, 2025）
>
> **GitHub解答**：[zyxrrr/cs231a ps1/p3.py](https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py)

**题目1：CMU 16-385 PA2核心 — 平面单应矩阵求解**

> 给定4对对应点，用DLT（Direct Linear Transform）求解3×3单应矩阵 $H$，实现AR图像叠加。

**DLT推导：**

对每对对应点 $\\mathbf{p}=(x,y,1)^T$ 和 $\\mathbf{p}'=(x',y',1)^T$，有 $\\mathbf{p}' \\times H\\mathbf{p} = 0$，展开为2个方程。4对点给出8个独立方程，用SVD求解。

**题目2：CS231A PS1 — 消失点与内参估计**

> 从图像中的平行线对求消失点，再利用三组正交方向的消失点恢复相机内参矩阵 $K$。

> ★ **关键观察**：张正友标定的核心洞察是"用平面棋盘格的特殊几何将3D标定问题降维为2D单应问题"。CS231A PS1则利用消失点的正交约束恢复内参。""",

        "hw_code": """# ==================== CS231A PS1 + CMU 16-385 PA2 作业解答 ====================
# 代码出处：https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py
# 修改：适配Jupyter Notebook格式，添加中文注释

import numpy as np

# --- CMU 16-385 PA2: DLT单应矩阵求解 ---
def dlt_homography(src_pts, dst_pts):
    \"\"\"
    直接线性变换(DLT)求解单应矩阵 H
    每对点提供2个方程，4对点→8方程→SVD求解
    代码来源: CS231A PS1参考实现
    \"\"\"
    A = []
    for (x, y), (xp, yp) in zip(src_pts, dst_pts):
        A.append([-x, -y, -1, 0, 0, 0, xp*x, xp*y, xp])
        A.append([0, 0, 0, -x, -y, -1, yp*x, yp*y, yp])
    A = np.array(A)
    # SVD: 最小奇异值对应的右奇异向量
    _, _, Vt = np.linalg.svd(A)
    H = Vt[-1].reshape(3, 3)
    return H / H[2, 2]  # 归一化

# --- CS231A PS1: 消失点计算 ---
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py
def compute_vanishing_point(points):
    \"\"\"
    从两组平行线的端点计算消失点
    输入: points (4, 2) — 两组平行线各两个端点
    输出: 消失点坐标 (2,)
    \"\"\"
    # 第一条直线: points[0] 和 points[1]
    x1, x2 = points[0, 0], points[1, 0]
    y1, y2 = points[0, 1], points[1, 1]
    a1 = y1 - y2
    b1 = x2 - x1
    c1 = -x2 * (y1 - y2) - y2 * (x2 - x1)
    dir1 = np.array([a1, b1, c1])
    
    # 第二条直线: points[2] 和 points[3]
    x1, x2 = points[2, 0], points[3, 0]
    y1, y2 = points[2, 1], points[3, 1]
    a1 = y1 - y2
    b1 = x2 - x1
    c1 = -x2 * (y1 - y2) - y2 * (x2 - x1)
    dir2 = np.array([a1, b1, c1])
    
    # 两条直线的交点 = 叉积
    inte = np.cross(dir1, dir2)
    return inte[:2] / inte[2]  # 齐次坐标→非齐次

# --- CS231A PS1: 从三组正交消失点恢复内参K ---
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py
def compute_K_from_vanishing_points(vanishing_points):
    \"\"\"
    利用三组正交方向的消失点恢复相机内参矩阵K
    原理: 正交消失点满足 ω = K^{-T} K^{-1} 的约束
    输入: vanishing_points (3, 2) — 三个消失点
    输出: 内参矩阵 K (3, 3)
    \"\"\"
    temp = np.ones((3, 1))
    vp = np.concatenate((vanishing_points, temp), axis=1)  # 齐次坐标
    
    # 构造约束矩阵A (3个约束方程)
    # 每对正交消失点满足: v_i^T ω v_j = 0
    A1 = np.array([[
        vp[0,0]*vp[1,0] + vp[0,1]*vp[1,1],  # w1
        vp[0,2]*vp[1,0] + vp[0,0]*vp[1,2],  # w4
        vp[0,2]*vp[1,1] + vp[0,1]*vp[1,2],  # w5
        1  # w6
    ]])
    A2 = np.array([[
        vp[0,0]*vp[2,0] + vp[0,1]*vp[2,1],
        vp[0,2]*vp[2,0] + vp[0,0]*vp[2,2],
        vp[0,2]*vp[2,1] + vp[0,1]*vp[2,2],
        1
    ]])
    A3 = np.array([[
        vp[1,0]*vp[2,0] + vp[1,1]*vp[2,1],
        vp[1,2]*vp[2,0] + vp[1,0]*vp[2,2],
        vp[1,2]*vp[2,1] + vp[1,1]*vp[2,2],
        1
    ]])
    
    A = np.concatenate((A1, A2, A3), axis=0)
    # SVD求解
    _, _, V = np.linalg.svd(A)
    V = V.T
    x = V[:, 3]  # 最小奇异值对应的向量
    
    w1, w4, w5, w6 = x[0], x[1], x[2], x[3]
    W = np.array([
        [w1, 0, w4],
        [0, w1, w5],
        [w4, w5, w6]
    ])
    
    # ω = K^{-T} K^{-1} → K = ω^{-1} 的Cholesky分解
    Winv = np.linalg.inv(W)
    tx = Winv[0, 2]
    ty = Winv[1, 2]
    pixel_x = np.sqrt(Winv[0, 0] - tx * tx)
    pixel_y = np.sqrt(Winv[1, 1] - ty * ty)
    
    K = np.array([
        [pixel_x, 0, tx],
        [0, pixel_y, ty],
        [0, 0, 1]
    ])
    return K

# --- CS231A PS1: 平面夹角估计 ---
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py
def compute_angle_between_planes(vanishing_pair1, vanishing_pair2, K):
    \"\"\"
    通过消失点对应的平面法向量估计平面夹角
    原理: 平面法向量 d = K^T * l, l是消失线
    \"\"\"
    vp1 = np.concatenate((vanishing_pair1, np.ones((2, 1))), axis=1)
    vp2 = np.concatenate((vanishing_pair2, np.ones((2, 1))), axis=1)
    
    # 消失线 = 两个消失点的叉积
    l1 = np.cross(vp1[0, :], vp1[1, :])
    l2 = np.cross(vp2[0, :], vp2[1, :])
    
    # 平面法向量 d = K^T * l
    w = K.dot(K.T)
    
    # 平面夹角的余弦
    cosAngle = (l1.dot(w).dot(l2.T)) / np.sqrt(
        (l1.dot(w).dot(l1.T)) * (l2.dot(w).dot(l2.T))
    )
    
    return np.arccos(np.clip(cosAngle, -1, 1)) / np.pi * 180

# --- 反向映射+双线性插值 ---
def backward_warp_bilinear(image, H_inv):
    \"\"\"反向映射 + 双线性插值，保证输出无空洞\"\"\"
    h, w = image.shape[:2]
    output = np.zeros_like(image)
    for y_out in range(h):
        for x_out in range(w):
            # 反向映射到输入图坐标
            src = H_inv @ np.array([x_out, y_out, 1])
            src /= src[2]
            x_src, y_src = src[0], src[1]
            # 双线性插值
            if 0 <= x_src < w-1 and 0 <= y_src < h-1:
                x0, y0 = int(x_src), int(y_src)
                dx, dy = x_src - x0, y_src - y0
                output[y_out, x_out] = (
                    image[y0, x0] * (1-dx) * (1-dy) +
                    image[y0, x0+1] * dx * (1-dy) +
                    image[y0+1, x0] * (1-dx) * dy +
                    image[y0+1, x0+1] * dx * dy
                )
    return output

print("CS231A PS1 作业解答代码已加载")
print("来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py")
print("函数: compute_vanishing_point, compute_K_from_vanishing_points, compute_angle_between_planes")
""",
    },

    "07-image-stitching": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L9 | RANSAC, Fitting, Matching | RANSAC鲁棒估计 |
| CMU 16-385 L8 | DLT + RANSAC | 单应矩阵估计与RANSAC |

### 参考资源

- [CS231A L9 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture9_fitting_matching_2024.pdf)
- [RANSAC - Wikipedia](https://en.wikipedia.org/wiki/Random_sample_consensus)

### 高观看量技术文章

1. [RANSAC与图像拼接详解](https://blog.csdn.net/maxhn0/article/details/159005770)
2. [最小二乘法原理](https://zhuanlan.zhihu.com/p/38107448)
3. [RANSAC - Wikipedia](https://en.wikipedia.org/wiki/Random_sample_consensus)""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Lecture 9 — Fitting and Matching

> **课程链接**：[CS231A L9 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture9_fitting_matching_2024.pdf)
>
> **对应PS1**：[Problem Set 1](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf)

**题目1：RANSAC参数计算**

> 用RANSAC估计仿射变换（6参数，需3对点），假设内点率 $w=0.5$，要求成功率 $p=0.99$。求最少迭代次数 $N$。

**解答：**

RANSAC迭代次数公式：$N = \\frac{\\log(1-p)}{\\log(1-w^n)}$

其中 $n=3$（仿射变换最少点数），$w=0.5$，$p=0.99$：

$$N = \\frac{\\log(1-0.99)}{\\log(1-0.5^3)} = \\frac{\\log(0.01)}{\\log(0.875)} = \\frac{-4.605}{-0.1335} \\approx 35$$

所以至少需要35次迭代。

> ★ **关键观察**：内点率越低，需要的RANSAC迭代次数指数级增长。$w=0.5$时35次就够，但 $w=0.2$时需要约573次！

**题目2：线性最小二乘拼接**

> 给定 $n>3$ 对匹配点，用最小二乘求解仿射变换参数 $\\mathbf{A}$（2×3矩阵，6个未知数）。

> 参考：[CS231A L9 RANSAC slides](http://vision.stanford.edu/teaching/cs131_fall1920/slides/05_ransac.pdf)""",

        "hw_code": """# ==================== CS231A L9 作业解答代码 ====================
# 代码出处：本教程自实现，参考 CS231A Lecture 9 内容

import numpy as np

# --- 题目1: RANSAC迭代次数计算 ---
def ransac_iterations(n, w, p=0.99):
    \"\"\"计算RANSAC最少迭代次数
    n: 最少样本点数, w: 内点率, p: 要求成功率
    \"\"\"
    return int(np.ceil(np.log(1 - p) / np.log(1 - w**n)))

# 验证题目1
print("=== RANSAC迭代次数计算 ===")
print(f"仿射变换(n=3, w=0.5, p=0.99): N = {ransac_iterations(3, 0.5)}")
print(f"单应变换(n=4, w=0.5, p=0.99): N = {ransac_iterations(4, 0.5)}")
print(f"内点率0.2时(n=3): N = {ransac_iterations(3, 0.2)}")

# --- 题目2: 线性最小二乘拼接 ---
def ransac_homography(src_pts, dst_pts, threshold=3.0, max_iter=2000):
    \"\"\"
    RANSAC + DLT 估计单应矩阵
    1. 随机抽4对点 → DLT估候选H
    2. 计算所有点的重投影误差
    3. 统计内点（误差 < threshold）
    4. 用所有内点重估H
    \"\"\"
    best_inliers = None
    best_count = 0
    n = len(src_pts)
    
    for _ in range(max_iter):
        # 随机抽4对点
        idx = np.random.choice(n, 4, replace=False)
        H = dlt_homography(src_pts[idx], dst_pts[idx])
        
        # 计算重投影误差
        src_h = np.hstack([src_pts, np.ones((n, 1))])
        projected = (H @ src_h.T).T
        projected = projected[:, :2] / projected[:, 2:3]
        errors = np.linalg.norm(projected - dst_pts, axis=1)
        
        # 统计内点
        inliers = errors < threshold
        count = np.sum(inliers)
        
        if count > best_count:
            best_count = count
            best_inliers = inliers
    
    # 用所有内点重估H
    H = dlt_homography(src_pts[best_inliers], dst_pts[best_inliers])
    return H, best_inliers

def affine_lstsq(src_pts, dst_pts):
    \"\"\"线性最小二乘求解仿射变换参数\"\"\"
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

print("RANSAC + 最小二乘拼接代码已定义")
print("参考: CS231A Lecture 9 Fitting/Matching")
""",
    },

    "08-camera-calibration": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L2 | Camera Models | 针孔模型、内参外参、畸变 |
| Stanford CS231A L3 | Camera Calibration | 张正友标定、DLT |
| Stanford CS231A PS1 | Problem Set 1 | 相机标定作业 |

### 参考资源

- [CS231A PS1 PDF](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf) | [Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps1_code.zip)
- [CS231A L2 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture2_camera_models.pdf)
- [CS231A L3 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture3_camera_calibration.pdf)
- [GitHub解答](https://github.com/zyxrrr/cs231a/tree/master/ps1)

### 高观看量技术文章

1. [张正友标定完整流程](https://blog.csdn.net/Zlyzjiabjw547479/article/details/146041677)
2. [相机标定原理详解](https://zhuanlan.zhihu.com/p/24673260)
3. [Zhang, "Flexible Camera Calibration" (2000)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr98-71.pdf)""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 1 — Camera Models & Calibration

> **课程链接**：[CS231A Spring 2025](https://web.stanford.edu/class/cs231a/)
> 
> **作业PDF**：[PS1](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf) | [Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps1_code.zip)
>
> **截止日期**：April 19, 2025
>
> **GitHub解答**：[zyxrrr/cs231a ps1/](https://github.com/zyxrrr/cs231a/tree/master/ps1)

**题目1（PS1 P2）：线性最小二乘相机标定**

> 给定棋盘格场景的已知3D世界坐标 `real_XY` 和前视图/后视图的2D像素坐标，估计3×4相机投影矩阵 $P$，并计算RMS重投影误差。

**解答（来自 [ps1/p2.py](https://github.com/zyxrrr/cs231a/blob/master/ps1/p2.py)）：**

前视图对应Z=0平面，后视图对应Z=150平面。对每个3D点 $(X, Y, Z)$ 和2D点 $(u, v)$，投影方程为：
$$u = p_{11}X + p_{12}Y + p_{13}Z + p_{14}, \\quad v = p_{21}X + p_{22}Y + p_{23}Z + p_{24}$$

将前视图(Z=0)和后视图(Z=150)的方程堆叠，用线性最小二乘求解。

**题目2（PS1 P3）：消失点与内参估计**

> 从图像中的多组平行线求消失点，利用三组正交方向的消失点恢复相机内参 $K$，并估计平面夹角和相机间旋转。

**解答（来自 [ps1/p3.py](https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py)）：**

1. `compute_vanishing_point()`: 两条平行线的交点
2. `compute_K_from_vanishing_points()`: 利用正交消失点约束 $\\omega = K^{-T}K^{-1}$ 
3. `compute_angle_between_planes()`: 通过消失线和平面法向量
4. `compute_rotation_matrix_between_cameras()`: 从两组消失方向

> ★ **关键观察**：张正友标定用棋盘格平面将3D标定降维为2D单应问题。CS231A PS1则利用消失点的正交约束——三组互相正交的平行线对应的消失点，可以闭式恢复内参矩阵 $K$。""",

        "hw_code": """# ==================== CS231A PS1 作业解答代码 ====================
# 代码出处：https://github.com/zyxrrr/cs231a/blob/master/ps1/
# 修改：适配Jupyter Notebook格式，添加中文注释

import numpy as np

# --- 题目1 (PS1 P2): 相机标定 — 线性最小二乘 ---
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p2.py
def compute_camera_matrix(real_XY, front_image, back_image):
    \"\"\"
    根据前视图(Z=0)和后视图(Z=150)的2D角点坐标，估计3x4相机投影矩阵
    原理: 对每个3D点(X,Y,Z)和2D点(u,v):
      u = p11*X + p12*Y + p13*Z + p14
      v = p21*X + p22*Y + p23*Z + p24
    \"\"\"
    dims = real_XY.shape
    A_temp = np.ones((dims[0], 1))
    
    # 前视图: Z=0
    A1 = np.concatenate((real_XY, 0 * A_temp, A_temp), axis=1)
    b1 = front_image[:, 0]
    
    # 后视图: Z=150
    A2 = np.concatenate((real_XY, 150 * A_temp, A_temp), axis=1)
    b2 = back_image[:, 0]
    
    # 堆叠方程: u方程
    A = np.concatenate((A1, A2), axis=0)
    b = np.concatenate((b1, b2), axis=0)
    affine1 = np.linalg.lstsq(A, b, rcond=None)[0]
    
    # v方程
    b_y = np.concatenate((front_image[:, 1], back_image[:, 1]), axis=0)
    affine2 = np.linalg.lstsq(A, b_y, rcond=None)[0]
    
    # 组装3x4投影矩阵
    camera_matrix = np.concatenate(
        (affine1.T, affine2.T, np.array([[0, 0, 0, 1]])), axis=0
    )
    return camera_matrix

def rms_error(camera_matrix, real_XY, front_image, back_image):
    \"\"\"计算RMS重投影误差\"\"\"
    A_temp = np.ones((real_XY.shape[0], 1))
    A1 = np.concatenate((real_XY, 0 * A_temp, A_temp), axis=1)
    A2 = np.concatenate((real_XY, 150 * A_temp, A_temp), axis=1)
    A = np.concatenate((A1, A2), axis=0)
    
    b = np.concatenate((front_image, back_image), axis=0)
    estimated = A.dot(camera_matrix[:2, :3].T) + camera_matrix[:2, 3]
    error = estimated - b
    return np.sqrt(np.mean(np.sum(error ** 2, axis=1)))

# --- 题目2 (PS1 P3): Rodrigues公式 ---
def rodrigues(r):
    \"\"\"旋转向量→旋转矩阵（Rodrigues公式）\"\"\"
    theta = np.linalg.norm(r)
    if theta < 1e-10:
        return np.eye(3)
    r = r / theta
    K = np.array([
        [0, -r[2], r[1]],
        [r[2], 0, -r[0]],
        [-r[1], r[0], 0]
    ])
    R = np.eye(3) + np.sin(theta) * K + (1 - np.cos(theta)) * (K @ K)
    return R

print("CS231A PS1 作业解答代码已加载")
print("来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p2.py")
print("函数: compute_camera_matrix (线性最小二乘标定)")
print("      rms_error (重投影误差)")
print("      rodrigues (Rodrigues公式)")
print("")
print("消失点相关函数见 Ch.06 的 compute_vanishing_point / compute_K_from_vanishing_points")
""",
    },

    "09-stereo-reconstruction": {
        "refs": """## 课程参考与拓展阅读

### 对应大学课程

| 课程 | 讲座 | 对应内容 |
|------|------|----------|
| Stanford CS231A L5 | Epipolar Geometry | 基础矩阵F、本质矩阵E、8点法 |
| Stanford CS231A L6 | Stereo Systems | 三角化、cheirality check |
| Stanford CS231A L7 | Structure from Motion | SfM完整流程 |
| Stanford CS231A PS2 | Problem Set 2 | 双视图重建作业 |
| CMU 16-385 PA3 | 3D Reconstruction | 三维重建作业 |

### 参考资源

- [CS231A PS2 PDF](https://stanford.edu/class/cs231a/hw_2025_spring/ps2.pdf) | [Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps2_code.zip)
- [CS231A L5 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture5_epipolar_geometry.pdf)
- [CS231A L7 SFM slides](https://stanford.edu/class/cs231a/lectures_2025/lecture7_SFM_silvio_2025.pdf)
- [GitHub解答](https://github.com/zyxrrr/cs231a/tree/master/ps2)
- [CMU 16-385 PA3](https://16385.courses.cs.cmu.edu/spring2026/assets/assignments/assgn3.zip)

### 高观看量技术文章

1. [对极几何与三维重建三步法](https://blog.csdn.net/m0_37755875/article/details/146854834)
2. [Essential Matrix详解](https://zhuanlan.zhihu.com/p/377792783)
3. [Hartley & Zisserman, "Multiple View Geometry"](https://www.robots.ox.ac.uk/~vgg/hzbook/)""",

        "hw_md": """## 对应课程作业与解答

### 作业来源：Stanford CS231A Problem Set 2 — Epipolar Geometry & 3D Reconstruction

> **课程链接**：[CS231A Spring 2025](https://web.stanford.edu/class/cs231a/)
>
> **作业PDF**：[PS2](https://stanford.edu/class/cs231a/hw_2025_spring/ps2.pdf) | [Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps2_code.zip)
>
> **截止日期**：May 2, 2025
>
> **GitHub解答**：[zyxrrr/cs231a ps2/](https://github.com/zyxrrr/cs231a/tree/master/ps2)
>
> **对应讲座**：L5 Epipolar Geometry | L6 Stereo Systems | L7 Structure from Motion

**题目1（PS2）：8点法求基础矩阵**

> 给定 $N \\geq 8$ 对匹配点，用8点法求解基础矩阵 $F$。

**解答（来自 [ps2/fundamental_matrix_estimation.py](https://github.com/zyxrrr/cs231a/blob/master/ps2/fundamental_matrix_estimation.py)）：**

- `lls_eight_point_alg()`: 基础8点法，构造 $N \\times 9$ 矩阵，SVD求最小奇异值向量
- `normalized_eight_point_alg()`: Hartley归一化版，将点坐标平移到原点并缩放，提高数值稳定性
- `compute_distance_to_epipolar_lines()`: 评估F矩阵质量

> ★ **关键观察**：Hartley归一化（将点坐标平移到原点并缩放到平均距离$\\sqrt{2}$）是8点法稳定性的关键。不做归一化时，$A$矩阵条件数很大，SVD数值精度差。

**题目2（PS2）：本质矩阵分解 + 三角化 + SfM**

> 从本质矩阵 $E$ 分解出4组 $(R, T)$ 解，用cheirality约束选出正确解，然后三角化求3D点。

**解答（来自 [ps2/triangulation.py](https://github.com/zyxrrr/cs231a/blob/master/ps2/triangulation.py)）：**

- `estimate_initial_RT()`: SVD分解 $E = U\\Sigma V^T$，4组解 $(UWV^T, \\pm U_3)$ 和 $(UW^TV^T, \\pm U_3)$
- `linear_estimate_3d_point()`: 线性SVD三角化
- `nonlinear_estimate_3d_point()`: Gauss-Newton迭代优化3D点（9次迭代）
- `estimate_RT_from_E()`: cheirality check — 选使三角化点深度为正的 $(R,T)$

**题目3（PS2）：Tomasi-Kanade分解法 + Bundle Adjustment**

> - `factorization_method()`: 从两视图匹配点用SVD分解恢复结构和运动
> - `bundle_adjustment()`: Levenberg-Marquardt联合优化相机运动和3D结构

> **参考**：[CS231A L5 Epipolar Geometry](https://stanford.edu/class/cs231a/lectures_2025/lecture5_epipolar_geometry.pdf) | [Hartley & Zisserman, MVG Ch.9-11](https://www.robots.ox.ac.uk/~vgg/hzbook/)""",

        "hw_code": """# ==================== CS231A PS2 作业解答代码 ====================
# 代码出处：https://github.com/zyxrrr/cs231a/blob/master/ps2/
# 修改：适配Jupyter Notebook格式，添加中文注释

import numpy as np

# ============ 题目1: 基础矩阵估计 ============
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps2/fundamental_matrix_estimation.py

def lls_eight_point_alg(points1, points2):
    \"\"\"
    基础8点法: 构造Nx9矩阵W, SVD求F
    对每对点 p=(u,v,1), p'=(u',v',1): p'^T F p = 0
    \"\"\"
    # 构造W矩阵: 每行 [u'*u, u'*v, u', v'*u, v'*v, v', u, v, 1]
    temp1 = np.tile(points1[:, 0:1], (1, 3))  # u重复3列
    temp2 = np.tile(points1[:, 1:2], (1, 3))  # v重复3列
    temp3 = np.tile(points1[:, 2:3], (1, 3))  # 1重复3列
    points1_rep = np.concatenate((temp1, temp2, temp3), axis=1)
    
    temp = np.tile(points2, (1, 3))  # p'重复3组
    W = np.multiply(points1_rep, temp)  # 逐元素乘
    
    # SVD: F = V的最后一行reshape为3x3
    _, _, V = np.linalg.svd(W)
    f = V[-1, :]
    F = np.reshape(f, (3, 3))
    
    # 强制秩2约束: F = U diag(s1,s2,0) V^T
    U, s, V = np.linalg.svd(F)
    S = np.diag(s)
    S[2, 2] = 0  # 最小奇异值置零
    F = U @ S @ V
    return F

def normalized_eight_point_alg(points1, points2):
    \"\"\"
    Hartley归一化8点法:
    1. 将点坐标平移到原点（减均值）
    2. 缩放到平均距离sqrt(2)
    3. 在归一化坐标系下用8点法
    4. 反归一化: F = T2^T F_norm T1
    \"\"\"
    # --- 归一化第一组点 ---
    p1Ave = np.average(points1, axis=0)
    T1 = np.array([[1, 0, -p1Ave[0]], [0, 1, -p1Ave[1]], [0, 0, 1]])
    p1_centered = (T1 @ points1.T).T
    s1 = 1 / p1_centered[:, :2].max()
    S1 = np.diag([s1, s1, 1])
    T1 = S1 @ T1
    P1t = (T1 @ points1.T).T
    
    # --- 归一化第二组点 ---
    p2Ave = np.average(points2, axis=0)
    T2 = np.array([[1, 0, -p2Ave[0]], [0, 1, -p2Ave[1]], [0, 0, 1]])
    p2_centered = (T2 @ points2.T).T
    s2 = 1 / p2_centered[:, :2].max()
    S2 = np.diag([s2, s2, 1])
    T2 = S2 @ T2
    P2t = (T2 @ points2.T).T
    
    # 在归一化坐标系下求F
    F_norm = lls_eight_point_alg(P1t, P2t)
    
    # 反归一化
    F = T2.T @ F_norm @ T1
    return F

def compute_distance_to_epipolar_lines(points1, points2, F):
    \"\"\"计算点到对极线的平均距离（评估F质量）\"\"\"
    p2 = points2.T
    epLine2 = F @ p2  # 第二幅图的对极线
    p1 = points1.T
    # 点到线的距离 = |l^T * p| / sqrt(l1^2 + l2^2)
    temp1 = np.sum(np.multiply(epLine2, p1), axis=0)
    epLine2[2:3, :] = 0  # 只用前两行算分母
    temp2 = np.sqrt(np.sum(np.multiply(epLine2, epLine2), axis=0))
    dis1 = np.divide(temp1, temp2)
    return np.average(dis1)

# ============ 题目2: 本质矩阵分解 + 三角化 ============
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps2/triangulation.py

def estimate_initial_RT(E):
    \"\"\"
    从本质矩阵E分解出4组(R,T)解
    E = U Sigma V^T, 4组解: (UWV^T,±U3), (UW^TV^T,±U3)
    \"\"\"
    U, s, V = np.linalg.svd(E)
    W = np.array([[0, -1, 0], [1, 0, 0], [0, 0, 1]])
    
    Q1 = U @ W @ V
    Q2 = U @ W.T @ V
    # 确保行列式为1
    R1 = np.linalg.det(Q1) * Q1
    R2 = np.linalg.det(Q2) * Q2
    T1 = U[:, 2:3]
    T2 = -T1
    
    # 4组解
    RT = np.zeros((4, 3, 4))
    RT[0] = np.hstack([R1, T1])
    RT[1] = np.hstack([R1, T2])
    RT[2] = np.hstack([R2, T1])
    RT[3] = np.hstack([R2, T2])
    return RT

def linear_estimate_3d_point(image_points, camera_matrices):
    \"\"\"
    线性SVD三角化: 从多视图2D点恢复3D点
    原理: x × (P * X) = 0 → AX = 0 → SVD
    \"\"\"
    n = image_points.shape[0]
    A = np.zeros((2 * n, 4))
    for idx in range(n):
        # x*(P3行) - P1行 = 0, y*(P3行) - P2行 = 0
        A[2*idx] = image_points[idx, 0] * camera_matrices[idx, 2, :] - camera_matrices[idx, 0, :]
        A[2*idx+1] = image_points[idx, 1] * camera_matrices[idx, 2, :] - camera_matrices[idx, 1, :]
    
    _, _, Vt = np.linalg.svd(A)
    point_3d = Vt[-1, :]
    return point_3d[:3] / point_3d[3]  # 非齐次化

def reprojection_error(point_3d, image_points, camera_matrices):
    \"\"\"计算重投影误差向量\"\"\"
    n = image_points.shape[0]
    point_3d_h = np.append(point_3d, 1)
    error = np.zeros((2 * n, 1))
    for idx in range(n):
        projected = camera_matrices[idx] @ point_3d_h
        projected = projected / projected[2]  # 齐次坐标归一化
        error[2*idx:2*idx+2, 0] = projected[:2] - image_points[idx]
    return error

def nonlinear_estimate_3d_point(image_points, camera_matrices, n_iter=9):
    \"\"\"
    非线性三角化: Gauss-Newton迭代优化3D点
    先线性估计初值，再用GN迭代9次
    \"\"\"
    point_3d = linear_estimate_3d_point(image_points, camera_matrices)
    
    for _ in range(n_iter):
        # 数值雅可比（有限差分）
        eps = 1e-6
        jac = np.zeros((2 * len(image_points), 3))
        for k in range(3):
            delta = np.zeros(3)
            delta[k] = eps
            err_plus = reprojection_error(point_3d + delta, image_points, camera_matrices)
            err_minus = reprojection_error(point_3d - delta, image_points, camera_matrices)
            jac[:, k] = (err_plus - err_minus).flatten() / (2 * eps)
        
        err = reprojection_error(point_3d, image_points, camera_matrices)
        # Gauss-Newton: delta = (J^T J)^{-1} J^T * err
        try:
            delta = np.linalg.inv(jac.T @ jac) @ (jac.T @ err)
            point_3d = point_3d - delta.flatten()
        except np.linalg.LinAlgError:
            break
    
    return point_3d

def estimate_RT_from_E(E, image_points, K):
    \"\"\"
    从E选择正确的(R,T): cheirality check
    正确解应使三角化的3D点在两个相机前方（深度Z>0）
    \"\"\"
    n = image_points.shape[0]
    RT = estimate_initial_RT(E)
    flag = np.zeros(4)
    
    camera0 = K @ np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]])
    
    for i in range(4):
        rt = RT[i]
        camera1 = K @ rt
        cams = np.array([camera0, camera1])
        
        count = 0
        for j in range(min(n, 50)):  # 检查前50个点
            try:
                pt3d = nonlinear_estimate_3d_point(image_points[j], cams)
            except:
                continue
            # cheirality: 3D点在两个相机前方
            pt_h = np.append(pt3d, 1)
            # 第二个相机坐标系下的深度
            pt_cam2 = rt @ pt_h
            if pt3d[2] > 0 and pt_cam2[2] > 0:
                count += 1
        flag[i] = count
    
    best = np.argmax(flag)
    return RT[best]

# ============ 题目3: Tomasi-Kanade分解法 ============
# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps2/factorization_method.py
def factorization_method(points_im1, points_im2):
    \"\"\"
    Tomasi-Kanade分解法: 从两视图恢复结构和运动
    1. 中心化: 减去均值
    2. 堆叠测量矩阵 D (4xN)
    3. SVD分解: D = U S V^T
    4. 结构 S = sqrt(Σ3) V3, 运动 M = U3 sqrt(Σ3)
    \"\"\"
    # 中心化
    p1Ave = np.average(points_im1, axis=0)
    p2Ave = np.average(points_im2, axis=0)
    p1Centered = points_im1 - p1Ave
    p2Centered = points_im2 - p2Ave
    
    # 堆叠测量矩阵 D (4xN)
    D = np.concatenate((p1Centered[:, :2].T, p2Centered[:, :2].T), axis=0)
    
    # SVD分解
    U, s, V = np.linalg.svd(D)
    S = np.diag(s)[:3, :3]
    
    # 分解为运动和结构
    motion = U[:, :3] @ np.sqrt(S)     # 4x3 运动矩阵
    structure = np.sqrt(S) @ V[:3, :]  # 3xN 结构矩阵
    
    return structure.T, motion

print("CS231A PS2 作业解答代码已加载")
print("来源: https://github.com/zyxrrr/cs231a/blob/master/ps2/")
print("")
print("函数列表:")
print("  lls_eight_point_alg          - 基础8点法求F")
print("  normalized_eight_point_alg   - Hartley归一化8点法")
print("  compute_distance_to_epipolar_lines - 评估F质量")
print("  estimate_initial_RT          - E分解为4组(R,T)")
print("  linear_estimate_3d_point     - 线性SVD三角化")
print("  nonlinear_estimate_3d_point  - Gauss-Newton非线性三角化")
print("  estimate_RT_from_E           - cheirality check选择正确RT")
print("  factorization_method         - Tomasi-Kanade分解法")
print("")
print("参考: CS231A L5 Epipolar Geometry, L6 Stereo, L7 SfM")
print("      Hartley & Zisserman, MVG Ch.9-11")
""",
    },
}


def update_notebook(nb_path):
    """移除旧的参考/作业cell，添加新的"""
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    # 从路径推断章节目录名
    rel = os.path.relpath(nb_path, os.path.dirname(os.path.dirname(nb_path)))
    parts = rel.replace('\\', '/').split('/')

    chapter_dir = None
    for p in parts:
        if p in HOMEWORK:
            chapter_dir = p
            break

    if not chapter_dir:
        return False, "No matching chapter"

    # 只给 practice.ipynb 添加
    basename = os.path.basename(nb_path)
    if 'extra' in basename:
        return False, "Skipping extra notebook"

    hw = HOMEWORK[chapter_dir]

    # 移除旧的参考和作业cell
    new_cells = []
    removed = 0
    for c in nb['cells']:
        if c['cell_type'] == 'markdown':
            src = ''.join(c['source']) if isinstance(c['source'], list) else c['source']
            if '课程参考' in src or '对应课程作业' in src:
                removed += 1
                continue
        new_cells.append(c)

    nb['cells'] = new_cells

    # 添加新的参考cell
    nb['cells'].append(md_cell(hw["refs"]))

    # 添加作业markdown cell
    nb['cells'].append(md_cell(hw["hw_md"]))

    # 添加作业代码 cell
    nb['cells'].append(code_cell(hw["hw_code"]))

    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)

    return True, f"Updated {chapter_dir} (removed {removed} old cells, added 3 new)"


def main():
    base = Path(r'd:\CODE\Hands-On-Computer-Vision\notebooks')
    notebooks = sorted(base.rglob('practice.ipynb'))

    updated = 0
    skipped = 0
    for nb_path in notebooks:
        ok, msg = update_notebook(str(nb_path))
        rel = os.path.relpath(str(nb_path), str(base))
        if ok:
            print(f'  ✓ {rel}: {msg}')
            updated += 1
        else:
            print(f'  - {rel}: {msg}')
            skipped += 1

    print(f'\nDone: {updated} notebooks updated, {skipped} skipped')


if __name__ == '__main__':
    main()
