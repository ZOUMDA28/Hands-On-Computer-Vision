# 计算机视觉自学与实践

本仓库围绕《图像处理基础》与《最优化算法与立体视觉重建》两条主线，提供从像素基础到三维重建的**编程实践 Notebook**。每个 Notebook 均包含概念推导、手写代码实现、与 OpenCV 的数值对比、结果可视化和练习解答。

> **核心原则**：能手写的不调库。除老师明确允许的读写 / 矩阵计算 / 特征提取匹配部分外，算法核心全部手写；手写实现必须与可信库做数值对比验证。

---

## 📚 课程大纲

### 第一部分：图像处理基础（6 章）

| 章 | 目录 | 手写核心 | 输入图片 |
|:--:|------|----------|----------|
| 1 | 数字图像的获取和表示 | Gamma 校正、灰度化、二值化、翻转、亮度 | `lena.jpeg` |
| 2 | 颜色空间的转换 | RGB↔HSV、RGB↔Lab、颜色传递 | `lena.jpeg`、`chong.png` |
| 3 | 基于直方图统计的处理 | 直方图统计、均衡化、匹配 | `lenaface.jpg`、`test1.png`、`test2.png` |
| 4 | 图像滤波 | 高斯核、高斯滤波、双边滤波、均值/中值滤波 | `lenaface.jpg` |
| 5 | 特征提取 | Canny、SIFT 关键点/描述子/匹配 | `chong.png`、`test1.png`、`test2.png` |
| 6 | 几何变换 | 相似/仿射/单应矩阵、手写 warp | `lena.jpeg` |

### 第二部分：最优化算法与立体视觉重建（3 章）

| 章 | 目录 | 手写核心 | 输入图片 |
|:--:|------|----------|----------|
| 1 | 图像拼接模型 | 线性最小二乘、RANSAC、仿射/单应拼接 | `stitch1.jpg`、`stitch2.jpg` |
| 2 | 相机参数标定 | 单应 DLT、张正友闭式解、Rodrigues、LM 优化 | `calib_image_1..4.jpg` |
| 3 | 立体视觉点云重建 | 8 点法 F、E 分解、cheirality、三角化 | `stereo_image_1.jpg`、`stereo_image_2.jpg` |

---

## 📂 原始参考代码

`Hands-on-CV-main/` 为上海交通大学《动手学习计算机视觉》课程的原始代码仓库，包含第 2~19 章的完整教学 Notebook，是本仓库实践内容的主要参考来源。

---

## 🖼️ 图片、公式与代码来源说明

- 图片、公式与代码示例以 **Hands-on-CV-main（上海交通大学《动手学习计算机视觉》）原始教学资料** 为主：`lena.jpeg`、`lenaface.jpg`、`chong.png`、`test1.png`、`test2.png`、`stitch1.jpg`、`stitch2.jpg` 等图片，以及公式推导、实现思路与教学代码组织方式，均主要参考该原始仓库。
- 原始参考库第 16 章（相机标定）与第 19 章（三维重建）为外链数据集、没有本地图片，因此对应章节沿用本仓库自备的 `calib_image_*` 与 `stereo_image_*`，并在 Notebook 中注明来源。
- `utils.py` 只提供基础设施，不包含任何算法，算法均保留在各章 Notebook 中。

---

## ⚙️ 环境配置

- Python 3.8+，推荐使用 conda 环境 `llm`：

```bash
conda activate llm
pip install -r requirements.txt
```

- SIFT 需要 `opencv-contrib-python`；如果已在其他环境安装 `opencv-python`，请先卸载后再装 contrib 版，避免冲突。

## 🚀 快速开始

```bash
jupyter notebook
```

打开对应章节目录下的 `practice.ipynb`，执行 `Kernel → Restart & Run All` 从头运行。每个 Notebook 都会向上查找仓库根目录的 `utils.py`，请保持目录结构不变。

---

## 📐 科研代码规范

每个 Notebook 遵循以下约定：

1. **手写实现 + 库对比验证**：算法函数自己写，另起验证单元格与 OpenCV/NumPy 结果做 MAE/RMSE 对比。
2. **函数化与文档化**：核心逻辑封装为带中文 docstring、参数/返回值说明的函数。
3. **可复现**：统一 `set_random_seed(42)`，含 RANSAC/噪声的章节结果可复现。
4. **中文路径兼容**：统一使用 `utils.cv_imread` / `utils.cv_imwrite`，避免 Windows 中文路径下 `cv2.imread` 返回 `None`。
5. **可视化与算法分离**：`matplotlib` 仅用于显示，不参与算法计算。

---

## 🆘 常见问题

- **`No module named 'cv2'`**：确认使用 `llm` 环境并已 `pip install opencv-contrib-python`。
- **读图失败**：先运行 Notebook 第一个代码单元格（配置根目录与 `utils` 导入），并确认输入图片在章节目录中。
- **中文字体显示方框**：`utils.setup_plot_chinese()` 已预置 `SimHei / Microsoft YaHei`。
- **SIFT 不可用**：OpenCV 4.x 的 SIFT 在 `opencv-contrib-python` 中，安装 contrib 版即可。

---

## 📄 许可证与致谢

本项目基于 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议，仅限非商业学习使用。课程内容参考华中科技大学软件学院《计算机视觉》课程体系，并以上海交通大学《动手学习计算机视觉》原始代码仓库 `Hands-on-CV-main/` 中的公开教学资料作为图片、公式与代码的主要参考来源。
