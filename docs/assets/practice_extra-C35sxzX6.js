const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "id": "192a05b1",\r
   "metadata": {},\r
   "source": [\r
    "# 第19章 三维重建\\n",\r
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
   "id": "52504bf8",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:05.397935Z",\r
     "iopub.status.busy": "2026-08-25T13:19:05.397732Z",\r
     "iopub.status.idle": "2026-08-25T13:19:05.456848Z",\r
     "shell.execute_reply": "2026-08-25T13:19:05.456162Z"\r
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
   "id": "3cd339c6",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.005976,\r
     "end_time": "2023-08-15T11:35:50.240316",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:50.234340",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "## 代码实现\\n"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "961bf9d5",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.006026,\r
     "end_time": "2023-08-15T11:35:50.252646",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:50.246620",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "上面我们已经了解了对极约束的基本概念和数学推导，以及如何通过对极约束计算基础矩阵和进行三角测量。接下来这一节我们将动手学如何基于两张给定的不同视角图像计算它们之间的基础矩阵并进行三角测量。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 2,\r
   "id": "4e460945",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:05.458726Z",\r
     "iopub.status.busy": "2026-08-25T13:19:05.458499Z",\r
     "iopub.status.idle": "2026-08-25T13:19:23.668620Z",\r
     "shell.execute_reply": "2026-08-25T13:19:23.668129Z"\r
    },\r
    "papermill": {\r
     "duration": 1.976712,\r
     "end_time": "2023-08-15T11:35:52.235767",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:50.259055",\r
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
    "!git clone https://github.com/boyu-ai/Hands-on-CV.git"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 3,\r
   "id": "e0f33750",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:23.670620Z",\r
     "iopub.status.busy": "2026-08-25T13:19:23.670432Z",\r
     "iopub.status.idle": "2026-08-25T13:19:23.932149Z",\r
     "shell.execute_reply": "2026-08-25T13:19:23.931691Z"\r
    },\r
    "papermill": {\r
     "duration": 0.336552,\r
     "end_time": "2023-08-15T11:35:52.580361",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.243809",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [],\r
   "source": [\r
    "import os, cv2, random\\n",\r
    "import matplotlib.pyplot as plt\\n",\r
    "import numpy as np\\n",\r
    "%matplotlib inline\\n",\r
    "\\n",\r
    "class FeatureExtractor:\\n",\r
    "    \\"\\"\\"\\n",\r
    "    构建类用于提取SIFT特征。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    def __init__(self, image):\\n",\r
    "        \\"\\"\\"\\n",\r
    "        初始化FeatureExtractor类。\\n",\r
    "        \\n",\r
    "        参数:\\n",\r
    "        - image: (np.ndarray): RGB 形式的图像。\\n",\r
    "        \\"\\"\\"\\n",\r
    "        self.image = image\\n",\r
    "        # 将图像转换为灰度图\\n",\r
    "        self.gray = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)\\n",\r
    "        self.keypoints = None\\n",\r
    "        self.descriptors = None\\n",\r
    "\\n",\r
    "    def extract_features(self):\\n",\r
    "        \\"\\"\\"\\n",\r
    "        使用OpenCV的内置函数提取图像中的SIFT特征。\\n",\r
    "        \\n",\r
    "        返回:\\n",\r
    "        - keys: (list): 特征点列表。\\n",\r
    "        - descriptors: (np.ndarray): 描述子。\\n",\r
    "        \\"\\"\\"\\n",\r
    "        sift = cv2.SIFT_create()\\n",\r
    "        keys, descriptors = sift.detectAndCompute(self.gray, None)\\n",\r
    "\\n",\r
    "        # 如果特征点数量小于20个，返回None\\n",\r
    "        if len(keys) <= 20:\\n",\r
    "            return None, None\\n",\r
    "        else:\\n",\r
    "            self.keypoints = keys\\n",\r
    "            self.descriptors = descriptors\\n",\r
    "            return keys, descriptors\\n",\r
    "\\n",\r
    "def vis_imgs(imgs):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    可视化多张图像。\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "    - imgs: 要可视化的图像列表。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 计算图像数量\\n",\r
    "    num_imgs = len(imgs)\\n",\r
    "    # 创建画布\\n",\r
    "    fig = plt.figure(figsize=(10, 10))\\n",\r
    "    # 遍历每一张图像\\n",\r
    "    for i in range(num_imgs):\\n",\r
    "        # 添加子图\\n",\r
    "        ax = fig.add_subplot(1, num_imgs, i + 1)\\n",\r
    "        # 显示图像\\n",\r
    "        ax.imshow(imgs[i])\\n",\r
    "        # 关闭坐标轴\\n",\r
    "        ax.axis('off')\\n",\r
    "    # 显示画布\\n",\r
    "    plt.show()"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "e2d7342f",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.007309,\r
     "end_time": "2023-08-15T11:35:52.595266",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.587957",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "为了方便，这里直接提供了照相机的内参（来自照相机本身的数据），当然也可以用在第 16 章中教过的标定获得的内参数据。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 4,\r
   "id": "0f3f53eb",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:23.933999Z",\r
     "iopub.status.busy": "2026-08-25T13:19:23.933765Z",\r
     "iopub.status.idle": "2026-08-25T13:19:23.937409Z",\r
     "shell.execute_reply": "2026-08-25T13:19:23.936957Z"\r
    },\r
    "papermill": {\r
     "duration": 0.018802,\r
     "end_time": "2023-08-15T11:35:52.621681",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.602879",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [],\r
   "source": [\r
    "def load_instrinsic(path):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    从文件中直接读取内参。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    return np.loadtxt(path).astype(np.float32)\\n",\r
    "\\n",\r
    "def construct_img_info(img_root):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    从图像中获取特征信息。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    imgs = []\\n",\r
    "    feats = []\\n",\r
    "    K = []\\n",\r
    "    for _, name in enumerate(os.listdir(img_root)):\\n",\r
    "        if '.jpg' in name or '.JPG' or '.png' in name:\\n",\r
    "            # 读取图像\\n",\r
    "            path = os.path.join(img_root, name)\\n",\r
    "            img = cv2.cvtColor(cv_imread(path), cv2.COLOR_BGR2RGB)\\n",\r
    "            imgs.append(img)\\n",\r
    "\\n",\r
    "            # 提取特征\\n",\r
    "            feature_ext = FeatureExtractor(img)\\n",\r
    "            kpt, des = feature_ext.extract_features()\\n",\r
    "\\n",\r
    "            # 读取内参\\n",\r
    "            K = load_instrinsic(os.path.join(\\n",\r
    "                os.path.dirname(img_root), 'K.txt'))\\n",\r
    "            feats.append({'kpt': kpt, 'des': des})\\n",\r
    "    return imgs, feats, K"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "b0ed316a",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.008034,\r
     "end_time": "2023-08-15T11:35:52.637095",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.629061",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "接下来我们计算两张图像间的对应关系，查询并匹配两者之间的特征。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 5,\r
   "id": "c8005eb6",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:23.938692Z",\r
     "iopub.status.busy": "2026-08-25T13:19:23.938557Z",\r
     "iopub.status.idle": "2026-08-25T13:19:23.945000Z",\r
     "shell.execute_reply": "2026-08-25T13:19:23.944262Z"\r
    },\r
    "papermill": {\r
     "duration": 0.025242,\r
     "end_time": "2023-08-15T11:35:52.670992",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.645750",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [],\r
   "source": [\r
    "def get_matches(des_query, des_train):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    匹配相关图像特征。\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "    - des_query: (np.ndarray): 查询描述子。\\n",\r
    "    - des_train: (np.ndarray): 训练描述子。\\n",\r
    "\\n",\r
    "    返回:\\n",\r
    "    - goods: (list): 匹配结果。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 创建匹配器\\n",\r
    "    bf = cv2.BFMatcher(cv2.NORM_L2)\\n",\r
    "    # 获取匹配结果\\n",\r
    "    matches = bf.knnMatch(des_query, des_train, k=2)\\n",\r
    "    # 创建goods列表用于存储有用的匹配结果\\n",\r
    "    goods = []\\n",\r
    "    # 遍历所有匹配结果\\n",\r
    "    for m, m_ in matches:\\n",\r
    "        # 设置阈值为0.65，保留更多的特征\\n",\r
    "        if m.distance < 0.65 * m_.distance:\\n",\r
    "            goods.append(m)\\n",\r
    "    return goods\\n",\r
    "\\n",\r
    "def get_match_point(p, p_, matches):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    寻找匹配的关键点。\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "    - p: (list[cv2.KeyPoint]): 查询关键点。\\n",\r
    "    - p_: (list[cv2.KeyPoint]): 训练关键点。\\n",\r
    "    - matches: (list[cv2.DMatch]): 匹配信息。\\n",\r
    "\\n",\r
    "    返回:\\n",\r
    "    - points_query: (np.ndarray): 查询关键点。\\n",\r
    "    - points_train: (np.ndarray): 训练关键点。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 从查询关键点中找到匹配的关键点\\n",\r
    "    points_query = np.asarray([p[m.queryIdx].pt for m in matches])\\n",\r
    "    # 从训练关键点中找到匹配的关键点\\n",\r
    "    points_train = np.asarray([p_[m.trainIdx].pt for m in matches])\\n",\r
    "    # 返回匹配的查询和训练关键点\\n",\r
    "    return points_query, points_train\\n",\r
    "\\n",\r
    "def homoco_pts_2_euco_pts(pts):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    齐次坐标转化为欧几里得坐标。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    if len(pts.shape) == 1:\\n",\r
    "        pts = pts.reshape(1, -1)\\n",\r
    "    res = pts / pts[:, -1, None]\\n",\r
    "    return res[:, :-1].squeeze()\\n",\r
    "\\n",\r
    "def euco_pts_2_homoco_pts(pts):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    欧几里得坐标转化为齐次坐标。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    if len(pts.shape) == 1:\\n",\r
    "        pts = pts.reshape(1, -1)\\n",\r
    "    one = np.ones(pts.shape[0])\\n",\r
    "    res = np.c_[pts, one]\\n",\r
    "    return res.squeeze()\\n",\r
    "\\n",\r
    "def normalize(pts, T=None):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    对点集进行归一化。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 如果T参数为空\\n",\r
    "    if T is None:\\n",\r
    "        # 求点集的平均值\\n",\r
    "        u = np.mean(pts, 0)\\n",\r
    "        # 求点集中每个点与原点之间的距离之和\\n",\r
    "        d = np.sum(np.sqrt(np.sum(np.power(pts, 2), 1)))\\n",\r
    "        # 计算归一化矩阵\\n",\r
    "        T = np.array([\\n",\r
    "            [np.sqrt(2) / d, 0, -(np.sqrt(2) / d * u[0])],\\n",\r
    "            [0, np.sqrt(2) / d, -(np.sqrt(2) / d * u[1])],\\n",\r
    "            [0, 0, 1]\\n",\r
    "        ])\\n",\r
    "    # 将点集进行归一化\\n",\r
    "    return homoco_pts_2_euco_pts(np.matmul(T, \\n",\r
    "                euco_pts_2_homoco_pts(pts).T).T), T"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "0c38f6b0",\r
   "metadata": {\r
    "papermill": {\r
     "duration": 0.00745,\r
     "end_time": "2023-08-15T11:35:52.686565",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.679115",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "source": [\r
    "到这里我们就已经得到了两张图之间的对应像素关系，接下来使用八点法计算基础矩阵。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 6,\r
   "id": "84a79964",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:23.946583Z",\r
     "iopub.status.busy": "2026-08-25T13:19:23.946396Z",\r
     "iopub.status.idle": "2026-08-25T13:19:23.953000Z",\r
     "shell.execute_reply": "2026-08-25T13:19:23.952457Z"\r
    },\r
    "papermill": {\r
     "duration": 0.029257,\r
     "end_time": "2023-08-15T11:35:52.723426",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.694169",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [],\r
   "source": [\r
    "random.seed(42)\\n",\r
    "def estimate_fundamental(pts1, pts2, num_sample=8):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    计算基础矩阵。\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "    - pts1: (np.ndarray)：匹配特征所得到的训练点集。\\n",\r
    "    - pts2: (np.ndarray)：匹配特征所得到的查询点集。\\n",\r
    "\\n",\r
    "    返回:\\n",\r
    "    - f: (np.ndarray): 基础矩阵。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    n = pts1.shape[0]\\n",\r
    "    pts_index = range(n)\\n",\r
    "    sample_index = random.sample(pts_index, num_sample)\\n",\r
    "    p1 = pts1[sample_index, :]\\n",\r
    "    p2 = pts2[sample_index, :]\\n",\r
    "    n = len(sample_index)\\n",\r
    "    # 归一化点集坐标\\n",\r
    "    p1_norm, T1 = normalize(p1, None)\\n",\r
    "    p2_norm, T2 = normalize(p2, None)\\n",\r
    "    w = np.zeros((n, 9))\\n",\r
    "    # 构建A矩阵\\n",\r
    "    for i in range(n):\\n",\r
    "        w[i, 0] = p1_norm[i, 0] * p2_norm[i, 0]\\n",\r
    "        w[i, 1] = p1_norm[i, 1] * p2_norm[i, 0]\\n",\r
    "        w[i, 2] = p2_norm[i, 0]\\n",\r
    "        w[i, 3] = p1_norm[i, 0] * p2_norm[i, 1]\\n",\r
    "        w[i, 4] = p1_norm[i, 1] * p2_norm[i, 1]\\n",\r
    "        w[i, 5] = p2_norm[i, 1]\\n",\r
    "        w[i, 6] = p1_norm[i, 0]\\n",\r
    "        w[i, 7] = p1_norm[i, 1]\\n",\r
    "        w[i, 8] = 1\\n",\r
    "    # svd分解\\n",\r
    "    U, sigma, VT = np.linalg.svd(w)\\n",\r
    "    f = VT[-1, :].reshape(3, 3)\\n",\r
    "    U, sigma, VT = np.linalg.svd(f)\\n",\r
    "    sigma[2] = 0\\n",\r
    "    f = U.dot(np.diag(sigma)).dot(VT)\\n",\r
    "    # 逆归一化\\n",\r
    "    f = T2.T.dot(f).dot(T1)\\n",\r
    "\\n",\r
    "    ### 随机计算的F矩阵误差较大，使用OpenCV中的函数(RANSAC)计算F矩阵\\n",\r
    "    pts1 = pts1.astype(np.float32)\\n",\r
    "    pts2 = pts2.astype(np.float32)\\n",\r
    "    f, mask = cv2.findFundamentalMat(pts1, pts2, cv2.FM_RANSAC)\\n",\r
    "\\n",\r
    "    return f\\n",\r
    "\\n",\r
    "def convert_F_to_E(F_single, K):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    根据F矩阵计算E矩阵。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    inverse_K = np.linalg.inv(K)\\n",\r
    "    E_single = inverse_K.T.dot(F_single).dot(inverse_K)\\n",\r
    "    return E_single\\n",\r
    "\\n",\r
    "def get_Rt_from_E(E_single,K,pts1,pts2):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    根据E矩阵计算Rt，使用OpenCV的函数recoverPose。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # OpenCV的recoverPose函数已经自动去除了不合理的3个解\\n",\r
    "    _, R, t, _ = cv2.recoverPose(E_single, pts1, pts2, K) \\n",\r
    "    return R, t\\n",\r
    "\\n",\r
    "def build_F_E_matrix(feats, K):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    计算基础矩阵F，本质矩阵E，从E中分离出Rt并返回。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    pair = dict()\\n",\r
    "    match = dict()\\n",\r
    "    Rts = dict()\\n",\r
    "\\n",\r
    "    for i in range(len(feats)):\\n",\r
    "        for j in range(i + 1, len(feats)):\\n",\r
    "            matches = get_matches(\\n",\r
    "                feats[i]['des'], feats[j]['des'])\\n",\r
    "            pts1, pts2 = get_match_point(\\n",\r
    "                feats[i]['kpt'], feats[j]['kpt'], matches)\\n",\r
    "            assert pts1.shape == pts2.shape\\n",\r
    "            \\n",\r
    "            # 至少需要8个点来计算F矩阵\\n",\r
    "            if pts1.shape[0] < 8:\\n",\r
    "                continue\\n",\r
    "            # 计算F矩阵\\n",\r
    "            F_single = estimate_fundamental(pts1, pts2)\\n",\r
    "            # 根据F矩阵计算E矩阵\\n",\r
    "            E_single = convert_F_to_E(F_single, K)\\n",\r
    "            # 从E矩阵中得到相对位姿\\n",\r
    "            R, t = get_Rt_from_E(E_single, K, pts1, pts2)\\n",\r
    "\\n",\r
    "            if pts1.shape[0] < 8:\\n",\r
    "                continue\\n",\r
    "\\n",\r
    "            pair.update({(i, j): {'pts1': pts1, 'pts2': pts2}})\\n",\r
    "            match.update({(i, j): {'match': matches}})\\n",\r
    "            Rts.update({(i, j): {'R': R, 't': t}})\\n",\r
    "\\n",\r
    "    return F_single, E_single, pair, match, Rts"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 7,\r
   "id": "01e53448",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:23.954361Z",\r
     "iopub.status.busy": "2026-08-25T13:19:23.954179Z",\r
     "iopub.status.idle": "2026-08-25T13:19:24.096911Z",\r
     "shell.execute_reply": "2026-08-25T13:19:24.096124Z"\r
    },\r
    "papermill": {\r
     "duration": 5.077515,\r
     "end_time": "2023-08-15T11:35:57.808216",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:52.730701",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [\r
    {\r
     "ename": "FileNotFoundError",\r
     "evalue": "[WinError 3] 系统找不到指定的路径。: 'Hands-on-CV/第19章 三维重建/images'",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mFileNotFoundError\\u001b[39m                         Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[7]\\u001b[39m\\u001b[32m, line 2\\u001b[39m\\n\\u001b[32m      1\\u001b[39m img_root = \\u001b[33m'Hands-on-CV/第19章 三维重建/images'\\u001b[39m\\n\\u001b[32m----> \\u001b[39m\\u001b[32m2\\u001b[39m imgs, feats, K = construct_img_info(img_root)\\n\\u001b[32m      3\\u001b[39m \\u001b[38;5;66;03m# 可视化图像\\u001b[39;00m\\n\\u001b[32m      4\\u001b[39m vis_imgs(imgs)\\n\\u001b[32m      5\\u001b[39m \\n",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[4]\\u001b[39m\\u001b[32m, line 14\\u001b[39m, in \\u001b[36mconstruct_img_info\\u001b[39m\\u001b[34m(img_root)\\u001b[39m\\n\\u001b[32m     10\\u001b[39m     \\"\\"\\"\\n\\u001b[32m     11\\u001b[39m     imgs = []\\n\\u001b[32m     12\\u001b[39m     feats = []\\n\\u001b[32m     13\\u001b[39m     K = []\\n\\u001b[32m---> \\u001b[39m\\u001b[32m14\\u001b[39m     \\u001b[38;5;28;01mfor\\u001b[39;00m _, name \\u001b[38;5;28;01min\\u001b[39;00m enumerate(os.listdir(img_root)):\\n\\u001b[32m     15\\u001b[39m         \\u001b[38;5;28;01mif\\u001b[39;00m \\u001b[33m'.jpg'\\u001b[39m \\u001b[38;5;28;01min\\u001b[39;00m name \\u001b[38;5;28;01mor\\u001b[39;00m \\u001b[33m'.JPG'\\u001b[39m \\u001b[38;5;28;01mor\\u001b[39;00m \\u001b[33m'.png'\\u001b[39m \\u001b[38;5;28;01min\\u001b[39;00m name:\\n\\u001b[32m     16\\u001b[39m             \\u001b[38;5;66;03m# 读取图像\\u001b[39;00m\\n\\u001b[32m     17\\u001b[39m             path = os.path.join(img_root, name)\\n",\r
      "\\u001b[31mFileNotFoundError\\u001b[39m: [WinError 3] 系统找不到指定的路径。: 'Hands-on-CV/第19章 三维重建/images'"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "img_root = 'Hands-on-CV/第19章 三维重建/images'\\n",\r
    "imgs, feats, K = construct_img_info(img_root)\\n",\r
    "# 可视化图像\\n",\r
    "vis_imgs(imgs)\\n",\r
    "\\n",\r
    "F, E, pair, match, Rts = build_F_E_matrix(feats, K)\\n",\r
    "print(\\"基础矩阵为:\\\\n\\", F)\\n",\r
    "print(\\"本质矩阵为:\\\\n\\", E)\\n",\r
    "\\n",\r
    "# 不妨假定第一张图为世界坐标系\\n",\r
    "R_t_0 = np.array([[1,0,0,0], [0,1,0,0], [0,0,1,0]])\\n",\r
    "R_t_1 = np.empty((3,4))\\n",\r
    "R_t_1[:,:3] = Rts[(0,1)]['R']\\n",\r
    "R_t_1[:,3] = Rts[(0,1)]['t'].reshape(3)\\n",\r
    "P_0 = K.dot(R_t_0)\\n",\r
    "P_1 = K.dot(R_t_1)\\n",\r
    "print(\\"第一副图像对应的矩阵为:\\\\n\\", P_0)\\n",\r
    "print(\\"第二幅图像对应的矩阵为:\\\\n\\", P_1)"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "49406d8e",\r
   "metadata": {},\r
   "source": [\r
    "在得到了基础矩阵之后，我们就可以通过三角测量计算出三维空间点的坐标。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 8,\r
   "id": "15934bd1",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:24.098690Z",\r
     "iopub.status.busy": "2026-08-25T13:19:24.098475Z",\r
     "iopub.status.idle": "2026-08-25T13:19:24.109252Z",\r
     "shell.execute_reply": "2026-08-25T13:19:24.108770Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'pair' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[8]\\u001b[39m\\u001b[32m, line 28\\u001b[39m\\n\\u001b[32m     24\\u001b[39m \\n\\u001b[32m     25\\u001b[39m     mask = (dist1 < threshold) & (dist2 < threshold)\\n\\u001b[32m     26\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m pts1[:,mask], pts2[:,mask]\\n\\u001b[32m     27\\u001b[39m \\n\\u001b[32m---> \\u001b[39m\\u001b[32m28\\u001b[39m pts1 = np.transpose(pair[(\\u001b[32m0\\u001b[39m,\\u001b[32m1\\u001b[39m)][\\u001b[33m'pts1'\\u001b[39m])\\n\\u001b[32m     29\\u001b[39m pts2 = np.transpose(pair[(\\u001b[32m0\\u001b[39m,\\u001b[32m1\\u001b[39m)][\\u001b[33m'pts2'\\u001b[39m])\\n\\u001b[32m     30\\u001b[39m \\u001b[38;5;66;03m# 过滤匹配点\\u001b[39;00m\\n\\u001b[32m     31\\u001b[39m pts1_filtered, pts2_filtered = filter_matches_by_epipolar(pts1, pts2, F)\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'pair' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "def filter_matches_by_epipolar(pts1, pts2, F, threshold=3.0):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    使用对极约束过滤匹配点\\n",\r
    "    \\n",\r
    "    参数:\\n",\r
    "    - pts1, pts2: 匹配点对。\\n",\r
    "    - F: 基础矩阵。\\n",\r
    "    - threshold: 对极误差阈值。\\n",\r
    "        \\n",\r
    "    返回:\\n",\r
    "    - pts1_filtered, pts2_filtered: 过滤后的匹配点。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    pts1_reshaped = pts1.T.reshape(-1,1,2)\\n",\r
    "    pts2_reshaped = pts2.T.reshape(-1,1,2)\\n",\r
    "    \\n",\r
    "    # 计算两幅图像的极线\\n",\r
    "    lines1 = cv2.computeCorrespondEpilines(pts2_reshaped, 2, F)\\n",\r
    "    lines2 = cv2.computeCorrespondEpilines(pts1_reshaped, 1, F)\\n",\r
    "    \\n",\r
    "    dist1 = np.abs(np.sum(lines1.reshape(-1,3) * \\n",\r
    "                 np.hstack((pts1.T, np.ones((pts1.shape[1],1)))), axis=1))\\n",\r
    "    dist2 = np.abs(np.sum(lines2.reshape(-1,3) * \\n",\r
    "                 np.hstack((pts2.T, np.ones((pts2.shape[1],1)))), axis=1))\\n",\r
    "    \\n",\r
    "    mask = (dist1 < threshold) & (dist2 < threshold)\\n",\r
    "    return pts1[:,mask], pts2[:,mask]\\n",\r
    "\\n",\r
    "pts1 = np.transpose(pair[(0,1)]['pts1'])\\n",\r
    "pts2 = np.transpose(pair[(0,1)]['pts2'])\\n",\r
    "# 过滤匹配点\\n",\r
    "pts1_filtered, pts2_filtered = filter_matches_by_epipolar(pts1, pts2, F)\\n",\r
    "print(\\"过滤前的匹配点数量为: \\", pts1.shape[1])\\n",\r
    "print(\\"过滤后的匹配点数量为: \\", pts1_filtered.shape[1])\\n",\r
    "\\n",\r
    "# 三角测量获得空间点坐标\\n",\r
    "points_3d = cv2.triangulatePoints(P_0, P_1, pts1_filtered, pts2_filtered)\\n",\r
    "# 齐次坐标的最后一行为1，需要除以最后一行\\n",\r
    "points_3d /= points_3d[3]\\n",\r
    "points_3d = points_3d[:3, :].T\\n",\r
    "print(\\"得到的三维点为:\\\\n\\", points_3d)\\n",\r
    "\\n",\r
    "# 计算有效点占像素比例\\n",\r
    "print(\\"检测到的点占图像像素的比例为: {:02f}%\\".format(\\n",\r
    "    points_3d.shape[0]/len(imgs[0][...,0].flatten())*100))"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "b1d8059f",\r
   "metadata": {},\r
   "source": [\r
    "可以发现，存在部分匹配点不严格遵循对极约束。接下来我们可视化极线和匹配点。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 9,\r
   "id": "6dda5c72",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:24.111464Z",\r
     "iopub.status.busy": "2026-08-25T13:19:24.111171Z",\r
     "iopub.status.idle": "2026-08-25T13:19:24.132168Z",\r
     "shell.execute_reply": "2026-08-25T13:19:24.131653Z"\r
    },\r
    "papermill": {\r
     "duration": 1.045955,\r
     "end_time": "2023-08-15T11:35:58.868807",\r
     "exception": false,\r
     "start_time": "2023-08-15T11:35:57.822852",\r
     "status": "completed"\r
    },\r
    "tags": []\r
   },\r
   "outputs": [\r
    {\r
     "ename": "NameError",\r
     "evalue": "name 'pts1_filtered' is not defined",\r
     "output_type": "error",\r
     "traceback": [\r
      "\\u001b[31m---------------------------------------------------------------------------\\u001b[39m",\r
      "\\u001b[31mNameError\\u001b[39m                                 Traceback (most recent call last)",\r
      "\\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[9]\\u001b[39m\\u001b[32m, line 68\\u001b[39m\\n\\u001b[32m     64\\u001b[39m         img2 = cv2.circle(img2, tuple(pt2), \\u001b[32m5\\u001b[39m, color, -\\u001b[32m1\\u001b[39m)\\n\\u001b[32m     65\\u001b[39m     \\u001b[38;5;28;01mreturn\\u001b[39;00m img1, img2\\n\\u001b[32m     66\\u001b[39m \\n\\u001b[32m     67\\u001b[39m \\u001b[38;5;66;03m# 在原图上可视化特征点对应的极线\\u001b[39;00m\\n\\u001b[32m---> \\u001b[39m\\u001b[32m68\\u001b[39m draw_epipolar_lines(pts1_filtered.T, pts2_filtered.T, \\n\\u001b[32m     69\\u001b[39m                     imgs[\\u001b[32m0\\u001b[39m], imgs[\\u001b[32m1\\u001b[39m], F)\\n",\r
      "\\u001b[31mNameError\\u001b[39m: name 'pts1_filtered' is not defined"\r
     ]\r
    }\r
   ],\r
   "source": [\r
    "random.seed(42)\\n",\r
    "np.random.seed(42)\\n",\r
    "def draw_epipolar_lines(pts1, pts2, img1, img2, F):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    绘制极线。\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "    - pts1: (np.ndarray): 第一幅图像中的匹配点。\\n",\r
    "    - pts2: (np.ndarray): 第二幅图像中的匹配点。\\n",\r
    "    - img1: (np.ndarray): 第一幅图像。\\n",\r
    "    - img2: (np.ndarray): 第二幅图像。\\n",\r
    "    - F: (np.ndarray): 基础矩阵。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 将点坐标转为整数\\n",\r
    "    pts1 = np.int32(pts1)\\n",\r
    "    pts2 = np.int32(pts2)\\n",\r
    "\\n",\r
    "    # 选取前8个点进行可视化\\n",\r
    "    idx = np.arange(8)\\n",\r
    "    pts1 = pts1[idx]\\n",\r
    "    pts2 = pts2[idx]\\n",\r
    "\\n",\r
    "    # 计算对应的极线\\n",\r
    "    lines1 = cv2.computeCorrespondEpilines(\\n",\r
    "                        pts2.reshape(-1,1,2), 2, F)\\n",\r
    "    lines1 = lines1.reshape(-1,3)\\n",\r
    "\\n",\r
    "    # 绘制极线\\n",\r
    "    imgl, imgr = drawlines(img1, img2, lines1, pts1, pts2)\\n",\r
    "\\n",\r
    "    # 将两幅图拼接在一起\\n",\r
    "    vis = np.concatenate((imgl, imgr), axis=1)\\n",\r
    "\\n",\r
    "    # 展示图像\\n",\r
    "    plt.figure(figsize=(10, 10))\\n",\r
    "    plt.imshow(vis)\\n",\r
    "    plt.axis('off')\\n",\r
    "    plt.show()\\n",\r
    "\\n",\r
    "def drawlines(img1, img2, lines, pts1, pts2):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    绘制极线。\\n",\r
    "\\n",\r
    "    参数:\\n",\r
    "    - img1: (np.ndarray): 左图。\\n",\r
    "    - img2: (np.ndarray): 右图。\\n",\r
    "    - lines: (np.ndarray): 极线。\\n",\r
    "    - pts1: (np.ndarray): 左图对应的匹配点。\\n",\r
    "    - pts2: (np.ndarray): 右图对应的匹配点。\\n",\r
    "    \\"\\"\\"\\n",\r
    "    # 获取图像尺寸\\n",\r
    "    r, c, _ = img1.shape\\n",\r
    "\\n",\r
    "    for r, pt1, pt2 in zip(lines, pts1, pts2):\\n",\r
    "        color = tuple(np.random.randint(50, 255, 3).tolist())\\n",\r
    "        # 计算直线上的两个点\\n",\r
    "        x0, y0 = map(int, [0, -r[2]/r[1]]) \\n",\r
    "        x1, y1 = map(int, [c, -(r[2]+r[0]*c)/r[1]])\\n",\r
    "        # 在img1中绘制直线\\n",\r
    "        img1 = cv2.line(img1,  (x0, y0),  (x1, y1),  color, 1) \\n",\r
    "        # 在img1中绘制对应的特征点\\n",\r
    "        img1 = cv2.circle(img1, tuple(pt1), 5, color, -1) \\n",\r
    "        # 在img2中绘制对应的特征点\\n",\r
    "        img2 = cv2.circle(img2, tuple(pt2), 5, color, -1) \\n",\r
    "    return img1, img2\\n",\r
    "\\n",\r
    "# 在原图上可视化特征点对应的极线\\n",\r
    "draw_epipolar_lines(pts1_filtered.T, pts2_filtered.T, \\n",\r
    "                    imgs[0], imgs[1], F)"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "id": "9896d40b",\r
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
   "id": "15c62eda",\r
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
   "id": "b6e3aefc",\r
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
   "id": "9027efbc",\r
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
   "execution_count": 10,\r
   "id": "6661858c",\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2026-08-25T13:19:24.133853Z",\r
     "iopub.status.busy": "2026-08-25T13:19:24.133662Z",\r
     "iopub.status.idle": "2026-08-25T13:19:24.137573Z",\r
     "shell.execute_reply": "2026-08-25T13:19:24.137062Z"\r
    }\r
   },\r
   "outputs": [\r
    {\r
     "ename": "SyntaxError",\r
     "evalue": "invalid syntax (4127060134.py, line 1)",\r
     "output_type": "error",\r
     "traceback": [\r
      "  \\u001b[36mCell\\u001b[39m\\u001b[36m \\u001b[39m\\u001b[32mIn[10]\\u001b[39m\\u001b[32m, line 1\\u001b[39m\\n\\u001b[31m    \\u001b[39m\\u001b[31m\`\`\`python\\u001b[39m\\n    ^\\n\\u001b[31mSyntaxError\\u001b[39m\\u001b[31m:\\u001b[39m invalid syntax\\n"\r
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
   "id": "02b4cc9e",\r
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
