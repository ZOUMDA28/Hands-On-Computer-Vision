"""
批量执行 workspace 内除 Hands-on-CV-main 外的所有 .ipynb，
将 cell outputs 保存回文件，让打开 notebook 时直接显示结果。
使用 jupyter nbconvert CLI 逐个执行，避免 Python API 在 Windows 下的 async/ZMQ 问题。
"""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

PYTHON = sys.executable

# 读取清单
with open("_notebooks_to_run.json", "r", encoding="utf-8") as f:
    notebooks = json.load(f)

results = []

for nb_path in notebooks:
    nb_path = Path(nb_path)
    cwd = nb_path.parent
    rel = nb_path.relative_to(Path.cwd())
    print(f"\n{'='*60}")
    print(f"[{len(results)+1}/{len(notebooks)}] Executing: {rel}")
    print(f"{'='*60}")

    start = time.time()
    cmd = [
        PYTHON, "-m", "jupyter", "nbconvert",
        "--to", "notebook",
        "--execute",
        "--inplace",
        "--allow-errors",
        "--ExecutePreprocessor.timeout=120",
        str(nb_path),
    ]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=180,  # 整个 notebook 最多 3 分钟
        )
        elapsed = time.time() - start
        if proc.returncode == 0:
            results.append({
                "path": str(nb_path),
                "rel": str(rel),
                "status": "success",
                "elapsed_sec": elapsed,
                "error": None,
                "output_tail": "\n".join(proc.stdout.splitlines()[-5:]),
            })
            print(f"OK ({elapsed:.1f}s)")
        else:
            results.append({
                "path": str(nb_path),
                "rel": str(rel),
                "status": "failed",
                "elapsed_sec": elapsed,
                "error": proc.stdout,
            })
            print(f"FAILED ({elapsed:.1f}s): exit={proc.returncode}")
            print(proc.stdout[-500:])

    except subprocess.TimeoutExpired as e:
        elapsed = time.time() - start
        results.append({
            "path": str(nb_path),
            "rel": str(rel),
            "status": "timeout",
            "elapsed_sec": elapsed,
            "error": f"Timeout after {elapsed:.1f}s",
        })
        print(f"TIMEOUT ({elapsed:.1f}s)")

# 保存结果日志
with open("_notebook_execution_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

# 简单统计
success = [r for r in results if r["status"] == "success"]
failed = [r for r in results if r["status"] in ("failed", "timeout")]
print(f"\n\nTotal: {len(results)}  Success: {len(success)}  Failed/Timeout: {len(failed)}")
