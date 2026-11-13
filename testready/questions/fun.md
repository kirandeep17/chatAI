# group: Core concepts
? What is software testing and why is it needed? | E
Testing is the process of evaluating software to find defects and to give stakeholders information about quality and risk. It is needed because defects cost more the later they are found, failures in production hurt users, revenue and reputation, and many domains (banking, health) need evidence of quality for compliance.

? Error vs defect vs failure | E
- **Error (mistake)**: a human action that produces a wrong result, e.g. a developer misreads a requirement.
- **Defect (bug, fault)**: the flaw in the code or document that results.
- **Failure**: the observable wrong behaviour when the defect is executed.

Not every defect causes a failure: the code path may never run.

? Seven principles of testing | E
1. Testing shows the presence of defects, not their absence.
2. Exhaustive testing is impossible, so prioritise by risk.
3. Early testing saves time and money.
4. Defects cluster: a few modules hold most defects.
5. Pesticide paradox: the same tests stop finding new bugs, so refresh them.
6. Testing is context dependent.
7. Absence-of-errors fallacy: bug-free software that doesn't meet user needs still fails.

? QA vs QC vs testing | E
**Quality assurance** is process-oriented and preventive: standards, reviews, process improvement. **Quality control** is product-oriented and detective: inspecting the output. **Testing** is one QC activity: executing the software to find defects. QA prevents, QC detects.

? SDLC models and where testing fits | E
- **Waterfall**: sequential; testing after development. Late feedback.
- **V-model**: each development phase has a matching test level (requirements ↔ acceptance, design ↔ system/integration, code ↔ unit). Test design starts early.
- **Agile/Scrum**: testing happens inside every sprint; testers work with devs and PO on acceptance criteria.
- **DevOps**: continuous testing in the pipeline plus monitoring in production.

? Levels of testing | E
- **Unit**: smallest testable part, by developers.
- **Integration**: interfaces between modules or services.
- **System**: the complete integrated system against requirements.
- **Acceptance (UAT)**: business users confirm it meets their needs; includes alpha and beta testing.

? Functional vs non-functional testing | E
Functional testing checks **what** the system does against requirements (login, checkout). Non-functional testing checks **how well** it does it: performance, security, usability, reliability, compatibility, accessibility, scalability.

? Black box vs white box vs grey box testing | E
- **Black box**: based on requirements, no knowledge of code (BVA, EP, decision tables).
- **White box**: based on code structure (statement, branch, path coverage).
- **Grey box**: partial internal knowledge, e.g. you know the DB schema or API contract while testing through the UI.

? Static vs dynamic testing | E
Static testing examines work products without executing code: reviews, walkthroughs, inspections, static analysis (SonarQube, linters). Dynamic testing executes the software. Static testing finds defects earlier and cheaper, such as ambiguous requirements and dead code.

? Positive vs negative testing | E
Positive testing uses valid input and checks the system does what it should. Negative testing uses invalid or unexpected input (empty fields, special characters, very long strings, wrong types) and checks the system fails gracefully with a clear message and no crash or data corruption.

? Alpha vs beta testing | E
**Alpha**: done by internal staff or testers at the developer's site before release. **Beta**: done by a limited set of real users in their own environment, giving real-world feedback before general availability.

? What is regression testing and how do you select regression tests? | E
Re-running tests to confirm a change didn't break existing behaviour. Selection approaches: **retest all** (expensive), **risk-based selection** (critical flows plus areas touched by the change), **prioritised** (by business value and defect history). Automate the stable core regression pack and run it on every build.

? What is a test case? What fields does it have? | E
A set of conditions and steps to verify one behaviour. Typical fields: ID, title, module, preconditions, test data, steps, expected result, actual result, status, priority, linked requirement, author. Good test cases are atomic, independent, repeatable and traceable.

? Test scenario vs test case vs test script | E
- **Scenario**: a high-level "what to test", e.g. "Verify checkout with a saved card".
- **Test case**: detailed steps, data and expected result for one path of that scenario.
- **Test script**: the automated code (or very detailed manual steps) that executes a test case.

? What is a Requirement Traceability Matrix (RTM)? | E
A table mapping each requirement to its test cases (and often to defects). **Forward** traceability: requirement → tests, proves coverage. **Backward**: test → requirement, proves no orphan tests. **Bidirectional** does both. It shows impact when a requirement changes.

? Entry and exit criteria | E
**Entry criteria**: conditions to start a test phase, e.g. build deployed, smoke passed, test data ready, test cases reviewed. **Exit criteria**: conditions to stop, e.g. all planned tests executed, no open critical/high defects, coverage target met, sign-off received.

? What is a test bed / test environment? | E
The hardware, software, network, configuration and data needed to run tests. It should mirror production as closely as practical (versions, configuration, integrations) and be stable and isolated so results are reliable.

? What is a test harness? | M
The collection of drivers, stubs, test data, runners and reporting that lets tests execute automatically in a controlled way. For example, TestNG plus a driver factory, mock server and Allure reporting form a harness.

? Stubs vs drivers | M
Used in incremental integration testing. A **stub** replaces a lower-level module that is called but not ready (top-down approach). A **driver** replaces a higher-level module that calls the module under test (bottom-up approach).

? Integration approaches: big bang, top-down, bottom-up, sandwich | M
- **Big bang**: integrate everything at once; hard to locate defects.
- **Top-down**: start with top modules, stub lower ones; early view of flows.
- **Bottom-up**: start from low-level modules with drivers; good for utility layers.
- **Sandwich/hybrid**: both directions meet in the middle.

? What is a build vs release? | E
A **build** is a compiled, deployable version of the software produced from source, often several a day. A **release** is a build that has passed testing and is delivered to customers, with version number, release notes and known issues.

? What is a test summary report? | E
A closure document summarising the testing performed: scope, environment, tests planned/executed/passed/failed/blocked, defect statistics by severity, open risks, deviations from plan, and a go/no-go recommendation.

? What is risk-based testing? | M | recent
Prioritising testing effort by risk = likelihood of failure × business impact. Identify risky areas (payments, new code, complex logic, past defects), test them first and deepest, and report coverage against risks. Interviewers in 2026 often expect you to start scenario answers with risks rather than a list of test cases.

? What is a defect leakage and defect removal efficiency? | M
**Defect leakage** = defects found after a phase (e.g. in UAT or production) ÷ total defects × 100. **DRE** = defects found before release ÷ (before + after release) × 100. High DRE and low leakage mean testing is effective.

? Which QA metrics do you track? | M
Test execution progress, pass rate, defect density (defects per KLOC or per module), defect leakage, defect ageing, reopen rate, requirement coverage, automation coverage, flaky-test rate, mean time to detect. Pair metrics with context; never use them to blame individuals.

? What is a test oracle? | M
The source used to decide whether an output is correct: requirements, a previous version, a reference implementation, a calculation, a domain expert, or consistency rules. The oracle problem is when no reliable expected result exists, common in ML and LLM systems.

? Monkey testing vs gorilla testing vs ad hoc testing | E
- **Monkey**: random inputs without knowledge of the system, to find crashes.
- **Gorilla**: hammering one module repeatedly and thoroughly.
- **Ad hoc**: informal, unplanned testing based on intuition, without documentation.

? What is usability testing? | E
Evaluating how easily real users can achieve their goals: learnability, efficiency, error recovery, satisfaction. Methods include moderated sessions with think-aloud, task success rate and time on task, heuristic evaluation, A/B tests.

? Compatibility testing | E
Checking the application on different browsers, browser versions, OSes, devices, screen sizes and network conditions. Use analytics to pick the matrix, and cloud grids (BrowserStack, Sauce Labs, LambdaTest) to execute.

? Localization vs internationalization testing | M
**i18n** checks the product can support multiple locales: Unicode, date/number/currency formats, text expansion, RTL layout, no hard-coded strings. **l10n** checks a specific locale: translations, cultural correctness, local formats such as ₹1,00,000 in India.

? What is end-to-end testing? | E
Testing a complete user journey across all layers and integrated systems, e.g. search → add to cart → pay → order confirmation email. It gives high confidence but is slow and brittle, so keep a small number of critical journeys.

? Confirmation testing vs regression testing in a defect fix | E
After a fix, **confirmation testing** (retesting) runs the failed test to prove the defect is fixed. **Regression testing** then checks the fix didn't break anything nearby. Both are needed.

? What is a hotfix and how do you test it? | M
An urgent fix deployed to production outside the normal release cycle. Test the specific fix, a focused regression of the affected area and critical-path smoke tests, then verify in production with monitoring. Make sure the fix is merged back to main so it doesn't regress in the next release.

# group: Test design techniques
? Error guessing | E
Using experience to anticipate where defects are likely: empty input, nulls, zero, negative numbers, leap years, time zones, double submits, special characters, very long strings, concurrent edits. Often formalised as a checklist of common failure types.

? Pairwise (all-pairs) testing | M
When many parameters each have several values, test every **pair** of values at least once instead of all combinations. Example: 4 browsers × 3 OS × 3 languages = 36 combos, but pairwise needs about 12. Tools: PICT, AllPairs. Most defects are caused by single values or pairs.

? Cause-effect graphing | M
Model causes (inputs) and effects (outputs) as a boolean graph, then convert to a decision table to derive tests. Useful when combinations of conditions drive outcomes and you want to prove coverage of the logic.

? Use case testing | E
Derive tests from use cases: main success scenario, alternate flows and exception flows. Example ATM withdrawal: success, insufficient funds, wrong PIN, card retained, network timeout.

? Statement, branch and path coverage | M
- **Statement**: every statement executed at least once.
- **Branch/decision**: every true and false outcome of each decision.
- **Path**: every possible route through the code (grows exponentially).

100% branch coverage implies 100% statement coverage, not the reverse. Tools: JaCoCo, Istanbul.

? What is MC/DC coverage? | H | concept
Modified condition/decision coverage requires that each condition in a decision is shown to **independently** affect the outcome. For `if (a && b)`, the tests TT, TF, FT are enough: TT vs FT shows `a` matters, TT vs TF shows `b` matters. It is required for safety-critical software (avionics DO-178C) and gives strong coverage with about n+1 tests for n conditions instead of 2ⁿ.

? Mutation testing | H | concept
Measure the quality of your tests by injecting small faults (mutants) into code, e.g. changing `>` to `>=`, and running the suite. If tests fail, the mutant is **killed**; if they pass, it **survived**, revealing a weak assertion. Mutation score = killed ÷ total. Tools: PIT (Java), Stryker (JS). It catches tests that execute code but assert nothing useful, which code coverage cannot.

? Property-based testing | H | concept
Instead of specific examples, state a property that should hold for all inputs and let the framework generate hundreds of random inputs, shrinking any failure to the smallest example. Example: `reverse(reverse(list)) == list`, or "sorting output is ordered and a permutation of the input". Tools: jqwik (Java), Hypothesis (Python), fast-check (JS). It finds edge cases humans don't think of.

? Classification tree method | M
Split the input domain into classifications (e.g. payment method, user type, amount range) and classes within each, draw them as a tree, then pick combinations as test cases. It visualises coverage and pairs well with pairwise selection.

? How do you write test cases when there are no requirements? | M | recent
Use other oracles: talk to the PO and devs, study similar products, existing behaviour, user stories, API contracts, support tickets and analytics. Do exploratory sessions to learn the system, write down your assumptions and get them confirmed. Document what you learn as lightweight test charters and checklists.

? How many test cases can you write for a pen? | E
Structure it: **functional** (writes, ink colour, cap fits, click mechanism, ink flow on different papers), **non-functional** (grip comfort, weight, writes at angles and temperatures), **durability** (drop test, number of clicks, ink lasts N metres), **safety** (non-toxic ink, cap has air hole), **negative** (writing on wet paper, upside down). Interviewers grade the categories more than the count.

# group: Defects
? What makes a good bug report? | E
A clear, specific title; environment and build; preconditions; numbered steps to reproduce; expected vs actual result; evidence (screenshot, video, logs, HAR file, request/response); severity and priority; frequency (always, intermittent); and any workaround. One bug per report.

? A bug is not reproducible. What do you do? | M
Collect more data: exact build, browser, user account, data, time, logs, network conditions. Check for race conditions, caching, feature flags, timezone and data-dependent paths. Try to reproduce on the reporter's environment, pair with the developer, add logging. If still not reproducible, record everything and keep it open for monitoring rather than closing it silently.

? Defect triage: what happens in a triage meeting? | E
QA, dev leads and the PO review new defects, confirm validity, remove duplicates, set severity and priority, assign owners and target releases. Deferred bugs get a documented reason. The aim is shared understanding of risk, not counting bugs.

? What is defect clustering? | E
Most defects are found in a small number of modules (Pareto principle: ~80% of defects in ~20% of modules). Use defect history to focus testing and to suggest refactoring of unstable modules.

? What is defect masking? | M
One defect hides another: e.g. a crash on page load prevents you seeing a calculation error further in the flow. After fixing the first, retest the path thoroughly because new defects may appear.

? What is the root cause analysis of a defect? | M
Find why the defect was introduced and why it escaped. Techniques: 5 Whys, fishbone diagram. Categories: requirement gap, design issue, coding error, missing test, environment difference, data issue. The output is a preventive action, e.g. add a contract test or a review checklist item.

? Bug vs enhancement | E
A bug is behaviour that differs from agreed requirements or reasonable expectations. An enhancement is a request for new or changed behaviour that was never specified. Log enhancements separately so they don't inflate defect metrics.

? What is a latent defect? | M
A defect that exists in the released software but hasn't caused a failure yet because the triggering conditions haven't occurred, e.g. a leap-year bug or a failure only above 10,000 records.

? What is a showstopper / blocker defect? | E
A defect that prevents testing or use of a major feature with no workaround, e.g. login broken or the app crashes on start. It blocks the release and must be fixed immediately.

# group: Agile and process
? Role of a tester in Scrum | E
Clarify acceptance criteria in refinement, estimate test effort, test stories during the sprint, automate regression, take part in three amigos sessions, pair with devs, demo quality status in reviews and suggest improvements in retros. There is no separate test phase; quality is a team responsibility.

? What are the three amigos? | E
A short session between business (PO/BA), development and testing to discuss a user story before development, so all three perspectives agree on the behaviour and examples. Output is clear acceptance criteria, often in Given/When/Then form.

? Definition of Ready vs Definition of Done | E
**DoR**: conditions for a story to enter a sprint (clear acceptance criteria, estimated, dependencies known, testable). **DoD**: conditions for a story to be complete (code reviewed, unit and acceptance tests passing, automated regression updated, no open critical bugs, deployed to test environment).

? How do you test in a two-week sprint with no separate test phase? | M
Start with acceptance criteria and test ideas during refinement; test incrementally as each piece is ready (API first, then UI); automate in parallel with development; use feature toggles; run the regression suite in CI daily; and push for small stories so testing isn't squeezed into the last two days.

? What is BDD and how is it different from TDD? | M
**TDD**: developer writes a failing unit test, writes code to pass it, refactors. Focus on design at code level. **BDD**: team agrees on behaviour through examples in business language (Given/When/Then) before building; the examples can become automated acceptance tests. TDD is about building it right; BDD is about building the right thing.

? What is ATDD? | M
Acceptance test-driven development: the team writes acceptance tests from the customer's perspective before development, and development is complete when those tests pass. BDD is a style of ATDD with a specific vocabulary.

? How do you estimate testing effort? | M
Techniques: work breakdown structure, three-point estimate ((O + 4M + P) / 6), test point analysis, historical data, and in Agile, story points with the whole team. Add buffers for environment issues, retesting and regression. Re-estimate as scope becomes clearer.

? What is continuous testing? | M | recent
Running automated tests at every stage of the delivery pipeline to get fast feedback on business risk: unit and static checks on commit, API and contract tests on PR, regression and non-functional tests on merge, synthetic monitoring in production. It turns testing from a phase into a continuous activity.

? What is shift-right testing? | M | recent
Testing and learning in production: feature flags, canary and blue-green releases, A/B tests, synthetic monitoring, real-user monitoring, chaos engineering, and analysing production logs and errors. It complements shift-left because some issues only appear with real traffic and data.

? What is a test strategy for a microservices system? | H
Unit tests per service, component tests with dependencies mocked, **contract tests** between consumers and providers, a small number of integration tests per service boundary, very few E2E journeys, plus resilience tests (timeouts, retries, circuit breakers), observability checks and production monitoring. Each service owns its tests and pipeline.

? How do you test when a third-party dependency is unavailable? | M
Use service virtualisation or mocks (WireMock, MockServer, Mountebank), vendor sandboxes, recorded responses, and contract tests against their published schema. Also test your own handling of their failures: timeouts, 5xx, malformed responses.

# group: Recent interview topics
? How has the tester's role changed in 2025–26? | M | recent
Less manual script execution and more: quality engineering across the pipeline, API and contract testing, writing automation in code, observability and production quality signals, testing AI-powered features, and using AI assistants to speed up test design while reviewing their output critically. Domain knowledge and risk thinking matter more than tool lists.

? What is observability and why should testers care? | M | recent
The ability to understand a system's internal state from its outputs: logs, metrics and traces. Testers use it to diagnose failures quickly (trace a failed request across services), to verify non-functional behaviour (latency, error rates) and to build production checks. Know the basics of tools like Grafana, Kibana and OpenTelemetry.

? What is chaos engineering? | H | recent
Deliberately injecting failures (kill pods, add latency, drop a dependency) in a controlled way to confirm the system degrades gracefully and recovers. Start with a steady-state hypothesis, limit the blast radius, observe, and fix weaknesses. Tools: Chaos Monkey, Gremlin, LitmusChaos, AWS FIS.

? What are feature flags and how do they affect testing? | M | recent
Flags let you turn features on or off without deploying. You must test both states, combinations of interacting flags, the default when the flag service is down, and clean-up of old flags. They enable testing in production with a small audience.

? How do you test a data pipeline or ETL job? | H | recent
Validate at each stage: source-to-target row counts, schema and type checks, null and duplicate checks, transformation rules on sample records, referential integrity, late and out-of-order data, idempotency of reruns, and performance on production-sized data. Tools: SQL queries, Great Expectations, dbt tests.

? What is accessibility testing and which standard applies? | M | recent
Ensuring people with disabilities can use the product. The standard is **WCAG 2.2** (levels A, AA, AAA; most laws require AA). Check keyboard access, focus visibility, screen reader labels, colour contrast, captions, resizable text and form errors. The European Accessibility Act made this a hard requirement for many products from June 2025.

? What is privacy/GDPR testing? | M
Verify consent capture, data minimisation, right to access and delete, masking of personal data in logs and test environments, data retention, and encryption in transit and at rest. India's DPDP Act brings similar expectations.

? Testing in production: is it safe? | M
It can be if controlled: feature flags, canary releases to a small percentage, synthetic users and test accounts clearly marked, read-only checks where possible, and strong monitoring with fast rollback. Never use real customer data or trigger real payments.

# group: Hard concepts
? Why can't exhaustive testing be done? Prove it with numbers | M | concept
A single 10-character password field with 95 printable characters has 95¹⁰ ≈ 6 × 10¹⁹ possible inputs. At one million tests per second it would take about 1.9 million years, and that's one field. Combine fields, states, timing and environments and the space explodes. That is why we use equivalence partitions, boundaries, pairwise and risk to choose a small set of tests with high defect-finding power.

? The pesticide paradox in practice | M | concept
Re-running the same regression tests catches regressions but finds fewer **new** defects over time, because the code has been fixed to pass them. Counter it by adding tests from production incidents, rotating exploratory charters, using mutation testing to find weak spots, varying test data (randomised or property-based), and reviewing tests when features change.

? Test pyramid vs test trophy vs honeycomb | H | concept
- **Pyramid** (Cohn): many unit, some service, few UI tests.
- **Trophy** (Kent C. Dodds): static analysis base, few unit, **most integration**, few E2E. Popular for front-end apps.
- **Honeycomb** (Spotify): for microservices, mostly integration tests per service, few implementation-detail and few integrated tests.

The common idea: test at the cheapest layer that gives real confidence. Choose based on architecture rather than dogma.

? What is the oracle problem and how do you handle it? | H | concept
Sometimes you can't easily know the correct output: ML predictions, complex simulations, LLM text, large reports. Strategies: **metamorphic testing** (if input changes in a known way, output should change predictably, e.g. adding an irrelevant record shouldn't change a search ranking), differential testing against another implementation or version, property checks, statistical acceptance thresholds and human review of samples.

? Metamorphic testing | H | concept
Test relations between multiple executions instead of exact outputs. Examples: searching "laptop" then "laptop under 50000" should return a subset; translating to French and back should keep meaning; rotating an image shouldn't change the detected object class. It is widely used for ML, search and scientific software where expected outputs are unknown.

? How do you prioritise when you have 500 test cases and one day? | M | concept
Rank by risk: business-critical flows (payments, login, data integrity), areas changed in this release, areas with defect history, high-usage features from analytics, and integrations. Run automated smoke and regression first, then manual tests for changed features, then exploratory sessions on risky areas. Communicate what was not tested and the residual risk.

? Testing concurrency and race conditions | H | concept
Race conditions appear when two operations interleave, e.g. two users booking the last seat, or double-clicking Pay. Techniques: send parallel requests with the same data (JMeter, k6, a thread pool in code), test idempotency keys, check DB constraints and locking, use delays or breakpoints to force interleavings, and verify final state consistency (one booking, one charge).

? Testing time-dependent behaviour | H | concept
Bugs hide around time: daylight saving changes, leap years (29 Feb), month ends, time zones (IST vs UTC storage), expiry and scheduling, certificate expiry. Make time controllable: inject a clock (Java `Clock`), use test hooks to set server time, or freeze time in tests (Playwright `page.clock`, `freezegun` in Python). Never rely on the real current time in assertions.

? Test data management at scale | H | concept
Problems: shared data causing collisions, stale data, production data privacy, slow setup. Solutions: create data per test via API, use synthetic data generators (Faker), masked subsets of production for realistic volume, database snapshots or containers (Testcontainers) for fast resets, and unique identifiers per run. Treat test data as code: versioned and reviewed.

? Flaky tests: root causes and a fix strategy | H | concept
Common causes: timing and async waits, shared state or order dependence, unstable test data, environment and network, third-party services, animation and rendering, non-deterministic code (random, time). Strategy: detect (rerun and track flake rate per test), quarantine with an owner and deadline, fix the root cause instead of adding retries, and make the CI dashboard show flake trends so trust in the suite stays high.

# group: Core concepts
? What is sanity testing in a release context? | E
A quick, focused check after a build with minor changes or fixes to confirm the specific functionality works and the build is rational enough for further testing. It's narrow and often unscripted, unlike broad smoke tests.

? Verification of a requirement: what makes it testable? | M
It is specific, measurable, unambiguous, and has clear acceptance criteria: "Search results appear within 2 seconds for 95% of queries" is testable; "search should be fast" is not. Testers ask for examples and numbers during refinement.

? What is a test charter? | E
A short mission statement for an exploratory session: what to explore, with what resources, to find what kind of information. Example: "Explore refund flows with partially shipped orders to find calculation errors."

? What is installation and upgrade testing? | M
Verifying the software installs, upgrades from supported older versions (with data preserved), uninstalls cleanly, and handles failures midway (rollback). For SaaS, the equivalent is testing deployments and database migrations.

? What is recovery testing? | M
Forcing failures (crash, power loss, network drop, DB failover) and verifying the system recovers within the defined time without data loss or corruption, and that users get sensible messages meanwhile.

? What is A/B testing and how does QA support it? | M | recent
Showing different variants to user groups and comparing metrics. QA verifies correct bucketing and consistency per user, each variant works fully, analytics events fire correctly, and switching off a variant is clean.
