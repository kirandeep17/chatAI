#!/usr/bin/env python3
"""Merge questions/*.md into index.html (run from anywhere: python3 build.py).

File format (one file per track id, e.g. sel.md):
  # group: Group name
  ? Question title | E|M|H [| recent] [| concept]
  body in mini-markdown (paragraphs, "- " bullets, "1. " lists, ``` fences,
  `code`, **bold**, | table rows |). For coding problems use ```java and
  ```python fences plus a final "> note" line.
"""
import html, json, re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent / "questions"
PAGE = ROOT.parent / "index.html"
SRC_MARK = ("const TRACKS = ", ";\n\nconst CHEATS")


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    return s


def md(lines):
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1; continue
        if ln.startswith("```"):
            j = i + 1; buf = []
            while j < len(lines) and not lines[j].startswith("```"):
                buf.append(lines[j]); j += 1
            out.append('<pre class="plain">' + html.escape("\n".join(buf), quote=False) + "</pre>")
            i = j + 1; continue
        if ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            h = "<tr>" + "".join(f"<th>{inline(c)}</th>" for c in rows[0]) + "</tr>"
            b = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f'<div class="tablewrap"><table>{h}{b}</table></div>'); continue
        m_ul, m_ol = ln.startswith("- "), re.match(r"\d+\. ", ln)
        if m_ul or m_ol:
            tag = "ul" if m_ul else "ol"; items = []
            while i < len(lines) and (lines[i].startswith("- ") if m_ul else re.match(r"\d+\. ", lines[i])):
                items.append(inline(re.sub(r"^(- |\d+\. )", "", lines[i]))); i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{x}</li>" for x in items) + f"</{tag}>"); continue
        buf = []
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("```", "|", "- ")) and not re.match(r"\d+\. ", lines[i]):
            buf.append(lines[i]); i += 1
        out.append("<p>" + inline(" ".join(buf)) + "</p>")
    return "".join(out)


def parse(path):
    groups, cur, item = [], None, None
    def flush():
        if item is None: return
        title, lvl, flags, body = item
        java = py = note = None
        text, i = [], 0
        while i < len(body):
            if body[i].startswith("```java") or body[i].startswith("```python"):
                lang = "java" if "java" in body[i] else "py"; j = i + 1; buf = []
                while not body[j].startswith("```"):
                    buf.append(body[j]); j += 1
                code = "\n".join(buf)
                if lang == "java" and java is None: java = code
                elif lang == "py" and py is None: py = code
                else: text += body[i:j + 1]
                i = j + 1; continue
            if body[i].startswith("> "):
                note = body[i][2:]; i += 1; continue
            text.append(body[i]); i += 1
        if java and py:
            cur[1].append([title, lvl, None, java, py, inline(note or "") + (md(text) if any(t.strip() for t in text) else ""), flags])
        else:
            cur[1].append([title, lvl, md(body), None, None, None, flags])
    for raw in path.read_text(encoding="utf-8").splitlines():
        if raw.startswith("# group:"):
            flush(); item = None
            cur = [raw[8:].strip(), []]; groups.append(cur)
        elif raw.startswith("? "):
            flush()
            parts = [p.strip() for p in raw[2:].split("|")]
            assert parts[1] in ("E", "M", "H"), (path.name, raw)
            item = (parts[0], parts[1], [p for p in parts[2:] if p], [])
        elif item is not None:
            item[3].append(raw)
        elif raw.strip():
            sys.exit(f"{path.name}: text outside an item: {raw!r}")
    flush()
    return groups


def main():
    page = PAGE.read_text(encoding="utf-8")
    a = page.index(SRC_MARK[0]) + len(SRC_MARK[0]); b = page.index(SRC_MARK[1], a)
    snap = ROOT / "base.json"
    if not snap.exists():  # first run: snapshot the hand-written tracks before merging
        base_js = page[a:b]
        snap.write_text(subprocess.run(["node", "-e", f"process.stdout.write(JSON.stringify({base_js}))"],
                                       capture_output=True, text=True, check=True).stdout, encoding="utf-8")
    base = json.loads(snap.read_text(encoding="utf-8"))
    for t in base:
        for g in t["groups"]:
            g[1] = [it + [None] * (7 - len(it)) if len(it) < 7 else it for it in g[1]]
        f = ROOT / f"{t['id']}.md"
        if not f.exists(): continue
        seen = {it[0].lower() for g in t["groups"] for it in g[1]}
        for name, items in parse(f):
            items = [it for it in items if it[0].lower() not in seen]
            seen |= {it[0].lower() for it in items}
            tgt = next((g for g in t["groups"] if g[0] == name), None)
            if tgt: tgt[1].extend(items)
            else: t["groups"].append([name, items])
    total = 0
    for t in base:
        n = sum(len(g[1]) for g in t["groups"]); total += n
        print(f"{t['id']:5} {n:4}  recent={sum('recent' in (it[6] or []) for g in t['groups'] for it in g[1]):3}  concept={sum('concept' in (it[6] or []) for g in t['groups'] for it in g[1]):3}")
    print("total", total)
    out = json.dumps(base, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    PAGE.write_text(page[:a] + out + page[b:], encoding="utf-8")


if __name__ == "__main__":
    main()
