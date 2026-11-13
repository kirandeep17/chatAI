# group: Playwright
? What is Playwright? | E
An open-source browser automation framework from Microsoft that drives Chromium, Firefox and WebKit through one API. It has official bindings for TypeScript/JavaScript, Python, Java and .NET, and its own test runner (`@playwright/test`) with parallelism, fixtures, retries, reporting and tracing built in.

? How does Playwright communicate with browsers? | M
Over a persistent WebSocket connection using browser-specific protocols (CDP for Chromium, patched Juggler for Firefox, a WebKit protocol), not over HTTP request-per-command like classic WebDriver. That makes it faster and lets it receive events (network, console, dialogs) as they happen.

? Browser vs BrowserContext vs Page | E
- **Browser**: one launched browser process.
- **BrowserContext**: an isolated incognito-like session with its own cookies, storage and cache. Cheap to create, so each test gets its own.
- **Page**: a single tab inside a context.

Multiple contexts in one browser let you test two users chatting with each other in one test.

? What is auto-waiting? | E
Before an action, Playwright checks the element is attached, visible, stable (not animating), enabled, and receives events (not covered). It retries until these are true or the timeout expires. This removes most explicit waits and sleeps.

? What are web-first assertions? | E
Assertions like `await expect(locator).toHaveText('Paid')` retry until the condition is met or the timeout passes (default 5 s). Avoid `expect(await locator.textContent()).toBe(...)`, which reads once and doesn't retry, causing flaky tests.

? Locator vs ElementHandle | M
A **Locator** is a lazy description of how to find an element; it re-queries the DOM on every action and supports auto-waiting and strictness. An **ElementHandle** points to one specific DOM node and can go stale. Playwright recommends locators; ElementHandles are discouraged.

? What is strict mode in locators? | M
If a locator matches more than one element when you act on it, Playwright throws an error instead of silently using the first. Narrow it with `filter`, `getByRole` with `name`, chaining, or explicitly `.first()`, `.nth(i)` when you really mean it.

? How do you filter and chain locators? | M
```
const row = page.getByRole('row').filter({ hasText: 'ORD-1042' });
await row.getByRole('button', { name: 'Cancel' }).click();
page.locator('.card').filter({ has: page.getByText('In stock') });
page.getByRole('listitem').and(page.getByTitle('Primary'));
page.getByText('Save').or(page.getByText('Update'));
```

? Common assertions in Playwright Test | E
`toBeVisible`, `toBeHidden`, `toBeEnabled`, `toBeChecked`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveAttribute`, `toHaveClass`, `toHaveCount`, `toHaveURL`, `toHaveTitle`, `toHaveScreenshot`, `toBeInViewport`, plus `expect.soft` for soft assertions and `expect.poll` for polling any value.

? What is expect.poll and expect.toPass? | M
`expect.poll(() => fetchStatus()).toBe('DONE')` retries a function until the value matches, useful for API state. `await expect(async () => { ... }).toPass({ timeout: 30000 })` retries a whole block of code, e.g. an API call plus assertion, until it passes.

? Explain playwright.config.ts key options | M
```
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['junit', { outputFile: 'results.xml' }]],
  use: { baseURL: 'https://qa.example.com', trace: 'on-first-retry',
         screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: 'auth.json' }, dependencies: ['setup'] },
    { name: 'webkit', use: { ...devices['iPhone 15'] }, dependencies: ['setup'] },
  ],
});
```

? What are projects in Playwright? | M
A project is a named configuration of tests: different browsers, devices, environments, or setup steps. Projects can depend on others (e.g. an auth setup project). Run one with `npx playwright test --project=webkit`.

? How does Playwright run tests in parallel? | M
Test files run in parallel across worker processes by default; tests within a file run in order unless `fullyParallel: true` or `test.describe.configure({ mode: 'parallel' })`. Each worker has its own browser. Use `--workers` to control the count and `--shard=1/4` to split across CI machines.

? Hooks in Playwright Test | E
`test.beforeAll`, `test.afterAll` (once per worker per file), `test.beforeEach`, `test.afterEach`. Prefer fixtures over hooks for reusable setup because fixtures are composable, lazy and typed.

? Write a custom fixture | M
```
type Fixtures = { todoPage: TodoPage; apiUser: User };
export const test = base.extend<Fixtures>({
  apiUser: async ({ request }, use) => {
    const user = await createUser(request);
    await use(user);
    await deleteUser(request, user.id);   // teardown
  },
  todoPage: async ({ page }, use) => {
    const p = new TodoPage(page); await p.goto();
    await use(p);
  },
});
```
Tests then declare what they need: `test('add', async ({ todoPage, apiUser }) => {...})`.

? Test-scoped vs worker-scoped fixtures | H
Test-scoped fixtures (default) are created for each test. Worker-scoped fixtures (`{ scope: 'worker' }`) are created once per worker process and shared by its tests, good for expensive resources like a seeded account or DB connection. Each worker gets its own instance, so use `workerInfo.workerIndex` to keep data unique.

? How do you do API testing in Playwright? | M
Use the `request` fixture or `request.newContext()`:
```
const res = await request.post('/api/users', { data: { name: 'Asha' } });
expect(res.status()).toBe(201);
const body = await res.json();
expect(body).toMatchObject({ name: 'Asha' });
```
It shares cookies with the browser context when you use `page.request`, so you can mix API setup with UI checks.

? How do you handle authentication for multiple roles? | M
Create a setup project that logs in as each role and saves `storageState` files (`admin.json`, `user.json`). Use them per project or per test with `test.use({ storageState: 'admin.json' })`. For a test needing two roles at once, create two contexts each with its own state.

? How do you handle file upload and download? | E
```
await page.getByLabel('Invoice').setInputFiles('data/invoice.pdf');
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByText('Export CSV').click(),
]);
await download.saveAs('out/report.csv');
```

? How do you handle new tabs and popups? | E
```
const popupPromise = page.waitForEvent('popup');
await page.getByText('Open help').click();
const popup = await popupPromise;
await popup.waitForLoadState();
await expect(popup).toHaveTitle(/Help/);
```
For tabs opened by `target=_blank`, use `context.waitForEvent('page')`.

? How do you handle dialogs (alert, confirm)? | E
Register a handler before the action: `page.on('dialog', d => d.accept())` or `page.once('dialog', async d => { expect(d.message()).toContain('Delete?'); await d.dismiss(); })`. By default Playwright auto-dismisses dialogs.

? How do you handle iframes? | E
`const frame = page.frameLocator('#payment-iframe'); await frame.getByLabel('Card number').fill('4111...');` Frame locators auto-wait for the frame to load. Nested frames chain: `frameLocator('#a').frameLocator('#b')`.

? Does Playwright support Shadow DOM? | E
Yes. CSS and text locators pierce open shadow roots automatically, so `page.getByRole('button', { name: 'Buy' })` finds a button inside a web component. XPath does not pierce shadow roots.

? How do you wait for a specific API response? | M
```
const respPromise = page.waitForResponse(r => r.url().includes('/api/orders') && r.status() === 200);
await page.getByRole('button', { name: 'Place order' }).click();
const resp = await respPromise;
expect((await resp.json()).status).toBe('CREATED');
```
Start waiting before the click to avoid missing the response.

? How do you modify a real response instead of fully mocking it? | M
```
await page.route('**/api/products', async route => {
  const response = await route.fetch();
  const json = await response.json();
  json.items[0].price = 0;
  await route.fulfill({ response, json });
});
```
Useful to test edge cases (zero price, very long names) with otherwise real data.

? What is HAR replay? | M
Record network traffic to a HAR file and replay it in tests with `page.routeFromHAR('data/app.har', { update: false })`. It makes UI tests independent of a backend or third party, and you can refresh the recording with `update: true`.

? How do you block images or third-party scripts to speed up tests? | E
```
await page.route('**/*.{png,jpg,jpeg,webp}', r => r.abort());
await page.route(/google-analytics|hotjar/, r => r.abort());
```

? What is the trace viewer? | E
A tool that records every action with DOM snapshots before and after, screenshots, console logs, network requests, and source code location. Enable with `trace: 'on-first-retry'` and open with `npx playwright show-trace trace.zip` or at trace.playwright.dev. It's the main way to debug CI-only failures.

? What is UI mode? | E | recent
`npx playwright test --ui` opens an interactive runner with watch mode, a timeline, DOM snapshots per step, locator picking and the ability to re-run a single test. It's the fastest way to develop and debug tests locally.

? What is codegen and when should you use it? | E
`npx playwright codegen <url>` records your actions and generates test code with recommended locators. Use it to discover good locators or bootstrap a test, then refactor into page objects and add proper assertions.

? Page Object Model in Playwright | M
```
export class LoginPage {
  constructor(private page: Page) {}
  readonly email = this.page.getByLabel('Email');
  readonly password = this.page.getByLabel('Password');
  async goto() { await this.page.goto('/login'); }
  async login(u: string, p: string) {
    await this.email.fill(u); await this.password.fill(p);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
```
Expose page objects through fixtures so tests don't construct them manually.

? How do you do visual regression testing in Playwright? | M
`await expect(page).toHaveScreenshot('home.png', { mask: [page.locator('.date')], maxDiffPixelRatio: 0.01 });` The first run creates baselines; later runs diff against them. Update with `--update-snapshots`. Generate baselines on the same OS as CI (use the official Docker image) because font rendering differs.

? What is ARIA snapshot testing? | M | recent
`await expect(page.getByRole('navigation')).toMatchAriaSnapshot(...)` compares the accessibility tree (roles, names, structure) against a YAML snapshot. It's more stable than pixel screenshots and catches accessibility regressions.

? How do you test accessibility with Playwright? | M
Use `@axe-core/playwright`:
```
const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
expect(results.violations).toEqual([]);
```
Combine with role-based locators and keyboard navigation tests.

? How do you emulate devices, geolocation, locale, timezone and permissions? | E
```
test.use({ ...devices['Pixel 7'], locale: 'hi-IN', timezoneId: 'Asia/Kolkata',
  geolocation: { latitude: 12.97, longitude: 77.59 }, permissions: ['geolocation'],
  colorScheme: 'dark' });
```

? How do you control time in Playwright? | H | recent
The Clock API: `await page.clock.install({ time: new Date('2026-03-31T23:59:00') })`, then `page.clock.fastForward('02:00')` or `runFor`. Use it to test session timeouts, countdowns, month-end logic and scheduled banners without waiting.

? How do you run Playwright in CI? | M
Install with `npm ci` and `npx playwright install --with-deps` (or use the official `mcr.microsoft.com/playwright` image), run with retries and a fixed worker count, shard across machines, and upload `playwright-report` and traces as artifacts. Use `--only-changed` or tags to run subsets on PRs.

? How do you tag and filter tests? | E
Use tags in the title or the details object: `test('checkout', { tag: ['@smoke', '@payments'] }, async ...)`. Run with `--grep @smoke` or `--grep-invert @slow`. Annotations like `test.skip`, `test.fixme`, `test.slow` and `test.fail` document known states.

? How do you parameterise tests in Playwright? | E
Loop over data to generate tests:
```
for (const user of ['admin', 'editor', 'viewer']) {
  test(`dashboard loads for ${user}`, async ({ page }) => { ... });
}
```
Or use project-level `use` options and custom option fixtures for environment-level parameters.

? How do you merge reports from sharded runs? | M
Run shards with the `blob` reporter, collect the `blob-report` folders as artifacts, then run `npx playwright merge-reports --reporter html ./all-blob-reports` in a final job to produce one HTML report.

? What are soft assertions? | E
`expect.soft(locator).toHaveText('x')` records a failure but continues the test, so you see all mismatches on a page in one run. The test is still marked failed at the end.

? How do you set timeouts in Playwright? | M
Test timeout (default 30 s) in config `timeout` or `test.setTimeout`; assertion timeout `expect: { timeout: 5000 }`; action and navigation timeouts in `use: { actionTimeout, navigationTimeout }`; global run timeout `globalTimeout`. `test.slow()` triples the test timeout.

? What is globalSetup vs setup projects? | M
`globalSetup` runs a function once before all tests but doesn't appear in reports or traces and can't use fixtures. **Setup projects** (recommended) are real tests that other projects depend on, so they get traces, fixtures and reporting.

? Playwright with Java: how is it different? | M
Same API through `com.microsoft.playwright`, but there's no built-in test runner, so you use JUnit 5 or TestNG for structure and parallelism and manage `Playwright`, `Browser`, `BrowserContext` and `Page` lifecycles yourself (one Playwright instance per thread). Assertions come from `PlaywrightAssertions.assertThat(locator)`.

? Playwright with Python and pytest | M
`pytest-playwright` provides `page`, `context` and `browser` fixtures and CLI options like `--browser webkit --headed`. Sync API is typical: `page.get_by_role("button", name="Pay").click()`, `expect(page.get_by_text("Paid")).to_be_visible()`.

? Can Playwright test mobile apps? | E
Only mobile web through device emulation (viewport, user agent, touch) and experimental Android Chrome support. Native iOS/Android apps need Appium or similar.

? Can Playwright test component-level UI? | M
Yes, experimental component testing for React, Vue and Svelte mounts components in a real browser: `await mount(<Button label="Pay" />)`. It's an alternative to jsdom-based tests when you need real rendering.

? Playwright MCP and AI agents: what are they? | H | recent
Playwright MCP is a Model Context Protocol server that lets AI agents (e.g. coding assistants) control a browser through Playwright using the accessibility tree rather than screenshots. Newer Playwright versions also ship test agents (planner, generator, healer) that explore an app, write tests and propose fixes. Use them to accelerate test creation, but review generated tests: they can encode current behaviour rather than intended behaviour.

# group: Cypress
? What is Cypress? | E
A JavaScript end-to-end and component testing framework that runs inside the browser, in the same run loop as the application. Features: automatic retries, time-travel debugging in its runner, network stubbing with `cy.intercept`, screenshots and videos, and a dashboard (Cypress Cloud).

? How do Cypress commands work? Why can't you use async/await? | M
Commands like `cy.get()` are enqueued and run later in order; they return chainables, not promises. You can't `await` them or assign their result to a variable. Use `.then()` to work with values, aliases (`.as('user')`) and `cy.wrap()`.

? cy.intercept: stub and spy network calls | M
```
cy.intercept('GET', '/api/orders*', { fixture: 'orders.json' }).as('orders');
cy.visit('/orders');
cy.wait('@orders').its('response.statusCode').should('eq', 200);
```
Without a response argument it spies on the real request so you can assert on it.

? How does retry-ability work in Cypress? | M
Queries (`get`, `find`, `contains`) and assertions (`should`) retry together until the assertion passes or the timeout (default 4 s) expires. Actions like `click` don't retry. Write assertions with `should` so they become part of the retry.

? cy.session for login caching | M
`cy.session('admin', () => { login steps }, { validate() { ... } })` caches cookies and storage after the first login and restores them in later tests, speeding up suites a lot while keeping tests isolated.

? What are Cypress custom commands? | E
Reusable commands added in `cypress/support/commands.js`: `Cypress.Commands.add('login', (u, p) => {...})`, then `cy.login('qa', 'pw')`. Use them for repeated flows, but prefer `cy.session` and API calls for setup.

? How do you handle iframes and multiple origins in Cypress? | H
Cypress has no native iframe API; get the iframe body with `cy.get('iframe').its('0.contentDocument.body').should('not.be.empty').then(cy.wrap)` or a plugin. For flows across domains (e.g. SSO), wrap the commands for the other domain in `cy.origin('https://login.example.com', () => {...})`.

? Why doesn't Cypress support multiple tabs? | M
Because it runs inside one browser tab alongside the app. Workarounds: remove the `target` attribute so the link opens in the same tab, or assert the `href` and visit it directly.

? Fixtures in Cypress | E
Static test data files in `cypress/fixtures` loaded with `cy.fixture('user.json')` or used directly as stub responses in `cy.intercept`. This is a different meaning from Playwright fixtures.

? Cypress component testing | M
Mount individual React/Vue/Angular components in a real browser with `cy.mount(<Cart items={[]} />)` and test them with the same commands. It gives fast, realistic tests without the whole app running.

? How do you run Cypress in CI and in parallel? | M
`npx cypress run --browser chrome --record --parallel` with Cypress Cloud load-balances spec files across machines. Without Cloud, split specs manually across CI jobs or use open-source plugins. Use the official `cypress/included` Docker images.

? Cypress limitations interviewers ask about | M
Only JavaScript/TypeScript; single tab; multi-origin needs `cy.origin`; no native Safari (WebKit support is experimental); hovers need workarounds; parallelism is easiest with paid Cloud; heavy network-dependent suites can be slow. Know these before recommending it.

# group: Recent interview topics
? Why is Playwright overtaking Cypress and Selenium in new projects? | M | recent
One API for three engines including WebKit, free built-in parallelism and sharding, multi-tab and multi-origin support, auto-waiting, traces and UI mode, API testing in the same runner, and support for several languages. Its npm downloads passed Cypress in 2024 and it's the default choice in many 2026 job descriptions.

? How would you migrate a Selenium suite to Playwright? | H | recent
Don't rewrite everything at once. Start with new tests in Playwright, migrate the highest-value and flakiest tests first, map page objects one to one, replace explicit waits with web-first assertions, move login to `storageState`, and run both suites in CI until coverage is equal. Track flake rate and run time to show the benefit.

? How do you test with Playwright against a Docker-compose environment? | M | recent
Start the app and dependencies with `docker compose up -d` in CI, wait for health checks, run Playwright against the service URL, then collect logs and tear down. Playwright's `webServer` config can also start a local server and wait for its URL before tests run.

# group: Hard concepts
? Why are Playwright tests faster and less flaky than WebDriver tests? | H | concept
Three reasons: a persistent connection and event stream instead of one HTTP call per command; actionability checks and auto-waiting performed inside the browser right before the action; and cheap, isolated browser contexts per test instead of a new browser per test. Combined with web-first assertions, most timing races disappear without explicit waits.

? Explain the fixture lifecycle and dependency graph | H | concept
Fixtures are declared with dependencies (`todoPage` depends on `page`, which depends on `context`, which depends on `browser`). Playwright builds a graph, sets up only the fixtures a test actually uses, in dependency order, then tears them down in reverse after `use()` returns. Worker-scoped fixtures live for the worker; test-scoped ones per test. `{ auto: true }` fixtures run for every test, useful for logging or failure hooks.

? Test isolation: why each test gets a new context | H | concept
Shared state between tests (cookies, localStorage, created data) creates order dependence and flakiness, especially in parallel. Playwright gives each test a fresh context, so tests are hermetic by default. Reuse expensive things deliberately (storageState files, worker fixtures) instead of sharing a browser session.

? Network interception order and the "wait before action" race | H | concept
`page.route` handlers are matched in reverse order of registration, and a handler must call `fulfill`, `continue`, `fallback` or `abort`. When waiting for responses or events, create the promise **before** triggering the action; otherwise a fast response can arrive before you start listening and the wait times out. `Promise.all([waitFor..., click()])` or storing the promise first avoids this race.

? Sharding vs workers | H | concept
**Workers** are parallel processes on one machine; **shards** split the test list across machines (`--shard=2/4`). Combine them: 4 shards × 4 workers = 16 parallel streams. Balance shards by making tests independent and similar in length; `fullyParallel` lets Playwright split at test level rather than file level for better balance.

? Cypress vs Playwright architecture | H | concept
Cypress runs **inside** the browser alongside the app, which gives direct access to the app's window and synchronous-feeling commands, but limits it to one tab and one origin at a time. Playwright runs **outside** the browser and controls it over a protocol, which allows multiple tabs, contexts, origins and browsers, and languages other than JavaScript. This one difference explains most of their trade-offs.

# group: More Playwright questions
? page.locator vs page.$ | E
`page.locator(selector)` returns a lazy Locator with auto-waiting and strictness. `page.$(selector)` returns an ElementHandle immediately (or null) without waiting; it's legacy and discouraged.

? fill vs type vs pressSequentially | E
`fill` clears and sets the value in one go (fast, triggers input events). `pressSequentially` (formerly `type`) types character by character with optional delay, needed for inputs that react to each keystroke such as autocomplete or masked fields.

? click options you should know | M
`click({ force: true })` skips actionability checks (use rarely), `{ position: { x, y } }`, `{ button: 'right' }`, `{ clickCount: 2 }`, `{ modifiers: ['Shift'] }`, `{ trial: true }` to run checks without clicking. `dblclick()` and `hover()` are separate methods.

? How do you select from a dropdown? | E
`await page.getByLabel('Country').selectOption('IN')` by value, `{ label: 'India' }` by visible text, or an array for multi-select. For custom dropdowns, click the trigger and then the option by role: `page.getByRole('option', { name: 'India' })`.

? How do you check and uncheck? | E
`await locator.check()` and `uncheck()` are idempotent and assert the final state. `setChecked(true/false)` sets it based on a value. Assert with `toBeChecked()`.

? How do you hover and drag in Playwright? | E
`await locator.hover()`; `await source.dragTo(target)` which handles HTML5 drag-and-drop. For custom gestures use `page.mouse.move/down/up`.

? How do you get text of all matching elements? | E
`await page.locator('.product-name').allTextContents()` or `allInnerTexts()`. For assertions prefer `await expect(locator).toHaveText(['A', 'B', 'C'])`, which retries.

? waitForLoadState: load vs domcontentloaded vs networkidle | M
`load` waits for the load event, `domcontentloaded` for DOM parsed, `networkidle` for no network activity for 500 ms. Playwright discourages `networkidle` for tests because it's slow and unreliable with polling or analytics; assert on the UI element you need instead.

? page.goto options | E
`page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })`. With `baseURL` in config you can write `page.goto('/login')`. It returns the main response, so you can assert its status.

? How do you take screenshots and record video? | E
`await page.screenshot({ path: 'p.png', fullPage: true })`, `await locator.screenshot()`. Videos are enabled in config with `video: 'retain-on-failure'` and saved per test in the output directory.

? How do you handle a slow or infinite spinner? | M
Wait for its disappearance: `await expect(page.getByTestId('spinner')).toBeHidden({ timeout: 30000 })`. If the spinner never shows in fast runs, `toBeHidden` passes immediately, which is the desired behaviour.

? How do you assert there are no console errors during a test? | M
```
const errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
// ... test steps
expect(errors).toEqual([]);
```
Put it in an auto fixture so every test checks it.

? How do you work with localStorage or sessionStorage? | M
`await page.evaluate(() => localStorage.setItem('flag', 'on'))` after navigating to the origin, or `context.addInitScript(() => localStorage.setItem(...))` so it's set before any page script runs. `storageState()` captures localStorage along with cookies.

? addInitScript: what is it used for? | M
Code injected into every page before its scripts run: seeding storage, mocking `Math.random` or `Date`, disabling animations, setting feature flags, or stubbing analytics objects.

? How do you disable animations to reduce flakiness? | M
Add CSS through `page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' })` or use `reducedMotion: 'reduce'` in config if the app respects it. `toHaveScreenshot` already disables CSS animations by default.

? How do you connect Playwright to a remote browser or cloud grid? | M
`chromium.connect(wsEndpoint)` to a Playwright server (e.g. `npx playwright run-server` in Docker), or `chromium.connectOverCDP(url)` to an existing Chrome. Cloud vendors (BrowserStack, LambdaTest, Microsoft Playwright Testing) give a WebSocket endpoint to use in config.

? How do you test a download filename and content? | M
```
const download = await downloadPromise;
expect(download.suggestedFilename()).toBe('orders.csv');
const path = await download.path();
const text = fs.readFileSync(path, 'utf8');
expect(text.split('\n')[0]).toBe('id,amount,status');
```

? How do you test responsive breakpoints? | E
Use projects with different devices, or `await page.setViewportSize({ width: 375, height: 812 })` inside a test, then assert layout behaviour (hamburger menu visible, sidebar hidden).

? How do you skip a test conditionally? | E
`test.skip(browserName === 'webkit', 'Feature not supported in Safari')` at the top of the test, or `test.skip(({ browserName }) => browserName === 'firefox')` at describe level. `test.fixme` marks known-broken tests.

? test.step: why use it? | E
`await test.step('Add item to cart', async () => {...})` groups actions in reports and traces, making failures easier to read. Steps can be nested and can return values.

? How do you handle a test that depends on another test's data? | M
Avoid it. Create the data in a fixture or `beforeEach` through the API. If order truly matters, use `test.describe.serial`, knowing that a failure stops the remaining tests and retries rerun the whole group.

? How do you debug a single test locally? | E
`npx playwright test tests/cart.spec.ts:42 --debug` opens the Inspector paused at the start; `await page.pause()` pauses at a point; `PWDEBUG=1` enables debug mode; the VS Code extension supports breakpoints and live locator picking.

? Common Playwright interview coding task: login and verify dashboard | M | recent
```
test('user sees their orders', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.QA_USER!);
  await page.getByLabel('Password').fill(process.env.QA_PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(6); // header + 5 orders
});
```
Credentials come from environment variables, not the code.
