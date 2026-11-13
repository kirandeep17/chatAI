# group: Framework
? What is a test automation framework? | E
A set of guidelines, libraries, structure and tools that makes automated tests consistent, maintainable and scalable: project layout, driver/client management, configuration, data handling, reporting, logging and CI integration. A framework is what turns scripts into a sustainable test suite.

? Types of automation frameworks | E
Linear (record and playback), modular, data-driven, keyword-driven, BDD, and hybrid (the most common: POM + data-driven + keyword-like reusable actions + BDD or plain tests).

? Data-driven vs keyword-driven framework | E
**Data-driven**: same test logic runs with many data sets from CSV, Excel, JSON or a DB. **Keyword-driven**: test steps are described with keywords (`OpenBrowser`, `Click`, `VerifyText`) in a table, executed by an engine; non-coders can write tests (Robot Framework is keyword-based).

? Typical Maven project structure for a Selenium + TestNG framework | E
```
src/main/java   → pages, components, driver factory, utils, config
src/test/java   → tests, listeners, data providers
src/test/resources → testng.xml, config/*.properties, data/, schemas/
pom.xml         → dependencies, surefire config, profiles
```
Keep framework code in main and tests in test so the framework can be packaged and reused.

? What does pom.xml do and what is Surefire? | E
`pom.xml` declares dependencies, plugins, versions and build profiles for Maven. The **Surefire** plugin runs unit/test classes during `mvn test` and generates reports; it can point to a `testng.xml` suite file and pass system properties. **Failsafe** is for integration tests run in `mvn verify`.

? Maven lifecycle phases a tester should know | E
`clean` → `validate` → `compile` → `test` → `package` → `verify` → `install` → `deploy`. `mvn clean test -Denv=qa -Dgroups=smoke` is the typical CI command.

? Maven vs Gradle | E
Both manage dependencies and builds. Maven uses XML and a fixed lifecycle; it's still the most common in QA projects. Gradle uses a Groovy/Kotlin DSL, is faster with incremental builds and caching, and is common in Android and newer backend projects.

? How do you run a TestNG suite from Maven? | E
```
<plugin>
  <artifactId>maven-surefire-plugin</artifactId>
  <configuration>
    <suiteXmlFiles><suiteXmlFile>${suite}</suiteXmlFile></suiteXmlFiles>
  </configuration>
</plugin>
```
Then `mvn test -Dsuite=testng-smoke.xml`.

? testng.xml: what can you configure? | E
Suites, tests, classes, packages, methods include/exclude, groups, parameters, listeners, parallel mode (`methods`, `classes`, `tests`, `instances`), thread count, data provider thread count, and preserve-order.

? TestNG annotations you use most | E
`@Test` (with `groups`, `priority`, `dependsOnMethods`, `enabled`, `timeOut`, `invocationCount`, `dataProvider`, `expectedExceptions`), `@BeforeSuite/Test/Class/Method`, `@AfterX`, `@DataProvider`, `@Parameters`, `@Listeners`, `@Factory`.

? priority vs dependsOnMethods in TestNG | M
`priority` sets execution order (lower first, default 0). `dependsOnMethods` skips the test if the dependency failed. Avoid both where possible: tests should be independent, and ordering hides coupling.

? What is a TestNG listener? Name the main ones | M
Hooks that react to test events. `ITestListener` (onTestStart, onTestFailure, onTestSuccess), `ISuiteListener`, `IInvokedMethodListener`, `IRetryAnalyzer`, `IAnnotationTransformer`, `IReporter`. Used for screenshots on failure, logging, retries and custom reports.

? Hard assert vs soft assert | E
Hard asserts stop the test at the first failure. Soft asserts (TestNG `SoftAssert`, AssertJ `SoftAssertions`) collect failures and report them at `assertAll()`. Use soft asserts when checking many independent fields on one page.

? Why use AssertJ? | M
Fluent, readable assertions with great failure messages: `assertThat(list).hasSize(3).extracting(User::name).containsExactly("A", "B", "C")`, recursive object comparison, soft assertions and exception assertions. It works with both JUnit and TestNG.

? JUnit 5 essentials for test engineers | M
`@Test`, `@BeforeEach/@AfterEach`, `@BeforeAll/@AfterAll`, `@DisplayName`, `@Tag`, `@Disabled`, `@Nested`, `@ParameterizedTest` with `@ValueSource/@CsvSource/@MethodSource`, `@RepeatedTest`, `@Timeout`, `@ExtendWith` for extensions. Parallel execution via `junit-platform.properties`.

? What is a JUnit 5 extension? | H
A hook into the test lifecycle: `BeforeEachCallback`, `AfterEachCallback`, `ParameterResolver` (inject a WebDriver or API client into tests), `TestWatcher` (screenshots on failure), `TestExecutionExceptionHandler`. Register with `@ExtendWith(DriverExtension.class)`.

? How do you pass parameters from testng.xml? | E
`<parameter name="browser" value="chrome"/>` and `@Parameters({"browser"}) @BeforeMethod public void setup(@Optional("chrome") String browser)`. System properties (`-Dbrowser=`) are more common in CI.

? How do you design test data management in a framework? | M
Data builders/factories with sensible defaults, API-based setup, unique values per run, external files only for data business users edit, secrets from vault/env, and cleanup hooks. Keep test data close to tests for readability.

? How do you read configuration in a framework? | E
A config loader that merges defaults, environment file (`qa.properties`), environment variables and system properties (highest priority). Libraries: Owner, Typesafe Config, or Spring `@ConfigurationProperties`. Expose typed getters.

? How do you implement logging? | E
Use SLF4J with Logback or Log4j2, log actions at INFO, details at DEBUG, include test name and thread in the pattern, write per-test logs in parallel runs (MDC), and attach logs to the report on failure.

? What should a good test report include? | E
Summary (pass/fail/skip, duration), environment and build info, failures with error message, stack trace, screenshots/videos/traces, request/response logs, steps, history trends, flaky indicators, and links to tickets.

? Allure vs Extent Reports | M
**Allure**: framework-agnostic, step annotations (`@Step`), attachments, history and trends, categories for failures, integrations with TestNG, JUnit, Cucumber, Playwright and Pytest; needs `allure generate`/serve. **Extent**: single HTML report, easy to customise, Java/.NET focused. Allure is more common in CI pipelines.

? What is BDD Cucumber's structure? | E
Feature files (Gherkin: Feature, Scenario, Given/When/Then, Background, Scenario Outline + Examples, tags), step definitions (code matched by Cucumber expressions or regex), hooks (`@Before`, `@After`), and a runner (JUnit Platform Suite or TestNG).

? Cucumber hooks and tags | E
`@Before`/`@After` run around scenarios (with order and tag filters, e.g. `@Before("@ui")`), `@BeforeStep`/`@AfterStep` around steps, `@BeforeAll`/`@AfterAll` globally. Run tags with `-Dcucumber.filter.tags="@smoke and not @wip"`.

? How do you share state between Cucumber step definition classes? | M
Dependency injection with PicoContainer (or Spring/Guice): create a `ScenarioContext` class, inject it via constructors into step classes. Each scenario gets fresh instances. Avoid static variables, which break parallel runs.

? Scenario Outline and data tables | E
Scenario Outline runs one scenario per Examples row with `<placeholders>`. Data tables pass structured data into a single step and can be converted to `List<Map<String,String>>` or custom objects with `@DataTableType`.

? How do you run Cucumber scenarios in parallel? | M
With JUnit Platform: `cucumber.execution.parallel.enabled=true` in `junit-platform.properties`. With TestNG: extend `AbstractTestNGCucumberTests` and override `scenarios()` with `@DataProvider(parallel = true)`. Thread-safe driver management is still required.

? What are common BDD anti-patterns? | M
Imperative UI steps ("click the button with id x"), very long scenarios, duplicated step definitions with slightly different wording, scenarios written after the code by testers only, and using Gherkin where nobody outside QA reads it.

? How do you organise tests: by feature or by type? | M
Usually by feature/domain (`checkout/`, `search/`) with tags for type (smoke, regression, api, ui). This keeps related tests together and lets CI pick subsets by tag.

? How do you handle waits centrally in a framework? | M
Wrap common interactions in a base page or helper (`click(By)` waits for clickable, `type` waits for visible), configure timeouts in one place, and expose specific waits (`waitForToast`) rather than letting tests call raw driver methods.

? What is a wrapper/decorator around WebDriver for? | H
Adding cross-cutting behaviour to every command: logging, screenshots, highlighting, timing, retries on specific exceptions. Selenium 4 offers `EventFiringDecorator` with `WebDriverListener` for this without changing tests.

? How do you make a framework reusable across projects? | H
Package core modules (driver management, API client base, config, reporting, utilities) as a versioned library published to an internal Maven repository; each product repo depends on it and contains only its page objects and tests. Semantic versioning and a changelog prevent breaking teams.

? Mono-repo tests vs tests in the application repo | M | recent
Tests in the application repo run on every PR, change together with code and are owned by the team; this is the modern default. A separate test repo suits cross-application E2E suites or teams without access to app code but drifts more easily.

? How do you version-control tests and review them? | E
Same as production code: Git branches, pull requests with reviews, linting and formatting (Checkstyle, Spotless, ESLint, Prettier), CI runs on the PR, and definition of done includes test updates.

# group: CI/CD
? What is CI/CD and where do tests run in it? | E
Continuous integration: every change is built and tested automatically. Continuous delivery/deployment: changes that pass are released automatically to environments (or production). Tests run at each stage: unit and static analysis on commit, API/contract/component tests on PR, regression and E2E after deployment to test environments, smoke tests after production deploys.

? Jenkins: freestyle vs pipeline jobs | E
Freestyle jobs are configured in the UI. Pipeline jobs are defined as code in a `Jenkinsfile` (declarative or scripted), versioned with the project, and support stages, parallelism and conditions. Pipelines are the standard.

? Write a declarative Jenkinsfile for a test suite | M
```
pipeline {
  agent any
  parameters {
    choice(name: 'ENV', choices: ['qa', 'stage'])
    string(name: 'TAGS', defaultValue: 'smoke')
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Test') { steps { sh "mvn clean test -Denv=${params.ENV} -Dgroups=${params.TAGS}" } }
  }
  post {
    always {
      junit 'target/surefire-reports/*.xml'
      allure results: [[path: 'target/allure-results']]
    }
    failure { slackSend channel: '#qa', message: "Tests failed: ${env.BUILD_URL}" }
  }
}
```

? How do you trigger tests automatically? | E
On push/PR via webhooks (GitHub, GitLab, Bitbucket), after an upstream deploy job, on a schedule (nightly cron), or manually with parameters. Use different suites for each trigger.

? GitHub Actions workflow for API tests | M
```
name: api-tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21', cache: maven }
      - run: mvn -B test -Denv=qa -Dgroups=smoke
        env: { API_TOKEN: "${{ secrets.API_TOKEN }}" }
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: reports, path: target/surefire-reports }
```

? How do you store secrets for CI test runs? | E
In the CI system's secret store (GitHub Secrets, Jenkins Credentials, GitLab CI variables marked masked/protected) or an external vault, injected as environment variables at runtime. Never in code, properties files or logs.

? How do you speed up a slow CI test stage? | M
Parallelise and shard, cache dependencies (Maven/npm), run only relevant tests on PRs (tags, changed-area selection), move checks down to API/unit level, reuse authenticated state, use containerised dependencies close to the runner, and kill unused waits. Measure each stage before optimising.

? What is test impact analysis? | H | recent
Selecting only the tests affected by a code change, using code coverage maps or dependency graphs. Tools: Launchable, Gradle/Bazel test selection, Playwright `--only-changed`. It shortens PR feedback; still run the full suite nightly to catch missed dependencies.

? What is a quality gate? | E
A pipeline rule that blocks promotion if criteria aren't met: unit coverage threshold, zero critical vulnerabilities, all smoke tests passing, no new SonarQube bugs, performance thresholds. Gates make quality expectations explicit and automatic.

? How should a pipeline handle flaky tests? | M
Don't silently retry everything. Allow a limited retry for known-flaky tests and record them, quarantine persistent offenders into a non-blocking job with an owner, track flake rate on a dashboard, and block merges only on reliable tests so trust stays high.

? Blue-green vs canary deployment and testing | M
**Blue-green**: two identical environments; switch traffic to the new one after testing it, instant rollback by switching back. **Canary**: release to a small percentage of users, monitor errors and metrics, then expand. Testers run smoke checks on the new environment and watch canary metrics.

? What is Infrastructure as Code and why does it matter for testing? | M
Defining environments in code (Terraform, Helm, docker-compose) so test environments are reproducible, disposable and identical to production configuration. It enables ephemeral per-PR environments for testing.

? Ephemeral (preview) environments | M | recent
A full copy of the app deployed for each pull request (via Kubernetes namespaces, Vercel/Netlify previews, or docker-compose in CI), tested and destroyed after merge. It removes shared-environment conflicts and lets E2E tests run before merge.

# group: Docker and Kubernetes
? Basic Docker commands for testers | E
`docker ps`, `docker images`, `docker run -d -p 8080:80 image`, `docker logs -f container`, `docker exec -it container sh`, `docker stop/rm`, `docker compose up -d`, `docker compose down -v`, `docker build -t name .`.

? Image vs container | E
An image is a read-only template (layers of filesystem plus metadata). A container is a running instance of an image with its own writable layer, process and network. Many containers can run from one image.

? Write a Dockerfile to run your test suite | M
```
FROM maven:3.9-eclipse-temurin-21
WORKDIR /tests
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
ENTRYPOINT ["mvn", "test"]
CMD ["-Denv=qa"]
```
Copying `pom.xml` first caches dependencies in a layer, so rebuilds are fast.

? docker-compose for app + DB + Selenium | M
```
services:
  db:      { image: postgres:16, environment: { POSTGRES_PASSWORD: test } }
  app:     { image: shop:latest, depends_on: [db], ports: ["8080:8080"] }
  chrome:  { image: selenium/standalone-chrome, shm_size: 2gb, ports: ["4444:4444"] }
```
Tests point to `http://app:8080` from inside the network or `localhost:8080` from the host.

? Kubernetes basics a QA engineer should know | M | recent
Pods (running containers), Deployments (desired replicas), Services (stable network endpoints), ConfigMaps and Secrets (configuration), Namespaces (isolation), Ingress (external routing). Useful commands: `kubectl get pods`, `kubectl logs`, `kubectl describe pod`, `kubectl port-forward`.

? How do you debug a failing test in a containerised environment? | M
Check container logs (`docker logs`, `kubectl logs`), health endpoints, environment variables and config maps, network connectivity between services, versions deployed, and resource limits (OOMKilled). Reproduce by running the same image locally.

# group: Git
? Git commands every automation engineer uses | E
`clone`, `status`, `add`, `commit`, `push`, `pull`, `fetch`, `branch`, `switch/checkout`, `merge`, `rebase`, `stash`, `log --oneline`, `diff`, `reset`, `revert`, `cherry-pick`, `blame`, `tag`.

? git merge vs git rebase | M
Merge combines branches with a merge commit, preserving history as it happened. Rebase replays your commits on top of the target branch for a linear history. Never rebase shared branches others have pulled.

? git reset vs git revert | M
`reset` moves the branch pointer back (rewriting local history): `--soft` keeps changes staged, `--mixed` unstaged, `--hard` discards them. `revert` creates a new commit that undoes an earlier one, which is safe for shared branches.

? How do you resolve a merge conflict? | E
Pull the latest target branch, open conflicted files, choose or combine the changes between conflict markers, run the tests, `git add` the files and complete the merge or `git rebase --continue`.

? What is a branching strategy? | E
Rules for how branches are used: **trunk-based** (short-lived feature branches merged daily, feature flags), **GitFlow** (develop, feature, release, hotfix branches). Trunk-based is favoured with CI/CD; test suites must be fast enough to run on every merge.

? What goes in .gitignore for a test project? | E
Build output (`target/`, `build/`), reports (`allure-results/`, `test-output/`, `playwright-report/`), IDE files (`.idea/`, `.vscode/`), logs, downloaded drivers, local `.env` files with secrets, and `node_modules/`.

# group: Recent interview topics
? How do you measure the ROI of automation? | M | recent
Compare manual effort saved (execution time × runs per release) plus faster feedback and defects caught earlier, against build and maintenance cost. Track pipeline duration, escaped defects, flake rate and time from commit to feedback. Present it in hours and release frequency, not just test counts.

? What does a modern quality engineering pipeline look like in 2026? | M | recent
Static analysis and unit tests on commit; API, contract and component tests on PR in ephemeral environments; a focused E2E smoke and visual/accessibility checks before merge; full regression nightly; canary releases with automated rollback; production synthetic monitoring and observability-driven alerts; AI-assisted test generation and failure triage reviewed by engineers.

? How do you use AI in your test framework responsibly? | M | recent
Generate first drafts of tests, page objects and data; summarise failure logs and cluster failures by root cause; suggest locators. Keep humans reviewing assertions and intent, never send secrets or customer data to external models, pin and version prompts, and measure whether AI-generated tests catch real defects.

? Monorepo test suites with many teams: how do you keep them healthy? | H | recent
Code owners per test folder, shared core libraries with versioning, test tags per team, flaky-test dashboards with ownership, budgets for suite duration, and automated detection of slow or redundant tests.

# group: Hard concepts
? Designing for parallel execution from day one | H | concept
Every test must be independent: own data, own browser/session, no shared mutable statics, no order dependence. Use ThreadLocal or DI-scoped drivers, unique data per test, thread-safe reporters and loggers (MDC), idempotent setup, and cleanup that can't remove another test's data. Then parallelism is just a configuration change.

? The test automation pyramid applied to a real product | H | concept
For an e-commerce app: ~70% unit tests (pricing rules, validators), ~20% service tests (cart API, payment API with mocked gateway, contract tests between cart and inventory), ~10% UI tests (search → checkout happy path, login, a couple of critical error states), plus non-functional checks. Each layer has a clear purpose, so you don't test the same rule five times through the UI.

? Why tests should be deterministic and hermetic | H | concept
A deterministic test gives the same result for the same code every time. A hermetic test controls all its inputs: its own data, mocked external systems, controlled time and randomness. Non-hermetic tests depend on shared environments and third parties, so they fail for reasons unrelated to the change, and the team learns to ignore failures.

? Dependency injection in test frameworks | H | concept
Instead of tests creating drivers, clients and page objects with `new`, a container (Guice, Spring, PicoContainer, JUnit 5 ParameterResolver, Playwright fixtures) provides them with the right scope (per test, per worker). This keeps tests short, makes swapping implementations easy (local vs grid, mock vs real API), and handles lifecycle and cleanup in one place.

? Test reporting as an engineering tool, not a document | H | concept
Good reports answer "what failed, why, and is it new?" quickly: failures grouped by error signature, history to show new vs known failures, flaky markers, direct links to traces, logs and commits, and ownership. Feeding results into dashboards (Allure TestOps, ReportPortal, Grafana) turns test runs into trend data for quality decisions.

# group: More framework questions
? How do you run only failed tests again? | E
TestNG writes `testng-failed.xml` in `test-output`; run it directly. Surefire supports `-Dsurefire.rerunFailingTestsCount=2` for JUnit. Playwright has `--last-failed`. Pytest has `--lf`.

? How do you run tests on a schedule? | E
Jenkins `triggers { cron('H 2 * * 1-5') }`, GitHub Actions `on: schedule: - cron: '30 20 * * 1-5'` (UTC), GitLab scheduled pipelines. Nightly regression with notification to the team channel is the common pattern.

? How do you send test results to Slack or Teams? | E
Use the CI plugin (Jenkins `slackSend`, GitHub Action for Slack) or a webhook call from a post-build step with a summary: pass/fail counts, failed test names, report link. Notify only on failures or status changes to avoid noise.

? How do you integrate test results with Jira or a test management tool? | M
Use tools like Xray or Zephyr with their REST APIs or Maven plugins to import JUnit/Cucumber results and link them to test cases and stories via annotations or tags (`@TEST_ABC-123`). This gives traceability from requirements to automated runs.

? What is a test management tool used for? | E
Storing test cases, plans and runs, mapping them to requirements, tracking manual and automated results, and reporting coverage. Examples: TestRail, Xray, Zephyr, qTest, Azure Test Plans.

? How do you handle different test environments in CI? | E
Parameterise the environment (`-Denv=qa`), keep config per environment, store secrets per environment, and use separate jobs or pipeline stages per environment with appropriate suites (smoke on prod, full on QA).

? How do you handle test dependencies on deployment order? | M
Make the test stage depend on successful deployment and a health check (poll `/health` until UP with a timeout) instead of fixed sleeps. Record the deployed version in the report.

? What are page components and why use them? | M
Reusable classes for UI parts that appear on many pages (header, search bar, date picker, modal, table). Page objects compose them. Changes to a shared component are fixed once.

? How do you handle multiple languages (i18n) in UI tests? | M
Avoid asserting on hard-coded English text where possible (use test IDs or roles), or load expected strings from the same translation files the app uses. Parameterise locale in config and run a subset per language.

? How do you parameterise tests for different users or roles? | E
Data providers or parameterised tests over role → credentials, with expected permissions per role. Combine with API-created users so each role's data is fresh.

? What is the Arrange-Act-Assert pattern? | E
Structure each test in three blocks: **Arrange** (set up data and state), **Act** (perform the single action under test), **Assert** (verify outcomes). It keeps tests readable and focused. Given/When/Then is the BDD equivalent.

? What makes a good automated test? | E
Fast, independent, repeatable, focused on one behaviour, readable name that describes the expectation, clear failure message, no hard waits, its own data, and it fails when the feature breaks (and only then).

? How do you name tests? | E
Describe the behaviour and expectation: `checkout_withExpiredCard_showsPaymentError` or `@DisplayName("Checkout shows an error when the card has expired")`. Names should make failures understandable without opening the code.

? How do you handle test failures caused by known bugs? | M
Link the test to the ticket and mark it as expected-to-fail or skipped with a reason (`test.fail()` in Playwright, `@Test(enabled=false)` with a comment, Allure `@Issue`). Re-enable when fixed. Don't delete the test or leave it failing in the main suite.

? How do you review someone else's automation code? | M
Check that the test verifies the right behaviour with meaningful assertions, has no hard waits or shared state, uses existing page objects/helpers, has readable names, handles data and cleanup, runs in parallel, and that locators are stable. Run it locally if in doubt.

? Linting and static analysis for test code | E
Checkstyle/PMD/SpotBugs or Sonar for Java, ESLint with `eslint-plugin-playwright` for TS, Ruff/flake8 for Python. They catch unused waits, focused tests (`test.only`) left in code, and style issues before review.

? How do you keep test execution time under control as the suite grows? | M
Set a time budget per stage, monitor slowest tests, push checks to lower layers, delete redundant tests, parallelise, and use test selection on PRs. Treat suite duration as a metric the team owns.

? What is the difference between regression suite and sanity suite in CI? | E
Sanity/smoke: a few minutes, critical paths, runs on every build or deploy. Regression: broad coverage, runs nightly or before releases. Some teams add a mid-sized PR suite between them.

? How do you test the framework itself? | H
Unit-test utilities (config loader, data builders, retry logic, JSON comparison), run a small self-test suite against a stable demo app after framework changes, and version the framework so product suites upgrade deliberately.

? How do you handle browser and driver updates in CI? | M
Use Selenium Manager or pinned Docker images (`selenium/standalone-chrome:<version>`, Playwright Docker image matching the npm version), update deliberately via dependency bots (Renovate, Dependabot) with the suite as the gate.

? How do you onboard a new tester onto your framework? | E
A README with setup and run commands, an example test for each type (UI, API), architecture diagram, coding conventions, how to add a page object or client, how to debug failures, and a first small task with a review.

? What are the most common reasons automation projects fail? | M
Automating the wrong things (unstable UI, low value), no ownership or maintenance time, flaky tests eroding trust, testers working separately from developers, no CI integration, unrealistic goals (100% automation), and frameworks over-engineered before tests exist.

? Explain the difference between a test runner, a test framework and an assertion library | E
**Runner** discovers and executes tests (Surefire, TestNG runner, Playwright Test runner). **Framework** provides structure and lifecycle (TestNG, JUnit, pytest). **Assertion library** checks outcomes (AssertJ, Hamcrest, Chai, `expect`). Some tools combine them.
