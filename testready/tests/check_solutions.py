#!/usr/bin/env python3
"""Compile every Java solution and execute every Python solution in the Coding for SDETs track.

Usage: python3 tests/check_solutions.py   (needs javac 21+ and python3 on PATH)
Exits non-zero if any snippet fails to compile or run.
"""
import json, pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGE = ROOT / "index.html"
OUT = ROOT / "tests" / ".build"
# Snippets that need Selenium/TestNG on the classpath; skipped here.
SKIP = {"Print all links on a page and find broken ones",
        "Read test data from a CSV for a data-driven test"}
IMPORTS = ("import java.util.*; import java.util.stream.*; import java.util.function.*; "
           "import java.util.regex.*; import java.net.http.*; import java.net.*; import java.io.*;\n")


def load_code_items():
    page = PAGE.read_text(encoding="utf-8")
    start = page.index("const TRACKS = ") + len("const TRACKS = ")
    end = page.index(";\n\nconst CHEATS", start)
    tracks = json.loads(page[start:end].replace("<\\/", "</"))
    return [it for t in tracks if t["id"] == "code" for g in t["groups"] for it in g[1] if it[3]]


def main():
    items = [it for it in load_code_items() if it[0] not in SKIP]
    shutil.rmtree(OUT, ignore_errors=True)
    (OUT / "classes").mkdir(parents=True)
    for n, it in enumerate(items):
        (OUT / f"S{n}.java").write_text(f"{IMPORTS}public class S{n} {{\n{it[3]}\n}}\n", encoding="utf-8")

    javac = subprocess.run(["javac", "-d", str(OUT / "classes"), *map(str, sorted(OUT.glob("S*.java")))],
                           capture_output=True, text=True)
    java_ok = javac.returncode == 0
    if not java_ok:
        print(javac.stderr)

    py_fail = 0
    for it in items:
        try:
            exec(compile(it[4], it[0], "exec"), {})
        except Exception as e:  # noqa: BLE001 - report any failure
            py_fail += 1
            print(f"Python failed: {it[0]}: {e!r}")

    print(f"{len(items)} problems checked | Java compile: {'OK' if java_ok else 'FAILED'} | Python failures: {py_fail}")
    sys.exit(0 if java_ok and py_fail == 0 else 1)


if __name__ == "__main__":
    main()
