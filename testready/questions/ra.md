# group: Building requests
? What is Rest Assured? | E
A Java DSL for testing REST services. It makes HTTP calls and assertions readable with a `given()/when()/then()` syntax, supports JSON and XML parsing (GPath), serialization with Jackson/Gson, auth, filters, logging and schema validation. It plugs into JUnit or TestNG.

? Which Maven dependencies do you need? | E
```
<dependency>
  <groupId>io.rest-assured</groupId>
  <artifactId>rest-assured</artifactId>
  <version>5.5.0</version>
  <scope>test</scope>
</dependency>
<!-- optional -->
io.rest-assured:json-schema-validator
com.fasterxml.jackson.core:jackson-databind
org.testng:testng or org.junit.jupiter:junit-jupiter
```
Use static imports: `io.restassured.RestAssured.*`, `org.hamcrest.Matchers.*`.

? Explain given(), when(), then() | E
- `given()`: request setup (base URI, headers, params, auth, body, specs, logging).
- `when()`: the action (HTTP method and path).
- `then()`: validation of the response (status, headers, body, time), and `extract()` to pull values out.

It follows BDD style but is plain Java.

? How do you set a global base URI, base path and port? | E
```
RestAssured.baseURI = "https://api.example.com";
RestAssured.basePath = "/v1";
RestAssured.port = 443;
```
Better in large suites: use a `RequestSpecification` so different services and parallel tests don't share mutable static state.

? How do you send headers and cookies? | E
```
given().header("X-Tenant", "acme")
       .headers(Map.of("Accept", "application/json", "X-Trace", traceId))
       .cookie("session", sid)
```

? How do you send a JSON body: string, Map, POJO, file? | E
```
.body("{\"name\":\"Asha\"}")              // raw string
.body(Map.of("name", "Asha", "age", 29))  // Map → JSON via Jackson
.body(new User("Asha", 29))               // POJO
.body(new File("src/test/resources/user.json"))
```
Set `contentType(ContentType.JSON)` so the server parses it correctly.

? How do you build nested JSON with Jackson ObjectNode? | M
```
ObjectMapper m = new ObjectMapper();
ObjectNode root = m.createObjectNode();
root.put("orderId", "ORD-1");
ArrayNode items = root.putArray("items");
items.addObject().put("sku", "A1").put("qty", 2);
given().body(root.toString())...
```
Useful when you need to tweak a template payload per test.

? How do you read a JSON template and change one field? | M
Load the file into a `JsonNode` or `Map`, modify, and send:
```
Map<String, Object> body = mapper.readValue(new File("user.json"), Map.class);
body.put("email", "qa+" + System.currentTimeMillis() + "@example.com");
given().body(body).post("/users");
```

? How do you send form data and URL-encoded requests? | E
`given().contentType(ContentType.URLENC).formParam("grant_type", "client_credentials").formParam("scope", "orders").post("/oauth/token")`.

? How do you set timeouts in Rest Assured? | M
Via HTTP client config:
```
RestAssured.config = RestAssuredConfig.config().httpClient(
  HttpClientConfig.httpClientConfig()
    .setParam("http.connection.timeout", 5000)
    .setParam("http.socket.timeout", 10000));
```
Without timeouts, a hung service can block the whole suite.

? How do you call HTTPS endpoints with self-signed certificates? | M
`given().relaxedHTTPSValidation()` per request, or globally `RestAssured.useRelaxedHTTPSValidation()`. Only for test environments. For mutual TLS use `.keyStore("client.jks", "pass")` and `.trustStore(...)`.

? How do you use a proxy? | E
`RestAssured.proxy("proxy.corp", 8080)` or `given().proxy(host(...).withScheme("http"))`. Useful for routing tests through corporate proxies or tools like Burp/ZAP to inspect traffic.

? How do you send query parameters with multiple values? | E
`.queryParam("status", "PAID", "SHIPPED")` sends `status=PAID&status=SHIPPED`. Use `.queryParams(map)` for many params. Rest Assured URL-encodes values automatically; disable with `urlEncodingEnabled(false)` if the server expects raw values.

? How do you send an XML request and validate an XML response? | M
```
given().contentType(ContentType.XML).body(xmlString)
.when().post("/soap/orders")
.then().body("Envelope.Body.CreateOrderResponse.status", equalTo("OK"))
       .body(hasXPath("//status[text()='OK']"));
```
GPath works for XML too; validate against XSD with `matchesXsdInClasspath("order.xsd")`.

# group: Assertions and extraction
? How do you validate status code, status line and content type? | E
`.then().statusCode(200).statusLine(containsString("OK")).contentType(ContentType.JSON)`.

? How do you validate headers? | E
`.header("Location", matchesPattern(".*/users/\\d+")).header("Cache-Control", containsString("no-store"))`. Extract with `.extract().header("Location")`.

? How do you assert response time? | E
`.time(lessThan(2000L))` or `.time(lessThan(2L), TimeUnit.SECONDS)`. Extract with `.extract().time()`. This is a sanity guard, not a performance test.

? Common Hamcrest matchers in Rest Assured | E
`equalTo`, `not`, `notNullValue`, `nullValue`, `hasItem`, `hasItems`, `hasSize`, `empty`, `contains` (exact order), `containsInAnyOrder`, `containsString`, `startsWith`, `greaterThan`, `lessThanOrEqualTo`, `hasKey`, `hasEntry`, `anyOf`, `allOf`, `everyItem`, `matchesPattern`, `closeTo`.

? Validate every item in an array | M
```
.body("items.price", everyItem(greaterThan(0f)))
.body("items.status", everyItem(isOneOf("PAID", "SHIPPED")))
.body("items.findAll { it.qty > 5 }", hasSize(0))
```

? How do you validate root-level JSON arrays? | M
For `[{"id":1},{"id":2}]` use an empty path or `$`: `.body("size()", equalTo(2)).body("id", hasItems(1, 2)).body("[0].id", equalTo(1))`.

? How do you use rootPath to avoid repeating prefixes? | E
```
.then().rootPath("data.user")
   .body("name", equalTo("Asha"))
   .body("address.city", equalTo("Pune"))
   .noRootPath()
   .body("meta.version", equalTo(2));
```

? extract().path() vs extract().response() vs jsonPath() | E
- `extract().path("id")` returns a single value directly.
- `extract().response()` returns the whole `Response` for many reads.
- `response.jsonPath().getList("items.sku")` gives typed access to many fields.
- `extract().as(Order.class)` deserialises into a POJO.

? How do you deal with float vs double in body assertions? | M
JSON numbers with decimals are parsed as `Float` by default in GPath, so `equalTo(10.5)` (a double) fails. Use `equalTo(10.5f)`, configure `JsonConfig.jsonConfig().numberReturnType(NumberReturnType.DOUBLE)` or `BIG_DECIMAL` for money.

? How do you compare a full response against an expected JSON file? | M
Deserialize both and compare, ignoring dynamic fields, or use JSONAssert / AssertJ:
```
JSONAssert.assertEquals(expectedJson, actualJson, JSONCompareMode.LENIENT);
assertThat(actual).usingRecursiveComparison().ignoringFields("id", "createdAt").isEqualTo(expected);
```

? Soft assertions in Rest Assured | M
Hamcrest chains stop at the first failure. For multiple independent checks, extract the response and use AssertJ `SoftAssertions`, or TestNG `SoftAssert`, then `assertAll()` so you see every mismatch.

? How do you assert a JSON key is absent? | E
`.body("$", not(hasKey("password")))` for root; `.body("user", not(hasKey("ssn")))` for nested objects. Important for data-exposure checks.

? Validate a nested field inside an array with a condition | M
`.body("orders.find { it.id == 'ORD-7' }.items.size()", equalTo(3))` or `.body("orders.findAll { it.status == 'PAID' }.total.sum()", greaterThan(0))`.

? How do you extract a value and use it in the next request? | E
```
String token = given().body(creds).post("/login").then().statusCode(200)
                  .extract().path("accessToken");
given().auth().oauth2(token).get("/me").then().statusCode(200);
```

# group: Serialization and POJOs
? What is serialization and deserialization in Rest Assured? | E
Serialization: converting a Java object into JSON/XML for the request body. Deserialization: converting the response body into a Java object. Rest Assured uses Jackson, Gson or JSON-B, whichever is on the classpath.

? How do you use Java records as request/response models? | M | recent
```
public record User(Long id, String name, String role) {}
User created = given().body(new User(null, "Asha", "QA")).post("/users")
    .then().statusCode(201).extract().as(User.class);
```
Records (Java 16+) are immutable and concise; Jackson 2.12+ supports them. Use `@JsonInclude(NON_NULL)` to skip nulls in requests.

? Builder pattern for request payloads | M
Use Lombok `@Builder` or a hand-written builder so tests set only what they care about:
```
Order order = Order.builder().customerId(id).item("SKU-1", 2).build();
```
Combine with defaults in a test data factory (`OrderFactory.valid()`).

? How do you ignore unknown properties? | E
Annotate the class with `@JsonIgnoreProperties(ignoreUnknown = true)` or configure the mapper: `new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)` and register it via `ObjectMapperConfig`. Otherwise new response fields break tests.

? How do you map JSON field names that differ from Java names? | E
`@JsonProperty("first_name") private String firstName;` or set a naming strategy `PropertyNamingStrategies.SNAKE_CASE` on the ObjectMapper.

? How do you deserialize a generic list or a wrapper response? | M
```
List<User> users = get("/users").as(new TypeRef<List<User>>() {});
ApiResponse<User> r = get("/users/1").as(new TypeRef<ApiResponse<User>>() {});
```
`TypeRef` keeps the generic type information that would otherwise be erased.

? How do you configure a custom ObjectMapper in Rest Assured? | M
```
RestAssured.config = RestAssuredConfig.config().objectMapperConfig(
  new ObjectMapperConfig().jackson2ObjectMapperFactory((cls, charset) ->
      new ObjectMapper().registerModule(new JavaTimeModule())
          .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)));
```
Needed for `LocalDate`/`Instant` fields.

# group: Authentication
? Basic vs preemptive basic auth | M
`auth().basic(u, p)` waits for a 401 challenge from the server, then resends with credentials (two requests). `auth().preemptive().basic(u, p)` sends the Authorization header immediately. Many APIs don't send a challenge, so preemptive is the usual choice.

? How do you implement OAuth2 client credentials token fetching? | M
```
public final class TokenManager {
  private static String token; private static Instant expiry = Instant.EPOCH;
  public static synchronized String get() {
    if (Instant.now().isAfter(expiry.minusSeconds(60))) {
      Response r = given().formParam("grant_type", "client_credentials")
          .auth().preemptive().basic(Env.clientId(), Env.secret())
          .post(Env.tokenUrl());
      token = r.path("access_token");
      expiry = Instant.now().plusSeconds(r.<Integer>path("expires_in"));
    }
    return token;
  }
}
```

? How do you test with different user roles? | M
Keep credentials per role in config, create a `RequestSpecification` per role with its token, and parametrize tests over roles with a data provider to verify allowed and forbidden actions.

? Digest, form and certificate auth | M
`auth().digest(u, p)`, `auth().form(u, p, new FormAuthConfig("/login", "user", "pass"))`, `auth().certificate("client.p12", "password")`. Form auth is rare in APIs but appears in legacy apps.

? How do you keep secrets out of test code? | E
Read from environment variables or a secret manager (Vault, AWS Secrets Manager) in CI; use a local `.env` that's git-ignored; mask them in logs with a filter or `LogConfig.blacklistHeader("Authorization")`.

# group: Logging, filters and config
? Logging options | E
`given().log().all()`, `.log().headers()`, `.log().body()`, `.log().ifValidationFails()`; on the response `.then().log().ifError()`, `.log().status()`. Globally: `RestAssured.enableLoggingOfRequestAndResponseIfValidationFails()`.

? How do you hide sensitive headers in logs? | M | recent
```
RestAssured.config = RestAssured.config().logConfig(
    LogConfig.logConfig().blacklistHeader("Authorization", "X-Api-Key"));
```
The values show as `[ BLACKLISTED ]`. Also mask body fields like passwords with a custom filter.

? Write a custom filter that adds a correlation ID | M
```
public class CorrelationFilter implements Filter {
  public Response filter(FilterableRequestSpecification req,
                         FilterableResponseSpecification res, FilterContext ctx) {
    req.header("X-Correlation-ID", UUID.randomUUID().toString());
    return ctx.next(req, res);
  }
}
given().filter(new CorrelationFilter())...
```

? How do you attach requests and responses to Allure? | E
Add `io.qameta.allure:allure-rest-assured` and `.filter(new AllureRestAssured())` (or add it to your base spec). Each request appears in the report step with headers and body.

? RequestLoggingFilter to a file per test | M
```
PrintStream ps = new PrintStream(new FileOutputStream("logs/" + testName + ".log"));
given().filters(new RequestLoggingFilter(ps), new ResponseLoggingFilter(ps))...
```
Helpful in parallel runs where console output interleaves.

? How do you reset Rest Assured global state? | E
`RestAssured.reset()` restores defaults (baseURI, filters, config). Call it in suite teardown or avoid global state altogether by passing specs explicitly.

# group: Framework design
? Design a client class for a resource | M
```
public class UserClient {
  private final RequestSpecification spec;
  public UserClient(RequestSpecification spec) { this.spec = spec; }
  public Response create(User u) { return given(spec).body(u).post("/users"); }
  public Response get(long id)   { return given(spec).get("/users/{id}", id); }
  public Response delete(long id){ return given(spec).delete("/users/{id}", id); }
}
```
Tests call the client and assert; endpoints live in one place.

? Where should assertions live: client or test? | M
In tests. Clients return `Response` (or typed objects) so the same method can be used for positive and negative tests. Assertions inside clients make negative testing awkward and hide intent.

? How do you organise config per environment? | E
`config/qa.properties`, `config/stage.properties` with base URLs and non-secret settings; select with `-Denv=qa`; load via Owner library or a small Config class; secrets from environment variables.

? How do you run Rest Assured tests in parallel? | M
TestNG `parallel="methods"` or JUnit 5 parallel execution. Avoid static `RestAssured.baseURI`/filters changing at runtime; build a spec per test or per thread; make token managers thread-safe; generate unique data per test.

? Data-driven API tests with TestNG DataProvider | E
```
@DataProvider Object[][] invalidEmails() {
  return new Object[][]{{""}, {"a@"}, {"@b.com"}, {"a b@c.com"}};
}
@Test(dataProvider = "invalidEmails")
public void rejectsInvalidEmail(String email) {
  users.create(UserFactory.withEmail(email)).then().statusCode(400);
}
```

? Data-driven tests with JUnit 5 | E
`@ParameterizedTest @CsvSource({"PAID,200", "UNKNOWN,400"}) void status(String s, int code)`, or `@MethodSource` for complex objects, `@CsvFileSource(resources="/data.csv")` for files.

? How do you clean up data created by tests? | M
Track created IDs in the test and delete in `@AfterMethod`, use a cleanup registry that deletes in reverse order at the end, tag test data with a prefix and purge it nightly, or use disposable environments/containers. Always clean up even when tests fail.

? Polling for asynchronous results with Awaitility | M
```
await().atMost(Duration.ofSeconds(30)).pollInterval(Duration.ofSeconds(2))
  .untilAsserted(() -> orders.get(id).then().body("status", equalTo("COMPLETED")));
```

? How do you integrate Rest Assured with Cucumber? | M
Step definitions call service clients and store the response in a shared scenario context (PicoContainer DI). Given steps set up data, When steps make the call, Then steps assert. Keep steps business-level ("When the user places an order") rather than HTTP-level.

? How do you integrate Rest Assured with Spring Boot tests? | M
Use `@SpringBootTest(webEnvironment = RANDOM_PORT)` with `@LocalServerPort` to point Rest Assured at the running app, or `RestAssuredMockMvc` with `spring-mock-mvc` to test controllers without starting a server.

? How do you run a subset of API tests in CI? | E
TestNG groups (`@Test(groups="smoke")` and `-Dgroups=smoke`) or JUnit 5 tags (`@Tag("smoke")` and `-Dgroups=smoke` in Surefire). Run smoke on every PR and the full regression nightly.

# group: Recent interview topics
? Rest Assured vs Playwright API testing vs Karate | M | recent
Rest Assured fits Java teams wanting full code control and existing JUnit/TestNG tooling. Playwright's `request` fits TypeScript teams already using Playwright for UI. Karate fits teams wanting low-code readable tests with powerful JSON matching. Many companies use Rest Assured for service tests and Playwright for E2E.

? How do you validate a JSON response from an LLM-powered endpoint with Rest Assured? | H | recent
Assert the envelope strictly (status, schema, required fields, enums) and the generated text loosely: non-empty, within length limits, no banned terms or PII patterns, mentions required facts. Send the text to an evaluation step (rubric or LLM-as-judge) for quality scoring in a separate eval suite rather than in deterministic regression tests.

? Writing a JSON schema validator utility (a common 2026 coding round) | M | recent
```
public static void assertMatchesSchema(Response r, String schemaFile) {
  r.then().assertThat().body(JsonSchemaValidator
      .matchesJsonSchemaInClasspath("schemas/" + schemaFile)
      .using(JsonSchemaFactory.newBuilder()
          .setValidationConfiguration(ValidationConfiguration.newBuilder()
              .setDefaultVersion(SchemaVersion.DRAFTV4).freeze()).freeze()));
}
```
Explain how you'd generate schemas from OpenAPI and keep them versioned.

# group: Hard concepts
? How do RequestSpecification merges work? | H | concept
`given().spec(a).spec(b)` merges both specs into the request: headers and query params are combined, and single-value settings (base URI, content type, auth) from the later spec override earlier ones. Filters are added. Know this so environment specs and per-test specs combine predictably.

? GPath: how Rest Assured's path language works | H | concept
GPath is Groovy's path syntax. Dot notation navigates (`store.book.author` collects all authors), `[0]`/`[-1]` index, and Groovy closures filter and transform: `find`, `findAll`, `collect`, `sum`, `max`, `min`, `size()`, `any`, `every`. Example: `store.book.findAll { it.price < 10 }.title` returns titles of cheap books. It's more powerful than JsonPath's Jayway syntax and different from it, a common confusion in interviews.

? Thread-safety pitfalls of RestAssured static configuration | H | concept
`RestAssured.baseURI`, `RestAssured.filters()` and `RestAssured.config` are static and shared. If one test changes them while another runs in parallel, requests go to the wrong place or get extra filters. Build immutable `RequestSpecification`s at startup and pass them into clients; never mutate global state inside tests.

? Testing multipart uploads correctly | H | concept
```
given().multiPart("file", file, "application/pdf")
       .multiPart("meta", new Meta("invoice"), "application/json")
       .contentType("multipart/form-data")
.when().post("/documents")
```
Each part can have its own content type. Common failures: missing boundary because content type was set manually incorrectly, wrong control name, or large files exceeding server limits. Assert the stored file's checksum to prove integrity.

? Designing retry for flaky environments without hiding bugs | H | concept
Retry only network-level or known transient failures (connection reset, 502/503/504) on idempotent requests, with a small limit and backoff, and log every retry. Never retry on 4xx or assertion failures. Implement it as a filter so it's consistent and visible in reports.

# group: More Rest Assured questions
? How do you write the same test in the non-BDD style? | E
```
Response r = RestAssured.given().spec(req).get("/users/7");
assertEquals(r.getStatusCode(), 200);
assertEquals(r.jsonPath().getString("name"), "Asha");
```
Both styles are valid; BDD style is more readable for simple checks, the `Response` style for complex logic.

? Response methods you should know | E
`getStatusCode()`, `getStatusLine()`, `getHeader(name)`, `getHeaders()`, `getCookie(name)`, `getContentType()`, `getBody().asString()`, `asPrettyString()`, `jsonPath()`, `xmlPath()`, `getTime()`, `as(Class)`, `prettyPrint()`.

? How do you send PUT, PATCH and DELETE requests? | E
`given().spec(req).body(user).put("/users/{id}", id)`, `.body(Map.of("status","INACTIVE")).patch("/users/{id}", id)`, `.delete("/users/{id}", id)`. Assert 200/204 and fetch again to verify the change.

? How do you pass path parameters: named vs unnamed? | E
Named: `given().pathParam("id", 7).get("/users/{id}")`. Unnamed (positional): `get("/users/{id}/orders/{orderId}", 7, 99)`. Use named params for readability in complex URLs.

? How do you get the response as a String and parse it manually? | E
`String json = get("/users/7").asString(); JsonPath jp = new JsonPath(json);` or with Jackson `mapper.readTree(json)`. Useful when you need to log or transform the body.

? How do you validate response headers exist without checking values? | E
`.header("X-Request-ID", notNullValue())`, or extract `Headers h = response.getHeaders(); assertTrue(h.hasHeaderWithName("ETag"));`.

? How do you check that a list is sorted? | M
```
List<String> dates = r.jsonPath().getList("orders.createdAt");
List<String> sorted = new ArrayList<>(dates);
sorted.sort(Comparator.reverseOrder());
assertEquals(dates, sorted);
```
ISO dates sort correctly as strings; parse other formats first.

? How do you validate a response against an OpenAPI spec instead of separate schemas? | H | recent
Use the Atlassian `swagger-request-validator-restassured` filter: `given().filter(new OpenApiValidationFilter("openapi.yaml"))`. Every request and response is validated against the spec automatically, catching contract drift without hand-written schemas.

? How do you handle cookies-based session APIs? | M
Use `SessionFilter`: `SessionFilter session = new SessionFilter(); given().filter(session).auth().form(...)...` then reuse `given().filter(session)` so the session cookie is sent automatically, or extract `detailedCookies()` and pass them on.

? How do you redirect behaviour control? | E
`given().redirects().follow(false)` to assert a 302 and its `Location` header; by default Rest Assured follows redirects for GET. `redirects().max(5)` limits chains.

? How do you test file download APIs? | M
```
byte[] bytes = given().spec(req).get("/reports/7/pdf")
   .then().statusCode(200).contentType("application/pdf")
   .header("Content-Disposition", containsString("report-7.pdf"))
   .extract().asByteArray();
assertTrue(bytes.length > 1000);
```
Verify a checksum or parse the PDF/CSV for content.

? How do you log only when a specific test fails across the suite? | M
Use `.log().ifValidationFails(LogDetail.ALL, true)` (pretty print), or collect request/response in a filter and attach them to the report only in the `onTestFailure` listener.

? How do you validate number precision for money fields? | M
Configure `JsonConfig.jsonConfig().numberReturnType(NumberReturnType.BIG_DECIMAL)` and compare with `BigDecimal` (`comparesEqualTo(new BigDecimal("499.00"))`). Floating point can make 0.1 + 0.2 checks fail.

? Hamcrest vs JsonPath assertions: what fails better? | M
Hamcrest in `then()` gives messages like "Expected: <499> Actual: <450>" with the path. Extracting values and using AssertJ gives richer diffs for objects and collections. Use Hamcrest for quick field checks, AssertJ for object comparisons.

? How do you build a common ResponseSpecification for errors? | M
```
ResponseSpecification problem(int status) {
  return new ResponseSpecBuilder().expectStatusCode(status)
      .expectContentType("application/problem+json")
      .expectBody("title", notNullValue())
      .expectBody("traceId", notNullValue()).build();
}
users.create(invalid).then().spec(problem(400)).body("errors[0].field", equalTo("email"));
```

? How do you test pagination with Rest Assured? | M
Loop pages until `next` is null, collect IDs, and assert no duplicates and the total matches `totalElements`:
```
Set<Long> ids = new HashSet<>(); String next = "/orders?page=0&size=50";
while (next != null) {
  Response r = given(spec).get(next);
  List<Long> page = r.jsonPath().getList("content.id", Long.class);
  assertTrue(ids.addAll(page));
  next = r.path("links.next");
}
```

? What is RestAssuredMockMvc? | M
A module that runs Rest Assured syntax against Spring MVC controllers through MockMvc, without a real HTTP server. Fast for controller-level tests owned by developers; SDET suites usually test deployed services instead.

? How do you validate an XML namespace response? | H
Declare namespaces in config: `config(RestAssured.config().xmlConfig(XmlConfig.xmlConfig().declareNamespace("ns", "http://example.com/orders")))` and use `ns:` prefixes in XPath, or use GPath which ignores namespaces by default.

? How do you test API performance with Rest Assured? | E
You shouldn't beyond single-request time checks. Rest Assured isn't designed for concurrency or metrics. Reuse request definitions in a load tool (Gatling Java DSL, JMeter, k6) instead.

? How do you mock downstream services for Rest Assured tests? | M
Start WireMock (embedded via JUnit extension or as a container), point the service under test at it through config, stub responses per test, and verify calls. This tests error handling without depending on real partners.

? How do you test the same endpoint across environments? | E
Parameterize the base URI by environment through config, tag environment-specific tests (some data exists only in QA), and keep test data creation in the test so it works anywhere.

? Can Rest Assured test GraphQL? | M
Yes, as a POST with a JSON body containing `query` and `variables`:
```
given().spec(req).body(Map.of("query", "query($id:ID!){ user(id:$id){ name } }",
                              "variables", Map.of("id", "7")))
.post("/graphql").then().statusCode(200)
.body("errors", nullValue()).body("data.user.name", equalTo("Asha"));
```

? What's new in Rest Assured 5? | M | recent
Requires Java 8+ and moved to Groovy 4 (5.x), with improved support for Jackson and Java records, better Kotlin extensions, and CSRF support. Interviewers mostly care that you know current syntax (`TypeRef`, specs, filters) rather than version history.

? Interview coding task: create, update and verify an order end-to-end | M | recent
```
@Test
void orderLifecycle() {
  long id = orders.create(OrderFactory.valid()).then().statusCode(201)
              .extract().jsonPath().getLong("id");
  orders.updateStatus(id, "SHIPPED").then().statusCode(200);
  orders.get(id).then().statusCode(200)
        .body("status", equalTo("SHIPPED"))
        .body("items", not(empty()));
  orders.delete(id).then().statusCode(204);
  orders.get(id).then().statusCode(404);
}
```
Talk through test data, cleanup and what you'd assert in the DB.
