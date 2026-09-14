<<<<<<< HEAD
export const PATH_STEPS = [
  {
    num: "01",
    title: "图像处理基础",
    titleEn: "Image Processing",
    desc: "从像素到特征，掌握图像操作与经典算法",
    descEn: "From pixels to features, master image operations and classic algorithms",
    section: "image-processing",
  },
  {
    num: "02",
    title: "最优化与立体视觉",
    titleEn: "Optimization & 3D Vision",
    desc: "最优化方法与三维重建核心技术",
    descEn: "Optimization methods and 3D reconstruction techniques",
    section: "optimization-3d",
  },
]

export const RUNNABLE_NOTEBOOKS = [
  {
    id: "nb-1",
    lessonId: "数字图像的获取和表示-practice",
    title: "数字图像的获取和表示",
    titleEn: "Digital Image Representation",
    desc: "理解图像的数字表示、像素操作与 Gamma 校正",
    descEn: "Understand digital image representation, pixel operations and gamma correction",
    section: "image-processing",
    duration: 15,
  },
  {
    id: "nb-2",
    lessonId: "颜色空间的转换-practice",
    title: "颜色空间的转换",
    titleEn: "Color Space Conversion",
    desc: "RGB、HSV、Lab 等颜色空间及其转换",
    descEn: "RGB, HSV, Lab and other color spaces and their conversions",
    section: "image-processing",
    duration: 20,
  },
  {
    id: "nb-3",
    lessonId: "几何变换-practice",
    title: "几何变换",
    titleEn: "Geometric Transforms",
    desc: "平移、旋转、缩放、仿射与单应变换",
    descEn: "Translation, rotation, scaling, affine and homography transforms",
    section: "image-processing",
    duration: 25,
  },
  {
    id: "nb-4",
    lessonId: "图像滤波-practice",
    title: "图像滤波",
    titleEn: "Image Filtering",
    desc: "均值、高斯、中值、双边滤波与去噪",
    descEn: "Mean, Gaussian, median, bilateral filtering and denoising",
    section: "image-processing",
    duration: 25,
  },
  {
    id: "nb-5",
    lessonId: "基于直方图统计的处理-practice",
    title: "基于直方图统计的处理",
    titleEn: "Histogram-based Processing",
    desc: "直方图均衡化、匹配与统计增强",
    descEn: "Histogram equalization, matching and statistical enhancement",
    section: "image-processing",
    duration: 20,
  },
  {
    id: "nb-6",
    lessonId: "特征提取-practice",
    title: "特征提取",
    titleEn: "Feature Extraction",
    desc: "边缘检测、角点检测与特征描述",
    descEn: "Edge detection, corner detection and feature description",
    section: "image-processing",
    duration: 30,
  },
  {
    id: "nb-7",
    lessonId: "相机参数标定-practice",
    title: "相机参数标定",
    titleEn: "Camera Calibration",
    desc: "针孔相机模型与张正友标定法",
    descEn: "Pinhole camera model and Zhang's calibration method",
    section: "optimization-3d",
    duration: 35,
  },
  {
    id: "nb-8",
    lessonId: "图像拼接模型-practice",
    title: "图像拼接模型",
    titleEn: "Image Stitching",
    desc: "特征匹配、单应矩阵估计与全景拼接",
    descEn: "Feature matching, homography estimation and panorama stitching",
    section: "optimization-3d",
    duration: 30,
  },
  {
    id: "nb-9",
    lessonId: "立体视觉点云重建-practice",
    title: "立体视觉点云重建",
    titleEn: "Stereo Vision & Point Cloud",
    desc: "双目匹配、三角测量与三维点云重建",
    descEn: "Stereo matching, triangulation and 3D point cloud reconstruction",
    section: "optimization-3d",
    duration: 40,
  },
  {
    id: "nb-10",
    lessonId: "图像滤波-practice_extra",
    title: "图像滤波（拓展）",
    titleEn: "Image Filtering (Extra)",
    desc: "频域滤波与高级滤波技术",
    descEn: "Frequency domain filtering and advanced techniques",
    section: "image-processing",
    duration: 22,
  },
=======
// Learning path steps for the welcome page
export const PATH_STEPS = [
  {
    part: 'part1-image-processing',
    title: '第一部分：图像处理基础',
    subtitle: '从像素到特征——手写实现6大核心算法',
    chapters: [
      { num: 1, title: '数字图像的获取和表示', topic: 'Gamma校正、灰度化、ISP管线' },
      { num: 2, title: '颜色空间的转换', topic: 'RGB↔HSV/Lab、颜色传递' },
      { num: 3, title: '基于直方图统计的处理', topic: '直方图均衡化、匹配' },
      { num: 4, title: '图像滤波', topic: '高斯滤波、双边滤波' },
      { num: 5, title: '特征提取', topic: 'Canny边缘、SIFT特征匹配' },
      { num: 6, title: '几何变换', topic: '相似/仿射/单应变换' },
    ],
  },
  {
    part: 'part2-optimization-3d',
    title: '第二部分：最优化算法与立体视觉重建',
    subtitle: '从最小二乘到三维点云——3大经典任务',
    chapters: [
      { num: 7, title: '图像拼接模型', topic: '最小二乘、RANSAC' },
      { num: 8, title: '相机参数标定', topic: '张正友标定、LM优化' },
      { num: 9, title: '立体视觉点云重建', topic: '对极几何、三角化、SfM' },
    ],
  },
  {
    part: 'appendix',
    title: '附录：额外学习主题',
    subtitle: '路线之外的拓展知识——卷积、模板匹配、光流、SfM',
    chapters: [
      { num: 10, title: '卷积基础', topic: '2D卷积、可分离滤波、边界处理' },
      { num: 11, title: '额外学习主题', topic: '模板匹配、Harris角点、光流、SfM' },
    ],
  },
]

// Course references for cross-referencing
export const COURSE_REFERENCES = {
  stanford_cs231a: {
    name: 'Stanford CS231A',
    title: 'Computer Vision: Foundations and Applications',
    url: 'https://web.stanford.edu/class/cs231a/',
    relevant: ['Camera Models', 'Camera Calibration', 'Epipolar Geometry', 'Stereo Systems', 'SfM', 'Fitting/Matching'],
  },
  cmu_16720: {
    name: 'CMU 16-720A',
    title: 'Computer Vision',
    url: 'https://vision.cs.cmu.edu/courses.html',
    relevant: ['Filtering', 'Warping', 'Image Descriptors', 'Camera Models', 'Optical Flow', 'Stereo', 'SfM'],
  },
  mit_6801: {
    name: 'MIT 6.801',
    title: 'Machine Vision',
    url: 'https://ocw.mit.edu/courses/6-801-machine-vision-fall-2000/',
    relevant: ['Image Formation', 'Binary Image Processing', 'Filtering', 'Photometric Stereo'],
  },
  ucberkeley_cs280: {
    name: 'UC Berkeley CS280',
    title: 'Computer Vision',
    url: 'https://www2.eecs.berkeley.edu/Courses/CS280/',
    relevant: ['Image Processing', 'Feature Detection', 'Camera Geometry', 'Multi-View Geometry'],
  },
  sjtu_hocv: {
    name: '上海交通大学《动手学习计算机视觉》',
    title: 'Hands-on Computer Vision',
    url: 'https://github.com/gotonca/Hands-on-CV',
    relevant: ['Convolution', 'Filtering', 'Edge Detection', 'Feature Detection', 'Image Stitching', 'Camera Calibration', '3D Reconstruction'],
  },
}

// Runnable notebooks (notebooks with pre-rendered outputs)
export const RUNNABLE_NOTEBOOKS = [
  '01-digital-image-acquisition-practice',
  '02-color-space-conversion-practice',
  '03-histogram-processing-practice',
  '04-image-filtering-practice',
  '05-feature-extraction-practice',
  '06-geometric-transformation-practice',
  '07-image-stitching-practice',
  '08-camera-calibration-practice',
  '09-stereo-reconstruction-practice',
>>>>>>> e8dbc7c (add course homework with CS231A/CMU 16-385 actual assignments and GitHub solutions)
]
