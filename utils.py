"""计算机视觉教材公共工具模块。

本模块只提供基础设施（图像读写、随机种子、中文绘图、可视化与误差对比），
不包含任何算法实现，算法代码保留在各章 Notebook 中，以保证老师要求的手写约束。
"""
from __future__ import annotations

import os
import random
from typing import Optional, Sequence, Tuple, List

import numpy as np
import cv2
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch


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
    """配置 matplotlib 中文字体，避免中文标签显示为方框。同时设置美观的全局样式。"""
    plt.rcParams["font.sans-serif"] = [
        "Microsoft YaHei", "SimHei", "PingFang SC",
        "Hiragino Sans GB", "WenQuanYi Micro Hei", "DejaVu Sans"
    ]
    plt.rcParams["axes.unicode_minus"] = False
    plt.rcParams["figure.dpi"] = 120
    plt.rcParams["savefig.dpi"] = 150
    plt.rcParams["axes.grid"] = False
    plt.rcParams["axes.spines.top"] = False
    plt.rcParams["axes.spines.right"] = False


def _to_displayable(img: np.ndarray) -> Tuple[np.ndarray, Optional[str]]:
    """将 BGR/灰度图转换为 matplotlib 可显示的格式，返回 (array, cmap)。"""
    if img.ndim == 2:
        return img, "gray"
    if img.ndim == 3 and img.shape[2] == 1:
        return img.squeeze(), "gray"
    return img[:, :, ::-1], None


def show_images(
    images: Sequence[np.ndarray],
    titles: Optional[Sequence[str]] = None,
    figsize: Optional[Tuple[int, int]] = None,
    ncols: Optional[int] = None,
    cmap: Optional[str] = None,
    suptitle: Optional[str] = None,
    show_info: bool = False,
    padding: float = 2.0,
) -> None:
    """美观地并排展示多张 BGR 或灰度图像。

    特性：
    - 自动计算行列数，支持多行多列布局
    - 彩色图自动 BGR->RGB
    - 支持总标题、每张图的形状信息
    - 美观的间距和字体设置

    参数
    ----
    images : 图像序列（BGR 或灰度）
    titles : 对应标题，None 时自动编号
    figsize : 总图像大小，None 时根据张数自动计算
    ncols : 列数，None 时根据张数自动推断（最多 4 列）
    cmap : 自定义灰度图 colormap
    suptitle : 整个图的总标题
    show_info : 是否在标题下方显示图像形状和 dtype 信息
    padding : 子图间距控制
    """
    setup_plot_chinese()
    n = len(images)
    if n == 0:
        raise ValueError("images 不能为空")

    if ncols is None:
        ncols = min(n, 4)
    nrows = int(np.ceil(n / ncols))

    if figsize is None:
        w = min(16, 3.8 * ncols)
        h = 3.2 * nrows + (0.8 if suptitle else 0)
        figsize = (w, h)

    if titles is None:
        titles = [f"图像 {i+1}" for i in range(n)]

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize, squeeze=False)
    if suptitle:
        fig.suptitle(suptitle, fontsize=15, fontweight="bold", y=0.98, color="#2c3e50")

    axes_flat = axes.flatten()
    for idx, (ax, img, title) in enumerate(zip(axes_flat, images, titles)):
        if img is None:
            ax.set_visible(False)
            continue
        disp, default_cmap = _to_displayable(img)
        actual_cmap = cmap if cmap else default_cmap
        ax.imshow(disp, cmap=actual_cmap, interpolation="nearest")
        if show_info:
            info = f"{img.shape[1]}×{img.shape[0]}  {img.dtype}"
            if img.ndim == 3:
                info += f"  C={img.shape[2]}"
            ax.set_title(f"{title}\n({info})",
                         fontsize=11, fontweight="medium", pad=8, color="#2c3e50",
                         style="italic")
        else:
            ax.set_title(title, fontsize=12, fontweight="medium", pad=8, color="#2c3e50")
        ax.axis("off")
        for spine in ax.spines.values():
            spine.set_visible(True)
            spine.set_color("#bdc3c7")
            spine.set_linewidth(0.8)

    for idx in range(n, len(axes_flat)):
        axes_flat[idx].set_visible(False)

    plt.tight_layout(pad=padding, h_pad=1.5, w_pad=1.5)
    if suptitle:
        plt.subplots_adjust(top=0.90)
    plt.show()


def show_histogram(
    images: Sequence[np.ndarray],
    titles: Optional[Sequence[str]] = None,
    figsize: Optional[Tuple[int, int]] = None,
    ncols: Optional[int] = None,
    colors: Optional[Sequence[str]] = None,
    suptitle: Optional[str] = None,
    bins: int = 256,
    range_min: int = 0,
    range_max: int = 256,
    density: bool = False,
    show_cdf: bool = False,
) -> None:
    """绘制一或多张灰度图的直方图（可选叠加 CDF）。

    参数
    ----
    images : 灰度图像序列
    titles : 对应标题
    ncols : 子图列数，None 时自动取 min(3, n)
    colors : 自定义柱状图颜色序列
    suptitle : 总标题
    bins : 直方图柱数
    show_cdf : 是否叠加绘制累积分布函数（CDF）
    """
    setup_plot_chinese()
    n = len(images)
    ncols_local = ncols if ncols is not None else min(n, 3)
    nrows = int(np.ceil(n / ncols_local))
    if titles is None:
        titles = [f"直方图 {i+1}" for i in range(n)]
    default_colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"]
    if colors is None:
        colors = [default_colors[i % len(default_colors)] for i in range(n)]
    if figsize is None:
        figsize = (5.2 * ncols_local, 3.8 * nrows + (0.6 if suptitle else 0))

    fig, axes = plt.subplots(nrows, ncols_local, figsize=figsize, squeeze=False)
    if suptitle:
        fig.suptitle(suptitle, fontsize=15, fontweight="bold", y=0.98, color="#2c3e50")

    axes_flat = axes.flatten()
    rng = (range_min, range_max)
    for idx, (ax, img, title, color) in enumerate(zip(axes_flat, images, titles, colors)):
        gray = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        flat = gray.flatten()
        n_counts, edges, patches = ax.hist(
            flat, bins=bins, range=rng, density=density,
            color=color, alpha=0.85, edgecolor="white", linewidth=0.4, zorder=2,
        )
        ax.set_xlim(rng)
        ax.set_xlabel("灰度值", fontsize=10, color="#34495e")
        ax.set_ylabel("频数" if not density else "概率密度", fontsize=10, color="#34495e")
        ax.set_title(title, fontsize=12, fontweight="medium", pad=8, color="#2c3e50")
        ax.grid(axis="y", linestyle="--", alpha=0.5, color="#ecf0f1", zorder=1)
        ax.tick_params(labelsize=9, colors="#7f8c8d")
        for spine in ["top", "right"]:
            ax.spines[spine].set_visible(False)

        if show_cdf:
            sorted_vals = np.sort(flat)
            cdf_y = np.arange(1, len(sorted_vals) + 1) / len(sorted_vals)
            ax2 = ax.twinx()
            ax2.plot(sorted_vals, cdf_y, color="#c0392b", linewidth=1.8,
                     linestyle="-", alpha=0.9, label="CDF", zorder=3)
            ax2.set_ylabel("CDF", fontsize=10, color="#c0392b")
            ax2.tick_params(axis="y", labelcolor="#c0392b", labelsize=9)
            ax2.set_ylim(0, 1.03)
            ax2.spines["top"].set_visible(False)
            ax.legend(loc="upper left", fontsize=9, framealpha=0.9)
            ax2.legend(loc="upper right", fontsize=9, framealpha=0.9)

    for idx in range(n, len(axes_flat)):
        axes_flat[idx].set_visible(False)

    plt.tight_layout(pad=1.8, h_pad=2.0, w_pad=2.0)
    if suptitle:
        plt.subplots_adjust(top=0.90)
    plt.show()


def plot_gamma_curve(
    gammas: Sequence[float] = (0.5, 1.0, 2.2, 3.0),
    figsize: Tuple[int, int] = (8, 6),
) -> None:
    """绘制不同 Gamma 值的幂函数校正曲线，帮助零基础学员直观理解 Gamma 校正。

    横轴：输入归一化亮度 [0,1]
    纵轴：输出归一化亮度 [0,1]
    """
    setup_plot_chinese()
    x = np.linspace(0, 1, 500)
    default_colors = ["#2980b9", "#27ae60", "#e67e22", "#c0392b", "#8e44ad"]

    fig, ax = plt.subplots(figsize=figsize)
    for i, g in enumerate(gammas):
        y = x ** (1.0 / g)
        label = f"γ = {g:.2f}"
        if abs(g - 2.2) < 0.01:
            label += "（显示器标准）"
        if abs(g - 1.0) < 0.01:
            label += "（无变化）"
        ax.plot(x, y, color=default_colors[i % len(default_colors)],
                linewidth=2.2, label=label, alpha=0.9)

    ax.plot(x, x, color="#95a5a6", linewidth=1.0, linestyle="--", label="恒等线 y=x", alpha=0.7)
    ax.fill_between(x, x, x ** (1.0 / max(gammas)), alpha=0.08, color="#e67e22")
    ax.fill_between(x, x ** (1.0 / min(gammas)), x, alpha=0.08, color="#2980b9")

    ax.annotate("γ > 1：暗部被拉伸，整体变亮 ☀️",
                xy=(0.35, 0.35 ** (1.0 / max(gammas))),
                xytext=(0.08, 0.75),
                fontsize=10, color="#d35400",
                arrowprops=dict(arrowstyle="->", color="#d35400", lw=1.2, alpha=0.8),
                bbox=dict(boxstyle="round,pad=0.4", facecolor="#fdf2e9", edgecolor="#e67e22", alpha=0.9))
    ax.annotate("γ < 1：暗部被压缩，整体变暗 🌙",
                xy=(0.65, 0.65 ** (1.0 / min(gammas))),
                xytext=(0.52, 0.2),
                fontsize=10, color="#1f618d",
                arrowprops=dict(arrowstyle="->", color="#1f618d", lw=1.2, alpha=0.8),
                bbox=dict(boxstyle="round,pad=0.4", facecolor="#ebf5fb", edgecolor="#2980b9", alpha=0.9))

    ax.set_xlabel("输入归一化像素值 $I_{in}/255$", fontsize=12, color="#2c3e50")
    ax.set_ylabel("输出归一化像素值 $I_{out}/255$", fontsize=12, color="#2c3e50")
    ax.set_title("Gamma 校正幂函数曲线对比\n公式：$I_{out} = 255 \\times (I_{in}/255)^{1/\\gamma}$",
                 fontsize=14, fontweight="bold", pad=12, color="#2c3e50")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect("equal")
    ax.grid(True, linestyle="--", alpha=0.55, color="#ecf0f1")
    ax.legend(loc="lower right", fontsize=10.5, framealpha=0.95, edgecolor="#bdc3c7")
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    plt.tight_layout()
    plt.show()


def plot_gaussian_kernel(
    sigma: float = 1.0,
    size: Optional[int] = None,
    figsize: Tuple[int, int] = (13, 5),
) -> None:
    """可视化二维高斯核：左为热力图，右为 3D 曲面图，帮助理解核权重分布。

    参数
    ----
    sigma : 高斯标准差
    size : 核边长（奇数），None 时自动取 ceil(6*sigma) 并保证奇数
    """
    setup_plot_chinese()
    from mpl_toolkits.mplot3d import Axes3D  # noqa: F401

    if size is None:
        size = int(np.ceil(6 * sigma))
        if size % 2 == 0:
            size += 1
        size = max(3, size)
    center = size // 2
    s2 = 2.0 * sigma * sigma
    kernel = np.zeros((size, size), dtype=np.float64)
    total = 0.0
    for i in range(size):
        for j in range(size):
            x = j - center
            y = i - center
            kernel[i, j] = np.exp(-(x * x + y * y) / s2) / (np.pi * s2)
            total += kernel[i, j]
    kernel_norm = kernel / total

    fig = plt.figure(figsize=figsize)
    fig.suptitle(f"二维高斯核  σ={sigma:.2f}, 尺寸={size}×{size}, 总和={kernel_norm.sum():.6f}",
                 fontsize=14, fontweight="bold", y=0.98, color="#2c3e50")

    ax1 = fig.add_subplot(1, 2, 1)
    X, Y = np.meshgrid(np.arange(size) - center, np.arange(size) - center)
    im = ax1.imshow(kernel_norm, cmap="YlOrRd", interpolation="nearest", origin="upper")
    for i in range(size):
        for j in range(size):
            val = kernel_norm[i, j]
            txt_color = "white" if val > kernel_norm.max() * 0.55 else "black"
            ax1.text(j, i, f"{val:.3f}", ha="center", va="center", fontsize=8,
                     color=txt_color, fontweight="medium")
    ax1.set_title("高斯核热力图（归一化后权重）", fontsize=12, pad=8, color="#2c3e50")
    ax1.set_xticks(np.arange(size))
    ax1.set_xticklabels(np.arange(size) - center, fontsize=9)
    ax1.set_yticks(np.arange(size))
    ax1.set_yticklabels(np.arange(size) - center, fontsize=9)
    ax1.set_xlabel("x 偏移", fontsize=10)
    ax1.set_ylabel("y 偏移", fontsize=10)
    cbar = plt.colorbar(im, ax=ax1, shrink=0.85, pad=0.02)
    cbar.ax.tick_params(labelsize=9)

    ax2 = fig.add_subplot(1, 2, 2, projection="3d")
    surf = ax2.plot_surface(X, Y, kernel_norm, cmap="YlOrRd",
                            linewidth=0.3, edgecolor="#7f8c8d", alpha=0.92, antialiased=True)
    ax2.set_title("高斯核 3D 曲面图", fontsize=12, pad=8, color="#2c3e50")
    ax2.set_xlabel("x 偏移", fontsize=10, labelpad=6)
    ax2.set_ylabel("y 偏移", fontsize=10, labelpad=6)
    ax2.set_zlabel("权重", fontsize=10, labelpad=4)
    ax2.tick_params(labelsize=8)
    ax2.view_init(elev=32, azim=-55)
    fig.colorbar(surf, ax=ax2, shrink=0.6, pad=0.1)

    plt.tight_layout(pad=1.8)
    plt.subplots_adjust(top=0.86)
    plt.show()


def compare_results(manual: np.ndarray, reference: np.ndarray, name: str) -> None:
    """美观地打印手写实现与参考实现之间的 MAE/RMSE/最大绝对误差，并给出评价。

    对零基础学员提供直观的误差解读：误差越小越好，并给出绿色/黄色/红色提示。
    """
    a = manual.astype(np.float64)
    b = reference.astype(np.float64)
    diff = np.abs(a - b)
    mae = float(diff.mean())
    rmse = float(np.sqrt((diff ** 2).mean()))
    max_err = float(diff.max())

    def level(val: float, good: float, warn: float) -> str:
        if val <= good:
            return "✅ 优秀"
        elif val <= warn:
            return "⚠️ 可接受"
        else:
            return "❌ 偏大，请检查代码"

    border = "=" * 62
    print(border)
    print(f"  🔍 【{name}】手写实现 vs 参考实现 数值对比报告")
    print(border)
    print(f"  MAE  平均绝对误差  = {mae:.6f}    {level(mae, 0.5, 2.0)}")
    print(f"  RMSE 均方根误差    = {rmse:.6f}    {level(rmse, 1.0, 3.0)}")
    print(f"  Max  最大绝对误差  = {max_err:.6f}    {level(max_err, 2.0, 5.0)}")
    print(border)
    if max_err <= 2.0:
        print("  🎉 恭喜！误差仅来自 uint8 取整，手写实现与参考实现基本一致。")
    elif max_err <= 5.0:
        print("  💡 提示：误差在合理范围内，可能来自边界处理/插值策略的细微差异。")
    else:
        print("  🔧 建议：检查归一化范围、取整方式、边界条件、矩阵求逆等关键步骤。")
    print(border)
    print()
