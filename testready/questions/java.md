# group: OOP
? JDK vs JRE vs JVM | E
**JVM** runs bytecode and provides memory management and JIT compilation. **JRE** = JVM + core libraries needed to run programs. **JDK** = JRE + development tools (javac, jshell, jar, javadoc). Since Java 11, Oracle ships only the JDK; you install a JDK to both build and run.

? Why is Java platform independent? | E
`javac` compiles source into bytecode (`.class`), not machine code. Any OS with a compatible JVM can run that bytecode ("write once, run anywhere"). The JVM itself is platform-specific.

? What is a class and an object? | E
A class is a blueprint defining fields and methods. An object is an instance created from it with `new`, having its own state. Example: `LoginPage` is a class; `new LoginPage(driver)` is an object.

? What is a constructor? Can it be private, static or final? | E
A special method with the class name and no return type, used to initialise objects. It can be **private** (singletons, factories, utility classes), but not `static`, `final` or `abstract`. If you write no constructor, the compiler adds a default no-arg one.

? Constructor overloading and constructor chaining | E
Multiple constructors with different parameters. Chaining calls another constructor of the same class with `this(...)` or the parent with `super(...)`, which must be the first statement.

? this vs super | E
`this` refers to the current object (fields, methods, constructors). `super` refers to the parent class: call its constructor `super(driver)` or overridden method `super.click()`.

? Types of inheritance supported by Java | E
Single, multilevel and hierarchical inheritance with classes. Multiple inheritance of classes isn't allowed (diamond problem) but a class can implement multiple interfaces. Hybrid inheritance is achieved through interfaces.

? What is the diamond problem and how do default methods handle it? | M
If two interfaces provide the same default method and a class implements both, the compiler forces the class to override it and choose: `InterfaceA.super.method()`. This avoids the ambiguity that multiple class inheritance would cause.

? Compile-time vs runtime polymorphism | E
Compile time (static): method overloading, resolved by the compiler from parameter types. Runtime (dynamic): method overriding, resolved by the JVM based on the actual object type: `WebDriver d = new FirefoxDriver(); d.get(url)` calls Firefox's implementation.

? Can you override static, private or final methods? | M
No. **Static** methods are hidden, not overridden (resolved by reference type). **Private** methods aren't visible to subclasses. **Final** methods are explicitly locked. Overriding also can't reduce visibility or throw broader checked exceptions.

? Access modifiers and their scope | E
| Modifier | Class | Package | Subclass | World |
|---|---|---|---|---|
| private | yes | no | no | no |
| default | yes | yes | no (other package) | no |
| protected | yes | yes | yes | no |
| public | yes | yes | yes | yes |

? Composition vs inheritance: which is better for page objects? | M
Prefer composition for shared UI components: a `CheckoutPage` **has a** `Header` and `CartSummary` component rather than inheriting from a deep hierarchy. Use inheritance sparingly (a `BasePage` with common waits). Composition keeps classes small and flexible.

? What is a marker interface? | M
An interface with no methods that tags a class for special treatment, e.g. `Serializable`, `Cloneable`, `RandomAccess`. Annotations are the modern alternative.

? What is a functional interface? | E
An interface with exactly one abstract method, usable as a lambda target: `Runnable`, `Callable`, `Comparator`, `Predicate`, `Function`, `Supplier`, `Consumer`. Annotate with `@FunctionalInterface`. Selenium's `ExpectedCondition` is one, which is why `wait.until(d -> ...)` works.

? What is an inner class, static nested class and anonymous class? | M
Inner (non-static) classes have access to the outer instance. Static nested classes don't need an outer instance (common for builders: `Order.Builder`). Anonymous classes implement an interface inline; lambdas replaced most of them.

? What is the singleton pattern and how do you make it thread-safe? | M
One instance per JVM, e.g. a config reader. Thread-safe options: eager initialisation, an `enum` singleton, or the holder idiom:
```
public final class Config {
  private Config() {}
  private static class Holder { static final Config I = new Config(); }
  public static Config get() { return Holder.I; }
}
```
Don't use a singleton WebDriver in parallel tests.

? Design patterns used in test frameworks | M
Page Object, Factory (driver factory), Singleton (config), Builder (test data), Strategy (browser or environment strategies), Decorator (wrapping WebDriver with logging, e.g. `EventFiringDecorator`), Facade (simplified workflows), Template method (base test lifecycle), Observer (listeners).

# group: Strings
? == vs equals() | E
`==` compares references (same object) for objects and values for primitives. `equals()` compares content when overridden (String, wrappers, collections). `new String("a") == "a"` is false; `"a".equals(new String("a"))` is true.

? What is the String pool? | M
A special heap area where string literals are stored once and reused. `String a = "qa"; String b = "qa";` point to the same object. `new String("qa")` creates a new object outside the pool; `intern()` returns the pooled copy.

? How many objects does `String s = new String("hello")` create? | M
Up to two: one literal `"hello"` in the string pool (if not already there) and one new String object on the heap. Classic interview question.

? Useful String methods for test automation | E
`trim()`, `strip()` (Unicode-aware), `isBlank()`, `split(regex)`, `replace`, `replaceAll`, `contains`, `startsWith`, `endsWith`, `equalsIgnoreCase`, `substring`, `indexOf`, `toLowerCase`, `chars()`, `repeat()`, `lines()`, `String.join`, `String.format`, `formatted()` (Java 15).

? Extract digits from text like "Total: ₹1,299.00" | E
```
String digits = text.replaceAll("[^0-9.]", "");    // "1299.00"
BigDecimal amount = new BigDecimal(digits);
```
Use `BigDecimal` for money, not double.

? What are text blocks? | E | recent
Java 15+ multi-line strings with `"""`, ideal for JSON payloads in tests:
```
String body = """
    { "name": "%s", "role": "QA" }
    """.formatted(name);
```

? Why is char[] preferred over String for passwords? | M
Strings are immutable and may stay in memory (and the pool) until garbage collected, so a heap dump could reveal them. A `char[]` can be wiped after use. Mostly a theoretical interview question today, but know the reasoning.

# group: Collections
? Collection hierarchy overview | E
`Iterable` → `Collection` → `List` (ArrayList, LinkedList), `Set` (HashSet, LinkedHashSet, TreeSet), `Queue`/`Deque` (ArrayDeque, PriorityQueue, LinkedList). `Map` is separate: HashMap, LinkedHashMap, TreeMap, ConcurrentHashMap.

? List vs Set vs Map | E
**List**: ordered, allows duplicates, index access. **Set**: no duplicates. **Map**: key-value pairs with unique keys. Example: collect product names in a List, unique categories in a Set, SKU → price in a Map.

? HashSet vs LinkedHashSet vs TreeSet | E
HashSet: no order, O(1). LinkedHashSet: insertion order. TreeSet: sorted (natural or Comparator), O(log n), no null.

? Comparable vs Comparator | E
`Comparable` defines a class's natural order inside the class (`compareTo`). `Comparator` defines external, multiple orderings: `Comparator.comparing(Product::price).thenComparing(Product::name).reversed()`.

? Iterator vs ListIterator; fail-fast vs fail-safe | M
`Iterator` moves forward and can remove. `ListIterator` moves both ways and can add/set. Fail-fast iterators (ArrayList, HashMap) throw `ConcurrentModificationException` if the collection changes during iteration. Fail-safe ones (CopyOnWriteArrayList, ConcurrentHashMap) iterate over a snapshot or tolerate changes.

? How do you remove items from a list while iterating? | M
Use `iterator.remove()` or `list.removeIf(x -> x.isEmpty())`. Calling `list.remove()` inside a for-each loop throws `ConcurrentModificationException`.

? HashMap vs Hashtable vs ConcurrentHashMap | M
HashMap: not synchronized, allows one null key. Hashtable: legacy, fully synchronized, no nulls. ConcurrentHashMap: thread-safe with fine-grained locking/CAS, no nulls, high concurrency. Use ConcurrentHashMap for shared state in parallel tests.

? Why must you override hashCode when you override equals? | M
Hash-based collections find the bucket with `hashCode()` and then compare with `equals()`. If two equal objects have different hash codes, `HashSet.contains` or `HashMap.get` fails to find them. Contract: equal objects must have equal hash codes.

? Arrays vs ArrayList | E
Arrays have fixed size and can hold primitives; ArrayList is resizable, holds objects only (autoboxing), and has rich methods. `Arrays.asList()` returns a fixed-size list; `List.of()` returns an immutable one.

? List.of vs Arrays.asList vs new ArrayList | M
`List.of(...)` (Java 9): immutable, no nulls. `Arrays.asList(...)`: fixed size backed by the array, `set` works but `add`/`remove` throw. `new ArrayList<>(...)`: fully mutable copy. Know which one throws `UnsupportedOperationException`.

? How do you sort a Map by value? | M
```
Map<String, Integer> sorted = map.entrySet().stream()
    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
             (a, b) -> a, LinkedHashMap::new));
```

? How do you iterate a Map? | E
`for (Map.Entry<String, Integer> e : map.entrySet())`, `map.forEach((k, v) -> ...)`, or iterate `keySet()`/`values()`. `entrySet` is most efficient when you need both key and value.

? Useful Collections utility methods | E
`Collections.sort`, `reverse`, `shuffle`, `max`, `min`, `frequency`, `unmodifiableList`, `synchronizedList`, `emptyList`, `nCopies`, `swap`. `Arrays.sort`, `Arrays.toString`, `Arrays.fill`, `Arrays.stream`.

# group: Java 8 and modern Java
? What are lambda expressions? | E
Anonymous functions that implement a functional interface concisely: `(a, b) -> a + b`. In tests: `wait.until(d -> d.findElement(by).isDisplayed())`, `list.forEach(e -> System.out.println(e.getText()))`.

? Method references | E
Shorthand for lambdas that call an existing method: `WebElement::getText`, `String::toUpperCase`, `System.out::println`, `User::new`.

? Intermediate vs terminal stream operations | M
Intermediate (lazy, return a stream): `filter`, `map`, `flatMap`, `sorted`, `distinct`, `limit`, `skip`, `peek`. Terminal (trigger execution): `collect`, `forEach`, `count`, `reduce`, `anyMatch`, `allMatch`, `findFirst`, `toList()` (Java 16). Nothing runs until a terminal operation is called.

? map vs flatMap | M
`map` transforms each element one to one. `flatMap` transforms each element into a stream and flattens them: `orders.stream().flatMap(o -> o.items().stream())` gives all items across orders.

? Collectors you should know | M
`toList`, `toSet`, `toMap`, `joining(", ")`, `groupingBy(Product::category)`, `groupingBy(..., counting())`, `partitioningBy(p -> p.price() > 1000)`, `summingInt`, `averagingDouble`, `mapping`.

? Find duplicate elements with streams | M
```
Set<String> seen = new HashSet<>();
List<String> dups = names.stream().filter(n -> !seen.add(n)).distinct().toList();
// or by counting
Map<String, Long> counts = names.stream()
    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
```

? What is Optional and how should it be used? | M
A container that may or may not hold a value, to avoid `null` returns: `findUser(id).map(User::email).orElse("none")`, `orElseThrow()`, `ifPresent`. Don't use it for fields or parameters; use it as a return type.

? What is var (local variable type inference)? | E
Java 10+ lets the compiler infer local types: `var users = new ArrayList<User>();`. Only for local variables with initialisers; improves readability when the type is obvious.

? What are records? | E | recent
Java 16+ immutable data carriers: `record User(String name, int age) {}` generates constructor, accessors (`name()`), `equals`, `hashCode` and `toString`. Perfect for API request/response models and test data.

? What are sealed classes? | M | recent
Java 17: `sealed interface Payment permits Card, Upi, Wallet {}` restricts which classes can implement or extend a type. Combined with switch pattern matching, the compiler checks you handled every case.

? Pattern matching for instanceof and switch | M | recent
```
if (obj instanceof String s && !s.isBlank()) use(s);
String label = switch (payment) {
  case Card c -> "Card ending " + c.last4();
  case Upi u  -> "UPI " + u.vpa();
  case Wallet w -> "Wallet";
};
```
Java 16 (instanceof) and Java 21 (switch, record patterns). Removes casts and makes branching safer.

? Switch expressions | E | recent
Java 14+: `var d = switch (browser) { case "firefox" -> new FirefoxDriver(); case "edge" -> new EdgeDriver(); default -> new ChromeDriver(); };` Arrow cases don't fall through and the switch returns a value.

? What are virtual threads (Java 21)? | H | recent
Lightweight threads managed by the JVM rather than the OS, so you can run thousands of blocking tasks cheaply: `Executors.newVirtualThreadPerTaskExecutor()`. Useful for I/O-heavy test utilities (firing many API calls, polling services). They don't make CPU-bound work faster.

? Which Java version should a test project use in 2026? | E | recent
An LTS version: Java 21 is the common choice, with Java 25 (LTS, released September 2025) being adopted. Java 17 is still widely used. Selenium, Rest Assured, Playwright Java and TestNG all support 17+.

# group: Exceptions and memory
? Exception hierarchy | E
`Throwable` → `Error` (OutOfMemoryError, StackOverflowError; don't catch) and `Exception` → checked exceptions and `RuntimeException` (unchecked). Selenium's `WebDriverException` extends `RuntimeException`.

? Can a finally block be skipped? | M
Only if the JVM exits (`System.exit`), the thread dies, or the machine crashes. A `return` in try still runs finally first. Avoid `return` inside finally because it swallows exceptions.

? How do you create a custom exception? | E
```
public class TestDataException extends RuntimeException {
  public TestDataException(String msg, Throwable cause) { super(msg, cause); }
}
```
Use custom exceptions in frameworks to give clear failure reasons (e.g. config missing).

? Multi-catch and rethrowing | E
`catch (IOException | TimeoutException e)` handles several types in one block. When rethrowing, wrap with context: `throw new FrameworkException("Failed to load " + file, e)` to keep the stack trace.

? Stack vs heap memory | M
Stack: per-thread, stores method frames, local primitives and references; fast, auto-cleaned. Heap: shared, stores objects; managed by garbage collection. `StackOverflowError` comes from deep recursion; `OutOfMemoryError` from heap exhaustion.

? How does garbage collection work at a high level? | M
The GC frees objects no longer reachable from GC roots (thread stacks, static fields). Modern collectors (G1 by default, ZGC for low latency) split the heap into regions and collect young objects frequently. You can't force GC; `System.gc()` is only a hint.

? What are memory leaks in Java test frameworks? | M
Objects held unintentionally: static lists of WebDrivers or responses, ThreadLocal values never removed in thread pools, listeners never unregistered, caches without limits. Symptoms: suites slowing down and OOM in long runs.

# group: Multithreading
? Thread vs Runnable vs Callable | E
Extend `Thread` or implement `Runnable` (no return value) or `Callable<T>` (returns a value and can throw checked exceptions). Prefer submitting `Runnable`/`Callable` to an `ExecutorService` rather than creating threads manually.

? What is ExecutorService? | M
A thread pool that manages task execution: `ExecutorService pool = Executors.newFixedThreadPool(4); Future<Integer> f = pool.submit(task); f.get();` then `shutdown()`. Useful in tests to fire concurrent API requests for race-condition testing.

? synchronized, volatile and atomic classes | M
`synchronized` gives mutual exclusion and visibility for a block or method. `volatile` gives visibility of a variable's latest value across threads but not atomicity. `AtomicInteger`/`AtomicLong` give lock-free atomic operations like `incrementAndGet()` for counters.

? What is a deadlock? | M
Two or more threads each hold a lock and wait for a lock held by another, so none can proceed. Avoid by acquiring locks in a consistent order, using timeouts (`tryLock`), and minimising shared locks.

? What is ThreadLocal and why is it critical in parallel test runs? | M
It gives each thread its own copy of a variable. In parallel Selenium/Playwright Java runs, `ThreadLocal<WebDriver>` keeps each test's browser separate. Always call `remove()` in teardown because thread pools reuse threads.

? Fire 50 concurrent requests to test a race condition | H
```
ExecutorService pool = Executors.newFixedThreadPool(50);
CountDownLatch start = new CountDownLatch(1);
List<Future<Integer>> results = new ArrayList<>();
for (int i = 0; i < 50; i++)
  results.add(pool.submit(() -> { start.await(); return bookSeat("A1").statusCode(); }));
start.countDown();   // release all at once
long ok = results.stream().filter(f -> get(f) == 201).count();
assertEquals(ok, 1, "Seat booked more than once");
```

? CompletableFuture basics | H
Async composition: `CompletableFuture.supplyAsync(() -> api.get(1)).thenCombine(supplyAsync(() -> api.get(2)), (a, b) -> merge(a, b)).join()`. Use for parallel independent setup calls; handle errors with `exceptionally`.

# group: Generics, IO and utilities
? What are generics and why use them? | E
Type parameters for classes and methods (`List<String>`, `Response<T>`) that give compile-time type safety and remove casts. Example: a generic `ApiClient.get(String path, Class<T> type)` returning `T`.

? Wildcards: ? extends vs ? super | H
`List<? extends Number>` can be read as Numbers but you can't add (producer). `List<? super Integer>` accepts Integers to add, but reads give Object (consumer). Remember PECS: Producer Extends, Consumer Super.

? Read a properties file | E
```
Properties p = new Properties();
try (InputStream in = getClass().getResourceAsStream("/qa.properties")) { p.load(in); }
String url = p.getProperty("base.url");
```

? Read and write files with NIO | E
`Files.readAllLines(Path.of("data.csv"))`, `Files.readString(path)`, `Files.writeString(path, text)`, `Files.lines(path)` for streaming large files, `Files.exists`, `Files.createDirectories`.

? Read an Excel file for test data | M
Use Apache POI:
```
try (Workbook wb = WorkbookFactory.create(new File("data.xlsx"))) {
  Sheet s = wb.getSheet("logins");
  for (Row r : s) {
    if (r.getRowNum() == 0) continue;
    String user = r.getCell(0).getStringCellValue();
  }
}
```
Prefer CSV or JSON for data under version control.

? Parse JSON with Jackson | E
```
ObjectMapper m = new ObjectMapper();
User u = m.readValue(json, User.class);
JsonNode root = m.readTree(json);
String city = root.path("address").path("city").asText();
```

? Date and time API in tests | E
Use `java.time`: `LocalDate.now().plusDays(7)`, `DateTimeFormatter.ofPattern("dd/MM/yyyy")`, `ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))`, `Duration.ofSeconds(10)` for waits. Avoid legacy `Date` and `SimpleDateFormat` (not thread-safe).

? Random and unique test data | E
`UUID.randomUUID()`, `System.currentTimeMillis()`, `ThreadLocalRandom.current().nextInt(1, 100)`, and Datafaker for realistic names, addresses and phone numbers.

? Wrapper classes and autoboxing pitfalls | M
`Integer a = 127, b = 127; a == b` is true (cached), but `Integer a = 128, b = 128; a == b` is false. Always use `equals()` for wrappers. Unboxing a null `Integer` throws NullPointerException.

? Pass by value or pass by reference? | M
Java is always pass by value. For objects, the value passed is a copy of the reference, so a method can modify the object's state but can't make the caller's variable point to a new object.

? What is reflection and where do frameworks use it? | H
Inspecting and invoking classes, methods and fields at runtime: TestNG/JUnit find `@Test` methods by reflection, PageFactory initialises `@FindBy` fields, Jackson maps JSON to fields. It's powerful but slow and bypasses compile-time checks.

? What are annotations and how do you create a custom one? | H
Metadata on code read by compilers or frameworks. Custom example for test metadata:
```
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
public @interface Jira { String value(); }
```
A TestNG listener reads `method.getAnnotation(Jira.class).value()` and adds the issue link to the report.

# group: Hard concepts
? HashMap internals in Java 8+ in depth | H | concept
- Backed by an array of buckets (`Node<K,V>[] table`), default capacity 16, load factor 0.75.
- `put` computes `hash = h ^ (h >>> 16)` and index `(n - 1) & hash`.
- Collisions form a linked list; when a bucket exceeds 8 nodes and the table has at least 64 buckets, it converts to a red-black tree (O(log n) lookups), and back to a list below 6.
- When size exceeds capacity × load factor, the table doubles and entries are redistributed.
- Mutable keys whose hashCode changes after insertion get "lost". Use immutable keys.

? equals and hashCode contract and what breaks it | H | concept
Rules: reflexive, symmetric, transitive, consistent, and `x.equals(null)` is false. Equal objects must have equal hash codes (unequal objects may collide). Breaking it causes duplicates in HashSet, failed lookups in HashMap and wrong test assertions on collections. Records and Lombok `@EqualsAndHashCode` generate correct implementations.

? Immutability: how to design an immutable class | H | concept
Make the class `final`, fields `private final`, no setters, initialise everything in the constructor, make defensive copies of mutable inputs and outputs (lists, dates), and return unmodifiable views. Immutable objects are thread-safe and great for test data and config. Records give most of this for free, except defensive copies of mutable fields.

? The Java memory model: visibility and happens-before | H | concept
Without synchronisation, one thread may not see another's writes (CPU caches, reordering). A happens-before relationship guarantees visibility: unlocking a monitor happens-before a later lock; writing a `volatile` happens-before reading it; `Thread.start()` and `join()` create edges. Flaky parallel tests sometimes come from unsynchronised shared counters or flags.

? String immutability and its benefits in depth | H | concept
Strings are immutable so they can be safely shared from the pool, their hash code is cached (fast HashMap keys), they're inherently thread-safe, and security-sensitive values (class names, URLs, file paths) can't be changed after validation. The cost is new objects on every modification, which is why loops use StringBuilder.

? How do streams work lazily and why does order matter? | H | concept
A stream pipeline is built from lazy intermediate operations and runs element by element only when a terminal operation pulls data. `filter` before `map` avoids mapping discarded elements; `limit` short-circuits so `Stream.iterate(...).filter(...).limit(5)` stops early; `sorted` is a stateful barrier that must consume everything first. Parallel streams split work across the common ForkJoinPool; avoid them for I/O like WebDriver calls.

# group: Collections
? Queue vs Deque vs Stack | E
`Queue` is FIFO (`offer`, `poll`, `peek`). `Deque` supports both ends and can act as a stack (`push`, `pop`). Use `ArrayDeque` for both; the legacy `Stack` class is synchronized and slower.

? What is PriorityQueue? | M
A heap-based queue that returns the smallest (or highest via a Comparator) element first, O(log n) insert and remove. Useful for "top K" problems in coding rounds.

# group: OOP
? What is encapsulation's practical benefit in a test framework? | E
Hiding locators and driver details behind methods means UI changes are fixed in one class, tests stay readable, and nobody bypasses waits by calling the driver directly.

? Abstract class with constructor: why? | M
Abstract classes can't be instantiated, but their constructors run when a subclass is created, so they can initialise shared state, e.g. `BasePage(WebDriver driver)` sets the driver and creates a WebDriverWait for every page.

? What is the difference between static and instance initialisation blocks? | M
`static { }` runs once when the class loads (load config, register drivers). `{ }` instance blocks run before each constructor body. Order: static blocks, then for each object: instance blocks, then constructor.
