#!/usr/bin/env python3
"""Replace the CodeMirror bundle inlined in ../index.html with a freshly built cm.min.js."""
import pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
PAGE = HERE.parent / "index.html"
START = "<script>/* CodeMirror 6 bundle (MIT): codemirror, lang-java, lang-python */\n"
END = "\n</script>\n<script>\n/* ---------------- CONTENT"

bundle = (HERE / "cm.min.js").read_text(encoding="utf-8")
if "</script" in bundle:
    sys.exit("bundle contains </script>; cannot inline safely")
page = PAGE.read_text(encoding="utf-8")
a = page.index(START) + len(START)
b = page.index(END, a)
PAGE.write_text(page[:a] + bundle + page[b:], encoding="utf-8")
print(f"inlined {len(bundle):,} bytes into {PAGE.name}")
