# group: Basics
? How do you set up a Karate project? | E
Add the `io.karatelabs:karate-junit5` dependency (current group ID; older projects use `com.intuit.karate`), put `.feature` files and `karate-config.js` under `src/test/java` (or resources), and add a JUnit 5 runner class. A Maven archetype `karate-archetype` generates the skeleton.

? Karate keywords: Given, When, Then, And, * | E
They are only for readability; Karate doesn't map them to step definitions. `*` can replace any of them. What matters is the keyword after: `url`, `path`, `request`, `method`, `status`, `match`, `def`, etc.

? Core Karate keywords | E
`url`, `path`, `param`, `params`, `header`, `headers`, `cookie`, `form field`, `multipart file`, `request`, `method`, `status`, `match`, `assert`, `def`, `set`, `remove`, `print`, `call`, `callonce`, `read`, `configure`, `retry until`, `eval`, `table`, `text`, `yaml`, `csv`.

? def vs set vs remove | E
`* def user = { name: 'Asha' }` creates a variable. `* set user.address.city = 'Pune'` changes or adds a nested value. `* remove user.address` deletes a key. `set` also supports tables for bulk changes.

? How do you add query parameters? | E
`* param status = 'PAID'` or `* params { status: 'PAID', page: 2 }`. Multiple values: `* param status = ['PAID', 'SHIPPED']`.

? How do you send headers and configure headers globally? | E
`* header Authorization = 'Bearer ' + token`, `* headers { Accept: 'application/json' }`. For every request in a feature or globally: `* configure headers = { 'X-Tenant': 'acme' }` or a JS function that computes headers per request.

? What does the response variable contain? | E
After `method`, Karate sets `response` (parsed JSON/XML or string), `responseStatus`, `responseHeaders`, `responseCookies`, `responseTime`, `responseType`, and `responseBytes`.

? How do you print values for debugging? | E
`* print response`, `* print 'user id:', userId`, or `karate.log(...)` in JS. Output appears in the console and in the HTML report.

? What is the Background section used for? | E
Steps that run before **each** Scenario in the feature: base URL, auth header, common variables. Expensive one-time setup belongs in `callonce` or `karate.callSingle`, not plain Background steps.

? How do you write multi-line JSON payloads? | E
Use docstrings:
```
* def payload =
  """
  {
    "name": "Asha",
    "items": [ { "sku": "A1", "qty": 2 } ]
  }
  """
```
Karate parses JSON in docstrings automatically.

? How do you read data from files? | E
`* def user = read('classpath:data/user.json')`, also CSV (returns a list of objects), YAML, XML, text, JS functions and other feature files. Relative paths resolve from the current feature file; `classpath:` from the classpath root.

? Embedded expressions #() | M
Inside JSON, `#(expr)` inserts a variable or expression:
```
* def name = 'Asha'
* def body = { name: '#(name)', id: '#(1 + 1)', tags: '#(tagList)' }
```
`##(expr)` removes the key if the value is null, useful for optional fields.

? How do you send form data and multipart files? | E
```
* form field grant_type = 'client_credentials'
* method post

* multipart file file = { read: 'invoice.pdf', filename: 'invoice.pdf', contentType: 'application/pdf' }
* multipart field meta = { type: 'invoice' }
* method post
```

? How do you handle XML in Karate? | M
XML is a first-class type: `* def xml = <order><id>1</id></order>`, send with `request xml`, match with XPath: `* match /order/id == '1'` or `* match response/order/status == 'OK'`. Convert with `karate.toJson(xml)` if needed.

# group: Matching
? match vs assert | E
`match` is for comparing JSON/XML/strings with great failure messages and fuzzy markers. `assert` evaluates a JavaScript boolean expression (`* assert responseTime < 2000`). Prefer `match` for data checks.

? match contains deep and contains only deep | H
`contains` checks a subset at the top level. `contains deep` checks nested objects/arrays recursively as subsets. `contains only` requires all elements present in any order; `contains only deep` applies this recursively. Useful for large responses where you care about some nested values.

? How do you match arrays in any order? | M
`* match response.tags contains only ['qa', 'api']` (any order, exact set). `* match response.tags contains ['qa']` for a subset, `contains any` for at least one, `!contains` for none.

? Validate an array length | E
`* match response.items == '#[3]'` exactly 3, `'#[_ > 0]'` non-empty, `'#[] #string'` every element is a string, `* assert response.items.length == 3`.

? Self-validation expressions with _ and $ | M
`_` is the current value; `$` is the root of the JSON being matched:
```
* match response == { min: '#number', max: '#? _ >= $.min', avg: '#? _ >= $.min && _ <= $.max' }
```

? How do you ignore dynamic fields when matching full payloads? | E
Use `#ignore` for fields to skip and markers like `#notnull`, `#uuid` or `#regex` for dynamic values. Then you can match the entire response with `==` and still be strict about structure.

? Match one field with a regex | E
`* match response.orderId == '#regex ORD-[0-9]{6}'`. The regex must match the whole string.

? Match each with conditional logic | M
```
* match each response.users contains { status: '#? _ == "ACTIVE" || _ == "PENDING"' }
* def paid = karate.filter(response.orders, x => x.status == 'PAID')
* match each paid == { status: 'PAID', amount: '#? _ > 0' }
```

? Match headers and status | E
`* status 201`, `* match responseHeaders['Content-Type'][0] contains 'application/json'`, or the `header` match shortcut: `* match header Content-Type contains 'json'`.

? How do you compare two JSON files ignoring order? | M
`* match actual contains only expected` for arrays, or `contains only deep` for nested data, with `#ignore` markers for dynamic fields in the expected file.

# group: Data, reuse and JavaScript
? How do you write JavaScript functions in Karate? | E
```
* def uuid = function(){ return java.util.UUID.randomUUID() + '' }
* def email = 'qa+' + uuid() + '@example.com'
```
Or put functions in `.js` files and `read()` them. Karate uses the GraalVM JS engine (ES6 supported).

? Common karate.* helpers | M
`karate.env`, `karate.call`, `karate.callSingle`, `karate.read`, `karate.filter`, `karate.map`, `karate.forEach`, `karate.jsonPath`, `karate.match`, `karate.get`, `karate.set`, `karate.remove`, `karate.log`, `karate.abort`, `karate.fail`, `karate.toJson`, `karate.merge`, `karate.append`, `karate.properties`.

? How do you pass parameters to a called feature and get results back? | M
`* def result = call read('create-user.feature') { name: 'Asha' }`. Inside the called feature, the argument keys are variables (`name`) and the whole object is `__arg`. All variables defined there are returned in `result` (e.g. `result.userId`).

? Shared scope vs isolated scope in call | H
`* def r = call read('x.feature')` runs in an isolated scope; variables come back only through `r`. `* call read('x.feature')` without assignment uses shared scope: variables and configured headers from the called feature leak into the caller. Shared scope is handy for setting auth headers, risky otherwise.

? Call a feature once per item in an array (data-driven call loop) | M
`* def results = call read('create-user.feature') users` where `users` is a JSON array: Karate calls the feature once per element and returns an array of results.

? Dynamic Scenario Outline | H | recent
The Examples table can come from an expression evaluated in the Background:
```
Background:
  * def users = read('users.json')

Scenario Outline: create <name>
  * request __row
  ...
  Examples:
    | users |
```
Each element of the array becomes a row; `__row` and `__num` give the row and index.

? Tags in Karate | E
`@smoke`, `@regression`, `@ignore` on features or scenarios. Run with `-Dkarate.options="--tags @smoke"` or `.tags("@smoke", "~@ignore")` in the runner. `@ignore` excludes features meant only to be called.

? How do you configure environments? | E
`karate-config.js` switches on `karate.env`; you can also add `karate-config-qa.js` which is merged after the base config. Pass `-Dkarate.env=qa` on the command line.

? How do you share an auth token across all tests (once per run)? | M | recent
In `karate-config.js`:
```
var auth = karate.callSingle('classpath:auth/token.feature', config);
config.token = auth.token;
```
`callSingle` runs once even across parallel threads and caches the result. Use `karate.callSingle` with a cache option to persist across runs during development.

? How do you configure retries until a condition? | M
```
* configure retry = { count: 10, interval: 2000 }
Given path 'jobs', jobId
And retry until response.status == 'DONE'
When method get
```
The `retry until` line must come before `method`.

? How do you use Java code from Karate (and why)? | M
`Java.type('com.acme.DbUtils')` for static methods or `new` for instances: DB checks, encryption, JWT signing, complex data generation, reading Excel. Keep business assertions in features; use Java for utilities.

? How do you query a database in Karate? | M
Write a small Java helper with JDBC (or use Spring JdbcTemplate) and call it:
```
* def Db = Java.type('com.acme.Db')
* def rows = Db.query("select status from orders where id = ?", orderId)
* match rows[0].STATUS == 'PAID'
```

? How do you handle conditional logic in a feature? | M
Use JS expressions: `* if (responseStatus == 404) karate.call('create.feature')`, `* def x = cond ? 'a' : 'b'`, or `karate.abort()` to skip the rest. Keep logic minimal; complex branching belongs in Java/JS helpers.

? How do you generate random test data? | E
JS: `Math.floor(Math.random() * 1000)`, `java.util.UUID.randomUUID()`, or a Java helper using JavaFaker/Datafaker for names, addresses and phone numbers.

? configure ssl, proxy, timeouts | E
`* configure ssl = true` (trust all), `* configure proxy = 'http://proxy:8080'`, `* configure connectTimeout = 5000`, `* configure readTimeout = 10000`, `* configure followRedirects = false`.

? configure afterScenario and afterFeature hooks | M
```
* configure afterScenario = function(){ karate.call('cleanup.feature', { id: orderId }) }
```
Use them for cleanup and logging. Global before hooks are done with `callSingle` in config.

# group: Running and reporting
? How do you run Karate from Maven and the command line? | E
`mvn test -Dtest=ApiRunner -Dkarate.env=qa -Dkarate.options="--tags @smoke classpath:features/orders"`. The standalone JAR (`karate.jar`) can run features without Maven.

? Write a JUnit 5 runner for one feature during development | E
```
class OrdersTest {
  @Karate.Test
  Karate orders() { return Karate.run("orders").relativeTo(getClass()); }
}
```
Use the parallel `Runner` for CI and `@Karate.Test` for running single features from the IDE.

? Karate HTML reports and Cucumber JSON | E
Karate generates its own HTML report in `target/karate-reports` with request/response details. For dashboards, enable `.outputCucumberJson(true)` and feed it to the `cucumber-reporting` library or Allure.

? How do you integrate Karate in Jenkins or GitHub Actions? | E
Run `mvn test` with environment and tags as parameters, publish JUnit XML from `target/karate-reports` and archive the HTML report. Fail the build on failures; use tags for smoke vs regression jobs.

? What is the Karate debugger and VS Code extension? | M
The Karate extension for VS Code/IntelliJ runs features with a debug server: breakpoints on steps, inspecting variables, and step-back. It makes debugging feature files much easier than reading logs.

# group: Mocks, performance and UI
? Karate mocks (test doubles) | M
A mock is a feature file with `Scenario: pathMatches('/rates/{ccy}') && methodIs('get')` blocks that define responses. Start it with `karate.start('mock.feature')` or the standalone JAR. Useful to stand in for partner APIs and to run consumer tests.

? Karate Gatling for performance testing | M
Reuse functional feature files as load scenarios in a Gatling simulation:
```
val orders = scenario("orders").exec(karateFeature("classpath:orders.feature"))
setUp(orders.inject(rampUsers(100).during(60))).protocols(karateProtocol())
```
You get Gatling reports with Karate's readable scenarios.

? Karate UI automation basics | M
`* configure driver = { type: 'chrome' }`, then `* driver 'https://app'`, `* input('#email', 'a@b.c')`, `* click('button[type=submit]')`, `* waitFor('.dashboard')`, `* match text('h1') == 'Welcome'`. It supports Chrome DevTools, WebDriver and Playwright backends. Most teams still prefer Playwright or Selenium for UI.

? Can you mix API and UI steps in one Karate test? | M
Yes: create data via API, then verify in the UI in the same scenario, or capture a token in UI and use it in API calls. This hybrid style is one of Karate's selling points.

# group: Recent interview topics
? Why do teams choose Karate in 2026? | M | recent
Fast onboarding for non-Java testers, powerful built-in JSON matching that removes most assertion code, parallel execution and reports out of the box, and one tool for API, mocks and performance. Trade-offs: weaker IDE refactoring and type safety compared with Rest Assured, and complex logic gets awkward in feature files.

? How do you keep a large Karate suite maintainable? | M | recent
Reusable called features for common flows (auth, create user), shared JS/Java helpers, data in JSON files, consistent folder structure per domain, tags for suites, `@ignore` on helper features, schema files for reuse, and code reviews for feature files just like code.

? Karate vs Cucumber: the most common confusion | E | recent
Both use Gherkin syntax, but Cucumber needs step definitions written in code for every step, while Karate's steps are built-in keywords. Karate is not Cucumber-based anymore (since 0.9) and doesn't need glue code.

# group: Hard concepts
? How Karate executes in parallel and what breaks it | H | concept
The parallel runner runs **scenarios** concurrently on a thread pool. Each scenario has its own variables, so most suites parallelise safely. Problems arise with shared external state (same test user or record used by many scenarios), `callonce` being per-feature, and Java helpers with static mutable state. Use `callSingle` for shared setup, unique data per scenario, and `@parallel=false` on features that must run serially.

? callonce vs callSingle vs Background | H | concept
- **Background**: runs before every scenario in the feature.
- **callonce**: runs once per feature (per thread, cached for the feature's scenarios).
- **karate.callSingle**: runs once for the entire test run across all features and threads, typically from `karate-config.js`.

Pick the narrowest one that avoids repeated expensive setup.

? Schema validation with reusable and nested schemas | H | concept
```
* def item = { sku: '#string', qty: '#number', price: '#? _ > 0' }
* def order = { id: '#uuid', items: '#[] item', coupon: '##string', total: '#number' }
* match response == order
* match each response.orders == order
```
`#[] item` validates every array element against `item`; `##` makes a key optional; schemas can live in JSON files and be `read()` and reused across features.

? JSON transforms with karate.map and karate.filter | H | concept
```
* def names = karate.map(response.users, x => x.name)
* def admins = karate.filter(response.users, x => x.role == 'ADMIN')
* def byId = {}
* karate.forEach(response.users, x => byId[x.id] = x)
* match names contains 'Asha'
```
These avoid loops in feature files and keep transformations readable.

? Contract-style consumer tests with Karate mocks | H | concept
The consumer team writes a Karate mock of the provider from the agreed contract and runs its tests against it. The provider team runs a Karate feature (the "contract test") against the real provider to prove it satisfies the same request/response pairs. Both share the feature files in a repo. It's lighter than Pact but without a broker or versioning.

# group: More Karate questions
? How do you do a GET with path segments? | E
`Given path 'users', userId, 'orders'` builds `/users/7/orders`. Each comma-separated value is URL-encoded. `path` appends to `url`.

? request vs form field vs multipart | E
`request` sets the raw body (JSON, XML, string). `form field` builds `application/x-www-form-urlencoded`. `multipart field/file` builds `multipart/form-data`. Don't mix them in one call.

? How do you check response time? | E
`* assert responseTime < 2000`. Karate also shows timings per request in the HTML report.

? How do you extract a value with JsonPath? | E
`* def ids = $..id` (all ids anywhere), `* def paid = $.orders[?(@.status=='PAID')]`, or `karate.jsonPath(response, "$.orders[*].id")`. Karate supports both JS dot notation and JsonPath.

? How do you use a CSV as test data? | E
`* def rows = read('logins.csv')` returns an array of objects with header names as keys; use it in a dynamic Scenario Outline or a call loop.

? How do you use YAML in Karate? | E
`* def config = read('data.yaml')` or inline with the `yaml` keyword. It's converted to JSON, useful for readable test data.

? text and table keywords | M
`text` defines a raw string without JSON parsing (e.g. GraphQL queries). `table` builds an array of JSON objects from a Gherkin table:
```
* table users
  | name   | age |
  | 'Asha' | 29  |
  | 'Ravi' | 31  |
```
Values are expressions, so strings need quotes.

? How do you test GraphQL with Karate? | M
```
* text query =
  """
  query($id: ID!) { user(id: $id) { name orders { id } } }
  """
* request { query: '#(query)', variables: { id: '7' } }
* method post
* match response.errors == '#notpresent'
* match response.data.user.name == 'Asha'
```

? How do you test SOAP with Karate? | M
Set `request` to the SOAP envelope XML, add a `SOAPAction` header (or use `soap action 'name'`), then match with XPath. Karate handles XML namespaces in matches.

? How do you handle cookies between calls? | E
Karate keeps cookies automatically within a scenario like a browser. Read them with `responseCookies.session.value`, set with `* cookie session = 'abc'`, and reset with `* configure cookies = null`.

? How do you call another feature with a specific scenario only? | M
Tag the scenario and use `call read('helpers.feature@createUser')`. Calling by tag lets one helper file hold several reusable scenarios.

? karate.abort vs karate.fail | E
`karate.abort()` stops the scenario and marks it passed/skipped (useful for conditional skips). `karate.fail('message')` fails it with a custom message.

? How do you generate a JWT or HMAC signature in Karate? | H
Write a Java helper using a JWT library (jjwt, Nimbus) or `javax.crypto.Mac` for HMAC, then call it: `* def sig = Signer.hmac(secret, body)` and set the header. Karate's JS engine doesn't have crypto built in.

? How do you validate against an external JSON Schema (draft) file? | H
Karate's fuzzy schemas are its own format. For standard JSON Schema files, call a Java validator (e.g. networknt json-schema-validator) through `Java.type`, or convert the schema to Karate markers. Interviewers like hearing both options.

? How do you handle dates in Karate? | M
Use Java: `* def LocalDate = Java.type('java.time.LocalDate')` then `LocalDate.now().plusDays(7).toString()`. For format checks use `#regex \\d{4}-\\d{2}-\\d{2}`.

? How do you write custom match functions? | M
Define a JS function and use it in a self-validation marker: `* def isSorted = function(a){ for (var i=1;i<a.length;i++) if (a[i-1] > a[i]) return false; return true }` then `* match response.prices == '#? isSorted(_)'`.

? How do you test pagination in Karate? | M
Use a JS loop with `karate.call` per page, or a recursive called feature, accumulating ids and asserting no duplicates and the total count. Alternatively use `retry until` style loops for cursor tokens.

? How do you skip SSL verification for a single call? | E
`* configure ssl = true` before the call in that scenario; configure applies to subsequent requests in the scenario.

? What files does a typical Karate project contain? | E
`karate-config.js`, env-specific config files, feature files grouped by domain, a runner class, `logback-test.xml` for logging levels, data and schema folders, helper features tagged `@ignore`, and Java utilities under `src/test/java`.

? How do you reduce log noise in Karate? | E
Set log levels in `logback-test.xml` (e.g. `com.intuit` or `com.intuit.karate` at INFO or WARN), and `* configure logPrettyRequest/logPrettyResponse` as needed. Use `* configure report = { showLog: true, showAllSteps: false }` to control the report.

? How do you mask secrets in Karate logs? | M | recent
Implement `HttpLogModifier` in Java to mask headers or body fields and set `* configure logModifier = Java.type('com.acme.MaskingModifier')` (or in config). Never print tokens with `print`.

? How do you run Karate tests against a Docker-compose environment? | M
Start services with `docker compose up -d`, wait for health, pass the base URL through `-Dkarate.env=ci` or a system property read in `karate-config.js`, run tests, then collect reports and tear down.

? What is the difference between url and path? | E
`url` sets the base URL (often from config); `path` adds segments for the current request and resets after each request. Setting `url` mid-scenario changes the base for subsequent calls.

? Can Karate test Kafka or other non-HTTP systems? | H | recent
Not natively in the open-source version; you call Java helpers that produce/consume messages, or use Karate Labs' commercial Kafka support. Many teams combine Karate for HTTP checks with Java helpers for async verification.

? How do you write reusable assertions across features? | M
Put schemas and matcher functions in JSON/JS files and `read()` them, or create small `@ignore` features that take a response and perform common matches, called with `call read('assert-error.feature') { res: response, field: 'email' }`.

? What is karate-config.js's return value used for? | E
Every key in the returned object becomes a global variable in every scenario (e.g. `baseUrl`, `token`, `users`). Keep it small and fast because it runs before every scenario (except work done via `callSingle`).

? How do you test an endpoint with a 30-second async job? | M
Use `retry until` with an interval and count matching the SLA, or a JS polling loop with `karate.call`. Fail with a clear message if the job never completes rather than relying on a long single timeout.

? How do you assert the order of items in an array? | E
`* match response.ids == [3, 2, 1]` checks exact order. For "sorted by date descending", extract and compare with a sorted copy in JS, or use a custom `#?` function.

? How do you handle very large responses efficiently? | H
Avoid printing them; match only the needed parts with JsonPath; use `contains` instead of full equality; and for files, use `responseBytes` and checksums rather than string comparisons.

? Interview task: write a feature to create, fetch and delete a user | M | recent
```
Feature: user lifecycle
Background:
  * url baseUrl
  * header Authorization = 'Bearer ' + token

Scenario: create, read, delete
  Given path 'users'
  And request { name: 'Asha', email: '#("qa+" + java.util.UUID.randomUUID() + "@ex.com")' }
  When method post
  Then status 201
  * def id = response.id
  Given path 'users', id
  When method get
  Then status 200
  And match response contains { id: '#(id)', name: 'Asha' }
  Given path 'users', id
  When method delete
  Then status 204
  Given path 'users', id
  When method get
  Then status 404
```

? How do you validate that a field is one of several values? | E
`* match response.status == '#? ["NEW","PAID","SHIPPED"].includes(_)'` or `* match ["NEW","PAID","SHIPPED"] contains response.status`.

? How do you merge JSON objects in Karate? | M
`* def full = karate.merge(defaults, overrides)` combines objects with later keys winning; `karate.append(list1, list2)` concatenates arrays. Useful for building payload variants from a base template.
