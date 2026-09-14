const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "id": "98c66ef5",\r
   "metadata": {},\r
   "source": [\r
    "# 第7章 特征检测\\n",\r
    "\\n",\r
    "本章节学习目标：\\n",\r
    "\\n",\r
    "- 理解本章核心算法的**数学原理**\\n",\r
    "- 掌握算法的**手写实现**方法\\n",\r
    "- 学会使用 OpenCV 对应函数进行**工程实践**\\n",\r
    "- 通过编程练习加深对算法的理解\\n",\r
    "\\n",\r
    "> **📌 学习建议**：先阅读概念说明，再动手编写代码，最后完成练习\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 1,\r
   "id": "11587a6f",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:01.893493Z",\r
     "iopub.status.busy": "2026-08-25T13:18:01.893227Z",\r
     "iopub.status.idle": "2026-08-25T13:18:01.957774Z",\r
     "shell.execute_reply": "2026-08-25T13:18:01.957042Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# -*- coding: utf-8 -*-\\n",\r
    "# 中文路径兼容的图像读写函数\\n",\r
    "import numpy as np\\n",\r
    "import cv2\\n",\r
    "import os\\n",\r
    "\\n",\r
    "def cv_imread(filepath, flags=cv2.IMREAD_COLOR):\\n",\r
    "    \\"\\"\\"支持中文路径的图像读取\\"\\"\\"\\n",\r
    "    with open(filepath, 'rb') as f:\\n",\r
    "        buf = np.frombuffer(f.read(), dtype=np.uint8)\\n",\r
    "    return cv2.imdecode(buf, flags)\\n",\r
    "\\n",\r
    "def cv_imwrite(filepath, img):\\n",\r
    "    \\"\\"\\"支持中文路径的图像写入\\"\\"\\"\\n",\r
    "    ext = os.path.splitext(filepath)[1]\\n",\r
    "    success, buf = cv2.imencode(ext, img)\\n",\r
    "    if success:\\n",\r
    "        with open(filepath, 'wb') as f:\\n",\r
    "            f.write(buf.tobytes())\\n",\r
    "        return True\\n",\r
    "    return False\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "73f10d69",\r
   "metadata": {},\r
   "source": [\r
    "# 代码实现\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "5808caf2",\r
   "metadata": {},\r
   "source": [\r
    "我们将通过编程实现SIFT算法。将SIFT的每一步流程都编写成一个函数。首先，我们来实现尺度空间的生成。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 2,\r
   "id": "90e3f105",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:01.959777Z",\r
     "iopub.status.busy": "2026-08-25T13:18:01.959564Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.390699Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.390047Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "import cv2\\n",\r
    "import numpy as np\\n",\r
    "from scipy.ndimage import maximum_filter\\n",\r
    "import matplotlib.pyplot as plt\\n",\r
    "import random\\n",\r
    "\\n",\r
    "\\n",\r
    "# 生成指定数目的高斯核，并对图像做高斯滤波\\n",\r
    "def generateGimage(image, sigma, num_layers = 8, k_stride = 2):\\n",\r
    "    sigma_res = np.sqrt(np.max([(sigma ** 2) - ((1) ** 2), 0.01]))\\n",\r
    "    # (0,0)表示卷积核的大小根据sigma来决定\\n",\r
    "    image = cv2.GaussianBlur(image, (0, 0), sigmaX=sigma_res, \\n",\r
    "                             sigmaY=sigma_res)\\n",\r
    "    \\n",\r
    "    # 生成高斯核\\n",\r
    "    k = 2 ** (1 / k_stride)\\n",\r
    "    gaussian_kernels = np.zeros(num_layers)\\n",\r
    "    # 第一层高斯就是1.6\\n",\r
    "    gaussian_kernels[0] = sigma\\n",\r
    "    \\n",\r
    "    for i in range(1, num_layers):\\n",\r
    "        # 根据高斯的性质，可以将大的高斯核拆分，减少计算量\\n",\r
    "        gaussian_old = k**(i-1) * sigma\\n",\r
    "        gaussian_new = k * gaussian_old\\n",\r
    "        gaussian_kernels[i] = np.sqrt(gaussian_new**2 - gaussian_old**2)\\n",\r
    "    \\n",\r
    "    # 至此，我们已经得到一系列高斯核\\n",\r
    "    \\n",\r
    "    # 进行高斯模糊\\n",\r
    "    gaussian_images = [image]\\n",\r
    "    for kernel in gaussian_kernels:\\n",\r
    "        tmp_image = cv2.GaussianBlur(image, (0, 0), sigmaX=kernel, \\n",\r
    "                                     sigmaY=kernel)\\n",\r
    "        gaussian_images.append(tmp_image)\\n",\r
    "    \\n",\r
    "    # 返回不同高斯核对图像滤波的结果\\n",\r
    "    return np.array(gaussian_images)\\n",\r
    "        \\n",\r
    "    \\n",\r
    "# 生成DoG空间\\n",\r
    "def generateDoGSpace(gaussian_images):\\n",\r
    "    dog_images = []\\n",\r
    "    for img1, img2 in zip(gaussian_images, gaussian_images[1:]):\\n",\r
    "        dog_images.append(img2 - img1)\\n",\r
    "    return dog_images\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "7f9db460",\r
   "metadata": {},\r
   "source": [\r
    "在生成图像的尺度空间之后，需要检测图像的特征点，这包含以下两个步骤：1.判断每个位置其是否为局部极值点；2.若为极值点，则对其进行定位与筛选，并计算最终选出的特征点的特征。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 3,\r
   "id": "8c4c9865",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.392249Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.392046Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.395594Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.395000Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 1.判别当前像素点是否为局部最大值点\\n",\r
    "def isLocalExtremum(l1, l2, l3, threshold):\\n",\r
    "    # l1，l2，l3是DoG尺度空间中相邻的3层，大小均已被切片成 3*3\\n",\r
    "    # 即[l1,l2,l3]是一个cube\\n",\r
    "    # 需要确定l2层的中心位置，即(1,1)位置是否为极值点\\n",\r
    "    # threshold是一个设定的阈值，l2[1,1]必须大于阈值才可进行极值点的判定\\n",\r
    "    if l2[1,1] > threshold:\\n",\r
    "        if l2[1,1] > 0:\\n",\r
    "            return np.all(l2[1,1]>=l1) and np.all(l2[1,1]>=l3) \\\\\\n",\r
    "                    and np.sum(l2[1,1]<l2)==0\\n",\r
    "        \\n",\r
    "        elif l2[1,1] < 0:\\n",\r
    "            return np.all(l2[1,1]<=l1) and np.all(l2[1,1]<=l3) \\\\\\n",\r
    "                    and np.sum(l2[1,1]>l2)==0\\n",\r
    "    return False"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 4,\r
   "id": "04068fac",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.398469Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.398245Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.403964Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.403435Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 2.若为极值点，则对其进行定位与筛选，并计算最终选出的特征点的特征。\\n",\r
    "# 在这一模块中，我们将编写实现计算特征点各个属性\\n",\r
    "# 参考7.2.2节以及7.2.3节\\n",\r
    "\\n",\r
    "\\n",\r
    "# 计算极值点特征\\n",\r
    "def computeBlobAttribute(x, y, layer, dog_images, sigma, threshold,\\n",\r
    "                        border, num_layers, g_image, corners, \\n",\r
    "                        scales, orientations, layers):\\n",\r
    "    # 计算(x,y)位置的特征点的特征\\n",\r
    "    # 此时假设该位置的点为邻域内的最大值\\n",\r
    "    # 首先需要对其进行筛选，根据牛顿迭代法判定是否为真正的极值点\\n",\r
    "    # 筛除低对比度的特征点\\n",\r
    "    # 消除边缘响应\\n",\r
    "    # 在此之后便可得到特征点的信息\\n",\r
    "    \\n",\r
    "    gamma = 10\\n",\r
    "    image_shape = dog_images[0].shape\\n",\r
    "    out_flag = False\\n",\r
    "    \\n",\r
    "    # 使用牛顿迭代法得到极值点\\n",\r
    "    # 至多更新5次，如果未收敛，则认为该候选点不是极值点\\n",\r
    "    for iter_num in range(5):\\n",\r
    "        # 得到DoG空间中相邻的3层\\n",\r
    "        img1, img2, img3 = dog_images[layer-1:layer+2]\\n",\r
    "        # 对这3层进行切片，得到大小为3*3的3层\\n",\r
    "        cube = np.array([img1[x-1:x+2, y-1:y+2], \\n",\r
    "                         img2[x-1:x+2, y-1:y+2],\\n",\r
    "                         img3[x-1:x+2, y-1:y+2]])\\n",\r
    "        \\n",\r
    "        # 分别得到cube的一二阶导数\\n",\r
    "        grad = compute1derivative(cube)\\n",\r
    "        hessian = compute2derivative(cube)\\n",\r
    "        \\n",\r
    "        # 解方程得到牛顿迭代的更新值\\n",\r
    "        update = -np.linalg.lstsq(hessian, grad, rcond=None)[0]\\n",\r
    "        # 如果移动的距离太小，说明当前点里极值已收敛，直接返回当前点即可\\n",\r
    "        if abs(update[0]) < 0.5 and abs(update[1]) < 0.5 \\\\\\n",\r
    "            and abs(update[2]) < 0.5:\\n",\r
    "            break\\n",\r
    "        # 更新当前点\\n",\r
    "        y += int(round(update[0]))\\n",\r
    "        x += int(round(update[1]))\\n",\r
    "        layer += int(round(update[2]))\\n",\r
    "        # 确保新的cube在DoG空间里\\n",\r
    "        if x < border or x >= image_shape[0] - border \\\\\\n",\r
    "                        or y < border \\\\\\n",\r
    "                        or y >= image_shape[1] - border \\\\\\n",\r
    "                        or layer < 1 or layer > num_layers - 2:\\n",\r
    "            # 若不在空间中，则 out_flag = True\\n",\r
    "            out_flag = True\\n",\r
    "            break\\n",\r
    "        \\n",\r
    "    # 超出空间大小或者未不收敛，直接返回\\n",\r
    "    if out_flag or iter_num >= 4:\\n",\r
    "        return \\n",\r
    "    \\n",\r
    "    # 使用公式计算极值点的对比度\\n",\r
    "    Extremum = cube[1, 1, 1] + 0.5 * np.dot(grad, update)\\n",\r
    "    # 筛除低对比度的特征点\\n",\r
    "    if np.abs(Extremum) >= threshold:\\n",\r
    "        # 得到xy的黑塞矩阵\\n",\r
    "        xy_hessian = hessian[:2, :2]\\n",\r
    "        xy_hessian_trace = np.trace(xy_hessian)\\n",\r
    "        xy_hessian_det = np.linalg.det(xy_hessian)\\n",\r
    "        # 消除边缘响应\\n",\r
    "        if xy_hessian_det > 0 and \\\\\\n",\r
    "            (xy_hessian_trace ** 2) / xy_hessian_det < \\\\\\n",\r
    "            ((gamma + 1) ** 2) / gamma:\\n",\r
    "            # 极值点坐标\\n",\r
    "            pt = ((y + update[0]), (x + update[1]))\\n",\r
    "            # 极值点尺度\\n",\r
    "            size = sigma * (2 ** ((layer + update[2])))\\n",\r
    "            # 计算特征点的方向（主方向和辅方向）\\n",\r
    "            # 利用computeOrien()函数进行计算\\n",\r
    "            orien_list = computeOrien(pt, size, layer, g_image)\\n",\r
    "            for tmp_orien in orien_list:\\n",\r
    "                # 尺度\\n",\r
    "                scales.append(size)\\n",\r
    "                # 位置\\n",\r
    "                layers.append(layer)\\n",\r
    "                corners.append(pt)\\n",\r
    "                # 方向\\n",\r
    "                orientations.append(tmp_orien)\\n",\r
    "    return "\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "3daa34d4",\r
   "metadata": {},\r
   "source": [\r
    "接着对上述代码中出现的一些函数进行进一步的实现。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 5,\r
   "id": "32974d58",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.405330Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.405163Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.408990Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.408370Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 编写一些数学函数\\n",\r
    "\\n",\r
    "# 计算一阶导数\\n",\r
    "def compute1derivative(cube):\\n",\r
    "    # cube是由DoG空间中相邻的3层组成，其中每层的大小被切片成 3*3\\n",\r
    "    # 需要计算cube正中心位置的梯度\\n",\r
    "    dx = (cube[1, 1, 2] - cube[1, 1, 0]) / 2\\n",\r
    "    dy = (cube[1, 2, 1] - cube[1, 0, 1]) / 2\\n",\r
    "    ds = (cube[2, 1, 1] - cube[0, 1, 1]) / 2\\n",\r
    "    return np.array([dx, dy, ds])\\n",\r
    "\\n",\r
    "\\n",\r
    "# 计算二阶导数\\n",\r
    "def compute2derivative(cube):\\n",\r
    "    # cube是由DoG空间中相邻的3层组成，其中每层的大小被切片成 3*3\\n",\r
    "    # 需要计算cube正中心位置的梯度\\n",\r
    "    \\n",\r
    "    # 根据二阶导数的定义写出各个分量\\n",\r
    "    center = cube[1, 1, 1]\\n",\r
    "    \\n",\r
    "    dxx = cube[1, 1, 2] + cube[1, 1, 0] - 2 * center\\n",\r
    "    dyy = cube[1, 2, 1] + cube[1, 0, 1] - 2 * center\\n",\r
    "    dss = cube[2, 1, 1] + cube[0, 1, 1] - 2 * center\\n",\r
    "\\n",\r
    "    dxy = (cube[1, 2, 2] - cube[1, 2, 0] \\n",\r
    "           - cube[1, 0, 2] + cube[1, 0, 0]) / 4\\n",\r
    "    dxs = (cube[2, 1, 2] - cube[2, 1, 0] \\n",\r
    "           - cube[0, 1, 2] + cube[0, 1, 0]) / 4\\n",\r
    "    dys = (cube[2, 2, 1] - cube[2, 0, 1] \\n",\r
    "           - cube[0, 2, 1] + cube[0, 0, 1]) / 4\\n",\r
    "    \\n",\r
    "    return np.array([[dxx, dxy, dxs], [dxy, dyy, dys],[dxs, dys, dss]])"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 6,\r
   "id": "e4f13db4",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.410537Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.410406Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.415414Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.414919Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 计算特征点的方向\\n",\r
    "def computeOrien(pt, size, layer, g_image):\\n",\r
    "    # pt为特征点的位置\\n",\r
    "    # size为对应的尺度大小\\n",\r
    "    # layer为特征点所在层级\\n",\r
    "    # g_image为高斯尺度空间的一层，即 g_images[layer]\\n",\r
    "    \\n",\r
    "    # 1.5倍的3sigma原则，决定圆半径的大小\\n",\r
    "    radius = int(round(3 * size * 1.5))\\n",\r
    "    image_shape = g_image.shape\\n",\r
    "    # 设置直方图柱的数量\\n",\r
    "    num_bins = 36\\n",\r
    "    histogram = np.zeros(num_bins)\\n",\r
    "    smooth_histogram = np.zeros(num_bins)\\n",\r
    "    orien_list = []\\n",\r
    "\\n",\r
    "    # 遍历以特征点为中心的块状区域，块状区域的边长为2*radius\\n",\r
    "    for i in range(-radius, radius + 1):\\n",\r
    "        y = int(round(pt[1])) + i\\n",\r
    "        # 判断坐标是否越界\\n",\r
    "        if y > 0 and y < image_shape[0] - 1:\\n",\r
    "            for j in range(-radius, radius + 1):\\n",\r
    "                x = int(round(pt[0])) + j\\n",\r
    "                # 判断坐标是否越界\\n",\r
    "                if x > 0 and x < image_shape[1] - 1:\\n",\r
    "                    # 计算当前位置的dx和dy\\n",\r
    "                    dx = 0.5 * (g_image[y, x + 1] - g_image[y, x - 1])\\n",\r
    "                    dy = 0.5 * (g_image[y + 1, x] - g_image[y - 1, x])\\n",\r
    "                    # 计算当前位置梯度的值\\n",\r
    "                    value = np.sqrt(dx * dx + dy * dy)\\n",\r
    "                    # 计算当前位置梯度的方向\\n",\r
    "                    orien = np.rad2deg(np.arctan2(dy, dx))\\n",\r
    "                    # 高斯加权\\n",\r
    "                    weight = np.exp(\\n",\r
    "                        -0.5 / ((size*1.5) ** 2) \\n",\r
    "                        * (i ** 2 + j ** 2)\\n",\r
    "                        )  \\n",\r
    "                    histogram_index = int(\\n",\r
    "                        round(orien * num_bins / 360.)\\n",\r
    "                        )\\n",\r
    "                    histogram[histogram_index % num_bins] += \\\\\\n",\r
    "                                weight * value\\n",\r
    "\\n",\r
    "    # 对直方图进行高斯平滑\\n",\r
    "    for n in range(num_bins):\\n",\r
    "        smooth_histogram[n] = (6 * histogram[n] \\n",\r
    "            + 4 * (histogram[n-1] + histogram[(n+1) % num_bins]) \\n",\r
    "            + histogram[n-2] + histogram[(n+2) % num_bins]) / 16.\\n",\r
    "    # 选择主方向\\n",\r
    "    orien_max = np.max(smooth_histogram)\\n",\r
    "    orien_local_max = list(i for i in range(len(smooth_histogram)) \\n",\r
    "            if smooth_histogram[i] > smooth_histogram[i-1] and\\n",\r
    "            smooth_histogram[i] > smooth_histogram[(i+1)%num_bins])\\n",\r
    "    \\n",\r
    "    # 选择辅方向\\n",\r
    "    for index in orien_local_max:\\n",\r
    "        if smooth_histogram[index] >= 0.8 * orien_max:\\n",\r
    "            orien_list.append(index * 360. / num_bins)\\n",\r
    "    \\n",\r
    "    return orien_list"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "1de195ad",\r
   "metadata": {},\r
   "source": [\r
    "至此，可以编写确定特征点的函数模块。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 7,\r
   "id": "8365f9b9",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.417347Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.417179Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.420818Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.420318Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 对一张图像进行特征点检测\\n",\r
    "def detect_blobs(image):\\n",\r
    "    sigma = 1.6\\n",\r
    "    num_layers = 4\\n",\r
    "    border = 5\\n",\r
    "    k_stride = 1\\n",\r
    "    \\n",\r
    "    # 生成高斯尺度空间\\n",\r
    "    g_images = generateGimage(image, sigma, num_layers, k_stride)\\n",\r
    "    # 生成DoG空间\\n",\r
    "    dog_images = generateDoGSpace(g_images)\\n",\r
    "        \\n",\r
    "    # 开始寻找块状区域\\n",\r
    "    threshold = 0.02\\n",\r
    "    corners = []\\n",\r
    "    scales = []\\n",\r
    "    orientations = []\\n",\r
    "    layers = []\\n",\r
    "    \\n",\r
    "    for layer, (image1, image2, image3) in \\\\\\n",\r
    "        enumerate(zip(dog_images, dog_images[1:], dog_images[2:])):\\n",\r
    "        # 忽略太靠近边缘的点\\n",\r
    "        for x in range(border, image1.shape[0]-border):\\n",\r
    "            for y in range(border, image2.shape[1]-border):\\n",\r
    "                # 检测当前位置是否为局部极值\\n",\r
    "                if isLocalExtremum(image1[x-1:x+2, y-1:y+2], \\n",\r
    "                                   image2[x-1:x+2, y-1:y+2], \\n",\r
    "                                   image3[x-1:x+2, y-1:y+2], \\n",\r
    "                                   threshold):\\n",\r
    "                    # 如果是候选点，则进行进一步定位筛选，并返回其信息\\n",\r
    "                    computeBlobAttribute(x, y, layer+1, dog_images, \\n",\r
    "                                         sigma, threshold, border, \\n",\r
    "                                         num_layers, g_images[layer], \\n",\r
    "                                         corners, scales, orientations, \\n",\r
    "                                         layers)\\n",\r
    "                    \\n",\r
    "    return g_images, corners, scales, orientations, layers  \\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "3dfd7c38",\r
   "metadata": {},\r
   "source": [\r
    "接下来，对检测到的特征点进行描述符的生成。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 8,\r
   "id": "1d65c3ca",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.423952Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.423824Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.431441Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.430929Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# SIFT特征点描述符的生成\\n",\r
    "def compute_descriptors(g_images, corners, scales, \\n",\r
    "                        orientations, layers):\\n",\r
    " \\n",\r
    "    if len(corners) != len(scales) \\\\\\n",\r
    "        or len(corners) != len(orientations):\\n",\r
    "        raise ValueError(\\n",\r
    "          '\`corners\`, \`scales\` and \`orientations\` \\\\\\n",\r
    "          must all have the same length.')\\n",\r
    "    \\n",\r
    "    descriptors_list = []\\n",\r
    "    \\n",\r
    "    for pt, size, orien, layer in \\\\\\n",\r
    "        zip(corners, scales, orientations, layers):\\n",\r
    "        \\n",\r
    "        # 读取特征点的各项信息\\n",\r
    "        g_image = g_images[layer]\\n",\r
    "        x, y = np.round(np.array(pt)).astype(np.int32)\\n",\r
    "        orien = 360 - orien\\n",\r
    "        \\n",\r
    "        # 计算块状区域大小\\n",\r
    "        win_s = 3 * size\\n",\r
    "        win_l = int(round(min(2**0.5 * win_s * (4+1) / 2, \\n",\r
    "            np.sqrt(g_image.shape[0]**2+g_image.shape[1]**2))))\\n",\r
    "        \\n",\r
    "        # 用列表依次存储块状区域内所有点的信息\\n",\r
    "        i_index = []\\n",\r
    "        j_index = []\\n",\r
    "        value_list = []\\n",\r
    "        orien_index = []\\n",\r
    "        \\n",\r
    "        # 三维数组存储16个窗口的8个方向，为防止计算时边界溢出，\\n",\r
    "        # 在行、列的首尾各扩展一次\\n",\r
    "        result_cube = np.zeros((4 + 2, 4 + 2, 8)) \\n",\r
    "        \\n",\r
    "        # 统计一个块状区域内16个子区域的像素梯度直方图\\n",\r
    "        for i in range(-win_l, win_l+1):\\n",\r
    "            for j in range(-win_l, win_l+1):\\n",\r
    "                \\n",\r
    "                # 获得旋转之后的坐标\\n",\r
    "                i_rotate = j * np.sin(np.deg2rad(orien)) \\\\\\n",\r
    "                        + i * np.cos(np.deg2rad(orien))\\n",\r
    "                j_rotate = j * np.cos(np.deg2rad(orien)) \\\\\\n",\r
    "                        - i * np.sin(np.deg2rad(orien))\\n",\r
    "                \\n",\r
    "                # 计算4*4子区域对应的下标\\n",\r
    "                tmp_i = (i_rotate / win_s) + 2 - 0.5\\n",\r
    "                tmp_j = (j_rotate / win_s) + 2 - 0.5\\n",\r
    "                \\n",\r
    "                # 邻域的点在旋转后，仍然处于4*4的区域内\\n",\r
    "                if tmp_i > -1 and tmp_j > -1 \\\\\\n",\r
    "                    and tmp_i < 4 and tmp_j < 4:\\n",\r
    "                    \\n",\r
    "                    # 该特征点在原图像中的位置\\n",\r
    "                    i_inimg = int(round(y + i))\\n",\r
    "                    j_inimg = int(round(x + j))\\n",\r
    "                    \\n",\r
    "                    if i_inimg > 0 and j_inimg > 0 \\\\\\n",\r
    "                        and i_inimg < g_image.shape[0]-1 \\\\\\n",\r
    "                        and j_inimg < g_image.shape[1]-1:\\n",\r
    "                        # 计算梯度大小\\n",\r
    "                        dx = g_image[i_inimg, j_inimg + 1] \\\\\\n",\r
    "                            - g_image[i_inimg, j_inimg - 1]\\n",\r
    "                        dy = g_image[i_inimg - 1, j_inimg] \\\\\\n",\r
    "                            - g_image[i_inimg + 1, j_inimg]\\n",\r
    "                        grad_value = np.sqrt(dx**2 + dy**2)\\n",\r
    "                        # 计算梯度方向\\n",\r
    "                        grad_orien = np.rad2deg(\\n",\r
    "                            np.arctan2(dy, dx)) % 360\\n",\r
    "                        \\n",\r
    "                        i_index.append(tmp_i)\\n",\r
    "                        j_index.append(tmp_j)\\n",\r
    "                        # 进行高斯加权\\n",\r
    "                        g_weight = np.exp(-1 / 8 * (\\n",\r
    "                            (i_rotate / win_s) ** 2 + \\n",\r
    "                            (j_rotate / win_s) ** 2)\\n",\r
    "                            )\\n",\r
    "                        value_list.append(g_weight * grad_value)\\n",\r
    "                        # 将梯度方向投影到8个方向\\n",\r
    "                        # 这里的grad_orien是原图像中的梯度\\n",\r
    "                        # 需要叠加上旋转之后的角度\\n",\r
    "                        orien_index.append(\\n",\r
    "                            (grad_orien - orien) * 8 / 360)\\n",\r
    "        \\n",\r
    "        # 将每个方向的幅值插入进矩阵result_cube中\\n",\r
    "        for i, j, value, orien1 in zip(i_index, j_index, value_list, orien_index):\\n",\r
    "            tirlinearInterpolation(i, j, value, orien1, result_cube)\\n",\r
    "            \\n",\r
    "        descriptor = result_cube[1:-1, 1:-1, :].flatten()  \\n",\r
    "        # 计算描述符的大小\\n",\r
    "        l2norm = np.linalg.norm(descriptor)\\n",\r
    "        # 设定阈值\\n",\r
    "        threshold = l2norm * 0.2\\n",\r
    "        # 将描述符进行截断，将大于阈值的值设定为阈值\\n",\r
    "        descriptor[descriptor > threshold] = threshold\\n",\r
    "        # 归一化，确保描述符具有尺度不变性\\n",\r
    "        descriptor /= l2norm\\n",\r
    "        # 添加描述符\\n",\r
    "        descriptors_list.append(descriptor)\\n",\r
    "        \\n",\r
    "    return descriptors_list\\n",\r
    "\\n",\r
    "\\n",\r
    "# 将每个方向的幅值插入进矩阵result_cube中\\n",\r
    "def tirlinearInterpolation(i, j, value, orien, result_cube):\\n",\r
    "    \\n",\r
    "    # 由于位置坐标(i,j,orien)是一个浮点数，没有办法直接在result_cube中赋值\\n",\r
    "    # 考虑到该浮点位置会对临近的8个整数坐标都有一定的贡献\\n",\r
    "    # （可以将该浮点坐标想象成一个正方体中的一点，它对正方体的8个顶点都有贡献）\\n",\r
    "    # 我们可以根据三线性插值法，根据该点到各顶点的距离为相邻的8个顶点赋值\\n",\r
    "    # 感兴趣的同学可以自行学习三线性插值法\\n",\r
    "    \\n",\r
    "    # 对坐标先进性量化，将其转换为整数\\n",\r
    "    i_quant = int(np.floor(i))\\n",\r
    "    j_quant = int(np.floor(j))\\n",\r
    "    orien_quant = int(np.floor(orien)) % 8\\n",\r
    "    \\n",\r
    "    # 计算量化前后的偏移量\\n",\r
    "    i_residual = i - i_quant\\n",\r
    "    j_residual =  j - j_quant\\n",\r
    "    orien_residual = (orien - orien_quant) % 8\\n",\r
    "    \\n",\r
    "    # 根据三线性插值法写出当前位置对每个顶点的权重\\n",\r
    "    c0 = (1 - i_residual) * value\\n",\r
    "    c1 = i_residual * value\\n",\r
    "    c11 = c1 * j_residual\\n",\r
    "    c10 = c1 * (1 - j_residual)\\n",\r
    "    c01 = c0 * j_residual\\n",\r
    "    c00 = c0 * (1 - j_residual)\\n",\r
    "    \\n",\r
    "    c111 = c11 * orien_residual\\n",\r
    "    c110 = c11 * (1 - orien_residual)\\n",\r
    "    c101 = c10 * orien_residual\\n",\r
    "    c100 = c10 * (1 - orien_residual)\\n",\r
    "    c011 = c01 * orien_residual\\n",\r
    "    c010 = c01 * (1 - orien_residual)\\n",\r
    "    c001 = c00 * orien_residual\\n",\r
    "    c000 = c00 * (1 - orien_residual)\\n",\r
    "    \\n",\r
    "    # 进行赋值操作\\n",\r
    "    result_cube[i_quant + 1, j_quant + 1, orien_quant] += c000\\n",\r
    "    result_cube[i_quant + 1, j_quant + 1, (orien_quant + 1) % 8] += c001\\n",\r
    "    result_cube[i_quant + 1, j_quant + 2, orien_quant] += c010\\n",\r
    "    result_cube[i_quant + 1, j_quant + 2, (orien_quant + 1) % 8] += c011\\n",\r
    "    result_cube[i_quant + 2, j_quant + 1, orien_quant] += c100\\n",\r
    "    result_cube[i_quant + 2, j_quant + 1, (orien_quant + 1) % 8] += c101\\n",\r
    "    result_cube[i_quant + 2, j_quant + 2, orien_quant] += c110\\n",\r
    "    result_cube[i_quant + 2, j_quant + 2, (orien_quant + 1) % 8] += c111\\n",\r
    "    \\n",\r
    "    return "\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "06c1ba6b",\r
   "metadata": {},\r
   "source": [\r
    "至此，我们已经完成SIFT特征的编写。先导入两张图像，寻找他们的特征点。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 9,\r
   "id": "7bdad4ca",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.434620Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.434492Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.437053Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.436650Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 展示图像中的特征点\\n",\r
    "def draw(img, corners):\\n",\r
    "    # corners为特征点的坐标\\n",\r
    "    img1 = img.copy()\\n",\r
    "    for m in corners:\\n",\r
    "        pt = (int(m[0]), int(m[1]))\\n",\r
    "        cv2.circle(img1, pt, 1, (0,255,0), 2)\\n",\r
    "    return img1"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 10,\r
   "id": "fbd58892",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.439978Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.439847Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.596948Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.596287Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "FileNotFoundError",\r
     "evalue": "[Errno 2] No such file or directory: 'sift1.png'",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mFileNotFoundError\\u001b[39m                         Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[10]\\u001b[39m\\u001b[32m, line 2\\u001b[39m\\n\\u001b[32m      1\\u001b[39m \\u001b[38;5;66;03m# 读取图像\\u001b[39;00m\\n\\u001b[32m----> \\u001b[39m\\u001b[32m2\\u001b[39m img1 = cv_imread(\\u001b[33m'sift1.png'\\u001b[39m, cv2.IMREAD_COLOR)\\n\\u001b[32m      3\\u001b[39m img2 = cv_imread(\\u001b[33m'sift2.png'\\u001b[39m, cv2.IMREAD_COLOR)\\n\\u001b[32m      4\\u001b[39m \\n\\u001b[32m      5\\u001b[39m gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) / \\u001b[32m255.0\\u001b[39m\\n",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[1]\\u001b[39m\\u001b[32m, line 9\\u001b[39m, in \\u001b[36mcv_imread\\u001b[39m\\u001b[34m(filepath, flags)\\u001b[39m\\n\\u001b[32m      7\\u001b[39m \\u001b[38;5;28;01mdef\\u001b[39;00m cv_imread(filepath, flags=cv2.IMREAD_COLOR):\\n\\u001b[32m      8\\u001b[39m     \\u001b[33m\\"\\"\\"支持中文路径的图像读取\\"\\"\\"\\u001b[39m\\n\\u001b[32m----> \\u001b[39m\\u001b[32m9\\u001b[39m     \\u001b[38;5;28;01mwith\\u001b[39;00m open(filepath, \\u001b[33m'rb'\\u001b[39m) \\u001b[38;5;28;01mas\\u001b[39;00m f:\\n\\u001b[32m     10\\u001b[39m         buf = np.frombuffer(f.read(), dtype=np.uint8)\\n\\u001b[32m     11\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m cv2.imdecode(buf, flags)\\n",\r
      "\\u001b[31mFileNotFoundError\\u001b[39m: [Errno 2] No such file or directory: 'sift1.png'"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 读取图像\\n",\r
    "img1 = cv_imread('sift1.png', cv2.IMREAD_COLOR)\\n",\r
    "img2 = cv_imread('sift2.png', cv2.IMREAD_COLOR)\\n",\r
    "\\n",\r
    "gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) / 255.0\\n",\r
    "gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY) / 255.0\\n",\r
    "\\n",\r
    "# 获得两张图像特征点的各项信息\\n",\r
    "g_images1, corners1, scales1, orientations1, layers1 = \\\\\\n",\r
    "                                    detect_blobs(gray1)\\n",\r
    "g_images2, corners2, scales2, orientations2, layers2 = \\\\\\n",\r
    "                                    detect_blobs(gray2)\\n",\r
    "\\n",\r
    "# 获得两张图像的SIFT特征点\\n",\r
    "descriptors1 = compute_descriptors(g_images1, corners1, scales1, \\n",\r
    "                                   orientations1, layers1)\\n",\r
    "descriptors2 = compute_descriptors(g_images2, corners2, scales2, \\n",\r
    "                                   orientations2, layers2)\\n",\r
    "\\n",\r
    "img1_detect = draw(img1, corners1)\\n",\r
    "img2_detect = draw(img2, corners2)\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 11,\r
   "id": "43785a4b",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.602374Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.602160Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.657905Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.656140Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'img1_detect' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[11]\\u001b[39m\\u001b[32m, line 4\\u001b[39m\\n\\u001b[32m      1\\u001b[39m \\u001b[38;5;66;03m# 展示两张图像的特征点\\u001b[39;00m\\n\\u001b[32m      2\\u001b[39m plt.title(\\u001b[33m'Output1'\\u001b[39m)\\n\\u001b[32m      3\\u001b[39m plt.axis(\\u001b[33m'off'\\u001b[39m)\\n\\u001b[32m----> \\u001b[39m\\u001b[32m4\\u001b[39m plt.imshow(img1_detect[:, :, ::-\\u001b[32m1\\u001b[39m])\\n\\u001b[32m      5\\u001b[39m plt.show()\\n\\u001b[32m      6\\u001b[39m \\n\\u001b[32m      7\\u001b[39m plt.title(\\u001b[33m'Output2'\\u001b[39m)\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'img1_detect' is not defined"\r
     ]\r
    },\r
    {\r
     "data": {\r
      "image/png": "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CgEAQQAACAIAQBAAAIIAAAhGhQCAIAAABAEAIAgAAEEAAASjQgBAEAAAggAAEAQAgCAAAIJRIQAgCAAAQQAACAIAQBAAAMGoEAAQBACAIAAABAEAIAgAgGBUCAAIAgBAEAAAggAAEAQAQDAqBAAEAQAgCAAAQQAACAIAIBgVAgCCAAAQBACAIAAABAEAEIwKAQBBAAAIAgBAEAAAggAACEaFAIAgAAAEAQAgCAAAQQAABKNCAEAQAACCAAAQBACAIAAAglEhACAIAABBAAAIAgBAEAAAwagQABAEAIAgAAAEAQAgCACAYFQIAAgCAEAQAACCAAAQBABAMCoEAAQBACAIAABBAAAIAgAgGBUCAIIAABAEAIAgAAAEAQAQjAoBAEEAAAgCAEAQAACCAAAIRoUAgCAAAAQBACAIAABBAAAEo0IAQBAAAIIAABAEAIAgAACCUSEAIAgAAEEAAAgCAEAQAADBqBAAEAQAgCAAAAQBACAIAIBgVAgACAIAQBAAAIIAABAEAEAwKgQABAEAIAgAAEEAAAgCACAYFQIAggAAEAQAgCAAAAQBABCMCgEAQQAACAIAQBAAAIIAAAhGhQCAIAAABAEAIAgAAEEAAASjQgBAEAAAggAAEAQAgCAAAIJRIQAgCAAAQQAACAIAQBAAAMGoEAAQBACAIAAABAEAIAgAgGBUCAAIAgBAEAAAggAAEAQAQDAqBAAEAQAgCAAAQQAACAIAIBgVAgCCAAAQBACAIAAABAEAEIwKAQBBAAAIAgBAEAAAggAACEaFAIAgAAAEAQAgCAAAQQAABKNCAEAQAACCAAAQBACAIAAAglEhACAIAABBAAAIAgBAEAAAwagQABAEAIAgAAAEAQAgCACAYFQIAAgCAEAQAACCAAAQBABAMCoEAAQBACAIAABBAAAIAgAgGBUCAIIAABAEAIAgAAAEAQAQjAoBAEEAAAgCAEAQAACCAAAIRoUAgCAAAAQBACAIAABBAAAEo0IAQBAAAIIAABAEAIAgAACCUSEAIAgAAEEAAAgCAEAQAADBqBAAEAQAgCAAAAQBACAIAIBgVAgACAIAQBAAAIIAABAEAEAwKgQABAEAIAgAAEEAAAgCACAYFQIAggAAEAQAgCAAAAQBABCMCgEAQQAACAIAQBAAAIIAAAhGhQCAIAAABAEAIAgAAEEAAASjQgBAEAAAggAAEAQAgCAAAIJRIQAgCAAAQQAACAIAQBAAAMGoEAAQBACAIAAABAEAIAgAgGBUCAAIAgBAEAAAggAAEAQAQDAqBAAEAQAgCAAgkdJ/ANAybdk6s6DyAAAAAElFTkSuQmCC",\r
      "text/plain": [\r
       "<Figure size 640x480 with 1 Axes>"\r
      ]\r
     },\r
     "metadata": {},\r
     "output_type": "display_data"\r
    }\r
   ],\r
   "source": [\r
    "# 展示两张图像的特征点\\n",\r
    "plt.title('Output1')\\n",\r
    "plt.axis('off')\\n",\r
    "plt.imshow(img1_detect[:, :, ::-1])\\n",\r
    "plt.show()\\n",\r
    "\\n",\r
    "plt.title('Output2')\\n",\r
    "plt.axis('off')\\n",\r
    "plt.imshow(img2_detect[:, :, ::-1])\\n",\r
    "plt.show()"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "a434d014",\r
   "metadata": {},\r
   "source": [\r
    "接下来，需要将寻找出的特征点进行匹配"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 12,\r
   "id": "7b7eb2bb",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.663278Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.662757Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.669944Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.668744Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 特征点匹配\\n",\r
    "def match_descriptors(descriptors1, descriptors2):\\n",\r
    "\\n",\r
    "    max_index = np.zeros((len(descriptors1))) - 1\\n",\r
    "    # 初始化第一和第二近的特征点对数组\\n",\r
    "    maxmatch = np.zeros((len(descriptors1))) + 1e10\\n",\r
    "    secmatch = np.zeros((len(descriptors1))) + 1e10\\n",\r
    "    # 设定阈值\\n",\r
    "    threshold = 0.8\\n",\r
    "\\n",\r
    "    for vec1_index in range(len(descriptors1)):\\n",\r
    "        for vec2_index in range(len(descriptors2)):\\n",\r
    "            # 计算特征点对的距离\\n",\r
    "            distance = np.linalg.norm(descriptors1[vec1_index] \\\\\\n",\r
    "                                      - descriptors2[vec2_index])\\n",\r
    "            if distance < maxmatch[vec1_index]:\\n",\r
    "                # 更新当前最匹配的特征点\\n",\r
    "                maxmatch[vec1_index] = distance\\n",\r
    "                # 记录当前特征点对的距离\\n",\r
    "                max_index[vec1_index] = vec2_index\\n",\r
    "                \\n",\r
    "            elif distance < secmatch[vec1_index]:\\n",\r
    "                # 更新第二近特征点对的距离\\n",\r
    "                # 这里只需要更新距离即可，因为不关心哪一个点是第二近的\\n",\r
    "                secmatch[vec1_index] = distance\\n",\r
    "\\n",\r
    "    matches = []\\n",\r
    "    # 返回匹配的特征点对的坐标信息\\n",\r
    "    for i in range(len(descriptors1)):\\n",\r
    "        if maxmatch[i] / secmatch[i] < threshold:\\n",\r
    "            matches.append((i, int(max_index[i])))\\n",\r
    "\\n",\r
    "    return matches"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 13,\r
   "id": "70fcc6af",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.674042Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.673518Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.683405Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.682089Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "def draw_matches(image1, image2, corners1, corners2, matches):\\n",\r
    "    # 获得两张图像的分辨率\\n",\r
    "    h1, w1 = image1.shape\\n",\r
    "    h2, w2 = image2.shape\\n",\r
    "    hres = 0\\n",\r
    "    if h1 >= h2:\\n",\r
    "        hres = int((h1 - h2) / 2)\\n",\r
    "    \\n",\r
    "        # 将两张图像拼接成高度一致的图像，方便进行特征点对的比对\\n",\r
    "        match_image = np.zeros((h1, w1 + w2, 3), np.uint8)\\n",\r
    "\\n",\r
    "        # 对R、G、B图像分别处理\\n",\r
    "        for i in range(3):\\n",\r
    "            match_image[: h1, : w1, i] = image1\\n",\r
    "            match_image[hres: hres + h2, w1: w1 + w2, i] = image2\\n",\r
    "\\n",\r
    "        for i in range(len(matches)):\\n",\r
    "            m = matches[i]\\n",\r
    "            # 获得匹配的特征点对在图中的坐标\\n",\r
    "            pt1 = (int(corners1[m[0]][0]), int(corners1[m[0]][1]))\\n",\r
    "            pt2 = (int(corners2[m[1]][0] + w1), \\n",\r
    "                   int(corners2[m[1]][1] + hres))\\n",\r
    "            # 将其圈出\\n",\r
    "            cv2.circle(match_image, pt1, 1, (0,255,0), 2)\\n",\r
    "            cv2.circle(match_image, (pt2[0], pt2[1]), 1, (0,255,0), 2)\\n",\r
    "            # 画线相连\\n",\r
    "            cv2.line(match_image, pt1, pt2, (0, 0, 255))\\n",\r
    "    else:\\n",\r
    "        hres = int((h2 - h1) / 2)\\n",\r
    "        \\n",\r
    "         # 将两张图像拼接成高度一致的图像，方便进行特征点对的比对\\n",\r
    "        match_image = np.zeros((h2, w1 + w2, 3), np.uint8)\\n",\r
    "\\n",\r
    "        # 对R、G、B图像分别处理\\n",\r
    "        for i in range(3):\\n",\r
    "            match_image[hres: hres + h1, : w1, i] = image1\\n",\r
    "            match_image[: h2, w1: w1 + w2, i] = image2\\n",\r
    "\\n",\r
    "        for i in range(len(matches)):\\n",\r
    "            m = matches[i]\\n",\r
    "            # 获得匹配的特征点对在图中的坐标\\n",\r
    "            pt1 = (int(corners1[m[0]][0]), \\n",\r
    "                   int(corners1[m[0]][1] + hres))\\n",\r
    "            pt2 = (int(corners2[m[1]][0] + w1), \\n",\r
    "                   int(corners2[m[1]][1]))\\n",\r
    "            # 将其圈出\\n",\r
    "            cv2.circle(match_image, pt1, 1, (0,255,0), 2)\\n",\r
    "            cv2.circle(match_image, (pt2[0], pt2[1]), 1, (0,255,0), 2)\\n",\r
    "            # 画线相连\\n",\r
    "            cv2.line(match_image, pt1, pt2, (0, 0, 255))\\n",\r
    "        \\n",\r
    "    return match_image\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 14,\r
   "id": "45e7e9de",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.686002Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.685614Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.711928Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.709353Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'descriptors1' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[14]\\u001b[39m\\u001b[32m, line 2\\u001b[39m\\n\\u001b[32m      1\\u001b[39m \\u001b[38;5;66;03m# 进行图像匹配\\u001b[39;00m\\n\\u001b[32m----> \\u001b[39m\\u001b[32m2\\u001b[39m matches = match_descriptors(descriptors1, descriptors2)\\n\\u001b[32m      3\\u001b[39m image1 = cv_imread(\\u001b[33m'sift1.png'\\u001b[39m, cv2.IMREAD_GRAYSCALE)\\n\\u001b[32m      4\\u001b[39m image2 = cv_imread(\\u001b[33m'sift2.png'\\u001b[39m, cv2.IMREAD_GRAYSCALE)\\n\\u001b[32m      5\\u001b[39m \\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'descriptors1' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 进行图像匹配\\n",\r
    "matches = match_descriptors(descriptors1, descriptors2)\\n",\r
    "image1 = cv_imread('sift1.png', cv2.IMREAD_GRAYSCALE)\\n",\r
    "image2 = cv_imread('sift2.png', cv2.IMREAD_GRAYSCALE)\\n",\r
    "\\n",\r
    "# 绘制匹配连线\\n",\r
    "match_image = draw_matches(image1, image2, corners1, corners2, matches)\\n",\r
    "\\n",\r
    "plt.title('Match')\\n",\r
    "plt.imshow(match_image)\\n",\r
    "plt.axis('off')\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "9effb2e4",\r
   "metadata": {},\r
   "source": [\r
    "可以很明显的看出，两幅图像中相同的特征点完美的匹配在了一起。再这之后，便可以进行图像拼接等一系列后续操作了。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "8cad82d1",\r
   "metadata": {},\r
   "source": [\r
    "\\n",\r
    "---\\n",\r
    "\\n",\r
    "## 📝 \\n",\r
    "练习：本章算法手写实现与扩展\\n",\r
    "\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "f4a86f20",\r
   "metadata": {},\r
   "source": [\r
    "**练习目标**：基于本章所学内容，完成以下实践任务。\\n",\r
    "\\n",\r
    "**要求**：\\n",\r
    "1. 手写实现本章的核心算法（不直接调用 OpenCV/PyTorch 对应函数）\\n",\r
    "2. 使用本章学习的方法处理至少 2 张不同的测试图像\\n",\r
    "3. 对比手写实现与现成库函数的结果差异\\n",\r
    "4. 分析算法参数对结果的影响\\n",\r
    "5. 撰写 200 字以上的实验报告"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "6853f22d",\r
   "metadata": {},\r
   "source": [\r
    "\\n",\r
    "**💡 小提示**：\\n",\r
    "- 除 \`cv_imread\` / \`cv_imwrite\` 外，不直接调用 OpenCV 高层函数\\n",\r
    "- 使用 NumPy 进行矩阵运算\\n",\r
    "- 注意边界处理和数值范围\\n",\r
    "- 对比手写实现与库函数的结果\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "e9ff5849",\r
   "metadata": {},\r
   "source": [\r
    "\\n",\r
    "<details>\\n",\r
    "<summary><b>🔑 点击查看完整解决方案</b></summary>\\n",\r
    "\\n",\r
    "---\\n",\r
    "\\n",\r
    "### 解决方案详解\\n",\r
    "\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 15,\r
   "id": "037dc493",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:03.717041Z",\r
     "iopub.status.busy": "2026-08-25T13:18:03.716666Z",\r
     "iopub.status.idle": "2026-08-25T13:18:03.726492Z",\r
     "shell.execute_reply": "2026-08-25T13:18:03.724863Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "SyntaxError",\r
     "evalue": "invalid syntax (4127060134.py, line 1)",\r
     "output_type": "error",\r
     "traceback": [\r
      "  \\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[15]\\u001b[39m\\u001b[32m, line 1\\u001b[39m\\n\\u001b[31m    \\u001b[39m\\u001b[31m\`\`\`python\\u001b[39m\\n    ^\\n\\u001b[31mSyntaxError\\u001b[39m\\u001b[31m:\\u001b[39m invalid syntax\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "\`\`\`python\\n",\r
    "# 本章练习代码框架\\n",\r
    "import numpy as np\\n",\r
    "import cv2\\n",\r
    "import os\\n",\r
    "import matplotlib.pyplot as plt\\n",\r
    "\\n",\r
    "def cv_imread(filepath, flags=cv2.IMREAD_COLOR):\\n",\r
    "    \\"\\"\\"支持中文路径的图像读取\\"\\"\\"\\n",\r
    "    with open(filepath, 'rb') as f:\\n",\r
    "        buf = np.frombuffer(f.read(), dtype=np.uint8)\\n",\r
    "    return cv2.imdecode(buf, flags)\\n",\r
    "\\n",\r
    "def cv_imwrite(filepath, img):\\n",\r
    "    \\"\\"\\"支持中文路径的图像写入\\"\\"\\"\\n",\r
    "    ext = os.path.splitext(filepath)[1]\\n",\r
    "    success, buf = cv2.imencode(ext, img)\\n",\r
    "    if success:\\n",\r
    "        with open(filepath, 'wb') as f:\\n",\r
    "            f.write(buf.tobytes())\\n",\r
    "        return True\\n",\r
    "    return False\\n",\r
    "\\n",\r
    "# ============================================\\n",\r
    "# TODO: 在此处手写实现本章核心算法\\n",\r
    "# ============================================\\n",\r
    "\\n",\r
    "# 示例框架：\\n",\r
    "# 1. 数据准备\\n",\r
    "# img = cv_imread('test_image.jpg')\\n",\r
    "# gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\\n",\r
    "\\n",\r
    "# 2. 手写算法实现\\n",\r
    "# def algorithm_manual(input_image, **params):\\n",\r
    "#     # TODO: 实现算法核心逻辑\\n",\r
    "#     # 要求：除 OpenCV 读写函数外，其余代码手写\\n",\r
    "#     return output\\n",\r
    "\\n",\r
    "# 3. 对比验证\\n",\r
    "# result_manual = algorithm_manual(gray)\\n",\r
    "# result_library = cv2.XXX(gray)  # 对应库函数\\n",\r
    "# diff = np.abs(result_manual.astype(float) - result_library.astype(float))\\n",\r
    "# print(f\\"最大差异: {diff.max()}\\")\\n",\r
    "\\n",\r
    "# 4. 参数敏感性分析\\n",\r
    "# for param in [param1, param2, param3]:\\n",\r
    "#     result = algorithm_manual(gray, param=param)\\n",\r
    "#     # 可视化结果变化\\n",\r
    "\\n",\r
    "# 5. 实验报告\\n",\r
    "print(\\"请完成上述练习并撰写实验报告\\")\\n",\r
    "\`\`\`\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "61fe0eec",\r
   "metadata": {},\r
   "source": [\r
    "\\n",\r
    "### 💻 代码要点解释\\n",\r
    "\\n",\r
    "1. **图像读取与保存**：使用自定义的 \`cv_imread\` / \`cv_imwrite\` 函数，解决 Windows 中文路径下 OpenCV 读写图像失败的问题\\n",\r
    "\\n",\r
    "2. **算法核心**：手写实现的核心在于**不依赖现成库函数**，而是直接操作像素和矩阵运算\\n",\r
    "\\n",\r
    "3. **对比验证**：通过与 OpenCV 对应函数的结果进行数值对比，验证手写实现的正确性\\n",\r
    "\\n",\r
    "4. **参数分析**：调整算法参数，观察输出变化，理解每个参数的物理含义\\n",\r
    "\\n",\r
    "5. **扩展思考**：尝试将算法应用到自己的图像上，或改进算法（如增加加速技巧）\\n",\r
    "\\n",\r
    "---\\n",\r
    "\\n",\r
    "</details>\\n",\r
    "\\n",\r
    "---\\n"\r
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
   "version": "3.14.3"\r
  }\r
 },\r
 "nbformat": 4,\r
 "nbformat_minor": 5\r
}`;export{n as default};
