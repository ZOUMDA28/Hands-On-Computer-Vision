// 学习路径配置
export const PATH_STEPS = [
  {
    num: "01",
    title: "图像处理基础",
    titleEn: "Image Processing Fundamentals",
    desc: "从像素操作到特征提取，掌握图像处理核心算法",
    descEn: "From pixel manipulation to feature extraction, master core image processing algorithms",
    section: "part1-image-processing"
  },
  {
    num: "02",
    title: "最优化与立体视觉",
    titleEn: "Optimization & Stereo Vision",
    desc: "图像拼接、相机标定到三维点云重建",
    descEn: "From image stitching, camera calibration to 3D point cloud reconstruction",
    section: "part2-optimization-3d"
  }
]

// 精选可运行笔记本
export const RUNNABLE_NOTEBOOKS = [
  {
    id: "nb-1",
    lessonId: "practice",
    title: "数字图像的获取和表示",
    titleEn: "Digital Image Acquisition & Representation",
    desc: "Gamma校正、灰度化、二值化、翻转、亮度调整",
    descEn: "Gamma correction, grayscale, binarization, flipping, brightness adjustment",
    section: "part1-image-processing",
    duration: 20
  },
  {
    id: "nb-2",
    lessonId: "practice",
    title: "颜色空间的转换",
    titleEn: "Color Space Conversion",
    desc: "RGB↔HSV、RGB↔Lab、颜色传递算法",
    descEn: "RGB↔HSV, RGB↔Lab, color transfer algorithms",
    section: "part1-image-processing",
    duration: 25
  },
  {
    id: "nb-3",
    lessonId: "practice",
    title: "图像滤波",
    titleEn: "Image Filtering",
    desc: "高斯滤波、双边滤波、均值/中值滤波",
    descEn: "Gaussian filter, bilateral filter, mean/median filter",
    section: "part1-image-processing",
    duration: 30
  },
  {
    id: "nb-4",
    lessonId: "practice",
    title: "特征提取",
    titleEn: "Feature Extraction",
    desc: "Canny边缘检测、SIFT关键点与描述子匹配",
    descEn: "Canny edge detection, SIFT keypoints and descriptor matching",
    section: "part1-image-processing",
    duration: 35
  },
  {
    id: "nb-5",
    lessonId: "practice",
    title: "图像拼接模型",
    titleEn: "Image Stitching Model",
    desc: "线性最小二乘、RANSAC、仿射/单应拼接",
    descEn: "Linear least squares, RANSAC, affine/homography stitching",
    section: "part2-optimization-3d",
    duration: 40
  },
  {
    id: "nb-6",
    lessonId: "practice",
    title: "立体视觉点云重建",
    titleEn: "Stereo Vision Point Cloud Reconstruction",
    desc: "8点法基础矩阵、本质矩阵分解、三角化",
    descEn: "8-point algorithm, essential matrix decomposition, triangulation",
    section: "part2-optimization-3d",
    duration: 45
  }
]
