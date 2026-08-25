"""
为所有 notebook 嵌入执行输出（图片、结果等），使 GitHub/VS Code 中直接可见。
排除 Hands-on-CV-main 文件夹（参考资料）。
"""
import os
import sys
import json
import traceback
from pathlib import Path
import matplotlib
matplotlib.use('Agg')  # 无头模式，避免 GUI 错误

import nbformat
from nbclient import NotebookClient

BASE = Path(r"d:\CODE\Hands-On-Computer-Vision")

# 要处理的 notebook 目录模式（排除 Hands-on-CV-main）
TARGET_DIRS = [
    "图像处理基础",
    "最优化算法与立体视觉重建",
    "EXTRA",
    "Chapter 4",
]

# 收集所有目标 notebook
notebooks = []
for d in TARGET_DIRS:
    dir_path = BASE / d
    if not dir_path.exists():
        print(f"  ⚠️  目录不存在: {dir_path}")
        continue
    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d != ".ipynb_checkpoints"]
        for f in files:
            if f.endswith(".ipynb") and not f.startswith("."):
                nb_path = Path(root) / f
                notebooks.append(nb_path)

print(f"📋 找到 {len(notebooks)} 个 notebook 待执行:\n")

TIMEOUT = 300  # 每个 notebook 5 分钟
SUCCESS = []
FAILED = []

for i, nb_path in enumerate(notebooks):
    rel_path = nb_path.relative_to(BASE)
    print(f"[{i+1}/{len(notebooks)}] 执行: {rel_path}")
    
    try:
        with open(nb_path, 'r', encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)
        
        # 修复 kernelspec
        kernelspec = nb.get('metadata', {}).get('kernelspec', {})
        if not kernelspec or kernelspec.get('name', '') not in ('python3', 'python'):
            nb['metadata']['kernelspec'] = {
                'name': 'python3',
                'display_name': 'Python 3',
                'language': 'python'
            }
        
        client = NotebookClient(
            nb,
            timeout=TIMEOUT,
            kernel_name='python3',
            resources={'metadata': {'path': str(nb_path.parent)}}
        )
        client.execute()
        
        with open(nb_path, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)
        
        code_cells = [c for c in nb.cells if c.cell_type == 'code']
        cells_with_output = sum(1 for c in code_cells if c.get('outputs', []))
        total_out_images = sum(
            1 for c in code_cells 
            for o in c.get('outputs', []) 
            if 'image/png' in o.get('data', {})
        )
        total_out_text = sum(
            1 for c in code_cells 
            for o in c.get('outputs', []) 
            if 'text/plain' in o.get('data', {})
        )
        
        print(f"  ✅ 成功！{cells_with_output}/{len(code_cells)} cells with output, {total_out_images} images, {total_out_text} text outputs")
        SUCCESS.append((str(rel_path), cells_with_output, len(code_cells), total_out_images, total_out_text))
        
    except Exception as e:
        err_type = type(e).__name__
        err_msg = str(e)[:200]
        print(f"  ❌ 失败: {err_type}: {err_msg}")
        FAILED.append((str(rel_path), err_type, err_msg))

print(f"\n{'='*60}")
print(f"📊 执行汇总:")
print(f"   ✅ 成功: {len(SUCCESS)} 个")
print(f"   ❌ 失败: {len(FAILED)} 个")

if SUCCESS:
    print("\n📗 成功的 notebook:")
    for path, with_out, total, imgs, texts in SUCCESS:
        print(f"   ✅ {path}")
        print(f"      {with_out}/{total} cells, {imgs} images, {texts} text outputs")

if FAILED:
    print("\n📕 失败的 notebook:")
    for path, err_type, err_msg in FAILED:
        print(f"   ❌ {path}")
        print(f"      {err_type}: {err_msg}")
