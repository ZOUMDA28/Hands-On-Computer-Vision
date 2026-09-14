"""
utils.py — 教程通用基础设施

设计原则：本文件只提供"基础设施"，**不包含任何算法实现**。
所有算法都必须保留在各章 Notebook 中手写实现，utils 仅负责：

1. 中文路径兼容的图像读写（Windows 下 cv2.imread 遇到中文路径会返回 None）
2. 中文字体配置（matplotlib 默认字体无法显示中文）
3. 随机种子固定（保证含 RANSAC / 噪声的章节结果可复现）
4. 图像与直方图的可视化辅助（仅做显示，不参与任何计算）
5. 手写实现 vs 参考实现的数值对比报告

被各章 Notebook 通过 `from utils import ...` 使用。
"""

from __future__ import annotations

import os
import random
from typing import Iterable, Sequence

import cv2
import numpy as np
import matplotlib
import matplotlib.pyplot as plt


# --------------------------------------------------------------------------- #
# 1. 中文路径兼容的图像读写
# --------------------------------------------------------------------------- #

def cv_imread(path: str, flags: int = cv2.IMREAD_COLOR) -> np.ndarray | None:
    """读取图像，兼容中文/Unicode 路径。

    Windows 下 `cv2.imread` 使用 ANSI 编码打开文件，路径含中文时会静默返回 None。
    这里改用 `np.fromfile` + `cv2.imdecode` 绕开该限制。

    参数:
        path: 图像路径（可含中文）
        flags: OpenCV 读取标志，如 cv2.IMREAD_COLOR / cv2.IMREAD_GRAYSCALE

    返回:
        图像数组；读取失败时返回 None
    """
    if not os.path.exists(path):
        return None
    try:
        buffer = np.fromfile(path, dtype=np.uint8)
        if buffer.size == 0:
            return None
        return cv2.imdecode(buffer, flags)
    except Exception:
        return None


def cv_imwrite(path: str, image: np.ndarray) -> bool:
    """保存图像，兼容中文/Unicode 路径。

    参数:
        path: 输出路径（可含中文）
        image: 待保存的图像数组

    返回:
        是否保存成功
    """
    try:
        directory = os.path.dirname(os.path.abspath(path))
        if directory:
            os.makedirs(directory, exist_ok=True)
        ext = os.path.splitext(path)[1] or ".jpg"
        ok, buffer = cv2.imencode(ext, image)
        if not ok:
            return False
        buffer.tofile(path)
        return True
    except Exception:
        return False


# --------------------------------------------------------------------------- #
# 2. 中文字体与随机种子
# --------------------------------------------------------------------------- #

def setup_plot_chinese() -> None:
    """配置 matplotlib 以正常显示中文与负号。

    预置字体：SimHei（黑体）、Microsoft YaHei（微软雅黑）等，
    按可用性依次回退，避免中文显示为方框。
    """
    plt.rcParams["font.sans-serif"] = [
        "SimHei",
        "Microsoft YaHei",
        "Noto Sans CJK SC",
        "WenQuanYi Micro Hei",
        "PingFang SC",
        "DejaVu Sans",
    ]
    plt.rcParams["axes.unicode_minus"] = False


def set_random_seed(seed: int = 42) -> None:
    """固定所有随机源，保证含随机采样的章节（RANSAC 等）结果可复现。"""
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)


# --------------------------------------------------------------------------- #
# 3. 可视化辅助（只负责显示，不参与计算）
# --------------------------------------------------------------------------- #

def _as_list(value) -> list:
    """把标量或序列统一成 list，便于同时兼容单值与多值参数。"""
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        return list(value)
    return [value]


def _to_displayable(image: np.ndarray) -> np.ndarray:
    """把任意数值范围的图像整理成 matplotlib 可显示的形态。

    - 三通道按 BGR 处理并转成 RGB（OpenCV 约定）
    - 单通道保持灰度
    - 浮点数据若超出 [0,1] 则线性拉伸到 [0,255]
    """
    if image is None:
        return np.zeros((10, 10), dtype=np.uint8)

    if image.dtype == bool:
        image = image.astype(np.uint8) * 255

    if np.issubdtype(image.dtype, np.floating):
        arr = image.astype(np.float64)
        if arr.size and arr.max() <= 1.0 + 1e-6 and arr.min() >= -1e-6:
            arr = arr * 255.0
        elif arr.size and (arr.min() < 0 or arr.max() > 255):
            span = arr.max() - arr.min()
            arr = (arr - arr.min()) / span * 255.0 if span > 1e-12 else np.zeros_like(arr)
        image = np.clip(arr, 0, 255).astype(np.uint8)

    if image.ndim == 3:
        if image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
        if image.shape[2] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image


def show_images(
    images: Sequence[np.ndarray],
    titles: Sequence[str] | str | None = None,
    cmap: str | None = None,
    suptitle: str | None = None,
    show_info: bool = False,
    figsize: tuple | None = None,
    ncols: int | None = None,
    padding: float = 1.2,
) -> None:
    """并排显示多张图像。

    参数:
        images:   图像列表
        titles:   标题（字符串或与图像等长的列表）
        cmap:     灰度显示时使用的色图，如 "gray"
        suptitle: 总标题
        show_info: 是否在标题下标注 shape / dtype / 均值
        figsize:  画布尺寸
        ncols:    列数（默认全部排成一行）
        padding:  子图间距
    """
    images = list(images)
    if not images:
        return

    n = len(images)
    titles = _as_list(titles)
    col = ncols or n
    row = int(np.ceil(n / col))
    if figsize is None:
        figsize = (4.2 * col, 3.6 * row)

    fig, axes = plt.subplots(row, col, figsize=figsize, squeeze=False)
    for i in range(row * col):
        ax = axes[i // col][i % col]
        if i >= n:
            ax.axis("off")
            continue
        disp = _to_displayable(images[i])
        if disp.ndim == 3:
            ax.imshow(disp)
        else:
            ax.imshow(disp, cmap=cmap or "gray", vmin=0, vmax=255)
        ax.axis("off")
        if i < len(titles):
            ax.set_title(str(titles[i]), fontsize=11)
        if show_info:
            arr = np.asarray(images[i])
            ax.set_xlabel(
                f"shape={arr.shape} dtype={arr.dtype} mean={arr.mean():.2f}",
                fontsize=8,
            )

    if suptitle:
        fig.suptitle(suptitle, fontsize=13)
    # 中文字体缺失的字符（如 ↔）会产生 UserWarning，这里静默处理
    with matplotlib.rc_context({"font.sans-serif": plt.rcParams["font.sans-serif"]}):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            plt.tight_layout(pad=padding, h_pad=1.5, w_pad=1.5)
    plt.show()


def show_histogram(
    images: Sequence[np.ndarray],
    titles: Sequence[str] | str | None = None,
    colors: Sequence[str] | None = None,
    show_cdf: bool = False,
    suptitle: str | None = None,
    figsize: tuple | None = None,
) -> None:
    """显示灰度直方图，可选叠加累积分布函数（CDF）曲线。

    参数:
        images:   灰度图列表（若为三通道自动转灰度）
        titles:   子图标题
        colors:   每个直方图的颜色
        show_cdf: 是否叠加 CDF（归一化到 [0,1]，画在右侧纵轴）
        suptitle: 总标题
        figsize:  画布尺寸
    """
    images = list(images)
    if not images:
        return

    n = len(images)
    titles = _as_list(titles)
    colors = _as_list(colors) or ["#3498db", "#e67e22", "#e74c3c", "#27ae60"]
    if figsize is None:
        figsize = (4.6 * n, 3.6)

    fig, axes = plt.subplots(1, n, figsize=figsize, squeeze=False)
    for i, img in enumerate(images):
        ax = axes[0][i]
        arr = np.asarray(img)
        if arr.ndim == 3:
            arr = cv2.cvtColor(arr, cv2.COLOR_BGR2GRAY)
        if arr.dtype != np.uint8:
            arr = np.clip(arr, 0, 255).astype(np.uint8)

        hist = cv2.calcHist([arr], [0], None, [256], [0, 256]).ravel()
        color = colors[i % len(colors)]
        ax.bar(np.arange(256), hist, width=1.0, color=color, alpha=0.85)
        ax.set_xlim(0, 255)
        ax.set_xlabel("灰度值")
        ax.set_ylabel("像素数")
        if i < len(titles):
            ax.set_title(str(titles[i]), fontsize=11)

        if show_cdf:
            cdf = np.cumsum(hist) / max(hist.sum(), 1)
            ax2 = ax.twinx()
            ax2.plot(np.arange(256), cdf, color="#2c3e50", linewidth=1.6)
            ax2.set_ylim(0, 1.05)
            ax2.set_ylabel("CDF", color="#2c3e50")
            ax2.tick_params(axis="y", colors="#2c3e50")

    if suptitle:
        fig.suptitle(suptitle, fontsize=13)
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        plt.tight_layout()
    plt.show()


def plot_gaussian_kernel(sigma: float = 1.0, size: int | None = None, figsize=(10, 4)) -> None:
    """显示高斯核的二维热力图与中心截面曲线。

    参数:
        sigma:  高斯核标准差
        size:   核尺寸（默认按 6σ+1 取奇数）
        figsize: 画布尺寸
    """
    if size is None:
        size = int(2 * np.ceil(3 * sigma) + 1)
    if size % 2 == 0:
        size += 1

    ax_1d = np.arange(size) - size // 2
    gauss_1d = np.exp(-(ax_1d ** 2) / (2 * sigma ** 2))
    gauss_1d /= gauss_1d.sum()
    gauss_2d = np.outer(gauss_1d, gauss_1d)

    fig, axes = plt.subplots(1, 2, figsize=figsize)
    im = axes[0].imshow(gauss_2d, cmap="viridis")
    axes[0].set_title(f"高斯核（size={size}, sigma={sigma}）")
    axes[0].set_xlabel("列")
    axes[0].set_ylabel("行")
    fig.colorbar(im, ax=axes[0], fraction=0.046)

    axes[1].plot(ax_1d, gauss_1d, marker="o", color="#e67e22")
    axes[1].set_title("中心截面的 1D 高斯（已归一化）")
    axes[1].set_xlabel("距中心偏移")
    axes[1].set_ylabel("权重")
    axes[1].grid(alpha=0.3)

    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        plt.tight_layout()
    plt.show()


def plot_gamma_curve(gammas: Iterable[float] = (0.5, 1.0, 2.2, 3.0), figsize=(6, 5)) -> None:
    """显示 Gamma 校正曲线 I_out = 255 * (I_in / 255) ** (1 / gamma)。

    参数:
        gammas: 要绘制的 gamma 取值（注意实现里指数用 1/gamma）
        figsize: 画布尺寸
    """
    x = np.linspace(0, 255, 256)
    plt.figure(figsize=figsize)
    for g in gammas:
        y = 255.0 * np.power(x / 255.0, 1.0 / g)
        plt.plot(x, y, linewidth=2, label=f"gamma = {g}")
    plt.plot([0, 255], [0, 255], "k--", linewidth=1, label="恒等映射")
    plt.xlabel("输入灰度 I_in")
    plt.ylabel("输出灰度 I_out")
    plt.title("Gamma 校正曲线")
    plt.legend()
    plt.grid(alpha=0.3)
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        plt.tight_layout()
    plt.show()


# --------------------------------------------------------------------------- #
# 4. 手写实现 vs 参考实现的数值对比
# --------------------------------------------------------------------------- #

def compare_results(
    manual: np.ndarray,
    reference: np.ndarray,
    name: str = "结果",
    mae_good: float = 1.0,
    max_good: float = 2.0,
) -> dict:
    """比较手写实现与参考实现的数值差异，并打印报告。

    参数:
        manual:    手写实现结果
        reference: 参考实现（如 OpenCV）结果
        name:      报告标题中显示的对比名称
        mae_good:  MAE 达到该值以内视为"优秀"
        max_good:  最大绝对误差达到该值以内视为"优秀"

    返回:
        含 mae / rmse / max 的字典
    """
    a = np.asarray(manual, dtype=np.float64)
    b = np.asarray(reference, dtype=np.float64)

    if a.shape != b.shape:
        print(f"  ⚠️ 形状不一致：手写 {a.shape} vs 参考 {b.shape}")
        diff = np.abs(a.reshape(-1)[: min(a.size, b.size)] -
                      b.reshape(-1)[: min(a.size, b.size)])
    else:
        diff = np.abs(a - b)

    mae = float(diff.mean()) if diff.size else 0.0
    rmse = float(np.sqrt((diff ** 2).mean())) if diff.size else 0.0
    max_err = float(diff.max()) if diff.size else 0.0

    def verdict(value: float, threshold: float) -> str:
        if value <= threshold * 0.5:
            return "✅ 优秀"
        if value <= threshold:
            return "✅ 合格"
        return "⚠️ 偏差偏大"

    print("=" * 62)
    print(f"  🔍 【{name}】手写实现 vs 参考实现 数值对比报告")
    print("=" * 62)
    print(f"  MAE  平均绝对误差  = {mae:.6f}    {verdict(mae, mae_good)}")
    print(f"  RMSE 均方根误差    = {rmse:.6f}    {verdict(rmse, mae_good)}")
    print(f"  Max  最大绝对误差  = {max_err:.6f}    {verdict(max_err, max_good)}")
    print("=" * 62)
    if mae <= mae_good:
        print("  🎉 恭喜！误差仅来自 uint8 取整，手写实现与参考实现基本一致。")
    else:
        print("  💡 提示：请检查归一化范围、通道顺序（BGR/RGB）与裁剪取整方式。")
    print("=" * 62)

    return {"mae": mae, "rmse": rmse, "max": max_err}
