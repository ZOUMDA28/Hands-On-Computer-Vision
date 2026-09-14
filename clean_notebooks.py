"""
清理 notebooks/ 目录下 Notebook 的冗余内容：
1. 移除"手写约束清单"段落（与开头重复的约束说明）
2. 移除"科研规范小结"段落（跨章节重复的模板内容）
3. 精简"编程实践"副标题（与章节标题重复）
4. 去重参考来源（开头和结尾不重复标注）
"""
import json
import os
import re
import copy

NOTEBOOKS_DIR = r'd:\CODE\Hands-On-Computer-Vision\notebooks'

def find_notebooks(base_dir):
    result = []
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.endswith('.ipynb'):
                result.append(os.path.join(root, f))
    return sorted(result)

def cell_source(cell):
    src = cell.get('source', '')
    if isinstance(src, list):
        return ''.join(src)
    return src

def set_cell_source(cell, text):
    lines = text.split('\n')
    cell['source'] = [l + '\n' for l in lines[:-1]] + [lines[-1]] if lines else []

def is_redundant_section(source):
    """Check if a markdown cell is a redundant section to remove."""
    s = source.strip()
    # 手写约束清单 - redundant with opening section
    if re.match(r'^##+\s*(四|三|二)?[、.]?\s*手写约束清单', s):
        return True
    # 科研规范小结 - boilerplate across notebooks
    if re.match(r'^##+\s*(六|五|四)?[、.]?\s*科研规范小结', s):
        return True
    return False

def is_practice_header(source):
    """Check if cell is the '编程实践' header that duplicates chapter title."""
    s = source.strip()
    return bool(re.match(r'^##+\s*编程实践[：:]', s))

def clean_notebook(nb_path):
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    cells = nb.get('cells', [])
    new_cells = []
    removed_count = 0

    for cell in cells:
        if cell['cell_type'] != 'markdown':
            new_cells.append(cell)
            continue

        source = cell_source(cell)

        # Skip redundant sections
        if is_redundant_section(source):
            removed_count += 1
            continue

        # Skip "编程实践" header (redundant with chapter title)
        if is_practice_header(source):
            # But keep the reference info if it exists
            # Extract any reference links before removing
            ref_match = re.search(r'(参考来源|参考|出处).*', source, re.DOTALL)
            if ref_match:
                # Keep just the reference part
                ref_text = ref_match.group(0).strip()
                if len(ref_text) > 50:  # Only keep if substantial
                    new_cell = copy.deepcopy(cell)
                    set_cell_source(new_cell, f'> {ref_text}')
                    new_cells.append(new_cell)
                    continue
            removed_count += 1
            continue

        new_cells.append(cell)

    nb['cells'] = new_cells

    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)

    return removed_count

def main():
    notebooks = find_notebooks(NOTEBOOKS_DIR)
    print(f'Found {len(notebooks)} notebooks\n')

    total_removed = 0
    for nb_path in notebooks:
        rel = os.path.relpath(nb_path, NOTEBOOKS_DIR)
        removed = clean_notebook(nb_path)
        total_removed += removed
        print(f'  {rel}: removed {removed} redundant cells')

    print(f'\nTotal: removed {total_removed} redundant cells across {len(notebooks)} notebooks')

if __name__ == '__main__':
    main()
