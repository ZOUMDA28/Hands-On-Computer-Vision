"""计算机视觉教材公共工具模块。

本模块只提供基础设施（图像读写、随机种子、中文绘图、可视化与误差对比），
不包含任何算法实现，算法代码保留在各章 Notebook 中，以保证老师要求的手写约束。
"""
from __future__ import annotations

import os
import random
from typing import Optional, Sequence

import numpy as np
import cv2
import matplotlib.pyplot as plt


def cv_imread(filepath: str, flags: int = cv2.IMREAD_COLOR) -> Optional[np.ndarray]:
    """支持 Windows 中文路径的图像读取。

    cv2.imread 在中文路径下会静默返回 None；这里先用二进制方式读入字节，
    再用 cv2.imdecode 解码。读取失败时返回 None。
    """
    if not os.path.exists(filepath):
        return None
    with open(filepath, "rb") as f:
        data = np.frombuffer(f.read(), dtype=np.uint8)
    return cv2.imdecode(data, flags)


def cv_imwrite(filepath: str, img: np.ndarray) -> bool:
    """支持 Windows 中文路径的图像写入，写入成功返回 True。"""
    ext = os.path.splitext(filepath)[1] or ".png"
    success, buf = cv2.imencode(ext, img)
    if success:
        with open(filepath, "wb") as f:
            f.write(buf.tobytes())
    return bool(success)


def set_random_seed(seed: int = 42) -> None:
    """固定 Python 与 numpy 随机种子，保证 RANSAC/噪声等随机算法可复现。"""
    random.seed(seed)
    np.random.seed(seed)


def setup_plot_chinese() -> None:
    """配置 matplotlib 中文字体，避免中文标签显示为方框。"""
    plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "DejaVu Sans"]
    plt.rcParams["axes.unicode_minus"] = False


def show_images(
    images: Sequence[np.ndarray],
    titles: Optional[Sequence[str]] = None,
    figsize: tuple = (12, 4),
    cmap: Optional[str] = None,
) -> None:
    """并排展示多张 BGR 或灰度图像。彩色图自动 BGR->RGB，灰度图使用 cmap。"""
    setup_plot_chinese()
    n = len(images)
    fig, axes = plt.subplots(1, n, figsize=figsize, squeeze=False)
    if titles is None:
        titles = [f"Image {i+1}" for i in range(n)]
    for ax, img, title in zip(axes[0], images, titles):
        if img.ndim == 2:
            ax.imshow(img, cmap=cmap or "gray")
        else:
            ax.imshow(img[:, :, ::-1])  # BGR -> RGB
        ax.set_title(title)
        ax.axis("off")
    plt.tight_layout()
    plt.show()


def compare_results(manual: np.ndarray, reference: np.ndarray, name: str) -> None:
    """打印手写实现与参考实现之间的 MAE/RMSE/最大绝对误差。"""
    a = manual.astype(np.float64)
    b = reference.astype(np.float64)
    diff = np.abs(a - b)
    mae = float(diff.mean())
    rmse = float(np.sqrt((diff ** 2).mean()))
    max_err = float(diff.max())
    print(f"[{name}] 数值对比结果:")
    print(f"  MAE  = {mae:.6f}")
    print(f"  RMSE = {rmse:.6f}")
    print(f"  Max  = {max_err:.6f}")
