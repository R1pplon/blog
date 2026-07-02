#!/usr/bin/env python3
"""为缺少 frontmatter 的 .md 文件自动生成 title/date 头部信息。"""

import os
import time
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def has_frontmatter(filepath: str) -> bool:
    """检查文件是否已有合法的 YAML frontmatter (含 title/date)。"""
    try:
        content = Path(filepath).read_text(encoding="utf-8")
    except Exception:
        return False

    if not content.strip():
        return False

    lines = content.splitlines()
    idx = 0
    while idx < len(lines) and lines[idx].strip() == "":
        idx += 1

    if idx >= len(lines) or lines[idx].strip() != "---":
        return False

    for j in range(idx + 1, min(idx + 8, len(lines))):
        if lines[j].strip() == "---":
            between = "\n".join(lines[idx + 1 : j])
            if "title:" in between or "date:" in between:
                return True
            break

    return False


def generate_frontmatter(filepath: str) -> str:
    """根据文件路径生成 frontmatter 块。"""
    fname = os.path.basename(filepath)
    title = os.path.splitext(fname)[0]
    mtime = os.path.getmtime(filepath)
    date_str = time.strftime("%Y-%m-%d", time.localtime(mtime))
    return f'---\ntitle: "{title}"\ndate: {date_str}\n---\n'


def process_file(filepath: str, dry_run: bool = True) -> str:
    """处理单个文件，返回状态: skip / add / error。"""
    if has_frontmatter(filepath):
        return "skip"

    fm = generate_frontmatter(filepath)

    if dry_run:
        return "add"

    try:
        original = Path(filepath).read_text(encoding="utf-8")
    except Exception as e:
        print(f"  ERROR reading {filepath}: {e}", file=sys.stderr)
        return "error"

    new_content = fm + original.lstrip("\n")
    if not new_content.endswith("\n"):
        new_content += "\n"

    try:
        Path(filepath).write_text(new_content, encoding="utf-8")
    except Exception as e:
        print(f"  ERROR writing {filepath}: {e}", file=sys.stderr)
        return "error"

    return "add"


def main() -> None:
    dry_run = "--apply" not in sys.argv

    if dry_run:
        print("[DRY-RUN] 预览模式，不会实际修改文件。加 --apply 参数执行写入。")
        print()

    md_files = sorted(ROOT.rglob("*.md"))
    skip_count = 0
    add_count = 0
    error_count = 0

    for fpath in md_files:
        rel = fpath.relative_to(ROOT)
        status = process_file(str(fpath), dry_run=dry_run)
        if status == "skip":
            skip_count += 1
        elif status == "add":
            add_count += 1
            print(f"  + {rel}")
        elif status == "error":
            error_count += 1

    print()
    print(f"  总计: {len(md_files)}  已有 frontmatter: {skip_count}"
          f"  {'将添加' if dry_run else '已添加'}: {add_count}"
          f"  错误: {error_count}")

    if add_count > 0 and dry_run:
        print()
        print(f"  确认无误后运行: python3 {os.path.basename(__file__)} --apply")


if __name__ == "__main__":
    main()
