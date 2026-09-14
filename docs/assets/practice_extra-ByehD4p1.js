const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "id": "f52fefae",\r
   "metadata": {},\r
   "source": [\r
    "# 第8章 图像拼接\\n",\r
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
   "id": "77860a32",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:37.598028Z",\r
     "iopub.status.busy": "2026-08-25T13:18:37.597880Z",\r
     "iopub.status.idle": "2026-08-25T13:18:37.908059Z",\r
     "shell.execute_reply": "2026-08-25T13:18:37.907452Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# -*- coding: utf-8 -*-\\n",\r
    "# 中文路径兼容的图像读写函数\\n",\r
    "import numpy as np\\n",\r
    "import cv2\\n",\r
    "import os\\n",\r
    "import random\\n",\r
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
    "    return False\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "3c744845",\r
   "metadata": {},\r
   "source": [\r
    "# 代码实现"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "8893ddde",\r
   "metadata": {},\r
   "source": [\r
    "在这一节中，我们将编程实现图像拼接。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 2,\r
   "id": "fcaa7dd5",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:37.909686Z",\r
     "iopub.status.busy": "2026-08-25T13:18:37.909495Z",\r
     "iopub.status.idle": "2026-08-25T13:18:37.916631Z",\r
     "shell.execute_reply": "2026-08-25T13:18:37.916056Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "random.seed(42)\\n",\r
    "\\n",\r
    "# 利用RANSAC算法剔除无效点\\n",\r
    "def compute_affine_xform(corners1, corners2, matches):\\n",\r
    "    \\n",\r
    "    # 设置最大迭代次数\\n",\r
    "    iteration = 50\\n",\r
    "    M_list = []\\n",\r
    "    \\n",\r
    "    # 存放每一次模型的正常样本个数\\n",\r
    "    inlier_num_list = []\\n",\r
    "    for _ in range(iteration):\\n",\r
    "        \\n",\r
    "        # 随机选择4个特征点对来拟合模型\\n",\r
    "        sample_index = random.sample(range(len(matches)), 4)\\n",\r
    "        x1_s, y1_s = corners1[matches[sample_index[0]][0]]\\n",\r
    "        x1_t, y1_t = corners2[matches[sample_index[0]][1]]\\n",\r
    "        x2_s, y2_s = corners1[matches[sample_index[1]][0]]\\n",\r
    "        x2_t, y2_t = corners2[matches[sample_index[1]][1]]\\n",\r
    "        x3_s, y3_s = corners1[matches[sample_index[2]][0]]\\n",\r
    "        x3_t, y3_t = corners2[matches[sample_index[2]][1]]\\n",\r
    "        x4_s, y4_s = corners1[matches[sample_index[3]][0]]\\n",\r
    "        x4_t, y4_t = corners2[matches[sample_index[3]][1]]\\n",\r
    "        \\n",\r
    "        # 编写矩阵A\\n",\r
    "        A = np.array([[x1_s, y1_s, 1, 0, 0, 0, \\n",\r
    "                       -x1_t*x1_s, -x1_t*y1_s, -x1_t],\\n",\r
    "                      [0, 0, 0, x1_s, y1_s, 1, \\n",\r
    "                       -y1_t*x1_s, -y1_t*y1_s, -y1_t],\\n",\r
    "                      [x2_s, y2_s, 1, 0, 0, 0, \\n",\r
    "                       -x2_t*x2_s, -x2_t*y2_s, -x2_t],\\n",\r
    "                      [0, 0, 0, x2_s, y2_s, 1, \\n",\r
    "                       -y2_t*x2_s, -y2_t*y2_s, -y2_t],\\n",\r
    "                      [x3_s, y3_s, 1, 0, 0, 0, \\n",\r
    "                       -x3_t*x3_s, -x3_t*y3_s, -x3_t],\\n",\r
    "                      [0, 0, 0, x3_s, y3_s, 1, \\n",\r
    "                       -y3_t*x3_s, -y3_t*y3_s, -y3_t],\\n",\r
    "                      [x4_s, y4_s, 1, 0, 0, 0, \\n",\r
    "                       -x4_t*x4_s, -x4_t*y4_s, -x4_t],\\n",\r
    "                      [0, 0, 0, x4_s, y4_s, 1, \\n",\r
    "                       -y4_t*x4_s, -y4_t*y4_s, -y4_t]\\n",\r
    "                      ])\\n",\r
    "        \\n",\r
    "        # 求解A的特征向量\\n",\r
    "        _,_, v = np.linalg.svd(A)\\n",\r
    "        \\n",\r
    "        # 取最小特征值对应的特征向量作为最终的结果\\n",\r
    "        M = np.reshape(v[-1], (3, 3))\\n",\r
    "        \\n",\r
    "        inlier_num = 0\\n",\r
    "        # 统计正常样本个数\\n",\r
    "        for (index1, index2) in matches:\\n",\r
    "            # coord是齐次坐标系的坐标\\n",\r
    "            coord1 = [corners1[index1][0], corners1[index1][1], 1]\\n",\r
    "            coord2 = [corners2[index2][0], corners2[index2][1], 1]\\n",\r
    "            # 计算将coord1齐次变换之后的坐标\\n",\r
    "            mapcoor = np.dot(M, coord1)\\n",\r
    "            # 将齐次坐标系中的w置为1\\n",\r
    "            mapcoor = mapcoor / mapcoor[-1]\\n",\r
    "            if np.linalg.norm(coord2 - mapcoor) < 5:\\n",\r
    "                inlier_num += 1\\n",\r
    "                \\n",\r
    "        # 将正常样本个数和对应的变换矩阵M记录在列表里\\n",\r
    "        M_list.append(M)\\n",\r
    "        inlier_num_list.append(inlier_num)\\n",\r
    "    \\n",\r
    "    # 获取列表中正常样本值最大的元素的下标\\n",\r
    "    best_index = np.argmax(inlier_num_list)\\n",\r
    "    # 获取对应的变换矩阵\\n",\r
    "    xform = M_list[best_index].astype(np.float64)\\n",\r
    "    \\n",\r
    "    # 统计属于模型异常样本的特征点对\\n",\r
    "    outlier_labels = []\\n",\r
    "    for (index1, index2) in matches:\\n",\r
    "        coord1 = [corners1[index1][0], corners1[index1][1], 1]\\n",\r
    "        coord2 = [corners2[index2][0], corners2[index2][1], 1]\\n",\r
    "        mapcoor = np.dot(xform, coord1)\\n",\r
    "        mapcoor = mapcoor/mapcoor[-1]\\n",\r
    "        if np.linalg.norm(coord2 - mapcoor) < 12:\\n",\r
    "            outlier_labels.append(1)\\n",\r
    "        else:\\n",\r
    "            outlier_labels.append(0)\\n",\r
    "    \\n",\r
    "    return xform, outlier_labels  "\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "3dc3cd42",\r
   "metadata": {},\r
   "source": [\r
    "为了在绘制时能够体现出异常点对，我们改写第7章中的draw_matches()函数。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 3,\r
   "id": "7571c92d",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:37.918011Z",\r
     "iopub.status.busy": "2026-08-25T13:18:37.917834Z",\r
     "iopub.status.idle": "2026-08-25T13:18:37.923243Z",\r
     "shell.execute_reply": "2026-08-25T13:18:37.922800Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "def draw_matches(image1, image2, corners1, corners2, \\n",\r
    "                 matches, outliers=None):\\n",\r
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
    "            if outliers:\\n",\r
    "                cv2.line(match_image, pt1, pt2, (255, 0, 0))\\n",\r
    "            else:\\n",\r
    "                cv2.line(match_image, pt1, pt2, (0, 0, 255))\\n",\r
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
    "            if outliers:\\n",\r
    "                cv2.line(match_image, pt1, pt2, (255, 0, 0))\\n",\r
    "            else:\\n",\r
    "                cv2.line(match_image, pt1, pt2, (0, 0, 255))\\n",\r
    "        \\n",\r
    "    return match_image"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "fd4ad10d",\r
   "metadata": {},\r
   "source": [\r
    "在此之后，我们编写图像变换与缝合的相关函数。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 4,\r
   "id": "411e8965",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:37.924828Z",\r
     "iopub.status.busy": "2026-08-25T13:18:37.924659Z",\r
     "iopub.status.idle": "2026-08-25T13:18:37.927882Z",\r
     "shell.execute_reply": "2026-08-25T13:18:37.927267Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "# 图像变换与缝合\\n",\r
    "def stitch_images(image1, image2, xform):\\n",\r
    "    # 将图像按照变换矩阵的方向进行变换\\n",\r
    "    new_image = cv2.warpPerspective(image1, xform, \\n",\r
    "                        (image2.shape[1],image2.shape[0]))\\n",\r
    "    image = new_image.copy()\\n",\r
    "    \\n",\r
    "    # 获取变换后的图像位置坐标\\n",\r
    "    h, w, _ = image1.shape\\n",\r
    "    pts = np.float32([[0, 0],\\n",\r
    "                      [0, h - 1],\\n",\r
    "                      [w - 1, h - 1],\\n",\r
    "                      [w - 1, 0]]).reshape(-1, 1, 2)\\n",\r
    "    dst = cv2.perspectiveTransform(pts, xform)\\n",\r
    "    \\n",\r
    "    # 画出缝合线\\n",\r
    "    image = cv2.polylines(image2, [np.int32(dst)], True, \\n",\r
    "                          255, 1, cv2.LINE_AA)\\n",\r
    "    \\n",\r
    "    # 将重叠部分的图像求平均\\n",\r
    "    image = np.where(new_image>0, 0.5*new_image+0.5*image, image)\\n",\r
    "    return image.astype(np.uint8)"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "d4f5773e",\r
   "metadata": {},\r
   "source": [\r
    "导入两张图像$\\\\boldsymbol{A}$和$\\\\boldsymbol{B}$，我们先计算图像的变换矩阵。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 5,\r
   "id": "fde077b5",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:37.929199Z",\r
     "iopub.status.busy": "2026-08-25T13:18:37.929021Z",\r
     "iopub.status.idle": "2026-08-25T13:18:38.073269Z",\r
     "shell.execute_reply": "2026-08-25T13:18:38.072696Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'detect_blobs' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[5]\\u001b[39m\\u001b[32m, line 8\\u001b[39m\\n\\u001b[32m      4\\u001b[39m gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) / \\u001b[32m255.0\\u001b[39m\\n\\u001b[32m      5\\u001b[39m gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY) / \\u001b[32m255.0\\u001b[39m\\n\\u001b[32m      6\\u001b[39m \\n\\u001b[32m      7\\u001b[39m g_images1, corners1, scales1, orientations1, layers1 = \\\\\\n\\u001b[32m----> \\u001b[39m\\u001b[32m8\\u001b[39m                                         detect_blobs(gray1)\\n\\u001b[32m      9\\u001b[39m g_images2, corners2, scales2, orientations2, layers2 = \\\\\\n\\u001b[32m     10\\u001b[39m                                         detect_blobs(gray2)\\n\\u001b[32m     11\\u001b[39m \\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'detect_blobs' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 读取图像\\n",\r
    "img1 = cv_imread('stitch1.jpg', cv2.IMREAD_COLOR)\\n",\r
    "img2 = cv_imread('stitch2.jpg', cv2.IMREAD_COLOR)\\n",\r
    "gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) / 255.0\\n",\r
    "gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY) / 255.0\\n",\r
    "\\n",\r
    "g_images1, corners1, scales1, orientations1, layers1 = \\\\\\n",\r
    "                                        detect_blobs(gray1)\\n",\r
    "g_images2, corners2, scales2, orientations2, layers2 = \\\\\\n",\r
    "                                        detect_blobs(gray2)\\n",\r
    "\\n",\r
    "# 计算两张图像的特征点\\n",\r
    "descriptors1 = compute_descriptors(g_images1, corners1, scales1, \\n",\r
    "                                   orientations1, layers1)\\n",\r
    "descriptors2 = compute_descriptors(g_images2, corners2, scales2, \\n",\r
    "                                   orientations2, layers2)\\n",\r
    "\\n",\r
    "# 匹配两张图像中的特征点\\n",\r
    "matches = match_descriptors(descriptors1, descriptors2)\\n",\r
    "\\n",\r
    "image1 = cv_imread('stitch1.jpg', cv2.IMREAD_GRAYSCALE)\\n",\r
    "image2 = cv_imread('stitch2.jpg', cv2.IMREAD_GRAYSCALE)\\n",\r
    "\\n",\r
    "# xform为变换矩阵，outlier_labels为模型的异常样本\\n",\r
    "xform, outlier_labels = compute_affine_xform(corners1, corners2, \\n",\r
    "                                             matches) \\n",\r
    "# 展示两张图像特征点的匹配\\n",\r
    "match_image = draw_matches(image1, image2, corners1, corners2, \\n",\r
    "                           matches, outliers=outlier_labels)\\n",\r
    "\\n",\r
    "plt.imshow(match_image)\\n",\r
    "plt.axis('off')\\n",\r
    "plt.plot()    \\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "b5f5c92a",\r
   "metadata": {},\r
   "source": [\r
    "在此之后，我们将其中一张图像进行变换，并与另一张图像拼接。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 6,\r
   "id": "81daeb53",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:38.074639Z",\r
     "iopub.status.busy": "2026-08-25T13:18:38.074461Z",\r
     "iopub.status.idle": "2026-08-25T13:18:38.084035Z",\r
     "shell.execute_reply": "2026-08-25T13:18:38.083609Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'xform' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[6]\\u001b[39m\\u001b[32m, line 6\\u001b[39m\\n\\u001b[32m      2\\u001b[39m img1_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)\\n\\u001b[32m      3\\u001b[39m img2_rgb = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)\\n\\u001b[32m      4\\u001b[39m \\n\\u001b[32m      5\\u001b[39m \\u001b[38;5;66;03m# 使用转换后的 RGB 图像拼接\\u001b[39;00m\\n\\u001b[32m----> \\u001b[39m\\u001b[32m6\\u001b[39m image = stitch_images(img1_rgb, img2_rgb, xform)\\n\\u001b[32m      7\\u001b[39m \\n\\u001b[32m      8\\u001b[39m \\u001b[38;5;66;03m# 确保图像是 uint8 格式，然后显示\\u001b[39;00m\\n\\u001b[32m      9\\u001b[39m plt.imshow(image.astype(np.uint8))\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'xform' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 假设 img1 和 img2 是 BGR 格式的图像，将它们转换为 RGB\\n",\r
    "img1_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)\\n",\r
    "img2_rgb = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)\\n",\r
    "\\n",\r
    "# 使用转换后的 RGB 图像拼接\\n",\r
    "image = stitch_images(img1_rgb, img2_rgb, xform)\\n",\r
    "\\n",\r
    "# 确保图像是 uint8 格式，然后显示\\n",\r
    "plt.imshow(image.astype(np.uint8))\\n",\r
    "plt.axis('off')\\n",\r
    "plt.show()"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "7ff654d4",\r
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
   "id": "b69f2887",\r
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
   "id": "70797cde",\r
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
   "id": "a4fe886b",\r
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
   "execution_count": 7,\r
   "id": "b2c90661",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:38.085829Z",\r
     "iopub.status.busy": "2026-08-25T13:18:38.085673Z",\r
     "iopub.status.idle": "2026-08-25T13:18:38.089510Z",\r
     "shell.execute_reply": "2026-08-25T13:18:38.089097Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "SyntaxError",\r
     "evalue": "invalid syntax (4127060134.py, line 1)",\r
     "output_type": "error",\r
     "traceback": [\r
      "  \\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[7]\\u001b[39m\\u001b[32m, line 1\\u001b[39m\\n\\u001b[31m    \\u001b[39m\\u001b[31m\`\`\`python\\u001b[39m\\n    ^\\n\\u001b[31mSyntaxError\\u001b[39m\\u001b[31m:\\u001b[39m invalid syntax\\n"\r
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
   "id": "f7c8e939",\r
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
