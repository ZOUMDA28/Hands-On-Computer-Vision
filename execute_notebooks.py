"""
批量执行 notebooks/ 目录下缺少输出的 Notebook
在 conda llm 环境中运行：
    conda run -n llm python execute_notebooks.py
"""
import json
import os
import sys
import subprocess
import tempfile
import shutil

NOTEBOOKS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'notebooks')
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

def find_notebooks_with_missing_outputs(base_dir):
    """找到缺少输出的Notebook"""
    result = []
    for root, dirs, files in os.walk(base_dir):
        for f in sorted(files):
            if not f.endswith('.ipynb'):
                continue
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                nb = json.load(fh)
            cells = nb.get('cells', [])
            code_cells = [c for c in cells if c['cell_type'] == 'code']
            without_output = sum(1 for c in code_cells if not c.get('outputs'))
            if without_output > 0:
                result.append({
                    'path': path,
                    'rel': os.path.relpath(path, base_dir),
                    'missing': without_output,
                    'total_code': len(code_cells),
                })
    return result

def execute_notebook(nb_path):
    """执行单个Notebook"""
    # 创建临时副本，在项目根目录执行
    dirname = os.path.dirname(nb_path)
    basename = os.path.basename(nb_path)
    
    # 使用 jupyter nbconvert 执行
    cmd = [
        sys.executable, '-m', 'jupyter', 'nbconvert',
        '--to', 'notebook', '--execute', '--inplace',
        '--ExecutePreprocessor.timeout=120',
        f'--ExecutePreprocessor.kernel_name=python3',
        nb_path
    ]
    
    # 设置工作目录为notebook所在目录
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=dirname,
        encoding='utf-8',
        env={**os.environ, 'PYTHONPATH': PROJECT_ROOT}
    )
    
    return result.returncode == 0, result.stderr

def main():
    notebooks = find_notebooks_with_missing_outputs(NOTEBOOKS_DIR)
    print(f'Found {len(notebooks)} notebooks with missing outputs:\n')
    
    for nb in notebooks:
        print(f'  {nb["rel"]}: {nb["missing"]}/{nb["total_code"]} code cells without output')
    
    print(f'\n--- Executing notebooks ---\n')
    
    success = 0
    failed = 0
    for nb in notebooks:
        print(f'Executing: {nb["rel"]}...', end=' ')
        sys.stdout.flush()
        ok, stderr = execute_notebook(nb['path'])
        if ok:
            print('OK')
            success += 1
        else:
            # Check if it actually wrote outputs despite error code
            with open(nb['path'], 'r', encoding='utf-8') as f:
                result_nb = json.load(f)
            cells = result_nb.get('cells', [])
            code_cells = [c for c in cells if c['cell_type'] == 'code']
            new_missing = sum(1 for c in code_cells if not c.get('outputs'))
            if new_missing < nb['missing']:
                print(f'PARTIAL (reduced from {nb["missing"]} to {new_missing})')
                success += 1
            else:
                print('FAILED')
                # Print last 3 lines of stderr
                lines = stderr.strip().split('\n')
                for line in lines[-3:]:
                    print(f'  {line}')
                failed += 1
    
    print(f'\n--- Summary ---')
    print(f'Success: {success}, Failed: {failed}')

if __name__ == '__main__':
    main()
