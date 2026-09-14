const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "id": "2062b8f3",\r
   "metadata": {},\r
   "source": [\r
    "# 第16章 照相机标定\\n",\r
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
   "id": "3f4d1dcd",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:45.716024Z",\r
     "iopub.status.busy": "2026-08-25T13:18:45.715751Z",\r
     "iopub.status.idle": "2026-08-25T13:18:45.784777Z",\r
     "shell.execute_reply": "2026-08-25T13:18:45.784224Z"\r
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
   "id": "605fc84c",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.01007,\r
     "end_time": "2023-07-20T08:44:53.685298",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:53.675228",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "## 代码实现"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "8c386500",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.010247,\r
     "end_time": "2023-07-20T08:44:53.727462",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:53.717215",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "接下来，我们来学习照相机标定的代码实现。为了方便理解，我们不考虑照相机畸变的影响。整个流程包括从标定板图像中提取角点，计算单应性矩阵，求解内参矩阵，求解外参矩阵，最后通过重投影误差来评估标定的准确性。这里我们采用OpenCV样例中的标定图像作为样例，有条件的同学也可以自己打印或者购买标定板进行拍照获取标定板图像。\\n",\r
    "<!-- 在这里我们将介绍一下OpenCV标定算法的标定流程： -->\\n",\r
    "<!-- （1）：由于镜头畸变的影响比较小，首先假定照相机是理想无畸变的，根据角点的二维坐标与三维坐标的对应关系来计算初始的照相机内参；\\n",\r
    "（2）：求解照相机外参；\\n",\r
    "（3）：应用最小二乘求解实际的畸变系数；\\n",\r
    "（4）：根据求解的内外参对空间点进行重投影，应用全局$Levenberg-Marquardt$优化算法来最小化重投影和原投影点之间的误差。 -->"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 2,\r
   "id": "34193a3e",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:45.786548Z",\r
     "iopub.status.busy": "2026-08-25T13:18:45.786261Z",\r
     "iopub.status.idle": "2026-08-25T13:18:55.734393Z",\r
     "shell.execute_reply": "2026-08-25T13:18:55.732708Z"\r
    },\r
    "papermill": {\r
     "duration": 2.60379,\r
     "end_time": "2023-07-20T08:44:56.341786",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:53.737996",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [\r
    {\r
     "name": "stderr",\r
     "output_type": "stream",\r
     "text": [\r
      "Cloning into 'Hands-on-CV'...\\n"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 首先clone对应仓库\\n",\r
    "! git clone https://github.com/boyu-ai/Hands-on-CV.git"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 3,\r
   "id": "df165d65",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:55.737636Z",\r
     "iopub.status.busy": "2026-08-25T13:18:55.737121Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.067164Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.065943Z"\r
    },\r
    "papermill": {\r
     "duration": 0.661361,\r
     "end_time": "2023-07-20T08:44:57.014911",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:56.353550",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [\r
    {\r
     "ename": "IndexError",\r
     "evalue": "list index out of range",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mIndexError\\u001b[39m                                Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[3]\\u001b[39m\\u001b[32m, line 15\\u001b[39m\\n\\u001b[32m     11\\u001b[39m \\u001b[38;5;66;03m# 可视化4张棋盘格图像\\u001b[39;00m\\n\\u001b[32m     12\\u001b[39m plt.figure()\\n\\u001b[32m     13\\u001b[39m \\u001b[38;5;28;01mfor\\u001b[39;00m i \\u001b[38;5;28;01min\\u001b[39;00m range(\\u001b[32m4\\u001b[39m):\\n\\u001b[32m     14\\u001b[39m     plt.subplot(\\u001b[32m2\\u001b[39m, \\u001b[32m2\\u001b[39m, i+\\u001b[32m1\\u001b[39m)\\n\\u001b[32m---> \\u001b[39m\\u001b[32m15\\u001b[39m     img = cv_imread(image_dirs[i], \\u001b[32m0\\u001b[39m)\\n\\u001b[32m     16\\u001b[39m     plt.imshow(img, cmap=\\u001b[33m\\"gray\\"\\u001b[39m)\\n\\u001b[32m     17\\u001b[39m     plt.axis(\\u001b[33m\\"off\\"\\u001b[39m)\\n",\r
      "\\u001b[31mIndexError\\u001b[39m: list index out of range"\r
     ]\r
    },\r
    {\r
     "data": {\r
      "image/png": "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",\r
      "text/plain": [\r
       "<Figure size 640x480 with 1 Axes>"\r
      ]\r
     },\r
     "metadata": {},\r
     "output_type": "display_data"\r
    }\r
   ],\r
   "source": [\r
    "import cv2\\n",\r
    "import glob\\n",\r
    "import numpy as np\\n",\r
    "import matplotlib.pyplot as plt\\n",\r
    "%matplotlib inline\\n",\r
    "\\n",\r
    "# 首先获取图像路径\\n",\r
    "image_dirs = sorted(glob.glob(\\"./Hands-on-CV/第13章 照相机标定/left*.jpg\\"), \\n",\r
    "                    key=lambda x: int(x.split(\\"/\\")[-1].split(\\".\\")[0][4:]))\\n",\r
    "\\n",\r
    "# 可视化4张棋盘格图像\\n",\r
    "plt.figure()\\n",\r
    "for i in range(4):\\n",\r
    "    plt.subplot(2, 2, i+1)\\n",\r
    "    img = cv_imread(image_dirs[i], 0)\\n",\r
    "    plt.imshow(img, cmap=\\"gray\\")\\n",\r
    "    plt.axis(\\"off\\")"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "0e425e61",\r
   "metadata": {},\r
   "source": [\r
    "从上图可以看到在标定板上的角点，我们可以通过角点检测算法来获取这些角点的坐标。在OpenCV中提供了一个函数 \`cv2.findChessboardCorners()\` 来帮助我们检测棋盘格角点。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 4,\r
   "id": "ec998984",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.071228Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.070775Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.098279Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.097322Z"\r
    },\r
    "papermill": {\r
     "duration": 0.028777,\r
     "end_time": "2023-07-20T08:44:57.060012",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:57.031235",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [\r
    {\r
     "ename": "UnboundLocalError",\r
     "evalue": "cannot access local variable 'img' where it is not associated with a value",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mUnboundLocalError\\u001b[39m                         Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[4]\\u001b[39m\\u001b[32m, line 38\\u001b[39m\\n\\u001b[32m     34\\u001b[39m \\n\\u001b[32m     35\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m objpoints, imgpoints, gray\\n\\u001b[32m     36\\u001b[39m \\n\\u001b[32m     37\\u001b[39m \\u001b[38;5;66;03m# 调用detect_corner函数检测每张图像的角点\\u001b[39;00m\\n\\u001b[32m---> \\u001b[39m\\u001b[32m38\\u001b[39m objpoints, imgpoints, gray = detect_corner(image_dirs)\\n",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[4]\\u001b[39m\\u001b[32m, line 31\\u001b[39m, in \\u001b[36mdetect_corner\\u001b[39m\\u001b[34m(image_dirs)\\u001b[39m\\n\\u001b[32m     27\\u001b[39m             objpoints.append(objp[:, :\\u001b[32m2\\u001b[39m])\\n\\u001b[32m     28\\u001b[39m             imgpoints.append(corners.reshape(-\\u001b[32m1\\u001b[39m, \\u001b[32m2\\u001b[39m))\\n\\u001b[32m     29\\u001b[39m \\n\\u001b[32m     30\\u001b[39m     \\u001b[38;5;66;03m# 使用OpenCV自带的绘图可视化角点检测效果，从红色开始绘制，紫色结束\\u001b[39;00m\\n\\u001b[32m---> \\u001b[39m\\u001b[32m31\\u001b[39m     cv2.drawChessboardCorners(img, (\\u001b[32m7\\u001b[39m,\\u001b[32m6\\u001b[39m), corners, ret)\\n\\u001b[32m     32\\u001b[39m     plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))\\n\\u001b[32m     33\\u001b[39m     plt.show()\\n\\u001b[32m     34\\u001b[39m \\n",\r
      "\\u001b[31mUnboundLocalError\\u001b[39m: cannot access local variable 'img' where it is not associated with a value"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def detect_corner(image_dirs):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    检测图像中的角点并返回，同时可视化角点检测效果。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 根据标定板决定用来标定的角点的个数，这里以(7, 6)为例\\n",\r
    "    num_corner = (7, 6)\\n",\r
    "    # 创建一个列表来保存每张图像中角点的三维坐标\\n",\r
    "    objpoints = []\\n",\r
    "    # 创建一个列表来保存每张图像中角点的二维坐标\\n",\r
    "    imgpoints = []\\n",\r
    "\\n",\r
    "    #定义三维坐标:[row, co1, z]\\n",\r
    "    objp = np.zeros((6*7,3), np.float32)\\n",\r
    "    objp[:,:2] = np.mgrid[0:num_corner[0], \\\\\\n",\r
    "                0:num_corner[1]].T.reshape(-1,2)\\n",\r
    "\\n",\r
    "    # 遍历所有图像，找到角点\\n",\r
    "    for fname in image_dirs:\\n",\r
    "        img = cv_imread(fname)\\n",\r
    "        # 转化成灰度图，方便角点检测\\n",\r
    "        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) \\n",\r
    "        # 使用角点检测寻找角点坐标，如果找到ret返回True\\n",\r
    "        # 左上角为坐标原点\\n",\r
    "        ret, corners = cv2.findChessboardCorners(gray, num_corner, None)\\n",\r
    "        # 根据ret的状态来记录角点\\n",\r
    "        if ret == True:\\n",\r
    "            objpoints.append(objp[:, :2])\\n",\r
    "            imgpoints.append(corners.reshape(-1, 2))\\n",\r
    "\\n",\r
    "    # 使用OpenCV自带的绘图可视化角点检测效果，从红色开始绘制，紫色结束\\n",\r
    "    cv2.drawChessboardCorners(img, (7,6), corners, ret)\\n",\r
    "    plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))\\n",\r
    "    plt.show()\\n",\r
    "    \\n",\r
    "    return objpoints, imgpoints, gray\\n",\r
    "\\n",\r
    "# 调用detect_corner函数检测每张图像的角点\\n",\r
    "objpoints, imgpoints, gray = detect_corner(image_dirs)"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "640afe58",\r
   "metadata": {},\r
   "source": [\r
    "到这里我们就得到了图像上角点的图像坐标以及其对应的世界坐标系中的坐标，接下来我们就可以利用这些坐标之间的对应关系求解单应性矩阵 $\\\\boldsymbol{H}$。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 5,\r
   "id": "61026fa3",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.101032Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.100696Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.128651Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.126241Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'objpoints' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[5]\\u001b[39m\\u001b[32m, line 59\\u001b[39m\\n\\u001b[32m     55\\u001b[39m \\n\\u001b[32m     56\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m H\\n\\u001b[32m     57\\u001b[39m \\n\\u001b[32m     58\\u001b[39m H_list = []\\n\\u001b[32m---> \\u001b[39m\\u001b[32m59\\u001b[39m \\u001b[38;5;28;01mfor\\u001b[39;00m i \\u001b[38;5;28;01min\\u001b[39;00m range(len(objpoints)):\\n\\u001b[32m     60\\u001b[39m     H = compute_homography(imgpoints[i], objpoints[i])\\n\\u001b[32m     61\\u001b[39m     H_list.append(H)\\n\\u001b[32m     62\\u001b[39m     \\u001b[38;5;28;01mif\\u001b[39;00m i < \\u001b[32m3\\u001b[39m:\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'objpoints' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def normalizing_input_data(coor_data):\\n",\r
    "    # 计算坐标数据的平均值\\n",\r
    "    x_avg = np.mean(coor_data[:, 0])\\n",\r
    "    y_avg = np.mean(coor_data[:, 1])\\n",\r
    "    # 计算坐标数据的标准差，并用它来计算尺度因子，使得归一化后的坐标的标准差为sqrt(2)\\n",\r
    "    sx = np.sqrt(2) / np.std(coor_data[:, 0])\\n",\r
    "    sy = np.sqrt(2) / np.std(coor_data[:, 1])\\n",\r
    "    # 构造归一化矩阵，用于将坐标归一化，使均值为0，标准差为sqrt(2)\\n",\r
    "    norm_matrix = np.array([[sx, 0, -sx * x_avg],\\n",\r
    "                             [0, sy, -sy * y_avg],\\n",\r
    "                             [0, 0, 1]])\\n",\r
    "    return norm_matrix\\n",\r
    "\\n",\r
    "\\n",\r
    "def compute_homography(pic_coor, real_coor):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    计算单应性矩阵H。\\n",\r
    "\\n",\r
    "    参数：\\n",\r
    "    - pic_coor: 图像坐标系坐标。\\n",\r
    "    - real_coor: 世界坐标系坐标。\\n",\r
    "\\n",\r
    "    返回：\\n",\r
    "    - H: 单应性矩阵。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    pic_norm_mat = normalizing_input_data(pic_coor)\\n",\r
    "    real_norm_mat = normalizing_input_data(real_coor)\\n",\r
    "    \\n",\r
    "    A = []  # 构建用于求解H的线性方程组\\n",\r
    "    for i in range(len(pic_coor)):\\n",\r
    "        # 将当前的图像坐标系坐标和世界坐标系坐标转换为齐次坐标\\n",\r
    "        single_pic_coor = np.array([pic_coor[i][0], pic_coor[i][1], 1])\\n",\r
    "        single_real_coor = np.array([real_coor[i][0], real_coor[i][1], 1])\\n",\r
    "\\n",\r
    "        # 对坐标进行归一化处理\\n",\r
    "        pic_norm = np.dot(pic_norm_mat, single_pic_coor)\\n",\r
    "        real_norm = np.dot(real_norm_mat, single_real_coor)\\n",\r
    "\\n",\r
    "        # 根据归一化后的坐标构造矩阵A的行\\n",\r
    "        # 这部分实现了将单应性矩阵H的约束条件转换为线性方程的过程\\n",\r
    "        A.append(np.array([-real_norm.item(0), -real_norm.item(1), -1, 0, 0, 0,\\n",\r
    "            pic_norm.item(0) * real_norm.item(0), pic_norm.item(0) * real_norm.item(1),\\n",\r
    "            pic_norm.item(0)]))\\n",\r
    "        A.append(np.array([0, 0, 0, -real_norm.item(0), -real_norm.item(1), -1,\\n",\r
    "            pic_norm.item(1) * real_norm.item(0), pic_norm.item(1) * real_norm.item(1),\\n",\r
    "            pic_norm.item(1)]))\\n",\r
    "\\n",\r
    "    # 使用奇异值分解(SVD)求解Mh=0中的h，即单应性矩阵H的向量化形式\\n",\r
    "    U, S, VT = np.linalg.svd((np.array(A, dtype='float')).reshape((-1, 9)))\\n",\r
    "    H = VT[-1].reshape((3, 3))  # 最小奇异值对应的奇异向量重塑为3x3矩阵\\n",\r
    "    \\n",\r
    "    # 对H进行反归一化处理\\n",\r
    "    H = np.dot(np.dot(np.linalg.inv(pic_norm_mat), H), real_norm_mat)\\n",\r
    "    H = H / H[-1, -1]  # 归一化，确保H的最后一个元素为1\\n",\r
    "\\n",\r
    "    return H\\n",\r
    "\\n",\r
    "H_list = []\\n",\r
    "for i in range(len(objpoints)):\\n",\r
    "    H = compute_homography(imgpoints[i], objpoints[i])\\n",\r
    "    H_list.append(H)\\n",\r
    "    if i < 3:\\n",\r
    "        print(\\"第{}张图像的单应性矩阵为：\\\\n{}\\".format(i+1, H))"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "b02ca4f8",\r
   "metadata": {},\r
   "source": [\r
    "在得到了每张标定板图像对应的 $\\\\boldsymbol{H}$ 之后，我们首先需要从每个单应性矩阵 $\\\\boldsymbol H$ 中提取出用于解矩阵 $\\\\boldsymbol B$ 的约束方程。然后再通过SVD分解求解出 $\\\\boldsymbol B$，最后通过楚列斯基分解求解出照相机的内参矩阵 $\\\\boldsymbol K$。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 6,\r
   "id": "2ba59827",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.131500Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.131262Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.322390Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.320617Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "LinAlgError",\r
     "evalue": "1-dimensional array given. Array must be at least two-dimensional",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mLinAlgError\\u001b[39m                               Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[6]\\u001b[39m\\u001b[32m, line 47\\u001b[39m\\n\\u001b[32m     43\\u001b[39m                   [b[\\u001b[32m3\\u001b[39m], b[\\u001b[32m4\\u001b[39m], b[\\u001b[32m5\\u001b[39m]]])\\n\\u001b[32m     44\\u001b[39m \\n\\u001b[32m     45\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m B\\n\\u001b[32m     46\\u001b[39m \\n\\u001b[32m---> \\u001b[39m\\u001b[32m47\\u001b[39m B = compute_B_matrix(H_list)\\n\\u001b[32m     48\\u001b[39m print(\\u001b[33m\\"B矩阵为：\\\\n{}\\"\\u001b[39m.format(B))\\n",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[6]\\u001b[39m\\u001b[32m, line 37\\u001b[39m, in \\u001b[36mcompute_B_matrix\\u001b[39m\\u001b[34m(H_list)\\u001b[39m\\n\\u001b[32m     33\\u001b[39m \\n\\u001b[32m     34\\u001b[39m     V = np.array(V)\\n\\u001b[32m     35\\u001b[39m \\n\\u001b[32m     36\\u001b[39m     \\u001b[38;5;66;03m# 使用SVD求解b，其中b是B矩阵的六个未知数的向量形式\\u001b[39;00m\\n\\u001b[32m---> \\u001b[39m\\u001b[32m37\\u001b[39m     U, S, Vt = np.linalg.svd(V)\\n\\u001b[32m     38\\u001b[39m     b = Vt[-\\u001b[32m1\\u001b[39m]  \\u001b[38;5;66;03m# 与最小奇异值对应的奇异向量\\u001b[39;00m\\n\\u001b[32m     39\\u001b[39m \\n\\u001b[32m     40\\u001b[39m     \\u001b[38;5;66;03m# 根据b重构B矩阵\\u001b[39;00m\\n",\r
      "\\u001b[36mFile \\u001b[39m\\u001b[32mD:\\\\python\\\\Lib\\\\site-packages\\\\numpy\\\\linalg\\\\_linalg.py:1826\\u001b[39m, in \\u001b[36msvd\\u001b[39m\\u001b[34m(a, full_matrices, compute_uv, hermitian)\\u001b[39m\\n\\u001b[32m   1823\\u001b[39m         s = \\u001b[38;5;28mabs\\u001b[39m(s)\\n\\u001b[32m   1824\\u001b[39m         \\u001b[38;5;28;01mreturn\\u001b[39;00m sort(s)[..., ::-\\u001b[32m1\\u001b[39m]\\n\\u001b[32m-> \\u001b[39m\\u001b[32m1826\\u001b[39m \\u001b[30;43m_assert_stacked_2d\\u001b[39;49m\\u001b[30;43m(\\u001b[39;49m\\u001b[30;43ma\\u001b[39;49m\\u001b[30;43m)\\u001b[39;49m\\n\\u001b[32m   1827\\u001b[39m t, result_t = _commonType(a)\\n\\u001b[32m   1829\\u001b[39m m, n = a.shape[-\\u001b[32m2\\u001b[39m:]\\n",\r
      "\\u001b[36mFile \\u001b[39m\\u001b[32mD:\\\\python\\\\Lib\\\\site-packages\\\\numpy\\\\linalg\\\\_linalg.py:247\\u001b[39m, in \\u001b[36m_assert_stacked_2d\\u001b[39m\\u001b[34m(*arrays)\\u001b[39m\\n\\u001b[32m    245\\u001b[39m \\u001b[38;5;28;01mfor\\u001b[39;00m a \\u001b[38;5;129;01min\\u001b[39;00m arrays:\\n\\u001b[32m    246\\u001b[39m     \\u001b[38;5;28;01mif\\u001b[39;00m a.ndim < \\u001b[32m2\\u001b[39m:\\n\\u001b[32m--> \\u001b[39m\\u001b[32m247\\u001b[39m         \\u001b[38;5;28;01mraise\\u001b[39;00m LinAlgError(\\u001b[33mf\\u001b[39m\\u001b[33m'\\u001b[39m\\u001b[38;5;132;01m{\\u001b[39;00ma.ndim\\u001b[38;5;132;01m}\\u001b[39;00m\\u001b[33m-dimensional array given. Array must be \\u001b[39m\\u001b[33m'\\u001b[39m\\n\\u001b[32m    248\\u001b[39m                           \\u001b[33m'\\u001b[39m\\u001b[33mat least two-dimensional\\u001b[39m\\u001b[33m'\\u001b[39m)\\n",\r
      "\\u001b[31mLinAlgError\\u001b[39m: 1-dimensional array given. Array must be at least two-dimensional"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def compute_B_matrix(H_list):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    从单应性矩阵H列表中计算B矩阵。\\n",\r
    "\\n",\r
    "    参数：\\n",\r
    "    - H_list: 单应性矩阵H的列表。\\n",\r
    "\\n",\r
    "    返回：\\n",\r
    "    - B: B矩阵。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    V = []\\n",\r
    "\\n",\r
    "    for H in H_list:\\n",\r
    "        # 分解H矩阵以获得其列向量\\n",\r
    "        h1, h2, _ = H[:,0], H[:,1], H[:,2]\\n",\r
    "        # 根据旋转矩阵的正交性质构造V矩阵的行\\n",\r
    "        # v_ij 是构造方程 hi^T * B * hj = 0 的向量形式\\n",\r
    "        # 由于 h = K * r，我们可以用 h 来代替 r\\n",\r
    "        \\n",\r
    "        # 第一个方程来自于 r1^T * r2 = 0 -> (h1^T * B * h2 = 0)\\n",\r
    "        v12 = np.array([h1[0]*h2[0], h1[0]*h2[1] + h1[1]*h2[0], h1[1]*h2[1], \\n",\r
    "            h1[2]*h2[0] + h1[0]*h2[2], h1[2]*h2[1] + h1[1]*h2[2], h1[2]*h2[2]])\\n",\r
    "        \\n",\r
    "        # 第二个方程来自于 r1^T * r1 = r2^T * r2 -> \\n",\r
    "        # ((h1^T * B * h1) - (h2^T * B * h2) = 0)\\n",\r
    "        v11_v22 = np.array([h1[0]**2 - h2[0]**2, 2*(h1[0]*h1[1] - h2[0]*h2[1]), \\n",\r
    "                            h1[1]**2 - h2[1]**2, 2*(h1[2]*h1[0] - h2[2]*h2[0]), \\n",\r
    "                            2*(h1[2]*h1[1] - h2[2]*h2[1]), h1[2]**2 - h2[2]**2])\\n",\r
    "\\n",\r
    "        # 将这两个方程添加到V矩阵中\\n",\r
    "        V.append(v12)\\n",\r
    "        V.append(v11_v22)\\n",\r
    "\\n",\r
    "    V = np.array(V)\\n",\r
    "\\n",\r
    "    # 使用SVD求解b，其中b是B矩阵的六个未知数的向量形式\\n",\r
    "    U, S, Vt = np.linalg.svd(V)\\n",\r
    "    b = Vt[-1]  # 与最小奇异值对应的奇异向量\\n",\r
    "\\n",\r
    "    # 根据b重构B矩阵\\n",\r
    "    B = np.array([[b[0], b[1], b[3]],\\n",\r
    "                  [b[1], b[2], b[4]],\\n",\r
    "                  [b[3], b[4], b[5]]])\\n",\r
    "\\n",\r
    "    return B\\n",\r
    "\\n",\r
    "B = compute_B_matrix(H_list)\\n",\r
    "print(\\"B矩阵为：\\\\n{}\\".format(B))"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "4bdb9c04",\r
   "metadata": {},\r
   "source": [\r
    "接下来我们使用楚列斯基分解求解出照相机的内参矩阵 $\\\\boldsymbol K$。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 7,\r
   "id": "7b23636f",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.324953Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.324622Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.345626Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.343731Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'B' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[7]\\u001b[39m\\u001b[32m, line 20\\u001b[39m\\n\\u001b[32m     16\\u001b[39m   K = K / K[-\\u001b[32m1\\u001b[39m, -\\u001b[32m1\\u001b[39m]\\n\\u001b[32m     17\\u001b[39m   \\u001b[38;5;28;01mreturn\\u001b[39;00m K\\n\\u001b[32m     18\\u001b[39m \\n\\u001b[32m     19\\u001b[39m \\u001b[38;5;66;03m# 直接求解\\u001b[39;00m\\n\\u001b[32m---> \\u001b[39m\\u001b[32m20\\u001b[39m K = cholesky_solve(B)\\n\\u001b[32m     21\\u001b[39m print(\\u001b[33m\\"K矩阵为：\\\\n{}\\"\\u001b[39m.format(K))\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'B' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def cholesky_solve(B):\\n",\r
    "  \\"\\"\\"\\n",\r
    "  利用楚列斯基分解求解 K 矩阵。\\n",\r
    "  \\"\\"\\"\\n",\r
    "  # 检查 B 是否为对称矩阵\\n",\r
    "  if not np.allclose(B, B.T):\\n",\r
    "    raise ValueError(\\"B is not a symmetric matrix\\")\\n",\r
    "\\n",\r
    "  # 进行楚列斯基分解\\n",\r
    "  L = np.linalg.cholesky(B)\\n",\r
    "\\n",\r
    "  # L是下三角矩阵，而我们的K是上三角矩阵\\n",\r
    "  K = np.linalg.inv(L.T)\\n",\r
    "\\n",\r
    "  # K矩阵的最后一个元素为1\\n",\r
    "  K = K / K[-1, -1]\\n",\r
    "  return K\\n",\r
    "\\n",\r
    "# 直接求解\\n",\r
    "K = cholesky_solve(B)\\n",\r
    "print(\\"K矩阵为：\\\\n{}\\".format(K))"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "ea92dc46",\r
   "metadata": {},\r
   "source": [\r
    "接下来我们再从单应性矩阵计算照相机的外参矩阵 $[\\\\boldsymbol{R} | \\\\boldsymbol{t}]$。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 8,\r
   "id": "b2b85fa8",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.349097Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.348692Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.374196Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.372482Z"\r
    },\r
    "papermill": {\r
     "duration": 1.150628,\r
     "end_time": "2023-07-20T08:44:58.226477",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:57.075849",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'K' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[8]\\u001b[39m\\u001b[32m, line 45\\u001b[39m\\n\\u001b[32m     41\\u001b[39m \\n\\u001b[32m     42\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m extrinsics_param\\n\\u001b[32m     43\\u001b[39m \\n\\u001b[32m     44\\u001b[39m \\n\\u001b[32m---> \\u001b[39m\\u001b[32m45\\u001b[39m extrinsics_param = get_extrinsics_param(H_list, K)\\n\\u001b[32m     46\\u001b[39m \\u001b[38;5;28;01mfor\\u001b[39;00m i \\u001b[38;5;28;01min\\u001b[39;00m range(len(extrinsics_param)):\\n\\u001b[32m     47\\u001b[39m     print(\\u001b[33m\\"第{}张图像的外参矩阵为：\\\\n{}\\"\\u001b[39m.format(i+\\u001b[32m1\\u001b[39m, extrinsics_param[i]))\\n\\u001b[32m     48\\u001b[39m     \\u001b[38;5;28;01mif\\u001b[39;00m i == \\u001b[32m2\\u001b[39m:\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'K' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def get_extrinsics_param(H, intrinsics_param):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    从单应性矩阵H和内参矩阵K中计算外参矩阵R和平移向量t，并确保R的行列式为1。\\n",\r
    "\\n",\r
    "    参数：\\n",\r
    "    - H: 单应性矩阵H列表。\\n",\r
    "    - intrinsics_param: 内参矩阵K。\\n",\r
    "\\n",\r
    "    返回：\\n",\r
    "    - extrinsics_param: 包含外参矩阵R和平移向量t的列表。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    extrinsics_param = []\\n",\r
    "\\n",\r
    "    inv_intrinsics_param = np.linalg.inv(intrinsics_param)\\n",\r
    "    for i in range(len(H)):\\n",\r
    "        h0 = (H[i].reshape(3, 3))[:, 0]\\n",\r
    "        h1 = (H[i].reshape(3, 3))[:, 1]\\n",\r
    "        h2 = (H[i].reshape(3, 3))[:, 2]\\n",\r
    "\\n",\r
    "        scale_factor = 1 / np.linalg.norm(np.dot(inv_intrinsics_param, h0))\\n",\r
    "\\n",\r
    "        r0 = scale_factor * np.dot(inv_intrinsics_param, h0)\\n",\r
    "        r1 = scale_factor * np.dot(inv_intrinsics_param, h1)\\n",\r
    "        t = scale_factor * np.dot(inv_intrinsics_param, h2)\\n",\r
    "        r2 = np.cross(r0, r1)\\n",\r
    "\\n",\r
    "        # 构成近似旋转矩阵\\n",\r
    "        R_approx = np.array([r0, r1, r2]).transpose()\\n",\r
    "        \\n",\r
    "        # 使用SVD来修正R，确保其符合旋转矩阵的性质\\n",\r
    "        U, _, Vt = np.linalg.svd(R_approx)\\n",\r
    "        R_corrected = np.dot(U, Vt)\\n",\r
    "        \\n",\r
    "        # 确保R的行列式为1\\n",\r
    "        if np.linalg.det(R_corrected) < 0:\\n",\r
    "            U[:, -1] *= -1  # 调整U的最后一列\\n",\r
    "            R_corrected = np.dot(U, Vt)  # 重新计算R\\n",\r
    "\\n",\r
    "        extrinsics = np.column_stack((R_corrected, t))\\n",\r
    "        extrinsics_param.append(extrinsics)\\n",\r
    "\\n",\r
    "    return extrinsics_param\\n",\r
    "\\n",\r
    "\\n",\r
    "extrinsics_param = get_extrinsics_param(H_list, K)\\n",\r
    "for i in range(len(extrinsics_param)):\\n",\r
    "    print(\\"第{}张图像的外参矩阵为：\\\\n{}\\".format(i+1, extrinsics_param[i]))\\n",\r
    "    if i == 2:\\n",\r
    "        break"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "e05156a4",\r
   "metadata": {},\r
   "source": [\r
    "接下来我们可以将空间中点根据我们计算得到的内参和外参投影到图像平面上，然后计算重投影误差来判断我们标定的准确程度。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 9,\r
   "id": "86b3d3de",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.377835Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.377383Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.399966Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.398601Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'K' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[9]\\u001b[39m\\u001b[32m, line 31\\u001b[39m\\n\\u001b[32m     27\\u001b[39m \\n\\u001b[32m     28\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m error.mean()\\n\\u001b[32m     29\\u001b[39m \\n\\u001b[32m     30\\u001b[39m \\u001b[38;5;66;03m# 将内外参矩阵都转化为齐次坐标\\u001b[39;00m\\n\\u001b[32m---> \\u001b[39m\\u001b[32m31\\u001b[39m K_homo = np.column_stack((K, np.zeros(\\u001b[32m3\\u001b[39m)))\\n\\u001b[32m     32\\u001b[39m K_homo = np.row_stack((K_homo, [\\u001b[32m0\\u001b[39m, \\u001b[32m0\\u001b[39m, \\u001b[32m0\\u001b[39m, \\u001b[32m1\\u001b[39m]))\\n\\u001b[32m     33\\u001b[39m \\n\\u001b[32m     34\\u001b[39m \\u001b[38;5;66;03m# 计算所有图像重投影误差的均值\\u001b[39;00m\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'K' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def reproject_error(K, extrinsic, pixel_coor, real_coor):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    计算重投影误差。\\n",\r
    "\\n",\r
    "    参数：\\n",\r
    "    - K: 内参矩阵。\\n",\r
    "    - extrinsic: 外参矩阵。\\n",\r
    "    - pixel_coor: 图像坐标系坐标。\\n",\r
    "    - real_coor: 世界坐标系坐标。\\n",\r
    "\\n",\r
    "    返回：\\n",\r
    "    - error: 重投影误差。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 计算投影矩阵\\n",\r
    "    P = np.dot(K, extrinsic)\\n",\r
    "    \\n",\r
    "    # 将世界坐标系坐标转换为齐次坐标\\n",\r
    "    real_coor = np.column_stack((real_coor, np.zeros(len(real_coor)), \\n",\r
    "                                 np.ones(len(real_coor))))\\n",\r
    "    \\n",\r
    "    # 计算重投影坐标\\n",\r
    "    reprojected_coor = np.dot(P, real_coor.T).T\\n",\r
    "    reprojected_coor = reprojected_coor[:, :2] / reprojected_coor[:, 2:3]\\n",\r
    "\\n",\r
    "    # 计算重投影误差\\n",\r
    "    error = np.linalg.norm(reprojected_coor - pixel_coor, axis=1)\\n",\r
    "    \\n",\r
    "    return error.mean()\\n",\r
    "\\n",\r
    "# 将内外参矩阵都转化为齐次坐标\\n",\r
    "K_homo = np.column_stack((K, np.zeros(3)))\\n",\r
    "K_homo = np.row_stack((K_homo, [0, 0, 0, 1]))\\n",\r
    "\\n",\r
    "# 计算所有图像重投影误差的均值\\n",\r
    "mean_error = 0\\n",\r
    "for j in range(len(imgpoints)):\\n",\r
    "    extrinsic_homo = np.row_stack((extrinsics_param[j], [0, 0, 0, 1]))\\n",\r
    "\\n",\r
    "    # 计算每一张图像的重投影误差\\n",\r
    "    error = reproject_error(K_homo, extrinsic_homo, imgpoints[j], objpoints[j])\\n",\r
    "    mean_error += error\\n",\r
    "\\n",\r
    "# 得到平均重投影误差\\n",\r
    "mean_error /= len(imgpoints) \\n",\r
    "print(\\"平均重投影误差为: {}\\".format(mean_error))"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "67cfd740",\r
   "metadata": {},\r
   "source": [\r
    "到这里，我们就完成了基础的照相机标定流程。从重投影误差来看，我们计算出来的照相机参数还是比较精确的，平均误差为 2.25 个像素。在实际应用过程中，我们往往直接使用 OpenCV 的标定函数来实现照相机标定："\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 10,\r
   "id": "007f5633",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.403825Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.403360Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.425315Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.424055Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'objpoints' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[10]\\u001b[39m\\u001b[32m, line 3\\u001b[39m\\n\\u001b[32m      1\\u001b[39m \\u001b[38;5;66;03m# 转换成OpenCV需要的格式\\u001b[39;00m\\n\\u001b[32m      2\\u001b[39m objpoints_cv = [np.hstack((i, np.zeros((i.shape[0], 1)))).astype(\\n\\u001b[32m----> \\u001b[39m\\u001b[32m3\\u001b[39m                 np.float32) \\u001b[38;5;28;01mfor\\u001b[39;00m i \\u001b[38;5;28;01min\\u001b[39;00m objpoints]\\n\\u001b[32m      4\\u001b[39m imgpoints_cv = [i[:,\\u001b[38;5;28;01mNone\\u001b[39;00m,:] \\u001b[38;5;28;01mfor\\u001b[39;00m i \\u001b[38;5;28;01min\\u001b[39;00m imgpoints]\\n\\u001b[32m      5\\u001b[39m \\n\\u001b[32m      6\\u001b[39m \\u001b[38;5;66;03m# 使用OpenCV的标定函数来标定照相机\\u001b[39;00m\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'objpoints' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 转换成OpenCV需要的格式\\n",\r
    "objpoints_cv = [np.hstack((i, np.zeros((i.shape[0], 1)))).astype(\\n",\r
    "                np.float32) for i in objpoints]\\n",\r
    "imgpoints_cv = [i[:,None,:] for i in imgpoints]\\n",\r
    "\\n",\r
    "# 使用OpenCV的标定函数来标定照相机\\n",\r
    "ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(objpoints_cv, \\n",\r
    "                                imgpoints_cv, gray.shape[::-1], None, None)\\n",\r
    "\\n",\r
    "print(\\"照相机内参:\\")\\n",\r
    "# 照相机内参，输出格式为 [[fx,0,cx],[0,fy,cy],[0,0,1]]\\n",\r
    "print(mtx,\\"\\\\n\\")\\n",\r
    "\\n",\r
    "print(\\"畸变参数:\\")\\n",\r
    "# k1,k2,p1,p2,k3\\n",\r
    "print(dist)"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 11,\r
   "id": "bec24bf4",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.428873Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.428517Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.466956Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.465609Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'objpoints_cv' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[11]\\u001b[39m\\u001b[32m, line 3\\u001b[39m\\n\\u001b[32m      1\\u001b[39m \\u001b[38;5;66;03m# 初始化误差\\u001b[39;00m\\n\\u001b[32m      2\\u001b[39m mean_error = \\u001b[32m0\\u001b[39m\\n\\u001b[32m----> \\u001b[39m\\u001b[32m3\\u001b[39m \\u001b[38;5;28;01mfor\\u001b[39;00m i \\u001b[38;5;28;01min\\u001b[39;00m range(len(objpoints_cv)):\\n\\u001b[32m      4\\u001b[39m     \\u001b[38;5;66;03m# 使用内外参和畸变参数对点进行重投影\\u001b[39;00m\\n\\u001b[32m      5\\u001b[39m     imgpoints2, _ = cv2.projectPoints(objpoints_cv[i], \\n\\u001b[32m      6\\u001b[39m                              rvecs[i], tvecs[i], mtx, dist)\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'objpoints_cv' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "# 初始化误差\\n",\r
    "mean_error = 0\\n",\r
    "for i in range(len(objpoints_cv)):\\n",\r
    "    # 使用内外参和畸变参数对点进行重投影\\n",\r
    "    imgpoints2, _ = cv2.projectPoints(objpoints_cv[i], \\n",\r
    "                             rvecs[i], tvecs[i], mtx, dist)\\n",\r
    "    # 计算重投影点与原始点的误差，使用欧几里得距离进行衡量\\n",\r
    "    error = cv2.norm(imgpoints_cv[i], imgpoints2, \\n",\r
    "                             cv2.NORM_L2) / len(imgpoints2)\\n",\r
    "    # 累加误差\\n",\r
    "    mean_error += error\\n",\r
    "    \\n",\r
    "# 得到平均每个点偏移像素的二范数\\n",\r
    "mean_error /= len(objpoints_cv) \\n",\r
    "print(\\"OpenCV得到的平均重投影误差为: {}\\".format(mean_error))"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "c4e02b54",\r
   "metadata": {},\r
   "source": [\r
    "可以发现我们的简易算法和OpenCV得到的标定结果大体上是一致的，只是精度上有一些差异，主要原因是畸变参数的影响。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "b6db4bfc",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.019567,\r
     "end_time": "2023-07-20T08:44:58.323749",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:58.304182",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "## 16.4 小结\\n",\r
    "\\n",\r
    "本章主要介绍了照相机成像的基本原理，以及照相机模型中重要的参数：内外参数和畸变参数。我们还学习了如何使用标定板对照相机进行标定，并通过代码实现了照相机的标定。经过标定的照相机，犹如一座连接三维世界与二维图像平面的桥梁。它让我们能够通过图像来反向推算三维空间的信息，为后续的计算机视觉应用提供重要的基础。下一节，我们将学习光流与运动场，探究空间运动与图像像素变化之间的关系。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "4f100a3e",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.019158,\r
     "end_time": "2023-07-20T08:44:58.362496",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:58.343338",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "## 16.5 习题"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "355a7f1f",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.020086,\r
     "end_time": "2023-07-20T08:44:58.402060",\r
     "exception": false,\r
     "start_time": "2023-07-20T08:44:58.381974",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "#### 习题16.1：我们在标定过程中默认标定板上每个方格的边长为 1 m，而不是其真实的物理长度，这样会对标定结果产生影响吗？为什么？\\n",\r
    "\\n",\r
    "#### 习题16.2：试思考径向畸变和切相畸变哪一个更常见？为什么？\\n",\r
    "\\n",\r
    "#### 习题16.3：棋盘格标定板是照相机标定中常用的标定板，那么在实际应用中，是否可以使用其他形式的标定板进行标定？请举例说明。\\n",\r
    "\\n",\r
    "#### 习题16.4：角点识别的精度会影响到标定的结果，试思考如何减少其误差带来的影响。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "5bd20123",\r
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
   "id": "c02adbab",\r
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
   "id": "64e976a3",\r
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
   "id": "82ffb7e9",\r
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
   "execution_count": 12,\r
   "id": "0de090f6",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:18:57.471427Z",\r
     "iopub.status.busy": "2026-08-25T13:18:57.470636Z",\r
     "iopub.status.idle": "2026-08-25T13:18:57.479711Z",\r
     "shell.execute_reply": "2026-08-25T13:18:57.478629Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "SyntaxError",\r
     "evalue": "invalid syntax (4127060134.py, line 1)",\r
     "output_type": "error",\r
     "traceback": [\r
      "  \\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[12]\\u001b[39m\\u001b[32m, line 1\\u001b[39m\\n\\u001b[31m    \\u001b[39m\\u001b[31m\`\`\`python\\u001b[39m\\n    ^\\n\\u001b[31mSyntaxError\\u001b[39m\\u001b[31m:\\u001b[39m invalid syntax\\n"\r
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
   "id": "4c78835f",\r
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
