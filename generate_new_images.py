# -*- coding: utf-8 -*-
"""
为"最优化算法与立体视觉重建"章节生成测试图像
"""
import os
import cv2
import numpy as np

BASE = r"d:\CODE\Hands-On-Computer-Vision"

# ===== 创建目录 =====
dirs = [
    os.path.join(BASE, "最优化算法与立体视觉重建", "图像拼接模型"),
    os.path.join(BASE, "最优化算法与立体视觉重建", "相机参数标定"),
    os.path.join(BASE, "最优化算法与立体视觉重建", "立体视觉点云重建"),
]
for d in dirs:
    os.makedirs(d, exist_ok=True)
    print(f"创建: {d}")

print("\n" + "=" * 50)
print("开始生成测试图像...")
print("=" * 50)

# ========== 第1章: 图像拼接 ==========
# 创建两张有重叠区域的图像 (模拟从不同角度拍摄的照片)
def create_stitch_images():
    """创建两张有重叠的图像用于拼接"""
    h, w = 300, 400
    
    # 创建大图 (600x300)
    big_img = np.zeros((h, w * 2 - 100, 3), dtype=np.uint8)
    
    # 生成一个有明显特征的场景
    for y in range(h):
        for x in range(w * 2 - 100):
            # 渐变背景
            big_img[y, x, 0] = int(100 + 80 * x / (w * 2))
            big_img[y, x, 1] = int(150 + 50 * y / h)
            big_img[y, x, 2] = int(80 + 100 * (x + y) / (w * 2 + h))
    
    # 添加特征元素 (便于特征点检测)
    cv2.rectangle(big_img, (100, 80), (180, 160), (0, 0, 255), -1)
    cv2.rectangle(big_img, (250, 60), (330, 140), (0, 255, 0), -1)
    cv2.rectangle(big_img, (450, 90), (530, 170), (255, 0, 0), -1)
    
    cv2.circle(big_img, (150, 220), 35, (255, 0, 255), -1)
    cv2.circle(big_img, (350, 200), 45, (0, 128, 255), -1)
    cv2.circle(big_img, (520, 240), 40, (128, 255, 0), -1)
    
    # 添加三角形
    pts1 = np.array([[80, 250], [130, 310], [30, 310]], np.int32)
    cv2.fillPoly(big_img, [pts1], (200, 100, 50))
    
    pts2 = np.array([[400, 260], [450, 320], [350, 320]], np.int32)
    cv2.fillPoly(big_img, [pts2], (50, 200, 200))
    
    # 添加文字
    cv2.putText(big_img, "LEFT PART", (50, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(big_img, "RIGHT PART", (400, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(big_img, "OVERLAP", (280, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
    
    # 从中切出两张有重叠的图像
    # 左图: 从位置0开始, 宽度400
    left_img = big_img[:, :w].copy()
    
    # 右图: 从位置300开始(有100像素重叠), 宽度400
    right_start = 300
    right_img = big_img[:, right_start:right_start + w].copy()
    
    # 保存
    d1 = os.path.join(BASE, "最优化算法与立体视觉重建", "图像拼接模型")
    cv2.imwrite(os.path.join(d1, "left_image.jpg"), left_img)
    cv2.imwrite(os.path.join(d1, "right_image.jpg"), right_img)
    print(f"  [第1章] left_image.jpg, right_image.jpg 已生成")
    print(f"    左图: {left_img.shape[1]}x{left_img.shape[0]}, 右图: {right_img.shape[1]}x{right_img.shape[0]}")
    print(f"    重叠区域: {w - right_start} 像素")


# ========== 第2章: 相机标定 ==========
def create_calibration_images():
    """创建棋盘格标定图像"""
    d2 = os.path.join(BASE, "最优化算法与立体视觉重建", "相机参数标定")
    
    # 创建一张棋盘格图像 (9x6 内角点)
    # 实际的棋盘格: 10x7 方格 = 9x6 内角点
    squares_x, squares_y = 10, 7
    cell_size = 60  # 每个方格的像素大小
    
    margin = 50  # 边距
    w = margin * 2 + squares_x * cell_size
    h = margin * 2 + squares_y * cell_size
    
    img = np.ones((h, w), dtype=np.uint8) * 255  # 白色背景
    
    # 绘制棋盘格
    for i in range(squares_x):
        for j in range(squares_y):
            if (i + j) % 2 == 0:
                x0 = margin + i * cell_size
                y0 = margin + j * cell_size
                img[y0:y0+cell_size, x0:x0+cell_size] = 0  # 黑色
    
    # 添加边框 (便于识别)
    cv2.rectangle(img, (margin, margin), (w-margin, h-margin), 128, 2)
    
    # 保存为第一张标定图 (正面)
    cv2.imwrite(os.path.join(d2, "calib_image_1.jpg"), img)
    
    # 创建几张不同角度的标定图 (使用透视变换模拟)
    src_pts = np.float32([[0, 0], [w-1, 0], [w-1, h-1], [0, h-1]])
    
    # 图2: 稍微倾斜
    dst_pts2 = np.float32([[30, 50], [w-40, 20], [w-20, h-30], [50, h-40]])
    M2 = cv2.getPerspectiveTransform(src_pts, dst_pts2)
    img2 = cv2.warpPerspective(img, M2, (w, h))
    cv2.imwrite(os.path.join(d2, "calib_image_2.jpg"), img2)
    
    # 图3: 不同角度
    dst_pts3 = np.float32([[40, 30], [w-30, 60], [w-50, h-20], [20, h-50]])
    M3 = cv2.getPerspectiveTransform(src_pts, dst_pts3)
    img3 = cv2.warpPerspective(img, M3, (w, h))
    cv2.imwrite(os.path.join(d2, "calib_image_3.jpg"), img3)
    
    # 图4: 更小 (远距离)
    small_img = cv2.resize(img, (w//2, h//2))
    # 放到一个更大的画布上
    canvas = np.ones((h, w), dtype=np.uint8) * 128
    canvas[h//4:h//4+h//2, w//4:w//4+w//2] = small_img
    cv2.imwrite(os.path.join(d2, "calib_image_4.jpg"), canvas)
    
    print(f"  [第2章] 4张标定图像已生成")
    print(f"    棋盘格: {squares_x}x{squares_y} 方格, 内角点: {squares_x-1}x{squares_y-1}")
    print(f"    图像尺寸: {w}x{h}")


# ========== 第3章: 立体视觉 ==========
def create_stereo_images():
    """创建立体视觉用的图像对"""
    d3 = os.path.join(BASE, "最优化算法与立体视觉重建", "立体视觉点云重建")
    
    h, w = 400, 500
    
    # 创建一个3D场景的俯视图 (模拟两个不同视角)
    scene = np.zeros((h, w, 3), dtype=np.uint8)
    
    # 背景渐变
    for y in range(h):
        for x in range(w):
            scene[y, x, 0] = int(50 + 50 * x / w)
            scene[y, x, 1] = int(80 + 60 * y / h)
            scene[y, x, 2] = int(100 + 80 * (x + y) / (w + h))
    
    # 添加3D物体 (用渐变模拟深度)
    # 物体1: 立方体 (正面)
    cube_x, cube_y = 150, 120
    cube_s = 100
    cv2.rectangle(scene, (cube_x, cube_y), (cube_x+cube_s, cube_y+cube_s), (0, 100, 200), -1)
    # 立方体侧面 (模拟3D)
    cv2.rectangle(scene, (cube_x+cube_s, cube_y+20), (cube_x+cube_s+40, cube_y+cube_s+20), (0, 80, 160), -1)
    cv2.rectangle(scene, (cube_x+20, cube_y-cube_s//3), (cube_x+cube_s+20, cube_y), (0, 120, 220), -1)
    
    # 物体2: 球体 (用圆形+阴影模拟)
    sphere_cx, sphere_cy = 350, 280
    cv2.circle(scene, (sphere_cx, sphere_cy), 60, (200, 50, 50), -1)
    cv2.circle(scene, (sphere_cx-15, sphere_cy-15), 20, (255, 150, 150), -1)  # 高光
    
    # 物体3: 三角锥
    tri_pts = np.array([[250, 200], [300, 280], [200, 280]], np.int32)
    cv2.fillPoly(scene, [tri_pts], (50, 180, 80))
    tri_pts2 = np.array([[300, 280], [350, 240], [250, 200]], np.int32)
    cv2.fillPoly(scene, [tri_pts2], (30, 140, 60))
    
    # 地面网格
    for i in range(0, h, 40):
        cv2.line(scene, (0, i), (w, i), (150, 150, 150), 1)
    for i in range(0, w, 40):
        cv2.line(scene, (i, 0), (i, h), (150, 150, 150), 1)
    
    # 添加特征标记 (便于匹配)
    markers = [(50, 50), (450, 50), (50, 350), (450, 350), (250, 200)]
    for mx, my in markers:
        cv2.drawMarker(scene, (mx, my), (255, 255, 255), cv2.MARKER_CROSS, 20, 2)
    
    cv2.putText(scene, "VIEW 1", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    # 保存第一张
    cv2.imwrite(os.path.join(d3, "stereo_image_1.jpg"), scene)
    
    # 创建第二张 (轻微变换视角 - 水平平移+轻微旋转)
    # 模拟立体视觉中两个相机的位置差异
    shift_x = 30  # 水平位移 (模拟基线)
    M = np.float32([[1, 0, shift_x], [0, 1, 0]])
    scene2 = cv2.warpAffine(scene, M, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=(50, 50, 50))
    
    # 加入轻微透视
    src_pts = np.float32([[0, 0], [w-1, 0], [w-1, h-1], [0, h-1]])
    dst_pts = np.float32([[5, 0], [w-5, 5], [w-2, h-2], [0, h-5]])
    M_persp = cv2.getPerspectiveTransform(src_pts, dst_pts)
    scene2 = cv2.warpPerspective(scene2, M_persp, (w, h))
    
    cv2.putText(scene2, "VIEW 2", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.imwrite(os.path.join(d3, "stereo_image_2.jpg"), scene2)
    
    print(f"  [第3章] 立体图像对已生成")
    print(f"    图像尺寸: {w}x{h}, 水平位移: {shift_x}像素")


# 执行生成
create_stitch_images()
create_calibration_images()
create_stereo_images()

print("\n" + "=" * 50)
print("所有测试图像生成完毕!")
print("=" * 50)