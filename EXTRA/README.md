# EXTRA 进阶章节

本章节包含 10 个进阶主题的编程实践内容，覆盖传统图像处理算法与深度学习前沿方法。已补充与后续待补充的专题内容，其图片、公式与代码内容主要参考 Hands-on-CV，即上海交通大学《动手学习计算机视觉》相关公开教学资料。

## 📚 章节列表

| 章节 | 内容说明 | 依赖 |
|------|----------|------|
| 卷积 | 图像卷积操作的手写实现与深入理解 | 无（仅需 OpenCV + NumPy） |
| 模板匹配 | 基于模板的图像匹配算法（SAD/SSD/NCC） | 无（仅需 OpenCV + NumPy） |
| 图像分割 | 阈值分割、区域生长、图割算法 | 无（仅需 OpenCV + NumPy） |
| 光流和运动场 | 稀疏光流、稠密光流计算与运动分析 | 无（仅需 OpenCV + NumPy） |
| 图像分类 | 词袋模型、ResNet、深度学习分类 | PyTorch + torchvision |
| 语义分割 | 基于深度学习的像素级语义分割 | PyTorch + torchvision |
| 目标检测 | 现代目标检测算法（R-CNN、YOLO、SSD） | PyTorch + torchvision |
| 实例分割 | Mask R-CNN 等实例分割算法 | PyTorch + torchvision |
| 人体姿态估计 | OpenPose、HRNet 等姿态估计模型 | PyTorch + torchvision |
| 动作识别 | 视频动作识别（双流网络、3D CNN） | PyTorch + torchvision |

## ✨ 每章特色

每个章节的 `practice_extra.ipynb` 均包含：

- **📖 概念讲解**：算法原理与数学推导
- **💻 手写实现**：从零实现核心算法（如卷积核运算、模板匹配）
- **📝 练习题目**：针对章节主题的动手练习
- **✅ 完整解决方案**：可运行的参考答案代码
- **📚 详细解释**：对解决方案的逐步代码解析
- **🔬 可复现性**：所有随机操作已设置固定种子（seed=42）

## 🚀 如何使用

### 传统算法章节（无需深度学习框架）

```bash
# 仅需基础依赖
pip install opencv-contrib-python numpy matplotlib
```

### 深度学习章节

```bash
# 额外安装 PyTorch
pip install torch torchvision

# GPU 加速（可选）
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## 📁 文件结构

```
EXTRA/
├── 卷积/
│   ├── lena.jpeg              # 测试图像
│   └── practice_extra.ipynb
├── 模板匹配/
│   ├── img.png
│   ├── lena_small.png
│   ├── lena_tri.jpg
│   ├── temp.png
│   └── practice_extra.ipynb
├── 图像分割/
│   ├── segmentation.jpeg
│   └── practice_extra.ipynb
├── 图像分类/
│   └── practice_extra.ipynb
├── 语义分割/
│   └── practice_extra.ipynb
├── 目标检测/
│   └── practice_extra.ipynb
├── 实例分割/
│   └── practice_extra.ipynb
├── 人体姿态估计/
│   └── practice_extra.ipynb
├── 动作识别/
│   └── practice_extra.ipynb
└── 光流和运动场/
    └── practice_extra.ipynb
```

## ⚠️ 注意事项

- 深度学习章节建议使用 GPU 运行（CUDA 版本 PyTorch）
- 所有 Notebook 均内置 `cv_imread` / `cv_imwrite` 中文路径兼容函数
- 代码已在 Python 3.8 + OpenCV 5.0 + PyTorch 2.0 环境下验证
- 涉及随机操作的代码已设置固定随机种子，确保结果可复现
