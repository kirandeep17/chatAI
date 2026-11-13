# group: REST basics
? What is an API and what is API testing? | E
An API (application programming interface) is a contract that lets one piece of software call another. API testing sends requests directly to the service (bypassing the UI) and verifies responses, data, errors, security and performance. It's faster and more stable than UI testing and finds defects closer to their source.

? What is REST? Name its constraints | E
REST (Representational State Transfer) is an architectural style for networked APIs. Constraints: client-server, stateless, cacheable, uniform interface (resources identified by URIs, manipulated through representations, self-descriptive messages, HATEOAS), layered system, and optional code on demand.

? REST vs SOAP | E
| | REST | SOAP |
|---|---|---|
| Type | Architectural style | Protocol |
| Format | JSON (usually), XML, others | XML only (envelope) |
| Transport | HTTP | HTTP, SMTP, others |
| Contract | OpenAPI (optional) | WSDL (strict) |
| Errors | HTTP status codes | SOAP Fault |
| Use | Web and mobile APIs | Enterprise, banking, legacy |

? What does stateless mean in REST? | E
Each request contains all the information needed to process it (auth token, parameters); the server keeps no session state between requests. This makes services easy to scale horizontally. For testing, it means each request can be tested independently.

? HTTP methods and their purpose | E
- **GET**: read a resource.
- **POST**: create a resource or trigger an action.
- **PUT**: replace a resource completely (create if absent, depending on the API).
- **PATCH**: partially update a resource.
- **DELETE**: remove a resource.
- **HEAD**: like GET but headers only.
- **OPTIONS**: which methods are allowed; used for CORS preflight.

? PUT vs PATCH | E
PUT sends the full representation and replaces the resource; missing fields may be set to null or defaults. PATCH sends only the fields to change. Test that PUT with missing fields behaves as documented and that PATCH doesn't wipe other fields.

? POST vs PUT | E
POST creates a new subordinate resource and the server chooses the ID (`POST /users` → `/users/42`); repeating it creates duplicates. PUT targets a known URI (`PUT /users/42`) and is idempotent: repeating it leaves the same state.

? Path parameter vs query parameter | E
Path parameters identify a resource: `/users/42/orders/7`. Query parameters filter, sort or paginate: `/orders?status=PAID&sort=-date&page=2`. Test missing, invalid and boundary values for both.

? Important request and response headers | E
`Content-Type`, `Accept`, `Authorization`, `Cache-Control`, `ETag`, `If-None-Match`, `If-Match`, `Location` (after 201), `Retry-After` (with 429/503), `X-Request-ID`/correlation IDs, `Set-Cookie`, CORS headers (`Access-Control-Allow-Origin`), security headers (`Strict-Transport-Security`, `Content-Security-Policy`).

? 200 vs 201 vs 202 vs 204 | E
**200 OK**: success with a body. **201 Created**: resource created, ideally with a `Location` header. **202 Accepted**: request accepted for asynchronous processing, not done yet. **204 No Content**: success with no body, common for DELETE and some PUTs.

? 301 vs 302 vs 304 vs 307 vs 308 | M
301 permanent redirect, 302 temporary redirect, 304 not modified (use the cached copy), 307 temporary redirect that keeps the method and body, 308 permanent redirect that keeps the method and body. Clients may change POST to GET on 301/302, which is why 307/308 exist.

? 500 vs 502 vs 503 vs 504 | E
500: unhandled server error. 502 Bad Gateway: a proxy got an invalid response from upstream. 503 Service Unavailable: overloaded or under maintenance. 504 Gateway Timeout: a proxy didn't get a response in time from upstream. 5xx in tests usually means a bug or environment problem; a 4xx means a client mistake.

? What is HATEOAS? | M
Hypermedia as the Engine of Application State: responses include links to related actions (`"links": {"cancel": "/orders/7/cancel"}`), so clients discover what they can do next. Test that the links are present, correct and respect state (no cancel link on a shipped order).

? What is an API endpoint, resource and payload? | E
A **resource** is a thing the API manages (users, orders). An **endpoint** is the URL plus method used to access it (`GET /orders/{id}`). The **payload** is the data in the request or response body.

? What is JSON and how is it different from XML? | E
JSON is a lightweight key-value format with objects, arrays, strings, numbers, booleans and null. XML is markup with tags, attributes and namespaces, and supports schemas (XSD) and XPath. JSON is smaller and easier to parse in JavaScript; XML is still common in SOAP and older enterprise systems.

? What is OpenAPI (Swagger)? | E
A standard for describing REST APIs in YAML/JSON: endpoints, parameters, request and response schemas, auth and examples. Swagger UI renders it as interactive docs. Testers use it to design tests, generate clients and validate responses against the spec.

# group: What and how to test
? How do you test a GET endpoint? | E
Status 200; response schema; correct values for a known ID; 404 for a non-existent ID; 400 for an invalid ID format; 401/403 without or with wrong permissions; filters, sorting and pagination; headers (content type, caching); response time; no sensitive fields leaked.

? How do you test a POST endpoint? | E
201 with Location header and correct body; data actually persisted (GET it back or check DB); required field missing → 400 with clear message; wrong types, too long values, invalid enums; duplicate creation (409 or idempotency); auth; extra unknown fields; large payloads; special characters and Unicode.

? How do you test pagination? | M
First, middle and last page; page size limits (0, 1, max, max+1); total count consistency; no duplicates or gaps across pages; stable ordering; behaviour when data changes between page requests; invalid page numbers; cursor-based tokens that expire.

? What is negative API testing? Give examples | E
Sending invalid requests to ensure graceful failure: missing auth, expired token, invalid JSON, wrong content type, missing required fields, null values, wrong data types, out-of-range numbers, SQL/script injection strings, unsupported methods (405), huge payloads (413). Expect clear 4xx errors and no 500s.

? How do you validate a JSON response body? | E
Check status first, then schema (types and required fields), then important values, then relationships (totals add up, IDs match the request). Avoid asserting every field with hard-coded values; use schema validation plus targeted assertions.

? How do you test API error messages? | E
Errors should have a consistent structure (e.g. RFC 9457 problem details: `type`, `title`, `status`, `detail`), meaningful messages, a correlation ID, and no stack traces or internal details. Test that each validation rule returns the right field and message.

? How do you test API versioning? | M
Old clients on v1 still work after v2 is released; deprecated fields still present until the sunset date; `Deprecation`/`Sunset` headers if used; version selection via URL (`/v2/`), header or media type behaves as documented; default version when none is given.

? What is API chaining? | E
Using data from one response in the next request: create a user, extract the ID, create an order for that user, fetch the order, then delete both. It models real workflows and is how most end-to-end API tests are built.

? How do you test file upload APIs? | M
Multipart requests with valid files, wrong types (validate by content, not only extension), zero-byte files, files at and above the size limit, file names with special characters, malicious files (EICAR test string for antivirus), and concurrent uploads. Verify storage and download of the same file.

? How do you test asynchronous APIs (202 Accepted)? | M
Submit the request, get the job ID or status URL, then poll with a timeout until status is DONE or FAILED (or listen for the callback/webhook). Assert the final state and result. Never use fixed sleeps; use a polling helper such as Awaitility.

? How do you test webhooks? | M
Expose a test receiver (webhook.site, a local server via ngrok, or a mock in your test harness), trigger the event, and assert the delivered payload, headers and signature. Also test retries when the receiver returns 500, ordering, and duplicate delivery handling.

? How do you test rate limiting? | M
Send requests above the limit within the window and expect 429 with `Retry-After` and rate-limit headers; verify the counter resets after the window; check limits are per user/key/IP as designed; and ensure blocked requests don't have side effects.

? How do you test caching (ETag, Cache-Control)? | M
Fetch a resource and capture its ETag; send `If-None-Match` with it and expect 304 with no body; change the resource and expect 200 with a new ETag. Check `Cache-Control` values are correct for private data (`no-store`) and public data.

? How do you test optimistic locking (If-Match)? | M
Get a resource with its ETag/version, update it with `If-Match` → success. Update again with the old ETag → 412 Precondition Failed (or 409). This proves concurrent updates can't silently overwrite each other.

? How do you test CORS? | M
Send an OPTIONS preflight with `Origin` and `Access-Control-Request-Method` headers; check `Access-Control-Allow-Origin` returns only allowed origins (not `*` for credentialed requests), and allowed methods and headers are correct. Disallowed origins should not get CORS headers.

? How do you test idempotency keys? | H | recent
For payment-like POSTs, send the same request twice with the same `Idempotency-Key` header: the second call must return the same result without creating a second resource or charge. Send the same key with a different body and expect an error. Test concurrent duplicate requests too.

? How do you test data integrity between the API and database? | M
After a POST or PUT, query the DB (JDBC, a test DB API) and compare stored values, defaults, timestamps and relationships. After DELETE, check soft vs hard delete. Keep DB checks focused on important fields to avoid brittle tests.

? What is API mocking and service virtualisation? | M
Replacing a real dependency with a fake that returns controlled responses. Tools: WireMock, MockServer, Mountebank, Prism (from OpenAPI). Use it to test error paths, slow responses and unavailable third parties, and to develop tests before the real API exists.

? Write a WireMock stub | M
```
stubFor(get(urlEqualTo("/rates/INR"))
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader("Content-Type", "application/json")
        .withBody("{\"rate\": 83.2}")
        .withFixedDelay(2000)));
```
Then verify calls with `verify(getRequestedFor(urlEqualTo("/rates/INR")))`.

# group: Security
? Authentication vs authorization | E
**Authentication**: who are you? (login, token validation). **Authorization**: what are you allowed to do? (roles, permissions, ownership). 401 means authentication failed; 403 means authenticated but not authorized.

? Types of API authentication | E
Basic auth (base64 user:pass, only over HTTPS), API keys, bearer tokens, OAuth 2.0 access tokens, JWT, mutual TLS (client certificates), HMAC request signing (e.g. AWS SigV4), and session cookies.

? OAuth 2.0 grant types | M
- **Authorization code (+ PKCE)**: user logs in via browser; for web and mobile apps.
- **Client credentials**: service-to-service, no user.
- **Refresh token**: get a new access token without logging in again.
- **Device code**: TVs and CLIs.

Implicit and password grants are deprecated in OAuth 2.1.

? What is inside a JWT and what do you test? | M
Header (algorithm), payload (claims such as `sub`, `exp`, `iat`, `aud`, `iss`, roles) and signature. Test: expired token rejected, modified payload rejected (signature fails), `alg: none` rejected, wrong audience/issuer rejected, roles enforced, no sensitive data in the payload (it's only base64, not encrypted).

? What is BOLA/IDOR and how do you test it? | M | recent
Broken Object Level Authorization, the top item in the **OWASP API Security Top 10**: a user can access another user's object by changing an ID (`GET /orders/1002` with user A's token returns user B's order). Test every endpoint that takes an ID with two different users' tokens and expect 403/404.

? OWASP API Security Top 10 (2023) | M | recent
1. Broken object level authorization
2. Broken authentication
3. Broken object property level authorization (mass assignment, excessive data exposure)
4. Unrestricted resource consumption
5. Broken function level authorization
6. Unrestricted access to sensitive business flows
7. Server-side request forgery
8. Security misconfiguration
9. Improper inventory management
10. Unsafe consumption of APIs

? What is mass assignment and how do you test it? | M
The API binds all JSON fields to the model, so a user can set fields they shouldn't, like `"role": "admin"` or `"price": 0` in a create request. Send extra privileged fields and verify they are ignored or rejected.

? How do you test for SQL injection in an API? | M
Send payloads such as `' OR '1'='1`, `1; DROP TABLE users--` in parameters and body fields; look for 500 errors, DB error messages or changed results. Use tools like OWASP ZAP or sqlmap in authorised test environments. The fix is parameterised queries, which you can confirm with the dev team.

? Why must APIs use HTTPS and what do you check? | E
To protect credentials and data in transit. Check HTTP redirects or is refused, TLS version is 1.2+, certificate is valid, HSTS is set, and tokens never travel in URLs (they end up in logs).

# group: Tools
? Postman: how do you write tests? | E
In the Tests (post-response) tab:
```
pm.test("status is 201", () => pm.response.to.have.status(201));
const body = pm.response.json();
pm.test("has id", () => pm.expect(body.id).to.be.a("number"));
pm.collectionVariables.set("userId", body.id);
```

? Postman variable scopes | E
Global, collection, environment, data (from CSV/JSON in the runner) and local. The narrowest scope wins. Use environments for base URLs and credentials per environment, and collection variables for values chained between requests.

? How do you run Postman collections in CI? | E
Export the collection and environment (or reference them via the Postman API) and run with Newman: `newman run api.json -e qa.json -r cli,htmlextra,junit`. Or use the Postman CLI. Fail the pipeline on test failures and publish the JUnit report.

? Data-driven testing in Postman | E
Use the Collection Runner or Newman with `-d data.csv`; each row runs the collection once and values are available as `{{column}}` or `pm.iterationData.get('column')`.

? Pre-request scripts in Postman | E
JavaScript that runs before a request: generate timestamps or unique emails, compute HMAC signatures, fetch and cache an OAuth token with `pm.sendRequest`, and set variables.

? curl basics every tester should know | E
```
curl -i https://api.example.com/users/7
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Asha"}'
curl -s .../orders | jq '.items[] | select(.status=="PAID") | .id'
```
`-i` shows headers, `-v` shows the full exchange, `jq` filters JSON.

? Other API testing tools you can mention | E
Rest Assured (Java), Karate (DSL), Playwright API testing (TS), requests + pytest (Python), SoapUI/ReadyAPI (SOAP), Insomnia and Bruno (Postman alternatives), Pact (contracts), WireMock (mocks), k6/JMeter (load), OWASP ZAP (security), Schemathesis (property-based tests from OpenAPI).

? API testing in Python with requests and pytest | M
```
import requests

def test_create_user(base_url, token):
    r = requests.post(f"{base_url}/users", json={"name": "Asha"},
                      headers={"Authorization": f"Bearer {token}"}, timeout=10)
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Asha" and isinstance(body["id"], int)
```
Fixtures in `conftest.py` provide `base_url` and `token`; `jsonschema` validates schemas.

? How do you test SOAP services? | M
Use the WSDL to generate requests in SoapUI or send XML envelopes with any HTTP client (Rest Assured supports XML). Validate with XPath or XSD, test SOAP Faults for invalid input, and check WS-Security headers if used.

# group: GraphQL, gRPC and events
? GraphQL queries vs mutations vs subscriptions | E
**Query**: read data, asking for exactly the fields you need. **Mutation**: change data. **Subscription**: receive real-time updates over WebSocket. All usually go to one endpoint, `POST /graphql`.

? What do you test in a GraphQL API? | M
Valid queries return requested fields only; invalid fields produce schema errors; variables validation; field-level authorization; query depth and complexity limits (DoS protection); pagination (cursor connections); N+1 query performance; introspection disabled in production; error structure in the `errors` array even with HTTP 200.

? What is gRPC and how is it tested? | M
A high-performance RPC framework using HTTP/2 and Protocol Buffers with strongly typed service contracts (`.proto` files). Test with grpcurl, Postman, BloomRPC/Kreya, or generated client stubs in code. Check status codes (OK, INVALID_ARGUMENT, NOT_FOUND, UNAUTHENTICATED, DEADLINE_EXCEEDED), deadlines, streaming and backward compatibility of proto changes.

? How do you test event-driven systems (Kafka, RabbitMQ)? | H | recent
Publish a test event and assert the consumer's effect (DB row, downstream event); or trigger the producer and consume from the topic with a test consumer to assert the message schema and content. Test ordering, duplicates (idempotent consumers), poison messages and dead-letter queues, schema evolution (Avro/JSON Schema registry), and lag under load. Testcontainers can start Kafka in tests.

? How do you test WebSocket APIs? | M
Connect with a client (Postman, Playwright `page.on('websocket')`, Java WebSocket client), send messages, and assert received messages and their order; test reconnection, authentication on connect, message size limits and server-initiated pushes.

# group: Recent interview topics
? API-first testing: why do teams push most coverage to the API layer? | M | recent
API tests run in milliseconds, aren't affected by UI changes, are easy to run in parallel, and pinpoint which service is broken. Most business rules live in services, so the API layer gives the best confidence per minute of execution. UI tests are kept for critical journeys and rendering.

? How do you generate API tests from an OpenAPI spec? | M | recent
Tools like Schemathesis or Dredd read the spec and generate requests (including edge cases and property-based inputs) and validate responses against the schema. Use them as a safety net for contract drift alongside hand-written business tests.

? How do you test an LLM-backed API endpoint? | H | recent
Treat responses as non-deterministic: assert structure (JSON schema, required fields), constraints (length, allowed values, no PII), latency and token limits, and refusal behaviour for unsafe prompts. Score answer quality with an evaluation set and thresholds instead of exact matches. Test timeouts, rate limits and fallbacks when the model provider fails.

? How do you test API backward compatibility? | H | recent
Adding optional fields is safe; removing or renaming fields, changing types, or making optional fields required breaks consumers. Use consumer-driven contract tests, run old client test suites against the new version, diff OpenAPI specs in CI (openapi-diff, oasdiff) to flag breaking changes automatically.

# group: Hard concepts
? Idempotency vs safety: the precise definitions | H | concept
A **safe** method has no intended side effects on server state (GET, HEAD, OPTIONS). An **idempotent** method can be applied many times with the same effect as once (GET, HEAD, OPTIONS, PUT, DELETE). DELETE is idempotent even though the second call may return 404: the server state is the same. POST and PATCH are neither by default, which is why payment APIs add idempotency keys.

? Consumer-driven contract testing in depth | H | concept
1. The consumer writes a test against a Pact mock provider describing the requests it makes and the minimal response fields it needs.
2. Running it produces a pact file (the contract), published to a Pact Broker.
3. The provider's pipeline fetches the contracts and replays the requests against the real provider, using provider states to set up data.
4. `can-i-deploy` checks the broker to confirm every consumer-provider version pair in the target environment is compatible before deployment.

It replaces slow, flaky cross-service E2E tests with fast, independent checks.

? Why contract tests don't replace functional API tests | H | concept
Contracts check that the provider can return the **shape** the consumer relies on for given interactions. They don't check business rules, all edge cases, performance or security. Keep provider functional tests for behaviour; use contracts to catch integration drift.

? Eventual consistency and how to test it | H | concept
In distributed systems a write may not be visible everywhere immediately (read replicas, caches, event-driven projections). Tests that read right after writing can fail intermittently. Poll with a timeout until the expected state appears (Awaitility, `expect.poll`), assert on the source of truth where possible, and separately test the maximum acceptable delay as a non-functional requirement.

? Testing retries, timeouts and circuit breakers | H | concept
Use a mock dependency (WireMock, Toxiproxy) to inject delays and failures: verify the client times out at the configured value, retries only idempotent calls with backoff, stops calling when the circuit opens, returns a fallback response, and recovers when the dependency is healthy (half-open state). These failure paths are where outages happen and they're rarely tested.

? How do you design an API automation framework from scratch? | H | concept
Layers: config (environments, secrets from env/vault), a base client (base URI, auth, logging filters, timeouts), service clients per domain (`OrderClient.create()`), models (POJOs/records with builders), test data factories, assertions helpers and schema files, and tests that read like scenarios. Add tagging, parallel execution, reporting (Allure), retries only for known transient errors, and CI integration with environment selection.

# group: More API questions
? 400 vs 404 vs 422: which should an invalid request return? | M
400 for malformed syntax (invalid JSON, wrong type). 404 when the resource in the path doesn't exist. 422 when the JSON is valid but fails business validation (end date before start date). Teams vary, so check the API guidelines and test for consistency.

? 401 vs 403 vs 404 for a resource the user can't access | M
401 if not authenticated. 403 if authenticated but not permitted. Some APIs deliberately return 404 instead of 403 to avoid revealing that the resource exists. Either is acceptable if consistent and documented.

? What is the difference between API testing and unit testing? | E
Unit tests check a single class or function in isolation with dependencies mocked, owned by developers. API tests call the deployed service over HTTP, exercising routing, serialization, validation, auth and persistence together.

? What is API smoke testing? | E
A small set of fast checks after each deployment: health endpoint returns UP, key GET endpoints return 200, auth works, a simple create/read flow works. It confirms the build is worth testing further.

? What is a health check endpoint and what should it return? | E
An endpoint like `/health` or `/actuator/health` that reports service status and dependencies (DB, cache, queues). Liveness says "the process is running"; readiness says "ready to take traffic". Test that it reports DOWN when a dependency is unavailable.

? How do you test sorting and filtering? | E
Sort ascending and descending on each sortable field and assert order; combine filters; filter with no matches (empty list, not 404); invalid filter values; case sensitivity; sorting with nulls and ties; filters combined with pagination.

? How do you test search APIs? | M
Exact and partial matches, case insensitivity, special characters and Unicode, empty query, very long queries, ranking of results, typo tolerance if supported, pagination of results and performance with large datasets.

? How do you test date and time fields in APIs? | M
ISO 8601 format with offset or `Z`, time zone conversions (store UTC, display local), leap years, DST transitions, invalid dates (31 Feb), boundaries for ranges, and that server-generated timestamps are close to "now" rather than exact.

? How do you handle dynamic values (IDs, timestamps) in assertions? | E
Assert their type or format instead of exact values (`id` is a positive number, `createdAt` matches an ISO pattern and is within the last minute). Extract and reuse them for later requests.

? What is the difference between JSON Schema validation and value assertions? | M
Schema validation checks structure: types, required fields, formats, enums, array shapes. Value assertions check business correctness: the total equals the sum of line items. You need both: a schema can pass with completely wrong numbers.

? How do you test bulk/batch endpoints? | M
Mixed valid and invalid items (partial success reporting), maximum batch size and one above, empty batch, duplicates within a batch, transactional behaviour (all-or-nothing vs per-item), and performance with large batches.

? How do you test DELETE properly? | E
Delete returns 204/200; a subsequent GET returns 404 (or the item is marked deleted for soft delete); deleting again returns 404 or 204 consistently; related data is handled (cascade or prevented with 409); only authorised users can delete.

? How do you test API response time? | E
Assert a per-request threshold in functional tests as a guard (e.g. under 2 s), but measure real performance with load tools (k6, JMeter, Gatling) using percentiles (p95, p99) under realistic concurrency.

? What is API gateway testing? | M
Gateways handle routing, auth, rate limiting, request transformation, caching and CORS for many services. Test that routes map correctly, auth is enforced at the gateway, limits apply per consumer, headers are added or stripped as configured, and errors from backends are passed through correctly.

? How do you test an API that sends emails or SMS? | M
In test environments route messages to a capture service (MailHog, Mailpit, Mailosaur, Twilio test credentials) and fetch them via its API to assert recipient, subject, template variables and links. Never send to real customers.

? How do you test localisation in API responses? | E
Send `Accept-Language` variations and check translated messages, number and currency formats, fallback to the default language for unsupported locales, and Unicode handling in both directions.

? What is API documentation testing? | E
Checking that the docs (OpenAPI, examples, README) match the real behaviour: every documented endpoint exists, examples work as written, error codes listed are the ones returned. Automated spec validation helps keep them in sync.

? What is the difference between functional, load and security API testing? | E
Functional: correct behaviour and data. Load: performance and stability under concurrent traffic. Security: authentication, authorization, injection, data exposure. Each needs different tools and environments, but they reuse the same requests.

? How do you test API backward compatibility for mobile apps? | M
Old app versions stay in use for months, so run the previous app's API test suite against new backend versions, never remove fields still used by supported versions, and use feature flags or versioned endpoints for breaking changes.

? How do you share an auth token across many API tests? | M
Fetch the token once (suite setup or a lazy singleton), cache it with its expiry, refresh it shortly before expiry, and make it thread-safe for parallel runs. Never hard-code tokens in tests or commit them to Git.

? How do you test multi-tenant APIs? | H
Every request is scoped to a tenant: verify a user from tenant A can never see or modify tenant B's data, including through search, exports, bulk endpoints and IDs. Also test tenant-specific configuration and rate limits.

? What is the difference between a mock, a stub and a fake? | M
A **stub** returns canned responses. A **mock** also verifies it was called in the expected way. A **fake** is a working lightweight implementation (in-memory DB). In API testing, WireMock is mainly used as a stub, with verification features that make it a mock.

? What is Testcontainers and why use it for API tests? | M | recent
A library that starts real dependencies (Postgres, Kafka, Redis, WireMock) in Docker containers from test code and throws them away afterwards. Integration tests run against real software with clean state, locally and in CI, without shared test environments.

? How do you test API logging and auditing? | M
Trigger actions and verify audit records (who, what, when, before/after values) exist for sensitive operations; logs include a correlation ID; and logs never contain passwords, tokens, card numbers or personal data.
