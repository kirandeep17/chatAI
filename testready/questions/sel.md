# group: Locators and waits
? What is Selenium and what are its components? | E
Selenium is an open-source suite for automating browsers. Components: **WebDriver** (language bindings that drive browsers through the W3C WebDriver protocol), **Selenium Grid** (run tests in parallel on remote machines), **Selenium IDE** (record and playback browser extension). Selenium RC is long retired.

? How does Selenium WebDriver work internally? | M
Your test calls the language binding (e.g. Java `ChromeDriver`). The binding sends HTTP requests in W3C WebDriver JSON format to a browser driver (chromedriver, geckodriver), which translates them into native browser commands and returns the response. Since 4.11, **Selenium Manager** downloads the matching driver automatically, so you rarely need WebDriverManager or system properties.

? List all locator strategies | E
`By.id`, `By.name`, `By.className`, `By.tagName`, `By.linkText`, `By.partialLinkText`, `By.cssSelector`, `By.xpath`, plus Selenium 4 **relative locators** (`above`, `below`, `toLeftOf`, `toRightOf`, `near`).

? Absolute vs relative XPath | E
Absolute XPath starts from the root (`/html/body/div[2]/form/input`) and breaks with any DOM change. Relative XPath starts anywhere (`//input[@name='email']`) and is far more stable. Always use relative XPath.

? Write XPath using axes: parent, following-sibling, ancestor | M
```
//label[text()='Email']/following-sibling::input
//td[text()='Asha']/parent::tr//button[text()='Edit']
//span[@class='error']/ancestor::form
//input[@id='q']/preceding::label[1]
```
Axes are the main reason to choose XPath over CSS: CSS cannot move up the DOM.

? XPath functions: contains, starts-with, text, normalize-space | E
```
//button[contains(@class,'primary')]
//a[starts-with(@href,'/products')]
//h2[text()='Orders']
//span[normalize-space()='Total amount']
//div[contains(text(),'Welcome')]
```
`normalize-space()` handles extra whitespace and line breaks in text.

? Write CSS selectors for common cases | E
```
#login                 id
.btn.primary           both classes
input[name='email']    attribute
a[href^='/products']   starts with
a[href$='.pdf']        ends with
div[class*='card']     contains
ul > li:nth-child(2)   child and position
label + input          adjacent sibling
```

? How do you handle dynamic elements whose IDs change? | M
Use stable parts: `contains()`/`starts-with()` on the stable prefix, nearby stable labels with axes, relative locators, or attributes like `data-testid`, `aria-label`, `name`. Best long-term fix: agree on test IDs with developers.

? What is the default timeout of implicit wait and page load? | E
Implicit wait defaults to 0. Page load timeout defaults to 300 seconds, script timeout to 30 seconds. Set them with `driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5))`, `pageLoadTimeout(...)`, `scriptTimeout(...)`.

? Write a FluentWait | M
```
Wait<WebDriver> wait = new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(20))
    .pollingEvery(Duration.ofMillis(500))
    .ignoring(NoSuchElementException.class)
    .withMessage("Order status never became PAID");
WebElement status = wait.until(d -> {
    WebElement el = d.findElement(By.id("status"));
    return el.getText().equals("PAID") ? el : null;
});
```

? Common ExpectedConditions | E
`visibilityOfElementLocated`, `elementToBeClickable`, `presenceOfElementLocated`, `invisibilityOfElementLocated`, `textToBePresentInElement`, `attributeContains`, `alertIsPresent`, `frameToBeAvailableAndSwitchToIt`, `numberOfWindowsToBe`, `urlContains`, `stalenessOf`, `numberOfElementsToBeMoreThan`.

? Presence vs visibility of an element | E
**Presence**: the element exists in the DOM (may be hidden). **Visibility**: it is in the DOM, displayed, and has height and width greater than 0. Use visibility before reading text or clicking.

? How do you wait for a page or AJAX call to finish? | M
Prefer waiting for the visible result (a row appears, a spinner disappears). If needed, check `document.readyState === 'complete'` with JavascriptExecutor, or for jQuery apps `jQuery.active == 0`. With Selenium 4 BiDi/CDP you can also wait on network events.

# group: Interactions
? getText() vs getAttribute("value") vs getDomProperty | E
`getText()` returns the visible inner text. For input fields, the typed value is in the `value` property, so use `getDomProperty("value")` (Selenium 4) or `getAttribute("value")`. `getDomAttribute` returns the HTML attribute as written in markup.

? How do you handle dropdowns? | E
For `<select>` use the `Select` class: `selectByVisibleText`, `selectByValue`, `selectByIndex`, `getOptions`, `getFirstSelectedOption`, `isMultiple`, `deselectAll`. For custom dropdowns (div-based), click to open, then click the option by text with an explicit wait.

? Actions class: what can it do? | E
Mouse and keyboard gestures: `moveToElement` (hover), `contextClick`, `doubleClick`, `dragAndDrop`, `clickAndHold`, `release`, `keyDown`/`keyUp` (e.g. Ctrl+click), `sendKeys`, `scrollToElement` (Selenium 4). Always end with `.perform()`.

? How do you upload a file? | E
If there's an `<input type="file">`, call `sendKeys` with the absolute path, even if the input is hidden behind a styled button. On a remote Grid, set `((RemoteWebDriver) driver).setFileDetector(new LocalFileDetector())` so the file is transferred to the node.

? How do you download a file and verify it? | M
Set browser preferences for the download directory and disable the prompt (Chrome `download.default_directory`). Wait until the file exists and has no `.crdownload` extension, then verify name, size and content. Better: get the download URL and fetch it with an HTTP client to verify headers and content.

? How do you handle a calendar/date picker? | M
Options: type into the input if allowed; navigate months by clicking next until the header matches, then click the day; or set the value with JavascriptExecutor (fast but bypasses UI behaviour). Make the target date relative to today so tests don't break over time.

? How do you handle web tables? | M
Locate rows `//table[@id='orders']/tbody/tr`, loop over them, read cells by column index, or locate a row by a cell value and act on the same row:
```
driver.findElement(By.xpath("//tr[td[text()='ORD-1042']]//button[text()='Cancel']")).click();
```
For pagination, loop until the next button is disabled.

? How do you handle authentication pop-ups (basic auth)? | M
Embed credentials in the URL `https://user:pass@host` (not supported everywhere), or use Selenium 4 `HasAuthentication`:
```
((HasAuthentication) driver).register(UsernameAndPassword.of("user", "pass"));
```
Native OS dialogs can't be automated by WebDriver directly.

? How do you scroll in Selenium? | E
`new Actions(driver).scrollToElement(el).perform()` (Selenium 4), `scrollByAmount(0, 500)`, or JavaScript `window.scrollBy(0, 500)` / `arguments[0].scrollIntoView({block:'center'})`.

? How do you handle infinite scroll? | M
Scroll to the bottom, wait for new items to load (count increases), repeat until the count stops changing or you find the target item. Put a max-iteration limit to avoid endless loops.

? How do you take a screenshot of the full page and of one element? | E
Viewport: `((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE)`. Element: `element.getScreenshotAs(OutputType.FILE)` (Selenium 4). Full page: Firefox supports `((FirefoxDriver) driver).getFullPageScreenshotAs(...)`; in Chrome use CDP or a library like AShot.

? How do you handle multiple tabs in Selenium 4? | E
```
driver.switchTo().newWindow(WindowType.TAB);
driver.get("https://example.com/help");
driver.close();
driver.switchTo().window(originalHandle);
```

? driver.close() vs driver.quit() | E
`close()` closes the current window; the session stays alive if other windows are open. `quit()` closes all windows and ends the session, releasing the driver process. Always call `quit()` in teardown.

? navigate().to() vs get() | E
Both load a URL and wait for page load. `navigate()` also gives `back()`, `forward()` and `refresh()`, and keeps browser history semantics. Functionally `get(url)` and `navigate().to(url)` are equivalent.

? How do you handle cookies? | E
`driver.manage().getCookies()`, `getCookieNamed("session")`, `addCookie(new Cookie("token", value))`, `deleteCookieNamed`, `deleteAllCookies`. Adding an auth cookie lets you skip the login UI in tests (you must first open a page on that domain).

? How do you handle SSL certificate errors? | E
Set `options.setAcceptInsecureCerts(true)` on ChromeOptions/FirefoxOptions. Use only for test environments with self-signed certificates.

? How do you run tests in incognito, with a specific window size or a mobile emulation? | E
```
ChromeOptions o = new ChromeOptions();
o.addArguments("--incognito", "--window-size=1366,768");
o.setExperimentalOption("mobileEmulation", Map.of("deviceName", "Pixel 7"));
```

# group: Exceptions
? Common Selenium exceptions and causes | E
| Exception | Typical cause |
|---|---|
| NoSuchElementException | Wrong locator or element not loaded yet |
| ElementNotInteractableException | Element hidden or disabled |
| ElementClickInterceptedException | Another element (overlay, cookie banner) covers it |
| StaleElementReferenceException | DOM re-rendered after you found it |
| TimeoutException | Wait condition never met |
| NoSuchFrameException / NoSuchWindowException | Wrong frame or window handle |
| InvalidSelectorException | Syntax error in XPath/CSS |
| SessionNotCreatedException | Browser and driver versions mismatch |

? ElementClickInterceptedException: how do you fix it? | M
Find what covers the element (cookie banner, sticky header, loader). Close or wait for invisibility of the overlay, scroll the element to the centre, or wait for animations to finish. Use a JavaScript click only as a last resort and note why.

? How do you verify an element is NOT present? | M
Use `findElements(by).isEmpty()` with implicit wait set to 0 so it doesn't wait the full timeout, or `wait.until(ExpectedConditions.invisibilityOfElementLocated(by))`.

# group: Selenium 4 and BiDi
? What's new in Selenium 4? | E | recent
W3C protocol only; relative locators; new window/tab API; element screenshots; `getDomProperty`/`getDomAttribute`; CDP access for Chromium; BiDi APIs; redesigned Grid with Docker and Kubernetes support and observability; Selenium Manager for automatic driver management; deprecated `DesiredCapabilities` in favour of browser Options.

? What is WebDriver BiDi? | H | recent
A new W3C bidirectional protocol (over WebSocket) that lets tests subscribe to browser events: console logs, JavaScript errors, network requests and responses, and intercept or modify requests, across browsers. It replaces Chromium-only CDP features in a standard way. Selenium 4 exposes it through `BiDi` and `Network`/`LogInspector` classes.

? How do you capture console errors and network calls in Selenium? | M | recent
With BiDi (cross-browser):
```
try (LogInspector logs = new LogInspector(driver)) {
  logs.onJavaScriptException(e -> errors.add(e.getText()));
  driver.get(url);
}
```
On Chromium you can use DevTools: `devTools.send(Network.enable(...))` and listen to `Network.responseReceived()`. Fail the test if unexpected JS errors appear.

? How do you mock geolocation or network conditions? | M
Chromium CDP: `devTools.send(Emulation.setGeolocationOverride(...))`, `Network.emulateNetworkConditions(...)` for offline or slow 3G. Useful to test location-based features and loading states.

? How do you run Selenium on Grid with Docker? | M
```
docker run -d -p 4444:4444 --shm-size=2g selenium/standalone-chrome
```
Then `new RemoteWebDriver(new URL("http://localhost:4444"), new ChromeOptions())`. For many browsers use `docker-compose` with a hub and nodes, or the dynamic Grid which starts containers per session. Selenium also provides Helm charts for Kubernetes.

? What is Selenium Manager? | E | recent
Built into Selenium since 4.6 (GA in 4.11). It detects the installed browser, downloads the matching driver (and even the browser via Chrome for Testing) and caches it. You no longer need `System.setProperty("webdriver.chrome.driver", ...)` or the WebDriverManager library.

? Headless mode: when should you use it? | E
In CI for speed and when no display is available. Use `--headless=new` in Chrome (the new headless mode is the real browser, so behaviour matches headed). Debug failures headed, and remember some sites detect headless mode.

# group: Framework and design
? Page Factory vs POM: which do you prefer? | M
Page Factory uses `@FindBy` with `PageFactory.initElements` and lazy proxies. It reduces boilerplate but caches elements (stale issues with `@CacheLookup`) and hides waits. Many teams now prefer plain POM with `By` locators and explicit waits in a base page. Selenium docs also discourage Page Factory.

? What goes into a BasePage class? | M
Shared driver and wait, generic helpers (`click(By)`, `type(By, text)`, `waitForVisible`, `isDisplayed`, `scrollTo`), common components (header, toast messages), and screenshot helpers. Keep business actions in page classes and assertions in tests.

? Fluent page objects (method chaining) | M
Each action returns a page object so tests read as a flow:
```
new LoginPage(driver).open()
    .loginAs("qa1", "secret")
    .searchFor("laptop")
    .addFirstResultToCart();
```
Return `this` for actions on the same page and the next page object when navigation happens.

? Screenplay pattern vs Page Object | H
Screenplay models **actors** with **abilities** (browse the web, call an API) performing **tasks** made of **interactions**, and asking **questions**. It scales better for large suites and shared tasks, but is more abstract. Serenity BDD implements it. Page Object is simpler and enough for most teams.

? How do you take a screenshot on failure in TestNG? | M
Implement `ITestListener.onTestFailure`, get the driver from the test instance or ThreadLocal, capture a screenshot and attach it to the report (Allure `Allure.addAttachment`, Extent `addScreenCaptureFromBase64String`). Register the listener in `testng.xml` or with `@Listeners`.

? How do you retry failed tests? | M
TestNG: implement `IRetryAnalyzer` (retry N times) and attach with `@Test(retryAnalyzer=...)` or globally via `IAnnotationTransformer`. JUnit 5: `@RetryingTest` from JUnit Pioneer. Retries hide flakiness, so record retried tests and fix them.

? How do you run tests on multiple browsers? | M
Parameterise browser via `testng.xml` `<parameter name="browser" value="firefox"/>`, a system property `-Dbrowser=edge`, or a data provider. A driver factory creates the right driver; on Grid set the browser in Options. Run browsers in parallel with separate `<test>` tags.

? How do you handle environment config (URLs, users) in Selenium projects? | E
Properties or YAML files per environment (`qa.properties`, `stage.properties`) selected by `-Denv=qa`, with secrets from environment variables or a vault, never committed. Load once in a Config singleton.

? What is Selenium IDE useful for today? | E
Quick reproduction of bugs, prototyping, and teaching. It supports control flow and can export to code, but recorded tests are brittle and not suitable for a maintainable suite.

? How do you test a CAPTCHA? | M
You shouldn't automate solving it. Ask devs to disable CAPTCHA in test environments, use a test key (Google reCAPTCHA provides test keys that always pass), or whitelist test IPs. Test the CAPTCHA itself manually.

? How do you handle OTP in automation? | M
Use a test environment bypass or fixed OTP, read the OTP from a test mail/SMS service API (Mailosaur, MailSlurp, Twilio test numbers), or fetch it from the DB/API. Never automate against a personal phone.

? Can Selenium test mobile apps or desktop apps? | E
Not directly. Mobile apps use **Appium**, which implements the WebDriver protocol for iOS and Android. Windows desktop apps can use WinAppDriver/Appium Windows driver. Selenium itself is browser-only, including mobile browsers via Appium.

? Can Selenium do API testing or performance testing? | E
No. Selenium drives browsers only. Use Rest Assured/Postman for APIs and JMeter/k6/Gatling for load. Running many Selenium browsers is not a valid load test.

# group: Recent interview topics
? Selenium vs Playwright in 2026: why are teams still on Selenium? | M | recent
Large existing Java suites, broad language support, real Safari via safaridriver, vendor cloud integrations and the W3C standard. Playwright wins on speed, auto-waiting and tooling for new projects. A strong answer is pragmatic: keep Selenium where it works, use Playwright for new UI work, and push most coverage to API tests regardless.

? How do you reduce Selenium suite execution time? | M | recent
Run in parallel (TestNG/JUnit + Grid or cloud), use headless mode, log in via API or cookies instead of UI, create test data via API, remove redundant UI tests that duplicate API coverage, avoid `Thread.sleep`, tag suites (smoke vs full), and shard across CI agents.

? How do you make locators resilient to UI redesigns? | M | recent
Agree on `data-testid` attributes, use accessible attributes (`aria-label`, role and name), avoid layout-dependent paths and indexes, keep locators in one place (page objects), and add visual or contract tests so redesigns are caught consistently.

# group: Hard concepts
? Why is mixing implicit and explicit waits dangerous? | H | concept
An explicit wait polls `findElement`, and every poll is itself delayed by the implicit wait. With implicit 10 s and explicit 15 s, a missing element can take 20+ s or exactly the wrong time, because the timeouts interact differently in each driver. Selenium docs explicitly warn against mixing them. Set implicit wait to 0 and use explicit waits everywhere.

? How does StaleElementReferenceException really happen? | H | concept
A `WebElement` is a reference to a specific DOM node in a specific document. Frameworks such as React re-render by replacing nodes, so the node you found is detached even though an identical-looking one exists. Any call on the old reference throws. Fix by keeping `By` locators and re-finding at use time, waiting for the re-render to finish (`stalenessOf(old)` then find again) or wrapping actions in a short retry that re-locates.

? Thread safety in parallel Selenium runs | H | concept
Problems appear when drivers, page objects, reports or test data are shared through static fields. Use `ThreadLocal<WebDriver>` (or dependency injection per test), create page objects per test, make report loggers thread-aware, generate unique data per thread, and ensure `@BeforeMethod`/`@AfterMethod` create and quit the driver per test. Run with `parallel="methods"` only when every test is fully independent.

? How do you design a driver factory? | H | concept
A factory reads config (browser, headless, remote URL, cloud capabilities) and returns a configured `WebDriver`, hiding the creation details from tests:
```
public static WebDriver create(Config c) {
  MutableCapabilities opts = switch (c.browser()) {
    case "firefox" -> new FirefoxOptions();
    case "edge" -> new EdgeOptions();
    default -> new ChromeOptions();
  };
  if (c.remote()) return new RemoteWebDriver(c.gridUrl(), opts);
  return switch (c.browser()) {
    case "firefox" -> new FirefoxDriver((FirefoxOptions) opts);
    case "edge" -> new EdgeDriver((EdgeOptions) opts);
    default -> new ChromeDriver((ChromeOptions) opts);
  };
}
```
Store the result in a ThreadLocal manager.

? Shadow DOM and iframes together | H | concept
Shadow roots and iframes are separate scopes. For an element inside a shadow root inside an iframe: switch to the frame first, then get the shadow host, call `getShadowRoot()`, and search with CSS (XPath is not supported in a shadow root). Closed shadow roots can't be accessed by WebDriver; ask developers for test hooks.

? How do you test a site that detects automation? | H | concept
Sites check `navigator.webdriver`, headless user agents and behaviour patterns. For your own product, ask for an allowlist or test flag in non-production environments. Don't try to evade bot protection on sites you don't own: it violates terms and it's not a testing goal.

# group: More practical questions
? isDisplayed() vs isEnabled() vs isSelected() | E
`isDisplayed()`: visible on the page. `isEnabled()`: can be interacted with (not `disabled`). `isSelected()`: checkbox, radio or option is checked/selected. `isDisplayed()` throws NoSuchElementException if the element doesn't exist, so combine with `findElements` for absence checks.

? How do you handle checkboxes and radio buttons? | E
Check state with `isSelected()` before clicking so the action is idempotent: `if (!box.isSelected()) box.click();`. For radio groups, locate by value or label text, then assert only one is selected.

? submit() vs click() | E
`submit()` submits the form the element belongs to (works only inside a `<form>`). `click()` simulates a user click and triggers JavaScript handlers. Prefer `click()` on the actual submit button because it matches user behaviour.

? sendKeys alternatives when typing doesn't work | M
Clear first with `clear()` or `Keys.chord(Keys.CONTROL, "a")` + `Keys.DELETE` (React inputs sometimes ignore `clear()`), type slowly for masked inputs, or set the value with JavaScript and dispatch an `input` event. Verify the value afterwards.

? How do you press keyboard keys like Enter, Tab or Ctrl+A? | E
`element.sendKeys(Keys.ENTER)`, `Keys.TAB`, `Keys.chord(Keys.CONTROL, "a")`. For key combos on the page, use Actions: `new Actions(d).keyDown(Keys.CONTROL).sendKeys("c").keyUp(Keys.CONTROL).perform()`. Use `Keys.COMMAND` on macOS.

? How do you get all links or all options and verify them? | E
`driver.findElements(By.tagName("a"))`, map to `getAttribute("href")` or text with streams, then assert against an expected list or check each URL's status with an HTTP client.

? How do you handle a hover menu? | E
`new Actions(driver).moveToElement(menu).perform();` then wait for the submenu item to be visible and click it. If the menu closes too fast, chain `moveToElement(menu).moveToElement(item).click().perform()`.

? How do you perform drag and drop when dragAndDrop() doesn't work? | M
HTML5 drag and drop often ignores WebDriver's synthetic mouse events. Try `clickAndHold(src).moveByOffset(5,5).moveToElement(target).release().perform()`. If it still fails, use a JavaScript helper that dispatches `dragstart`, `dragover` and `drop` events, or switch to Playwright's `dragTo` which handles HTML5 DnD.

? How do you verify a tooltip? | E
Hover with Actions, then read the tooltip element's text. If it's a native tooltip from the `title` attribute, read `getAttribute("title")` instead; native tooltips aren't in the DOM.

? How do you verify broken images? | M
For each `<img>`, check with JavaScript `arguments[0].naturalWidth > 0` and `complete`, or request the `src` with an HTTP client and check for 200. A broken image has naturalWidth 0.

? How do you count elements and verify sorting in a table column? | M
Read the column into a list, copy and sort it, then compare:
```
List<String> names = driver.findElements(By.cssSelector("td.name"))
    .stream().map(WebElement::getText).toList();
List<String> sorted = new ArrayList<>(names); Collections.sort(sorted);
assertEquals(names, sorted);
```
Parse numbers and dates before comparing.

? How do you handle a new window that opens after a click without knowing its handle? | M
Store handles before the click, click, wait for `numberOfWindowsToBe(n+1)`, then switch to the handle not in the original set:
```
Set<String> before = driver.getWindowHandles();
link.click();
wait.until(ExpectedConditions.numberOfWindowsToBe(before.size() + 1));
String newH = driver.getWindowHandles().stream()
    .filter(h -> !before.contains(h)).findFirst().orElseThrow();
driver.switchTo().window(newH);
```

? Nested frames | M
Switch frame by frame from the top: `switchTo().frame("outer")` then `frame("inner")`. `switchTo().parentFrame()` goes up one level and `defaultContent()` returns to the main document.

? How do you handle JavaScript alerts, confirms and prompts? | E
`Alert a = driver.switchTo().alert();` then `a.getText()`, `a.accept()`, `a.dismiss()`, and for prompts `a.sendKeys("text")`. Wait with `alertIsPresent()` first. Unexpected alerts throw `UnhandledAlertException`; set `unhandledPromptBehavior` in capabilities if needed.

? How do you read browser console logs? | M
With BiDi `LogInspector` (cross-browser) or, for Chrome, `driver.manage().logs().get(LogType.BROWSER)` when logging prefs are enabled. Assert that no severe errors appear during critical flows.

? How do you validate page title and URL? | E
`driver.getTitle()` and `driver.getCurrentUrl()`. After navigation, wait with `ExpectedConditions.titleContains(...)` or `urlContains(...)` before asserting.

? How do you maximise the window and set its size? | E
`driver.manage().window().maximize()`, `setSize(new Dimension(1366, 768))`, `fullscreen()`. In headless mode, set the window size explicitly because maximise may have no effect.

? How do you run JavaScript that returns a value? | E
```
Long height = (Long) ((JavascriptExecutor) driver)
    .executeScript("return document.body.scrollHeight");
```
Numbers come back as `Long` or `Double`, objects as `Map`, arrays as `List`.

? How do you scroll inside a specific container (not the window)? | M
Use JavaScript on the container: `arguments[0].scrollTop = arguments[0].scrollHeight`, or Actions `scrollFromOrigin(ScrollOrigin.fromElement(container), 0, 300)` in Selenium 4.

? How do you check if a page has fully loaded in an SPA? | M
`readyState` is `complete` almost immediately in SPAs, so it's not enough. Wait for a stable UI signal: the main content's unique element, spinner invisible, or a specific API response via BiDi network events.

? What is the difference between WebDriver, RemoteWebDriver and ChromeDriver? | M
`WebDriver` is the interface. `RemoteWebDriver` implements it by talking to a remote endpoint (Grid or cloud). `ChromeDriver` extends `ChromiumDriver`, which extends `RemoteWebDriver`, and starts a local chromedriver service. Code against `WebDriver` so the implementation can be swapped.

? Why does `WebDriver driver = new ChromeDriver()` use upcasting? | E
It programs to the interface: tests depend on `WebDriver`, so the same code runs on Chrome, Firefox or remote browsers. It's runtime polymorphism; you cast only when you need browser-specific features like `HasDevTools`.

? How do you integrate Selenium with a cloud grid such as BrowserStack? | M
Create `RemoteWebDriver` with the vendor hub URL and set vendor capabilities (`bstack:options` with OS, browser version, build name) along with standard Options. Credentials come from environment variables. Mark the session as passed or failed through the vendor's JavaScript executor or API.

? How do you test responsive design with Selenium? | M
Run the same tests at different window sizes (mobile, tablet, desktop) or with Chrome mobile emulation, and assert layout-specific behaviour: hamburger menu visible, columns stacked. Combine with visual testing tools for pixel-level checks.

? What is visual testing and how do you add it to Selenium? | M | recent
Comparing screenshots against approved baselines to catch layout and styling regressions that functional assertions miss. Tools: Applitools Eyes (AI-based comparison), Percy, or open-source AShot with image diffs. Mask dynamic regions such as dates and ads to avoid false failures.

? How do you test accessibility with Selenium? | M | recent
Inject axe-core with the `axe-core/selenium` Java library and assert there are no violations of the chosen WCAG tags:
```
Results r = new AxeBuilder().withTags(List.of("wcag2a", "wcag2aa")).analyze(driver);
assertTrue(r.getViolations().isEmpty(), r.getViolations().toString());
```

? How do you handle a stale element inside a loop over rows? | M
Don't hold a list of WebElements if the table re-renders after each action. Loop by index and re-find each row inside the loop (`findElements(rowsBy).get(i)`), or collect IDs first and then act by locator built from the ID.

? What is the Selenium WebDriver architecture in Selenium 3 vs 4? | M
Selenium 3 used the JSON Wire Protocol, with an extra translation layer to W3C for some drivers. Selenium 4 speaks W3C WebDriver directly, so commands behave more consistently across browsers and capabilities follow the standard (`browserName`, `browserVersion`, `platformName`, vendor prefixes like `goog:chromeOptions`).
