# -*- coding: utf-8 -*-
"""Cek source Landing Page tidak memuat karakter CJK tak terduga."""

from __future__ import annotations

import os
import pathlib
from pathlib import Path

import pytest

REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
SCAN_DIRS = ("app", "components", "lib", "scripts", "pages", "public", "docs", "assets")
SKIP_DIRS = {"__pycache__", ".pytest_cache", "node_modules", ".next"}
EXTS = {".py", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".md", ".css", ".html", ".txt", ".yml", ".yaml"}

CJK_RANGES = (
    (0x3000, 0x303F),
    (0x3400, 0x4DBF),
    (0x4E00, 0x9FFF),
    (0xAC00, 0xD7AF),
    (0xF900, 0xFAFF),
    (0xFF00, 0xFFEF),
)


def _is_cjk(ch: str) -> bool:
    code = ord(ch)
    return any(low <= code <= high for low, high in CJK_RANGES)


def _iter_source_files():
    for folder in SCAN_DIRS:
        base = REPO_ROOT / folder
        if not base.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for filename in filenames:
                if os.path.splitext(filename)[1].lower() in EXTS:
                    yield Path(dirpath) / filename


@pytest.mark.parametrize("path", sorted(_iter_source_files()), ids=str)
def test_tidak_ada_karakter_cjk_di_source(path):
    text = path.read_text(encoding="utf-8")
    offenders = []
    for lineno, line in enumerate(text.split("\n"), start=1):
        bad = [ch for ch in line if _is_cjk(ch)]
        if bad:
            offenders.append(
                "  baris {}: {} :: {}".format(
                    lineno,
                    " ".join("U+{:04X}".format(ord(c)) for c in bad),
                    line.strip()[:100],
                )
            )
    assert not offenders, (
        "File {rel} memuat karakter CJK tak terduga:\n{body}".format(
            rel=path.relative_to(REPO_ROOT), body="\n".join(offenders)
        )
    )


def test_pemindai_menemukan_file():
    files = list(_iter_source_files())
    assert len(files) > 8, files[:5]
    assert any(f.name == "landing-client.tsx" for f in files)
