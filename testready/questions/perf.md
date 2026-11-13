# group: Performance
? What is performance testing and why is it needed? | E
Testing how a system behaves under expected and extreme load: response times, throughput, resource use and stability. It prevents slow pages, timeouts and outages during peaks (sales, results day, salary day) and gives data for capacity planning.

? Key performance metrics | E
Response time (p50/p90/p95/p99), throughput (requests or transactions per second), error rate, concurrent users, CPU, memory, disk and network utilisation, DB query times, connection pool usage, GC pauses, and Apdex score.

? Latency vs response time vs throughput | E
**Latency**: time for a request to reach the server and the first byte to come back (network + queueing). **Response time**: total time until the full response is received. **Throughput**: how many requests are completed per unit of time. A system can have good latency but low throughput if it can't handle concurrency.

? Volume vs scalability vs capacity testing | M
**Volume**: behaviour with large amounts of data (millions of rows). **Scalability**: how performance changes as you add load or resources (does doubling servers double throughput?). **Capacity**: the maximum load the system can handle while meeting SLAs.

? What is an SLA, SLO and SLI? | M
**SLI**: a measured indicator (p95 latency of checkout API). **SLO**: the internal target (p95 under 400 ms for 99.9% of 5-minute windows). **SLA**: the contractual promise to customers, usually looser, with penalties. Performance tests verify SLOs.

? How do you gather performance requirements? | M
From product and business (expected users, peak events, growth), production analytics and logs (traffic mix, peak RPS, popular journeys), existing SLOs, infrastructure limits and competitor benchmarks. Express them as numbers: "500 orders/minute with p95 < 2 s and errors < 0.1%".

? What is a workload model? | M
A description of the realistic traffic mix: which transactions, in what proportion (60% browse, 25% search, 10% add to cart, 5% checkout), arrival rate, think times, data variety and ramp pattern. A load test without a realistic workload model gives misleading results.

? Open vs closed workload models | H
**Closed**: a fixed number of virtual users loop through scenarios; new requests only start when previous ones finish, so a slow system automatically receives less load (hides problems). **Open**: requests arrive at a fixed rate regardless of response times, like real internet traffic. k6 `constant-arrival-rate` and Gatling `constantUsersPerSec` model open workloads.

? What is think time and pacing? | E
**Think time**: pause between user actions to mimic reading or typing. **Pacing**: the time between iterations of a script to hit a target rate. Without them you generate unrealistically aggressive load.

? What is correlation in load testing? | M
Capturing dynamic values from responses (session IDs, CSRF tokens, order IDs) and using them in later requests. In JMeter: JSON Extractor, Regular Expression Extractor, Boundary Extractor. Recorded scripts fail without correlation.

? What is parameterisation in load tests? | E
Feeding different data per virtual user (usernames, search terms, product IDs) from CSV or generators, so caches and DB queries behave realistically. Using one user for all threads gives false results.

? JMeter: Thread Group settings | E
Number of threads (users), ramp-up period (time to start all threads), loop count or duration, and startup delay. Plugins add Concurrency Thread Group and Arrivals Thread Group for better control.

? JMeter listeners and why not to use them during load runs | M
Listeners (View Results Tree, Summary Report, Aggregate Report) collect and display results but consume memory and CPU. In real runs use non-GUI mode, write results to a `.jtl` file and generate the HTML dashboard afterwards: `jmeter -n -t plan.jmx -l results.jtl -e -o report/`.

? JMeter timers | E
Constant Timer, Uniform/Gaussian Random Timer (think time), Constant Throughput Timer and Precise Throughput Timer (target throughput), Synchronizing Timer (release a batch of threads together to create spikes).

? JMeter assertions | E
Response Assertion (status, text), JSON Assertion (JSONPath), Duration Assertion (max time), Size Assertion, XPath Assertion. Keep assertions light under load; they still cost CPU.

? How do you run JMeter distributed? | M
One controller and several remote load generators running `jmeter-server`, connected by RMI, or run several independent instances in containers/Kubernetes and merge results. Cloud services (BlazeMeter, Azure Load Testing) handle this for you.

? How do you run JMeter in CI? | E
Run headless with the `jmeter-maven-plugin` or the CLI in a Docker image, pass properties (`-Jusers=50 -Jduration=300`), fail the build on thresholds (Taurus pass/fail criteria or a script reading the JTL), and publish the HTML report.

? k6 executors (scenarios) | M
`shared-iterations`, `per-vu-iterations`, `constant-vus`, `ramping-vus` (closed models) and `constant-arrival-rate`, `ramping-arrival-rate` (open models). Scenarios can run in parallel with different executors to mix traffic types.

? k6 checks vs thresholds | E
**Checks** are assertions that record pass rates but don't fail the test (`check(res, {'200': r => r.status === 200})`). **Thresholds** are pass/fail criteria on metrics (`http_req_duration: ['p(95)<500']`, `checks: ['rate>0.99']`); if breached, k6 exits non-zero so CI fails.

? Gatling: what is it and why use it? | M
A load testing tool with code-based scenarios (Scala, Java or Kotlin DSL, and JavaScript), efficient async engine (high load from few machines), and detailed HTML reports. Good fit for Java teams wanting performance tests in the same repo as functional tests.

? Locust basics | E
A Python load testing tool where user behaviour is written as Python classes (`HttpUser` with `@task` methods); supports distributed runs and a web UI. Good for Python teams and custom protocols.

? JMeter vs k6 vs Gatling vs Locust | M
| Tool | Scripting | Strength |
|---|---|---|
| JMeter | GUI + XML, Groovy | Mature, many protocols, big community |
| k6 | JavaScript | Developer friendly, CI thresholds, low resource use |
| Gatling | Scala/Java/Kotlin/JS | High throughput, great reports |
| Locust | Python | Simple, flexible, distributed |

? How do you find the bottleneck when response time increases? | M
Correlate load test timings with server metrics: CPU saturated (inefficient code), memory growing (leak), DB slow queries or lock waits, connection pool exhaustion, thread pool queues, external dependency latency, GC pauses, network bandwidth. APM tools (Dynatrace, New Relic, Datadog) and traces pinpoint the slow span.

? What is a memory leak and how would a soak test reveal it? | M
Memory that's allocated and never released. In a soak test (hours at normal load), heap usage climbs steadily after each GC, response times degrade and eventually the service crashes with OOM. Compare heap after full GCs over time to confirm.

? What is a baseline and a benchmark? | E
**Baseline**: the measured performance of the current version under a defined load, used to compare future builds. **Benchmark**: a standard reference you compare against (industry figure, competitor, or agreed target).

? How do you test front-end performance? | M
Measure Core Web Vitals (LCP, INP, CLS), Time to First Byte, bundle size and number of requests using Lighthouse, WebPageTest, Chrome DevTools Performance panel, or Playwright/CDP metrics in CI. Test on throttled CPU and network to match real mobile users.

? What are Core Web Vitals? | M | recent
Google's user-centred metrics: **LCP** (Largest Contentful Paint, good ≤ 2.5 s), **INP** (Interaction to Next Paint, good ≤ 200 ms; replaced FID in March 2024), **CLS** (Cumulative Layout Shift, good ≤ 0.1). They affect search ranking and real user experience.

? Load testing in production: when and how? | H
Only with agreement and controls: off-peak windows, gradual ramp, synthetic test accounts and data flagged for cleanup, dependencies (payment, SMS) mocked or in test mode, kill switch, and live monitoring by ops. Many teams use production-like staging plus shadow traffic instead.

? How do you test autoscaling? | H | recent
Ramp load gradually beyond one instance's capacity, verify new pods/instances start within the expected time, response times recover after scaling, load is balanced, and scale-down happens without errors when load drops. Also test the cold-start latency of new instances.

? How do you test caching behaviour under load? | M
Compare cold-cache and warm-cache runs, verify hit ratios in metrics, test cache stampede (many requests for an expired key at once), eviction under memory pressure, and data freshness after updates.

? How do you test database performance? | M
Analyse slow query logs and execution plans (`EXPLAIN`), test with production-sized data, check indexes for frequent filters, connection pool sizing, locking under concurrent writes, and long-running reports' impact on transactional queries.

? What is an Apdex score? | M
Application Performance Index: (satisfied + tolerating/2) / total, where satisfied means response ≤ T and tolerating ≤ 4T. It summarises user satisfaction in one number between 0 and 1.

? What do you include in a performance test report? | E
Objectives and workload model, environment and build, test types run, key results against SLOs (p95, throughput, errors) with graphs, resource utilisation, bottlenecks found with evidence, comparison with baseline, risks and recommendations.

? Why is the test environment important for performance results? | M
Results only predict production if the environment is comparable: same instance sizes or a known scaling factor, same configuration, realistic data volumes, similar network topology. Shared or undersized environments produce misleading numbers.

? Common performance testing mistakes | M
No realistic workload model, same user/data for every thread, no think time, running load generators on overloaded machines, measuring averages only, ignoring errors (fast 500s look good), testing a debug build, no monitoring on the server side, and declaring success without a baseline.

# group: Security
? What is security testing? | E
Testing to find vulnerabilities that could compromise confidentiality, integrity or availability: authentication and authorization flaws, injection, data exposure, misconfiguration, insecure dependencies. Includes automated scanning, manual testing and penetration testing.

? OWASP Top 10 (2021) web risks | M
1. Broken access control
2. Cryptographic failures
3. Injection (including XSS)
4. Insecure design
5. Security misconfiguration
6. Vulnerable and outdated components
7. Identification and authentication failures
8. Software and data integrity failures
9. Security logging and monitoring failures
10. Server-side request forgery (SSRF)

An updated 2025 edition has been released; know that it exists and that access control still tops the list.

? SAST vs DAST vs IAST vs SCA | M
- **SAST**: static analysis of source code (SonarQube, Semgrep, Checkmarx).
- **DAST**: testing the running app from outside (OWASP ZAP, Burp Suite).
- **IAST**: instrumentation inside the running app during tests (Contrast).
- **SCA**: scanning dependencies for known CVEs (Dependabot, Snyk, OWASP Dependency-Check).

? What is XSS and how do you test for it? | M
Cross-site scripting: user input is rendered as executable script in another user's browser. Types: stored, reflected, DOM-based. Test by entering payloads like `<script>alert(1)</script>` or `"><img src=x onerror=alert(1)>` in every input that's displayed later (comments, names, search) and checking it's escaped. Content Security Policy is a second layer of defence.

? What is CSRF and how is it prevented? | M
Cross-site request forgery tricks a logged-in user's browser into sending an unwanted request to your site (e.g. change email). Prevention: anti-CSRF tokens, `SameSite` cookies, checking `Origin`/`Referer`, requiring re-authentication for sensitive actions. Test that state-changing requests without a valid token fail.

? What is SSRF? | H
Server-side request forgery: the server fetches a URL supplied by the user, and an attacker points it at internal services (`http://169.254.169.254/` cloud metadata, `http://localhost:8080/admin`). Test URL inputs (webhooks, image imports, PDF generators) with internal addresses and expect them to be blocked.

? What security checks do you do on login? | E
Account lockout or rate limiting after failed attempts, generic error messages, password policy, password not returned or logged, HTTPS only, session ID regenerated after login, session expires on logout and after inactivity, MFA works, "remember me" token is secure, and password reset links expire and are single-use.

? Session management tests | M
Session cookie has `HttpOnly`, `Secure` and `SameSite` flags; session ID changes after login (no session fixation); logout invalidates the session server-side; idle and absolute timeouts work; concurrent session rules are enforced; session tokens aren't in URLs.

? Security headers to check | M
`Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` or CSP `frame-ancestors` (clickjacking), `Referrer-Policy`, `Permissions-Policy`. Missing headers are easy findings in a ZAP baseline scan.

? How do you use OWASP ZAP in CI? | M
Run the ZAP baseline scan Docker image against a test environment (`zap-baseline.py -t https://qa.example.com -r report.html`), which passively scans for common issues; use the full scan or API scan (with an OpenAPI spec) for deeper testing. Fail the build on high-risk alerts and track false positives in a config file.

? What is Burp Suite used for? | E
An intercepting proxy for manual security testing: capture and modify requests (Proxy, Repeater), automate payload attacks (Intruder), and scan for vulnerabilities (Pro). Testers use it to try IDOR, tamper with prices and test authorization.

? Testing for broken access control in the UI | M
Log in as a low-privilege user and try admin URLs directly, hidden buttons enabled via devtools, other users' resource IDs, and API calls the UI doesn't expose. Authorization must be enforced on the server, not by hiding UI elements.

? What is penetration testing and how is it different from vulnerability scanning? | E
Scanning is automated detection of known issues. Penetration testing is a manual, goal-driven attempt by skilled testers to exploit vulnerabilities and chain them, showing real impact. Pen tests are usually done periodically by specialists; scans run continuously.

? How do you test file upload security? | M
Upload files with double extensions (`shell.php.jpg`), wrong MIME types, oversized files, SVG with embedded script, zip bombs, path traversal names (`../../a.txt`); check files are validated by content, renamed, stored outside the web root, scanned for malware and served with safe content types.

? What is dependency (supply chain) security and how do testers help? | M | recent
Most code is third-party libraries, and vulnerabilities in them (Log4Shell) or malicious packages affect you. Run SCA tools in CI, keep an SBOM (software bill of materials), pin and verify versions, and update dependencies regularly with the test suite as the safety net.

? Secrets scanning | E | recent
Detect committed API keys and passwords with tools like GitHub secret scanning, gitleaks or TruffleHog in pre-commit hooks and CI. If a secret leaks, rotate it immediately; deleting the commit isn't enough.

? OWASP Top 10 for LLM applications | H | recent
Key risks: prompt injection, sensitive information disclosure, supply chain issues, data and model poisoning, improper output handling, excessive agency (agents taking unsafe actions), system prompt leakage, vector/embedding weaknesses, misinformation, and unbounded consumption (cost/DoS). QA teams test these when products add AI features.

# group: Accessibility
? What is accessibility and why does it matter? | E
Designing and building so people with disabilities (visual, hearing, motor, cognitive) can use the product. It's a legal requirement in many places (ADA in the US, the European Accessibility Act from June 2025, India's RPwD Act and GIGW for government sites) and improves usability for everyone.

? WCAG principles: POUR | E
**Perceivable** (text alternatives, captions, contrast), **Operable** (keyboard access, enough time, no seizures), **Understandable** (readable, predictable, input help), **Robust** (works with assistive technologies). WCAG 2.2 has three levels: A, AA (the usual target) and AAA.

? Keyboard accessibility checks | E
Every interactive element is reachable with Tab in a logical order, has a visible focus indicator, can be activated with Enter/Space, menus and dialogs work with arrow keys and Escape, no keyboard traps, and a "skip to content" link exists.

? Screen reader testing | M
Use NVDA or JAWS on Windows, VoiceOver on macOS/iOS, TalkBack on Android. Check headings structure, landmark regions, form labels, button names, image alt text, live announcements for errors and toasts, and reading order. Automated tools can't judge whether announcements make sense.

? Colour contrast requirements | E
WCAG AA: 4.5:1 for normal text, 3:1 for large text (18pt or 14pt bold) and for UI components and graphics. Don't use colour alone to convey meaning (error fields need text or icons too).

? What is ARIA and when should it be used? | M
Accessible Rich Internet Applications attributes (`role`, `aria-label`, `aria-expanded`, `aria-live`) describe custom widgets to assistive tech. First rule of ARIA: use native HTML elements (button, label, select) when possible; wrong ARIA is worse than none.

? Which accessibility tools do you use? | E
axe DevTools and axe-core (in Selenium/Playwright/Cypress), Lighthouse, WAVE, Accessibility Insights, colour contrast analysers, browser zoom and screen readers. Automated tools catch roughly 30–50% of issues; manual testing covers the rest.

? Accessibility tests for forms | E
Every input has a programmatic label, required fields are indicated in text not only colour, errors are announced and linked to fields (`aria-describedby`), focus moves to the first error, autocomplete attributes for personal data, and the form works at 200% zoom.

? How do you test accessibility of dynamic content and modals? | M
When a modal opens, focus moves into it and is trapped there; Escape closes it; focus returns to the trigger. Dynamic updates (cart count, toasts, validation) use `aria-live` regions so screen readers announce them.

? What is new in WCAG 2.2? | M | recent
Nine new success criteria, including focus not obscured (sticky headers mustn't hide focused elements), target size minimum (24×24 CSS px), dragging movements need a single-pointer alternative, consistent help, redundant entry (don't ask for the same info twice), and accessible authentication (no cognitive tests like puzzles without alternatives). 4.1.1 Parsing was removed.

# group: Recent interview topics
? How do you shift performance testing left? | M | recent
Run small performance checks in CI on every merge: API response time budgets, k6 smoke tests with thresholds, Lighthouse CI budgets for pages, and benchmark tests for critical code (JMH). Save big load tests for pre-release, but catch regressions early with trends.

? How do you test the performance of an LLM-based feature? | H | recent
Measure time to first token, tokens per second, total latency at p95, concurrency limits and rate limiting from the provider, cost per request, and behaviour on timeouts (fallback messages, retries). Load test with realistic prompt lengths because latency scales with input and output tokens.

? What is synthetic monitoring? | M | recent
Scripted checks (often Playwright or API calls) running every few minutes from multiple locations against production, alerting when key journeys fail or slow down. It turns E2E tests into production monitors (Checkly, Datadog Synthetics, Grafana Synthetic Monitoring).

# group: Hard concepts
? Why averages lie: percentiles and the long tail | H | concept
If 99 requests take 100 ms and one takes 10 s, the average is ~200 ms, which looks fine, but 1% of users wait 10 s. With 20 API calls per page, the chance a page hits at least one p99-slow call is 1 − 0.99²⁰ ≈ 18%. That's why SLOs use p95/p99, and why you also watch maximums and error rates.

? Little's Law and sizing a load test | H | concept
L = λ × W: average users in the system = arrival rate × average time each spends. To generate 50 requests/second where each user iteration takes 10 s (including think time) you need about 500 concurrent virtual users. It also helps sanity-check results: if throughput stops rising while users increase, response time must be rising.

? Coordinated omission | H | concept
When a load tool waits for a slow response before sending the next request (closed model), it stops measuring during stalls, so the slow periods are under-represented and percentiles look better than reality. Use open models with constant arrival rates (k6 arrival-rate executors, Gatling open injection), or tools that correct for it (HdrHistogram).

? The knee of the curve: finding maximum capacity | H | concept
As load increases, response time stays flat until resources saturate, then rises sharply (the "knee") as queues form. Run a stepped load test, plot throughput and p95 against users; capacity is the point just before the knee where SLOs still hold. Beyond it, throughput plateaus or drops and errors appear.

? Threat modelling for testers (STRIDE) | H | concept
Identify threats per component and data flow: **S**poofing (identity), **T**ampering (data), **R**epudiation (deny actions; need audit logs), **I**nformation disclosure, **D**enial of service, **E**levation of privilege. Turning each threat into test cases focuses security testing on what matters for the design.

? Defence in depth for XSS: why escaping, CSP and HttpOnly all matter | H | concept
Output encoding prevents script injection at the source; Content Security Policy blocks inline and unknown scripts if encoding is missed; `HttpOnly` cookies stop stolen scripts from reading session tokens; input validation reduces attack surface. Testers verify each layer separately, since any single one can fail.

# group: More performance, security and accessibility
? Endurance vs soak testing: are they the same? | E
Yes, the terms are used interchangeably: sustained normal load over a long period (hours to days) to find leaks, resource exhaustion, log/disk growth and degradation over time.

? Breakpoint testing | M
Continuously increasing load until the system fails, to find the absolute limit and how it fails (errors, timeouts, crashes) and whether it recovers when load drops. Run it in isolated environments only.

? What is concurrency vs simultaneous users? | M
Concurrent users are logged in and active during a period; simultaneous users hit the same action at the same instant. A site with 10,000 concurrent users may only see 100 simultaneous requests per second. Confusing the two leads to wrong load targets.

? How do you calculate the number of virtual users needed? | M
From Little's Law: users = target throughput × (response time + think time). Example: 20 checkouts/sec, each journey 30 s including think time → about 600 VUs. Verify the generators can sustain it.

? What is a ramp-up and why does it matter? | E
The period over which virtual users start. A gradual ramp lets you see at what load problems start and avoids an artificial thundering herd at time zero (unless you're specifically testing a spike).

? Server-side metrics to monitor during a test | E
CPU, memory, GC activity, thread counts, connection pools (DB, HTTP), queue depths, disk I/O, network, error logs, DB slow queries and locks, cache hit rate, and container restarts. Without them you only know that something is slow, not why.

? What is an APM tool? | E
Application Performance Monitoring tools (Dynatrace, New Relic, Datadog, AppDynamics, Elastic APM, Grafana with OpenTelemetry) trace requests through services, showing slow methods, DB calls and external dependencies. Essential for diagnosing load test results.

? Client-side vs server-side performance | E
Server-side: how quickly the backend responds under load (load tests). Client-side: how quickly the browser renders and becomes usable (Lighthouse, Web Vitals). A fast API can still give a slow page because of large JavaScript bundles or render-blocking resources.

? How do you load test a WebSocket or streaming API? | H
Use tools with WebSocket support (k6 `k6/websockets`, Gatling WebSocket, JMeter plugins), model connection count separately from message rate, measure connect time, message latency and dropped connections, and test reconnection storms after a server restart.

? How do you load test an API protected by OAuth? | M
Fetch tokens in a setup phase (k6 `setup()`, JMeter setUp Thread Group) and reuse them, refresh before expiry, and spread load across many test users to avoid per-user rate limits. Don't load test the identity provider by accident unless that's the goal.

? What is rate limiting from a performance perspective? | M
Protection that rejects excess requests (429) to keep the service stable. Performance tests should verify the limits are applied correctly, that rejected requests are cheap, and that legitimate traffic still meets SLOs during a burst.

? What is denial of service testing? | H
Checking the system degrades gracefully under abusive load: rate limiting, request size limits, timeouts, query complexity limits (GraphQL), and autoscaling caps. Only in controlled environments with permission; never against third-party systems.

? Input validation vs output encoding | M
Input validation rejects data that doesn't fit expectations (type, length, format). Output encoding makes data safe for the context where it's displayed (HTML, JavaScript, URL, SQL via parameters). Both are needed: validation can't anticipate every context.

? Password storage: what should testers verify? | M
Passwords must be hashed with a slow algorithm (bcrypt, scrypt, Argon2) and salted, never encrypted or stored plain. Testers verify passwords aren't returned by any API, don't appear in logs, and that reset flows don't reveal them.

? Testing for sensitive data exposure | M
Check API responses, logs, error pages, URLs, browser storage, analytics calls and exported files for personal data, tokens or internal details. Verify encryption in transit (TLS) and that masked data stays masked (card numbers show last four digits).

? What is clickjacking and how do you test for it? | E
An attacker embeds your page in an invisible iframe to trick clicks. Test by loading the page in an iframe on another origin; it should be blocked by `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`.

? Path traversal testing | M
Send inputs like `../../etc/passwd` or URL-encoded `%2e%2e%2f` in file name parameters (downloads, templates, uploads) and verify the server rejects or normalises them and never serves files outside the allowed directory.

? Business logic security testing | H
Abuse flows the scanner can't understand: apply a coupon twice, change the price or quantity in the request, skip a payment step, race two refunds, use negative quantities, replay one-time tokens. These need tester creativity and domain knowledge.

? Accessibility of images and media | E
Informative images need meaningful `alt` text; decorative images use `alt=""`; complex charts need a text summary; videos need captions and transcripts; audio needs transcripts; no auto-playing media with sound.

? Accessibility of zoom and reflow | E
Content must be usable at 200% zoom and reflow at 320 CSS px width without horizontal scrolling (WCAG 1.4.10), and text spacing adjustments mustn't break layout.

? Mobile accessibility checks | M
Touch targets large enough (24×24 CSS px minimum in WCAG 2.2, 44×44 recommended), works with VoiceOver/TalkBack, supports system font scaling, no reliance on gestures without alternatives, and orientation isn't locked unnecessarily.

? How do you add accessibility to the definition of done? | M | recent
Automated axe checks in component and E2E tests with zero critical violations, keyboard and screen reader smoke checks for new UI, design review for contrast and focus states, and accessible names for all interactive elements. Track violations as defects with severity.

? Which performance test would you run before a big sale? | M
A load test at forecast peak (with margin, e.g. 1.5×), a spike test simulating the sale start, a soak test over the expected duration, and a failover test of key dependencies. Verify autoscaling, caching, payment gateway limits and queue backlogs, with dashboards ready for the live event.
