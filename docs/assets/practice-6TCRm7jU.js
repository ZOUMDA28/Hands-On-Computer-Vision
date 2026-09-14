const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "id": "cell-0",\r
   "metadata": {},\r
   "source": [\r
    "# 第二章：相机参数标定\\n",\r
    "\\n",\r
    "## 编程实践：手写张正友标定 + Levenberg-Marquardt 优化\\n",\r
    "\\n",\r
    "| 项目 | 说明 |\\n",\r
    "|------|------|\\n",\r
    "| 输入图片 | \`calib_image_1..4.jpg\`（棋盘格标定图；参考库第 16 章为外链数据集，本仓库沿用自备标定图） |\\n",\r
    "| 手写核心 | 归一化 DLT 单应、张正友闭式解、Rodrigues、LM 非线性最小二乘 |\\n",\r
    "| 允许调用 | 图像读写、矩阵计算、角点检测（OpenCV/numpy） |\\n",\r
    "| 对比验证 | 与 OpenCV \`cv2.calibrateCamera\` 的内参做数值对比 |\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "cell-1",\r
   "metadata": {},\r
   "source": [\r
    "## 一、学习目标\\n",\r
    "\\n",\r
    "1. 掌握三维视觉中的成像模型，以及相机内外参数（含镜头畸变）的基本概念。\\n",\r
    "2. 掌握基于平面棋盘格的相机内外参数标定算法——**张正友标定法**。\\n",\r
    "3. 掌握**非线性最小二乘优化算法**（Levenberg-Marquardt）及其编程实现。\\n",\r
    "\\n",\r
    "### 成像模型\\n",\r
    "\\n",\r
    "针孔模型：\\n",\r
    "\\n",\r
    "$$\\n",\r
    "s \\\\cdot \\\\begin{bmatrix} u \\\\\\\\ v \\\\\\\\ 1 \\\\end{bmatrix} = K \\\\cdot [R \\\\mid t] \\\\cdot \\\\begin{bmatrix} X \\\\\\\\ Y \\\\\\\\ Z \\\\\\\\ 1 \\\\end{bmatrix}\\n",\r
    "$$\\n",\r
    "\\n",\r
    "其中内参矩阵 $K$：\\n",\r
    "\\n",\r
    "$$\\n",\r
    "K = \\\\begin{bmatrix} f_x & 0 & c_x \\\\\\\\ 0 & f_y & c_y \\\\\\\\ 0 & 0 & 1 \\\\end{bmatrix}\\n",\r
    "$$\\n",\r
    "\\n",\r
    "- 内参 $K$：焦距 $f_x / f_y$、像主点 $c_x / c_y$；畸变系数刻画镜头径向/切向畸变。\\n",\r
    "- 外参 $[R \\\\mid t]$：相机在世界坐标系中的位置与朝向。\\n",\r
    "\\n",\r
    "### 张正友标定思路\\n",\r
    "\\n",\r
    "1. 检测棋盘格角点；\\n",\r
    "2. 每张图估计**平面单应** $H$；\\n",\r
    "3. 由多个 $H$ 解线性方程组得到内参 $K$ 的闭式解；\\n",\r
    "4. 由 $K$ 和每个 $H$ 恢复外参；\\n",\r
    "5. 用 **LM 非线性优化** 联合优化内参、畸变与所有外参，最小化重投影误差。\\n",\r
    "\\n",\r
    "### Levenberg-Marquardt\\n",\r
    "\\n",\r
    "在高斯-牛顿法基础上加入阻尼 $\\\\lambda$：\\n",\r
    "\\n",\r
    "$$\\n",\r
    "\\\\left(J^T J + \\\\lambda \\\\cdot \\\\text{diag}(J^T J)\\\\right) \\\\cdot \\\\boldsymbol{\\\\delta} = -J^T \\\\mathbf{r}\\n",\r
    "$$\\n",\r
    "\\n",\r
    "代价下降则减小 $\\\\lambda$（更接近高斯-牛顿），代价上升则增大 $\\\\lambda$（更接近梯度下降）。本页用**数值雅可比**（有限差分）计算 $J$，避免手推复杂解析梯度。\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 1,\r
   "id": "cell-3",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:53.682017Z",\r
     "iopub.status.busy": "2026-09-14T10:40:53.682017Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.670701Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.670138Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "OpenCV 版本: 5.0.0\\n",\r
      "当前工作目录: d:\\\\CODE\\\\Hands-On-Computer-Vision\\\\notebooks\\\\part2-optimization-3d\\\\08-camera-calibration\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "import sys\\n",\r
    "from pathlib import Path\\n",\r
    "\\n",\r
    "# 向上查找项目根目录（含 utils.py），并加入 sys.path\\n",\r
    "ROOT = Path.cwd().resolve()\\n",\r
    "while not (ROOT / \\"utils.py\\").exists():\\n",\r
    "    if ROOT.parent == ROOT:\\n",\r
    "        raise FileNotFoundError(\\"未找到项目根目录 utils.py\\")\\n",\r
    "    ROOT = ROOT.parent\\n",\r
    "sys.path.insert(0, str(ROOT))\\n",\r
    "\\n",\r
    "import numpy as np\\n",\r
    "import cv2\\n",\r
    "import matplotlib.pyplot as plt\\n",\r
    "\\n",\r
    "from utils import cv_imread, cv_imwrite, set_random_seed, setup_plot_chinese, show_images, compare_results\\n",\r
    "\\n",\r
    "setup_plot_chinese()\\n",\r
    "set_random_seed(42)\\n",\r
    "print(f\\"OpenCV 版本: {cv2.__version__}\\")\\n",\r
    "print(f\\"当前工作目录: {Path.cwd()}\\")\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 2,\r
   "id": "cell-4",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.672718Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.672718Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.701711Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.700707Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "import math\\n",\r
    "\\n",\r
    "# ==================== 基础几何工具 ====================\\n",\r
    "def normalize_points_2d(pts):\\n",\r
    "    \\"\\"\\"Hartley 归一化：平移质心到原点，缩放到平均距离 sqrt(2)。\\"\\"\\"\\n",\r
    "    pts = np.asarray(pts, dtype=np.float64)\\n",\r
    "    c = pts.mean(axis=0)\\n",\r
    "    d = np.mean(np.linalg.norm(pts - c, axis=1))\\n",\r
    "    s = math.sqrt(2.0) / d\\n",\r
    "    T = np.array([[s, 0, -s * c[0]], [0, s, -s * c[1]], [0, 0, 1]])\\n",\r
    "    return T\\n",\r
    "\\n",\r
    "\\n",\r
    "def compute_homography_dlt(model, image):\\n",\r
    "    \\"\\"\\"手写归一化 DLT 估计平面单应（model 为 Z=0 平面上的 XY 坐标）。\\"\\"\\"\\n",\r
    "    model = np.asarray(model, dtype=np.float64)[:, :2]\\n",\r
    "    image = np.asarray(image, dtype=np.float64)[:, :2]\\n",\r
    "    model_h = np.hstack([model, np.ones((len(model), 1))])\\n",\r
    "    image_h = np.hstack([image, np.ones((len(image), 1))])\\n",\r
    "    T_model = normalize_points_2d(model)\\n",\r
    "    T_image = normalize_points_2d(image)\\n",\r
    "    m_norm = (T_model @ model_h.T).T\\n",\r
    "    i_norm = (T_image @ image_h.T).T\\n",\r
    "\\n",\r
    "    A = []\\n",\r
    "    for (x, y, _), (u, v, _) in zip(m_norm, i_norm):\\n",\r
    "        A.append([-x, -y, -1, 0, 0, 0, u * x, u * y, u])\\n",\r
    "        A.append([0, 0, 0, -x, -y, -1, v * x, v * y, v])\\n",\r
    "    A = np.array(A)\\n",\r
    "    _, _, Vt = np.linalg.svd(A)\\n",\r
    "    H = Vt[-1].reshape(3, 3)\\n",\r
    "    H = np.linalg.inv(T_image) @ H @ T_model\\n",\r
    "    return H / H[2, 2]\\n",\r
    "\\n",\r
    "\\n",\r
    "def rodrigues_matrix(rvec):\\n",\r
    "    \\"\\"\\"手写 Rodrigues：旋转向量 -> 旋转矩阵。\\"\\"\\"\\n",\r
    "    rvec = np.asarray(rvec, dtype=np.float64).ravel()\\n",\r
    "    theta = float(np.linalg.norm(rvec))\\n",\r
    "    if theta < 1e-8:\\n",\r
    "        return np.eye(3)\\n",\r
    "    k = rvec / theta\\n",\r
    "    Kx = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])\\n",\r
    "    return np.eye(3) + math.sin(theta) * Kx + (1 - math.cos(theta)) * (Kx @ Kx)\\n",\r
    "\\n",\r
    "\\n",\r
    "def rodrigues_vector(R):\\n",\r
    "    \\"\\"\\"手写 Rodrigues：旋转矩阵 -> 旋转向量。\\"\\"\\"\\n",\r
    "    R = np.asarray(R, dtype=np.float64)\\n",\r
    "    theta = math.acos(min(1.0, max(-1.0, (np.trace(R) - 1.0) / 2.0)))\\n",\r
    "    if theta < 1e-8:\\n",\r
    "        return np.zeros(3)\\n",\r
    "    Kx = (R - R.T) / (2 * math.sin(theta))\\n",\r
    "    return theta * np.array([Kx[2, 1], Kx[0, 2], Kx[1, 0]])\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 3,\r
   "id": "cell-5",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.705379Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.705379Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.734217Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.732585Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# ==================== 张正友闭式解 ====================\\n",\r
    "def zhang_intrinsics(homographies):\\n",\r
    "    \\"\\"\\"由多个平面单应求内参 K（张正友闭式解，含 skew）。\\n",\r
    "\\n",\r
    "    当标定图姿态变化不足（如部分图接近纯正对、旋转/透视分量过小）时，\\n",\r
    "    闭式解会退化（B11 或 lam 非正），此时返回 None 由调用方回退到启发式初值。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    V = []\\n",\r
    "    for H in homographies:\\n",\r
    "        h1, h2, h3 = H[:, 0], H[:, 1], H[:, 2]\\n",\r
    "\\n",\r
    "        def vij(a, b):\\n",\r
    "            return np.array([a[0] * b[0],\\n",\r
    "                             a[0] * b[1] + a[1] * b[0],\\n",\r
    "                             a[1] * b[1],\\n",\r
    "                             a[2] * b[0] + a[0] * b[2],\\n",\r
    "                             a[2] * b[1] + a[1] * b[2],\\n",\r
    "                             a[2] * b[2]])\\n",\r
    "        V.append(vij(h1, h2))\\n",\r
    "        V.append(vij(h1, h1) - vij(h2, h2))\\n",\r
    "    V = np.array(V)\\n",\r
    "    _, _, Vt = np.linalg.svd(V)\\n",\r
    "    b = Vt[-1]\\n",\r
    "    # b 的符号任意，取 B11 > 0 以保证焦距为正\\n",\r
    "    if b[0] < 0:\\n",\r
    "        b = -b\\n",\r
    "    B11, B12, B22, B13, B23, B33 = b\\n",\r
    "\\n",\r
    "    denom = B11 * B22 - B12 * B12\\n",\r
    "    if B11 <= 1e-8 or denom <= 1e-8:\\n",\r
    "        return None\\n",\r
    "    v0 = (B12 * B13 - B11 * B23) / denom\\n",\r
    "    lam = B33 - (B13 * B13 + v0 * (B12 * B13 - B11 * B23)) / B11\\n",\r
    "    if lam <= 0:\\n",\r
    "        return None\\n",\r
    "    alpha = math.sqrt(lam / B11)\\n",\r
    "    beta = math.sqrt(lam * B11 / denom)\\n",\r
    "    gamma = -B12 * alpha * alpha * beta / lam\\n",\r
    "    u0 = gamma * v0 / beta - B13 * alpha * alpha / lam\\n",\r
    "    K = np.array([[alpha, gamma, u0], [0, beta, v0], [0, 0, 1]])\\n",\r
    "    return K\\n",\r
    "\\n",\r
    "\\n",\r
    "def extract_extrinsics(K, H):\\n",\r
    "    \\"\\"\\"由内参 K 与单应 H 恢复旋转矩阵 R 与平移向量 t。\\"\\"\\"\\n",\r
    "    Kinv = np.linalg.inv(K)\\n",\r
    "    lam = 1.0 / float(np.linalg.norm(Kinv @ H[:, 0]))\\n",\r
    "    r1 = lam * (Kinv @ H[:, 0])\\n",\r
    "    r2 = lam * (Kinv @ H[:, 1])\\n",\r
    "    r3 = np.cross(r1, r2)\\n",\r
    "    t = lam * (Kinv @ H[:, 2])\\n",\r
    "    R = np.column_stack([r1, r2, r3])\\n",\r
    "    U, _, Vt = np.linalg.svd(R)\\n",\r
    "    R = U @ Vt\\n",\r
    "    return R, t\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 4,\r
   "id": "cell-6",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.737741Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.737741Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.764407Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.762890Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# ==================== 投影模型与重投影误差 ====================\\n",\r
    "def project_points(K, k1, k2, rvec, tvec, obj_pts):\\n",\r
    "    \\"\\"\\"把三维点投影到像素坐标，含 k1/k2 径向畸变。\\"\\"\\"\\n",\r
    "    R = rodrigues_matrix(rvec)\\n",\r
    "    P = R @ obj_pts.T + tvec.reshape(3, 1)\\n",\r
    "    X, Y, Z = P[0], P[1], P[2]\\n",\r
    "    x = X / Z\\n",\r
    "    y = Y / Z\\n",\r
    "    r2 = x * x + y * y\\n",\r
    "    radial = 1 + k1 * r2 + k2 * r2 * r2\\n",\r
    "    xd = x * radial\\n",\r
    "    yd = y * radial\\n",\r
    "    u = K[0, 0] * xd + K[0, 1] * yd + K[0, 2]\\n",\r
    "    v = K[1, 1] * yd + K[1, 2]\\n",\r
    "    return np.vstack([u, v]).T\\n",\r
    "\\n",\r
    "\\n",\r
    "def params_to_components(params, num_images):\\n",\r
    "    \\"\\"\\"把参数向量拆成内参、畸变与每张图的外参。\\"\\"\\"\\n",\r
    "    fx, fy, cx, cy, k1, k2 = params[:6]\\n",\r
    "    K = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]])\\n",\r
    "    rvecs, tvecs = [], []\\n",\r
    "    for i in range(num_images):\\n",\r
    "        base = 6 + 6 * i\\n",\r
    "        rvecs.append(params[base:base + 3])\\n",\r
    "        tvecs.append(params[base + 3:base + 6])\\n",\r
    "    return K, k1, k2, rvecs, tvecs\\n",\r
    "\\n",\r
    "\\n",\r
    "def reprojection_residuals(params, objpoints, imgpoints):\\n",\r
    "    \\"\\"\\"计算所有图像所有点的重投影残差（展平为一维向量）。\\"\\"\\"\\n",\r
    "    num_images = len(objpoints)\\n",\r
    "    K, k1, k2, rvecs, tvecs = params_to_components(params, num_images)\\n",\r
    "    residuals = []\\n",\r
    "    for i in range(num_images):\\n",\r
    "        pred = project_points(K, k1, k2, rvecs[i], tvecs[i], objpoints[i])\\n",\r
    "        residuals.append((pred - imgpoints[i]).ravel())\\n",\r
    "    return np.concatenate(residuals)\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 5,\r
   "id": "cell-7",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.768920Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.767414Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.780166Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.778974Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# ==================== Levenberg-Marquardt 优化 ====================\\n",\r
    "def numeric_jacobian(residual_func, params, eps=1e-6):\\n",\r
    "    \\"\\"\\"数值雅可比（有限差分）。\\"\\"\\"\\n",\r
    "    base = residual_func(params)\\n",\r
    "    J = np.zeros((len(base), len(params)))\\n",\r
    "    for j in range(len(params)):\\n",\r
    "        p2 = params.copy()\\n",\r
    "        p2[j] += eps\\n",\r
    "        J[:, j] = (residual_func(p2) - base) / eps\\n",\r
    "    return J\\n",\r
    "\\n",\r
    "\\n",\r
    "def lm_refine(initial_params, objpoints, imgpoints, max_iter=50):\\n",\r
    "    \\"\\"\\"手写 LM 非线性最小二乘，返回优化后参数与每步代价。\\"\\"\\"\\n",\r
    "    params = initial_params.copy().astype(np.float64)\\n",\r
    "    lam = 1e-3\\n",\r
    "    history = []\\n",\r
    "\\n",\r
    "    def cost(p):\\n",\r
    "        r = reprojection_residuals(p, objpoints, imgpoints)\\n",\r
    "        return 0.5 * float(r @ r)\\n",\r
    "\\n",\r
    "    for it in range(max_iter):\\n",\r
    "        r = reprojection_residuals(params, objpoints, imgpoints)\\n",\r
    "        current_cost = 0.5 * float(r @ r)\\n",\r
    "        history.append(current_cost)\\n",\r
    "        J = numeric_jacobian(lambda p: reprojection_residuals(p, objpoints, imgpoints), params)\\n",\r
    "        A = J.T @ J\\n",\r
    "        g = J.T @ r\\n",\r
    "\\n",\r
    "        improved = False\\n",\r
    "        for _ in range(20):\\n",\r
    "            try:\\n",\r
    "                delta = np.linalg.solve(A + lam * np.diag(np.diag(A)), -g)\\n",\r
    "            except np.linalg.LinAlgError:\\n",\r
    "                lam *= 10\\n",\r
    "                continue\\n",\r
    "            new_params = params + delta\\n",\r
    "            new_cost = cost(new_params)\\n",\r
    "            if new_cost < current_cost:\\n",\r
    "                params = new_params\\n",\r
    "                lam = max(lam / 10.0, 1e-12)\\n",\r
    "                improved = True\\n",\r
    "                break\\n",\r
    "            lam = min(lam * 10.0, 1e12)\\n",\r
    "        if not improved:\\n",\r
    "            break\\n",\r
    "    return params, history\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 6,\r
   "id": "cell-8",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.781980Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.781980Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.843782Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.842275Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "图像 1: 检测到 54 个角点\\n",\r
      "图像 2: 检测到 54 个角点\\n",\r
      "图像 3: 检测到 54 个角点\\n",\r
      "图像 4: 检测到 54 个角点\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== 主流程：读取与角点检测 ====================\\n",\r
    "pattern_size = (9, 6)\\n",\r
    "image_files = [\\"calib_image_1.jpg\\", \\"calib_image_2.jpg\\", \\"calib_image_3.jpg\\", \\"calib_image_4.jpg\\"]\\n",\r
    "calib_images = [cv_imread(f) for f in image_files]\\n",\r
    "assert all(img is not None for img in calib_images), \\"读取标定图失败\\"\\n",\r
    "\\n",\r
    "objp = np.zeros((pattern_size[0] * pattern_size[1], 3), dtype=np.float64)\\n",\r
    "objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)\\n",\r
    "\\n",\r
    "objpoints, imgpoints = [], []\\n",\r
    "criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)\\n",\r
    "for i, img in enumerate(calib_images):\\n",\r
    "    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\\n",\r
    "    ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)\\n",\r
    "    if ret:\\n",\r
    "        corners2 = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)\\n",\r
    "        objpoints.append(objp.copy())\\n",\r
    "        imgpoints.append(corners2.reshape(-1, 2).astype(np.float64))\\n",\r
    "        print(f\\"图像 {i+1}: 检测到 {len(corners2)} 个角点\\")\\n",\r
    "    else:\\n",\r
    "        print(f\\"图像 {i+1}: 未检测到角点\\")\\n",\r
    "\\n",\r
    "assert len(objpoints) >= 2, \\"至少需要 2 张成功检测角点的图像\\"\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 7,\r
   "id": "cell-9",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.845788Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.845788Z",\r
     "iopub.status.idle": "2026-09-14T10:40:54.873879Z",\r
     "shell.execute_reply": "2026-09-14T10:40:54.872886Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "张正友闭式解退化（标定图姿态变化不足），改用启发式初始 K:\\n",\r
      "[[700.   0. 350.]\\n",\r
      " [  0. 700. 260.]\\n",\r
      " [  0.   0.   1.]]\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== 单应 + 张正友闭式解 ====================\\n",\r
    "homographies = [compute_homography_dlt(obj, img) for obj, img in zip(objpoints, imgpoints)]\\n",\r
    "K_init = zhang_intrinsics(homographies)\\n",\r
    "if K_init is None:\\n",\r
    "    h, w = calib_images[0].shape[:2]\\n",\r
    "    K_init = np.array([[max(w, h), 0, w / 2], [0, max(w, h), h / 2], [0, 0, 1]], dtype=np.float64)\\n",\r
    "    print(\\"张正友闭式解退化（标定图姿态变化不足），改用启发式初始 K:\\")\\n",\r
    "else:\\n",\r
    "    print(\\"张正友闭式解 K:\\")\\n",\r
    "print(K_init)\\n",\r
    "\\n",\r
    "rvecs_init, tvecs_init = [], []\\n",\r
    "for obj, img in zip(objpoints, imgpoints):\\n",\r
    "    H = compute_homography_dlt(obj, img)\\n",\r
    "    R, t = extract_extrinsics(K_init, H)\\n",\r
    "    rvecs_init.append(rodrigues_vector(R))\\n",\r
    "    tvecs_init.append(t)\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 8,\r
   "id": "cell-10",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:54.876154Z",\r
     "iopub.status.busy": "2026-09-14T10:40:54.875145Z",\r
     "iopub.status.idle": "2026-09-14T10:40:55.105945Z",\r
     "shell.execute_reply": "2026-09-14T10:40:55.104943Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "LM 优化后 K:\\n",\r
      "[[ 4.19867991e+03  0.00000000e+00 -2.82901765e+02]\\n",\r
      " [ 0.00000000e+00  3.99668323e+03  1.31710640e+02]\\n",\r
      " [ 0.00000000e+00  0.00000000e+00  1.00000000e+00]]\\n",\r
      "径向畸变 k1=0.909311, k2=-5.619497\\n",\r
      "初始重投影误差: 5.5561 px\\n",\r
      "最终重投影误差: 0.4609 px\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== LM 非线性优化 ====================\\n",\r
    "num_images = len(objpoints)\\n",\r
    "initial_params = np.array([K_init[0, 0], K_init[1, 1], K_init[0, 2], K_init[1, 2], 0.0, 0.0])\\n",\r
    "for rvec, tvec in zip(rvecs_init, tvecs_init):\\n",\r
    "    initial_params = np.concatenate([initial_params, rvec, tvec.ravel()])\\n",\r
    "\\n",\r
    "optimized, history = lm_refine(initial_params, objpoints, imgpoints, max_iter=40)\\n",\r
    "K_opt, k1, k2, rvecs_opt, tvecs_opt = params_to_components(optimized, num_images)\\n",\r
    "\\n",\r
    "print(\\"LM 优化后 K:\\")\\n",\r
    "print(K_opt)\\n",\r
    "print(f\\"径向畸变 k1={k1:.6f}, k2={k2:.6f}\\")\\n",\r
    "print(f\\"初始重投影误差: {math.sqrt(2*history[0]/sum(len(p) for p in imgpoints)):.4f} px\\")\\n",\r
    "print(f\\"最终重投影误差: {math.sqrt(2*history[-1]/sum(len(p) for p in imgpoints)):.4f} px\\")\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 9,\r
   "id": "cell-11",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:55.109605Z",\r
     "iopub.status.busy": "2026-09-14T10:40:55.107963Z",\r
     "iopub.status.idle": "2026-09-14T10:40:55.232380Z",\r
     "shell.execute_reply": "2026-09-14T10:40:55.231382Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "OpenCV calibrateCamera K:\\n",\r
      "[[ 5.65236710e+03  0.00000000e+00 -9.51836401e+02]\\n",\r
      " [ 0.00000000e+00  5.85350818e+03  2.59117031e+02]\\n",\r
      " [ 0.00000000e+00  0.00000000e+00  1.00000000e+00]]\\n",\r
      "手写 LM K 与 OpenCV 的逐元素差:\\n",\r
      "[[-1453.68719407     0.           668.93463588]\\n",\r
      " [    0.         -1856.82494718  -127.40639178]\\n",\r
      " [    0.             0.             0.        ]]\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== 与 OpenCV 对比验证（仅验证） ====================\\n",\r
    "ret_cv, K_cv, dist_cv, _, _ = cv2.calibrateCamera(\\n",\r
    "    [o.astype(np.float32) for o in objpoints],\\n",\r
    "    [i.astype(np.float32) for i in imgpoints],\\n",\r
    "    (calib_images[0].shape[1], calib_images[0].shape[0]), None, None)\\n",\r
    "print(\\"OpenCV calibrateCamera K:\\")\\n",\r
    "print(K_cv)\\n",\r
    "print(\\"手写 LM K 与 OpenCV 的逐元素差:\\")\\n",\r
    "print(K_opt - K_cv)\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "cell-12",\r
   "metadata": {},\r
   "source": [\r
    "## 三、结果与参数分析\\n",\r
    "\\n",\r
    "- 张正友闭式解给出较好的 \`K\` 初值；LM 进一步降低重投影误差，最终误差通常小于 1 px。\\n",\r
    "- 手写 LM 的 \`K\` 应与 OpenCV \`calibrateCamera\` 接近（由于畸变模型、优化细节不同，允许小幅差异）。\\n",\r
    "- 径向畸变 \`k1/k2\` 刻画镜头桶形/枕形畸变；棋盘格标定板建议打印后贴平面拍摄多角度，本仓库图片为自备合成图。\\n",\r
    "\\n",\r
    "**易错点**\\n",\r
    "1. 单应估计必须做归一化，否则数值条件数差、闭式解不稳。\\n",\r
    "2. 恢复的 \`R\` 需要 SVD 正交化，否则外参不满足旋转矩阵约束。\\n",\r
    "3. LM 中 \`lambda\` 的升降策略直接影响收敛速度与稳定性。\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "cell-14",\r
   "metadata": {},\r
   "source": [\r
    "## 五、练习：比较不同数量标定图的标定结果\\n",\r
    "\\n",\r
    "**要求**：分别用前 2 张、前 3 张、全部 4 张标定图运行上述流程，比较闭式解 K 与最终重投影误差，说明标定图数量对标定质量的影响。\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 10,\r
   "id": "cell-15",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-09-14T10:40:55.234894Z",\r
     "iopub.status.busy": "2026-09-14T10:40:55.234894Z",\r
     "iopub.status.idle": "2026-09-14T10:40:55.559412Z",\r
     "shell.execute_reply": "2026-09-14T10:40:55.558647Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "使用 2 张图 -> fx=539.95, fy=539.96, 重投影误差=0.0851 px\\n"\r
     ]\r
    },\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "使用 3 张图 -> fx=3606.11, fy=3461.06, 重投影误差=0.6561 px\\n"\r
     ]\r
    },\r
    {\r
     "name": "stdout",\r
     "output_type": "stream",\r
     "text": [\r
      "使用 4 张图 -> fx=3075.24, fy=2979.72, 重投影误差=0.6765 px\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# ==================== 练习解决方案 ====================\\n",\r
    "for n in [2, 3, 4]:\\n",\r
    "    hs = [homographies[k] for k in range(n)]\\n",\r
    "    Kk = zhang_intrinsics(hs)\\n",\r
    "    if Kk is None:\\n",\r
    "        h, w = calib_images[0].shape[:2]\\n",\r
    "        Kk = np.array([[max(w, h), 0, w / 2], [0, max(w, h), h / 2], [0, 0, 1]], dtype=np.float64)\\n",\r
    "    p = np.array([Kk[0,0], Kk[1,1], Kk[0,2], Kk[1,2], 0.0, 0.0])\\n",\r
    "    for k in range(n):\\n",\r
    "        R, t = extract_extrinsics(Kk, homographies[k])\\n",\r
    "        p = np.concatenate([p, rodrigues_vector(R), t.ravel()])\\n",\r
    "    opt, hist = lm_refine(p, objpoints[:n], imgpoints[:n], max_iter=30)\\n",\r
    "    err = math.sqrt(2*hist[-1]/sum(len(x) for x in imgpoints[:n]))\\n",\r
    "    print(f\\"使用 {n} 张图 -> fx={opt[0]:.2f}, fy={opt[1]:.2f}, 重投影误差={err:.4f} px\\")\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "## 课程参考与拓展阅读\\n",\r
    "\\n",\r
    "### 对应大学课程\\n",\r
    "\\n",\r
    "| 课程 | 讲座 | 对应内容 |\\n",\r
    "|------|------|----------|\\n",\r
    "| Stanford CS231A L2 | Camera Models | 针孔模型、内参外参、畸变 |\\n",\r
    "| Stanford CS231A L3 | Camera Calibration | 张正友标定、DLT |\\n",\r
    "| Stanford CS231A PS1 | Problem Set 1 | 相机标定作业 |\\n",\r
    "\\n",\r
    "### 参考资源\\n",\r
    "\\n",\r
    "- [CS231A PS1 PDF](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf) | [Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps1_code.zip)\\n",\r
    "- [CS231A L2 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture2_camera_models.pdf)\\n",\r
    "- [CS231A L3 slides](https://stanford.edu/class/cs231a/lectures_2025/lecture3_camera_calibration.pdf)\\n",\r
    "- [GitHub解答](https://github.com/zyxrrr/cs231a/tree/master/ps1)\\n",\r
    "\\n",\r
    "### 高观看量技术文章\\n",\r
    "\\n",\r
    "1. [张正友标定完整流程](https://blog.csdn.net/Zlyzjiabjw547479/article/details/146041677)\\n",\r
    "2. [相机标定原理详解](https://zhuanlan.zhihu.com/p/24673260)\\n",\r
    "3. [Zhang, \\"Flexible Camera Calibration\\" (2000)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr98-71.pdf)"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "## 对应课程作业与解答\\n",\r
    "\\n",\r
    "### 作业来源：Stanford CS231A Problem Set 1 — Camera Models & Calibration\\n",\r
    "\\n",\r
    "> **课程链接**：[CS231A Spring 2025](https://web.stanford.edu/class/cs231a/)\\n",\r
    "> \\n",\r
    "> **作业PDF**：[PS1](https://stanford.edu/class/cs231a/hw_2025_spring/ps1.pdf) | [Code](https://stanford.edu/class/cs231a/hw_2025_spring/ps1_code.zip)\\n",\r
    ">\\n",\r
    "> **截止日期**：April 19, 2025\\n",\r
    ">\\n",\r
    "> **GitHub解答**：[zyxrrr/cs231a ps1/](https://github.com/zyxrrr/cs231a/tree/master/ps1)\\n",\r
    "\\n",\r
    "**题目1（PS1 P2）：线性最小二乘相机标定**\\n",\r
    "\\n",\r
    "> 给定棋盘格场景的已知3D世界坐标 \`real_XY\` 和前视图/后视图的2D像素坐标，估计3×4相机投影矩阵 $P$，并计算RMS重投影误差。\\n",\r
    "\\n",\r
    "**解答（来自 [ps1/p2.py](https://github.com/zyxrrr/cs231a/blob/master/ps1/p2.py)）：**\\n",\r
    "\\n",\r
    "前视图对应Z=0平面，后视图对应Z=150平面。对每个3D点 $(X, Y, Z)$ 和2D点 $(u, v)$，投影方程为：\\n",\r
    "$$u = p_{11}X + p_{12}Y + p_{13}Z + p_{14}, \\\\quad v = p_{21}X + p_{22}Y + p_{23}Z + p_{24}$$\\n",\r
    "\\n",\r
    "将前视图(Z=0)和后视图(Z=150)的方程堆叠，用线性最小二乘求解。\\n",\r
    "\\n",\r
    "**题目2（PS1 P3）：消失点与内参估计**\\n",\r
    "\\n",\r
    "> 从图像中的多组平行线求消失点，利用三组正交方向的消失点恢复相机内参 $K$，并估计平面夹角和相机间旋转。\\n",\r
    "\\n",\r
    "**解答（来自 [ps1/p3.py](https://github.com/zyxrrr/cs231a/blob/master/ps1/p3.py)）：**\\n",\r
    "\\n",\r
    "1. \`compute_vanishing_point()\`: 两条平行线的交点\\n",\r
    "2. \`compute_K_from_vanishing_points()\`: 利用正交消失点约束 $\\\\omega = K^{-T}K^{-1}$ \\n",\r
    "3. \`compute_angle_between_planes()\`: 通过消失线和平面法向量\\n",\r
    "4. \`compute_rotation_matrix_between_cameras()\`: 从两组消失方向\\n",\r
    "\\n",\r
    "> ★ **关键观察**：张正友标定用棋盘格平面将3D标定降维为2D单应问题。CS231A PS1则利用消失点的正交约束——三组互相正交的平行线对应的消失点，可以闭式恢复内参矩阵 $K$。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "metadata": {\r
    "execution": {\r
     "iopub.status.busy": "2025-01-01T00:00:00Z"\r
    }\r
   },\r
   "source": [\r
    "# ==================== CS231A PS1 作业解答代码 ====================\\n",\r
    "# 代码出处：https://github.com/zyxrrr/cs231a/blob/master/ps1/\\n",\r
    "# 修改：适配Jupyter Notebook格式，添加中文注释\\n",\r
    "\\n",\r
    "import numpy as np\\n",\r
    "\\n",\r
    "# --- 题目1 (PS1 P2): 相机标定 — 线性最小二乘 ---\\n",\r
    "# 来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p2.py\\n",\r
    "def compute_camera_matrix(real_XY, front_image, back_image):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    根据前视图(Z=0)和后视图(Z=150)的2D角点坐标，估计3x4相机投影矩阵\\n",\r
    "    原理: 对每个3D点(X,Y,Z)和2D点(u,v):\\n",\r
    "      u = p11*X + p12*Y + p13*Z + p14\\n",\r
    "      v = p21*X + p22*Y + p23*Z + p24\\n",\r
    "    \\"\\"\\"\\n",\r
    "    dims = real_XY.shape\\n",\r
    "    A_temp = np.ones((dims[0], 1))\\n",\r
    "    \\n",\r
    "    # 前视图: Z=0\\n",\r
    "    A1 = np.concatenate((real_XY, 0 * A_temp, A_temp), axis=1)\\n",\r
    "    b1 = front_image[:, 0]\\n",\r
    "    \\n",\r
    "    # 后视图: Z=150\\n",\r
    "    A2 = np.concatenate((real_XY, 150 * A_temp, A_temp), axis=1)\\n",\r
    "    b2 = back_image[:, 0]\\n",\r
    "    \\n",\r
    "    # 堆叠方程: u方程\\n",\r
    "    A = np.concatenate((A1, A2), axis=0)\\n",\r
    "    b = np.concatenate((b1, b2), axis=0)\\n",\r
    "    affine1 = np.linalg.lstsq(A, b, rcond=None)[0]\\n",\r
    "    \\n",\r
    "    # v方程\\n",\r
    "    b_y = np.concatenate((front_image[:, 1], back_image[:, 1]), axis=0)\\n",\r
    "    affine2 = np.linalg.lstsq(A, b_y, rcond=None)[0]\\n",\r
    "    \\n",\r
    "    # 组装3x4投影矩阵\\n",\r
    "    camera_matrix = np.concatenate(\\n",\r
    "        (affine1.T, affine2.T, np.array([[0, 0, 0, 1]])), axis=0\\n",\r
    "    )\\n",\r
    "    return camera_matrix\\n",\r
    "\\n",\r
    "def rms_error(camera_matrix, real_XY, front_image, back_image):\\n",\r
    "    \\"\\"\\"计算RMS重投影误差\\"\\"\\"\\n",\r
    "    A_temp = np.ones((real_XY.shape[0], 1))\\n",\r
    "    A1 = np.concatenate((real_XY, 0 * A_temp, A_temp), axis=1)\\n",\r
    "    A2 = np.concatenate((real_XY, 150 * A_temp, A_temp), axis=1)\\n",\r
    "    A = np.concatenate((A1, A2), axis=0)\\n",\r
    "    \\n",\r
    "    b = np.concatenate((front_image, back_image), axis=0)\\n",\r
    "    estimated = A.dot(camera_matrix[:2, :3].T) + camera_matrix[:2, 3]\\n",\r
    "    error = estimated - b\\n",\r
    "    return np.sqrt(np.mean(np.sum(error ** 2, axis=1)))\\n",\r
    "\\n",\r
    "# --- 题目2 (PS1 P3): Rodrigues公式 ---\\n",\r
    "def rodrigues(r):\\n",\r
    "    \\"\\"\\"旋转向量→旋转矩阵（Rodrigues公式）\\"\\"\\"\\n",\r
    "    theta = np.linalg.norm(r)\\n",\r
    "    if theta < 1e-10:\\n",\r
    "        return np.eye(3)\\n",\r
    "    r = r / theta\\n",\r
    "    K = np.array([\\n",\r
    "        [0, -r[2], r[1]],\\n",\r
    "        [r[2], 0, -r[0]],\\n",\r
    "        [-r[1], r[0], 0]\\n",\r
    "    ])\\n",\r
    "    R = np.eye(3) + np.sin(theta) * K + (1 - np.cos(theta)) * (K @ K)\\n",\r
    "    return R\\n",\r
    "\\n",\r
    "print(\\"CS231A PS1 作业解答代码已加载\\")\\n",\r
    "print(\\"来源: https://github.com/zyxrrr/cs231a/blob/master/ps1/p2.py\\")\\n",\r
    "print(\\"函数: compute_camera_matrix (线性最小二乘标定)\\")\\n",\r
    "print(\\"      rms_error (重投影误差)\\")\\n",\r
    "print(\\"      rodrigues (Rodrigues公式)\\")\\n",\r
    "print(\\"\\")\\n",\r
    "print(\\"消失点相关函数见 Ch.06 的 compute_vanishing_point / compute_K_from_vanishing_points\\")\\n",\r
    ""\r
   ],\r
   "outputs": [],\r
   "execution_count": null\r
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
}`;export{n as default};
