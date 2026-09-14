const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "id": "212c7158",\r
   "metadata": {},\r
   "source": [\r
    "# 附录A1：卷积基础\\n",\r
    "\\n",\r
    "> **本节定位**：导师路线的第4章（图像滤波）中已涉及高斯/双边滤波，但未单独展开\\"卷积\\"这一核心运算。本附录补充 2D 卷积的定义、性质与手写实现，作为滤波章节的理论基础。\\n",\r
    ">\\n",\r
    "> **参考来源**：上海交通大学《动手学习计算机视觉》第 2 章 [boyu-ai/Hands-on-CV](https://github.com/boyu-ai/Hands-on-CV)；Stanford CS231A L10 Low-Level Representations。\\n",\r
    "\\n",\r
    "## 学习目标\\n",\r
    "\\n",\r
    "1. 理解 2D 卷积的数学定义与物理含义\\n",\r
    "2. 区分卷积（convolution）与互相关（correlation）\\n",\r
    "3. 手写实现 2D 卷积运算\\n",\r
    "4. 理解可分离滤波器（separable filter）的加速原理\\n",\r
    "5. 掌握边界处理策略（zero-padding、reflect、constant）\\n",\r
    "\\n",\r
    "## 一、直觉：卷积是什么\\n",\r
    "\\n",\r
    "想象你拿一个 3×3 的小窗口（叫**卷积核**）在图像上滑动：\\n",\r
    "\\n",\r
    "1. 把窗口对准某个像素\\n",\r
    "2. 将窗口内的 9 个像素值与卷积核的 9 个权重**逐个相乘再求和**\\n",\r
    "3. 把结果写到输出图像的对应位置\\n",\r
    "4. 滑动到下一个像素，重复\\n",\r
    "\\n",\r
    "> **类比**：卷积核就像一个\\"模板\\"或\\"探针\\"——它在图像上逐位置\\"探测\\"局部特征。高斯核探测平滑区域，Sobel 核探测边缘，Laplacian 核探测角点。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "5a7b2b74",\r
   "metadata": {},\r
   "source": [\r
    "## 二、数学定义\\n",\r
    "\\n",\r
    "### 2.1 二维卷积\\n",\r
    "\\n",\r
    "$$\\n",\r
    "(I * K)(x, y) = \\\\sum_{i=-a}^{a} \\\\sum_{j=-b}^{b} I(x-i, y-j) \\\\cdot K(i, j)\\n",\r
    "$$\\n",\r
    "\\n",\r
    "其中 $K$ 是 $(2a+1) \\\\times (2b+1)$ 的卷积核。\\n",\r
    "\\n",\r
    "### 2.2 互相关（Cross-Correlation）\\n",\r
    "\\n",\r
    "$$\\n",\r
    "(I \\\\star K)(x, y) = \\\\sum_{i=-a}^{a} \\\\sum_{j=-b}^{b} I(x+i, y+j) \\\\cdot K(i, j)\\n",\r
    "$$\\n",\r
    "\\n",\r
    "> ★ **关键区别**：卷积要翻转卷积核（$-i, -j$），互相关不翻转。OpenCV 的 \`filter2D\` 实际做的是互相关。对于对称核（如高斯核），两者等价。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "92015c13",\r
   "metadata": {},\r
   "source": [\r
    "### 2.3 手算验证\\n",\r
    "\\n",\r
    "用 3×3 的均值核 $K = \\\\frac{1}{9}\\\\begin{bmatrix}1&1&1\\\\\\\\1&1&1\\\\\\\\1&1&1\\\\end{bmatrix}$ 对 3×3 图像 $I = \\\\begin{bmatrix}1&2&3\\\\\\\\4&5&6\\\\\\\\7&8&9\\\\end{bmatrix}$ 做互相关：\\n",\r
    "\\n",\r
    "$$\\n",\r
    "\\\\text{输出中心} = \\\\frac{1+2+3+4+5+6+7+8+9}{9} = \\\\frac{45}{9} = 5\\n",\r
    "$$\\n",\r
    "\\n",\r
    "这就是均值滤波——把中心像素替换为邻域平均值。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 1,\r
   "id": "71c21405",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:33:19.969902Z",\r
     "iopub.status.busy": "2026-09-14T10:33:19.969902Z",\r
     "iopub.status.idle": "2026-09-14T10:33:20.180028Z",\r
     "shell.execute_reply": "2026-09-14T10:33:20.178998Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "中心像素值: 5.0000 (期望: 5.0000)\\n",\r
      "✅ 手算验证通过\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== 手写 2D 卷积 ====================\\n",\r
    "import numpy as np\\n",\r
    "\\n",\r
    "def convolve2d(image, kernel, mode='reflect'):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    手写 2D 卷积（实际做互相关，与 OpenCV filter2D 一致）\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "        image: 输入灰度图 (H, W)，uint8 或 float\\n",\r
    "        kernel: 卷积核 (kH, kW)，float\\n",\r
    "        mode: 边界处理 'reflect'|'constant'|'zero'\\n",\r
    "    返回:\\n",\r
    "        输出图像，与输入同尺寸\\n",\r
    "    \\"\\"\\"\\n",\r
    "    img = np.asarray(image, dtype=np.float64)\\n",\r
    "    kH, kW = kernel.shape\\n",\r
    "    # 确保核尺寸为奇数\\n",\r
    "    assert kH % 2 == 1 and kW % 2 == 1, \\"核尺寸必须为奇数\\"\\n",\r
    "    pad_h, pad_w = kH // 2, kW // 2\\n",\r
    "\\n",\r
    "    # 边界填充\\n",\r
    "    if mode == 'reflect':\\n",\r
    "        padded = np.pad(img, ((pad_h, pad_h), (pad_w, pad_w)), mode='reflect')\\n",\r
    "    elif mode == 'constant':\\n",\r
    "        padded = np.pad(img, ((pad_h, pad_h), (pad_w, pad_w)), mode='constant', constant_values=0)\\n",\r
    "    else:\\n",\r
    "        padded = np.pad(img, ((pad_h, pad_h), (pad_w, pad_w)), mode='constant', constant_values=0)\\n",\r
    "\\n",\r
    "    H, W = img.shape\\n",\r
    "    output = np.zeros((H, W), dtype=np.float64)\\n",\r
    "\\n",\r
    "    # 三重循环：逐像素滑动卷积核\\n",\r
    "    for y in range(H):\\n",\r
    "        for x in range(W):\\n",\r
    "            region = padded[y:y+kH, x:x+kW]\\n",\r
    "            output[y, x] = np.sum(region * kernel)\\n",\r
    "\\n",\r
    "    return output\\n",\r
    "\\n",\r
    "# ---------- 手算验证 ----------\\n",\r
    "test_img = np.array([[1,2,3],[4,5,6],[7,8,9]], dtype=np.float64)\\n",\r
    "mean_kernel = np.ones((3,3)) / 9.0\\n",\r
    "result = convolve2d(test_img, mean_kernel, mode='constant')\\n",\r
    "print(f\\"中心像素值: {result[1,1]:.4f} (期望: 5.0000)\\")\\n",\r
    "assert abs(result[1,1] - 5.0) < 1e-10, \\"手算验证失败!\\"\\n",\r
    "print(\\"✅ 手算验证通过\\")"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "035f1706",\r
   "metadata": {},\r
   "source": [\r
    "## 三、可分离滤波器\\n",\r
    "\\n",\r
    "如果卷积核 $K$ 可以分解为两个向量的外积 $K = v \\\\cdot h^T$，则 2D 卷积可拆成两次 1D 卷积：\\n",\r
    "\\n",\r
    "$$\\n",\r
    "I * K = (I * v) * h^T\\n",\r
    "$$\\n",\r
    "\\n",\r
    "> ★ **加速效果**：3×3 核从 9 次乘加降到 6 次（3+3）；5×5 核从 25 次降到 10 次。\\n",\r
    "\\n",\r
    "高斯核天然可分离：$G_{2D}(x,y) = G_x(x) \\\\cdot G_y(y)$，这是 OpenCV \`GaussianBlur\` 快的关键原因之一。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 2,\r
   "id": "c87d5ecf",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:33:20.183696Z",\r
     "iopub.status.busy": "2026-09-14T10:33:20.183096Z",\r
     "iopub.status.idle": "2026-09-14T10:33:20.432843Z",\r
     "shell.execute_reply": "2026-09-14T10:33:20.431282Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "2D vs 分离1D 的 MAE: 5.00e-17\\n",\r
      "✅ 可分离滤波器验证通过\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== 可分离卷积验证 ====================\\n",\r
    "def gaussian_kernel_1d(size, sigma):\\n",\r
    "    \\"\\"\\"生成 1D 高斯核\\"\\"\\"\\n",\r
    "    half = size // 2\\n",\r
    "    x = np.arange(-half, half + 1)\\n",\r
    "    k = np.exp(-(x**2) / (2 * sigma**2))\\n",\r
    "    return k / k.sum()\\n",\r
    "\\n",\r
    "def gaussian_kernel_2d(size, sigma):\\n",\r
    "    \\"\\"\\"生成 2D 高斯核\\"\\"\\"\\n",\r
    "    k1d = gaussian_kernel_1d(size, sigma)\\n",\r
    "    return np.outer(k1d, k1d)\\n",\r
    "\\n",\r
    "# 5x5 高斯核\\n",\r
    "k2d = gaussian_kernel_2d(5, 1.0)\\n",\r
    "k1d = gaussian_kernel_1d(5, 1.0)\\n",\r
    "\\n",\r
    "# 方法1：直接 2D 卷积\\n",\r
    "# 方法2：分两次 1D 卷积\\n",\r
    "# 两次 1D 卷积的中间结果\\n",\r
    "import numpy as np\\n",\r
    "test = np.random.rand(20, 20)\\n",\r
    "# 直接2D\\n",\r
    "r_2d = convolve2d(test, k2d, mode='reflect')\\n",\r
    "# 分离1D: 先对列卷积，再对行卷积\\n",\r
    "r_sep = convolve2d(test, k1d.reshape(1,-1), mode='reflect')  # 水平\\n",\r
    "r_sep = convolve2d(r_sep, k1d.reshape(-1,1), mode='reflect')  # 垂直\\n",\r
    "\\n",\r
    "mae = np.mean(np.abs(r_2d - r_sep))\\n",\r
    "print(f\\"2D vs 分离1D 的 MAE: {mae:.2e}\\")\\n",\r
    "assert mae < 1e-12, \\"可分离验证失败!\\"\\n",\r
    "print(\\"✅ 可分离滤波器验证通过\\")"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "f19a8b71",\r
   "metadata": {},\r
   "source": [\r
    "## 四、边界处理对比\\n",\r
    "\\n",\r
    "| 策略 | 说明 | 适用场景 |\\n",\r
    "|------|------|----------|\\n",\r
    "| zero-padding | 边界补 0 | 通用，但边缘变暗 |\\n",\r
    "| reflect | 镜像反射 | 自然图像最常用 |\\n",\r
    "| constant | 补固定值 | 需要特定背景色 |\\n",\r
    "| wrap | 环绕 | 周期性信号 |\\n",\r
    "\\n",\r
    "> 在实际工程中，\`reflect\`（镜像）是最常用的边界处理方式，因为它不会引入人为的亮度跳变。\\n",\r
    "\\n",\r
    "## 五、与导师路线的关系\\n",\r
    "\\n",\r
    "| 导师路线章节 | 本附录补充内容 |\\n",\r
    "|-------------|--------------|\\n",\r
    "| 第4章：图像滤波 | 卷积是滤波的数学基础；高斯核可分离是快速滤波的关键 |\\n",\r
    "| 第5章：特征提取 | Sobel 核是卷积；Canny 第一步就是用 Sobel 卷积 |\\n",\r
    "\\n",\r
    "## 参考来源\\n",\r
    "\\n",\r
    "1. **上海交通大学《动手学习计算机视觉》第 2 章** — [boyu-ai/Hands-on-CV](https://github.com/boyu-ai/Hands-on-CV)\\n",\r
    "2. **Stanford CS231A L10** — Low-Level Representations\\n",\r
    "3. **CMU 16-720A** — Filtering & Warping"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "a79efb5c",\r
   "metadata": {},\r
   "source": [\r
    "## 练习\\n",\r
    "\\n",\r
    "1. 实现一个拉普拉斯核 $\\\\begin{bmatrix}0&1&0\\\\\\\\1&-4&1\\\\\\\\0&1&0\\\\end{bmatrix}$ 的卷积，观察输出（提示：拉普拉斯是二阶导数，响应于边缘和角点）。\\n",\r
    "2. 验证 Sobel 核 $G_x = \\\\begin{bmatrix}-1&0&1\\\\\\\\-2&0&2\\\\\\\\-1&0&1\\\\end{bmatrix}$ 是否可分离（提示：$G_x = [1,2,1]^T \\\\cdot [-1,0,1]$）。\\n",\r
    "3. 比较不同边界处理策略对图像边缘 1 像素的影响。"\r
   ]\r
  }\r
 ],\r
 "metadata": {\r
  "kernelspec": {\r
   "display_name": "Python 3",\r
   "language": "python",\r
   "name": "python3"\r
  },\r
  "language_info": {\r
   "codemirror_mode": {\r
    "name": "ipython",\r
    "version": 3\r
   },\r
   "file_extension": ".py",\r
   "mimetype": "text/x-python",\r
   "name": "python",\r
   "nbconvert_exporter": "python",\r
   "pygments_lexer": "ipython3",\r
   "version": "3.10.19"\r
  }\r
 },\r
 "nbformat": 4,\r
 "nbformat_minor": 5\r
}\r
`;export{n as default};
