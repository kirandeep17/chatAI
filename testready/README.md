# TestReady

Free interview prep for QA, test and automation engineers (SDETs). Keep your interview skills sharp before you need them, so a layoff is a setback, not a scramble.

TestReady is a single, self-contained web page. It needs no server, no sign-up and no build step to use, and it keeps your progress privately in your browser.

## What's inside

**1,205 interview questions with model answers**, at least 100 per track:

| Track | Questions | What it covers |
|---|---|---|
| Testing Fundamentals | 100 | STLC, test design techniques, defects, Agile, metrics |
| Selenium WebDriver | 100 | Locators, waits, exceptions, Selenium 4, BiDi, Grid, POM |
| Playwright & Cypress | 100 | Auto-waiting, fixtures, tracing, network mocking, CI, Cypress |
| API Testing | 100 | REST, status codes, auth, OWASP API Top 10, contracts, GraphQL |
| Rest Assured | 100 | Specs, POJOs, GPath, filters, auth, framework design |
| Karate | 100 | Matching, schemas, call/callSingle, parallel runs, mocks |
| Core Java for SDETs | 100 | OOP, strings, collections, streams, Java 17/21, concurrency |
| Coding for SDETs | 105 | String/array/DS problems plus automation utilities, in Java and Python |
| Framework Design & CI/CD | 100 | TestNG/JUnit, BDD, reporting, Jenkins, GitHub Actions, Docker |
| Performance, Security & A11y | 100 | JMeter, k6, percentiles, OWASP Top 10, WCAG 2.2 |
| AI in Testing | 100 | Testing LLM/RAG/agent apps, evals, prompt injection, AI tools |
| Scenarios & Behavioural | 100 | "How would you test…", STAR stories, layoff and career questions |

Every question is tagged by difficulty (Easy, Medium, Hard). There are two cross-track tags:
- **Recent** (186 questions): topics that recur in 2025–26 interview guides and reports.
- **Deep dive** (72 questions): hard concepts such as HashMap internals, coordinated omission and LLM-judge calibration.

Each tag has its own page.

### Features

- **Readiness report card**: passed, to revise, pending, and your day streak, styled as a test run.
- **Mark passed / add to revision list** on every question, with filters per track.
- **Code editor**: CodeMirror 6 with Java and Python on every coding problem, a starter template and *Load solution*. There's also a multi-file **Scratchpad**. Code is saved in the browser. The editor is for writing and comparing solutions; it doesn't compile or run code.
- **Cheat sheets**: Selenium, Playwright, Rest Assured & HTTP, Karate, SQL, Git, TestNG & pytest.
- **Good reads**: hand-picked articles, docs and courses.
- **Search** (`/` or `Ctrl+K`), theme toggle (`T`), random pending question (`R`).
- Light and dark themes, works on phones.

## Use it

Open `index.html` in any modern browser. That's it: everything, including the editor, is inlined in the file.

To host it, serve the folder as static files, e.g. GitHub Pages, Netlify, or:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project layout

```
testready/
├── index.html              # the app: page, styles, script, inlined editor and all questions
├── build.py                # merges questions/*.md into index.html
├── questions/
│   ├── base.json           # the original hand-written questions (snapshot)
│   └── <track>.md          # one file per track: fun, sel, pw, api, ra, kar, java, code, fw, perf, ai, scn
├── editor/
│   ├── entry.js            # CodeMirror 6 setup with theme-aware highlighting
│   ├── package.json        # npm run build → bundles and inlines the editor
│   └── inline.py
└── tests/
    └── check_solutions.py  # compiles all Java solutions, runs all Python solutions
```

## Adding or editing questions

Questions live in `questions/<track>.md` in a small text format:

````
# group: Locators and waits
? Implicit vs explicit wait | E | recent
Answer in light markdown: paragraphs, `- ` bullets, `1. ` lists,
`inline code`, **bold**, | tables |, and fenced code blocks.

? Reverse a string | E
```java
public static String reverse(String s) { ... }
```
```python
def reverse(s): ...
```
> One-line note shown under the code.
````

- The line `? Title | E|M|H` starts a question. You can add `| recent` and/or `| concept` (deep dive) after the difficulty.
- `# group: Name` starts a section. Questions are merged into an existing group with the same name.
- A question with both a ```` ```java ```` and a ```` ```python ```` block becomes a coding problem with language tabs and the editor.

Then rebuild:

```bash
python3 build.py
```

The script prints the count per track. Titles are de-duplicated within a track. Rebuilding from unchanged files gives a byte-identical `index.html`.

After changing coding problems, verify them (needs `javac` 21+ and Python 3):

```bash
python3 tests/check_solutions.py
```

## Rebuilding the editor bundle

Only needed to upgrade CodeMirror or change editor behaviour:

```bash
cd editor
npm install
npm run build
```

`npm run build` bundles `entry.js` with esbuild and replaces the inlined bundle in `index.html`.

## About the content

The question topics were chosen by researching what popular interview-prep sites and recent interview write-ups say is being asked (Guru99, InterviewBit, TestDino, Hyring, SoftwareTestPilot, QASkills and others). Every answer is written originally for this project, not copied.

Tool versions and standards change quickly, so check version-specific details (e.g. Rest Assured, Karate, OWASP lists) against the official docs before relying on them in an interview.

## Inspiration

The idea comes from [LayoffReady](https://layoffready.in/): free, no-sign-up interview prep with progress saved on your device. TestReady applies the same idea to testing and automation roles.
