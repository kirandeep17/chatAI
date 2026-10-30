# Task: add Snowflake connectivity + one read endpoint to this Spring Boot project

Add a minimal Snowflake integration that connects with key-pair auth and exposes **one** REST endpoint returning rows from the table `QA_PERF_TEST_CM_PS_TABLEAU_DATA`.

## Rules

- Make the **smallest possible change**. Do not refactor, rename, or reformat existing code.
- Put new code in a new package `snowflake` under the app's root package (e.g. `com.mycompany.app.snowflake`).
- **Reuse what already exists** before creating anything:
  - If the project has an existing `@ConfigurationProperties` class or record for app settings, add the Snowflake settings to it (as a nested record) instead of creating `SnowflakeProperties`.
  - If the project has an existing model/record/class for `QA_PERF_TEST_CM_PS_TABLEAU_DATA` (for example a GraphQL type or DTO with fields like `HH_SURR_KEY`, `VIN`, `aggregates`), return that type from the endpoint instead of `Map<String, Object>` (see "Using an existing model" below).
  - If the project has an existing `@Configuration` class, register the properties there.
- **Do not create a Snowflake `DataSource` or `JdbcTemplate` Spring bean.** That would replace the app's own auto-configured `DataSource` and `JdbcTemplate`. The Snowflake pool lives privately inside `SnowflakeService`.
- No heavy Javadoc. Short comments only where something is non-obvious.
- Tests: one plain unit test with Mockito. No `@SpringBootTest`, no Testcontainers, no network, no new test libraries.
- Use the `jakarta.*` imports for Spring Boot 3. If the project is on Spring Boot 2, use `javax.*` instead.
- The Snowflake pool must be lazy, so the app and existing tests start without Snowflake env vars. The code below already does this; keep it that way.

## 1. Dependencies (`pom.xml`)

Add the Snowflake JDBC driver:

```xml
<dependency>
    <groupId>net.snowflake</groupId>
    <artifactId>snowflake-jdbc</artifactId>
    <version>4.4.0</version>
</dependency>
```

Then check JDBC support:

- If the project **already** has `spring-boot-starter-jdbc`, `spring-boot-starter-data-jpa`, or another dependency that brings `spring-jdbc` + HikariCP: add nothing else.
- If it does **not**: add `spring-boot-starter-jdbc` (no version, managed by Boot) **and**, if the project has no `spring.datasource.url` of its own, exclude DataSource auto-config in `application.yml` so startup doesn't fail:

  ```yaml
  spring:
    autoconfigure:
      exclude: org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
  ```

  (If `spring.autoconfigure.exclude` already exists, append to it.)

If the project uses Gradle, add the equivalent `implementation` lines.

Note: in driver 4.x the driver class is `net.snowflake.client.api.driver.SnowflakeDriver` (the old `net.snowflake.client.jdbc.SnowflakeDriver` is gone).

## 2. Configuration (`application.yml`)

Add this block. Use `application.properties` syntax instead if that's what the project uses. Every value has an empty default so the app starts without them.

```yaml
snowflake:
  url: ${SNOWFLAKE_JDBC_URL:}
  user: ${SNOWFLAKE_USER:}
  private-key-file: ${SNOWFLAKE_PRIVATE_KEY_FILE:}
  private-key-pwd: ${SNOWFLAKE_PRIVATE_KEY_PASSPHRASE:}
  database: ${SNOWFLAKE_DATABASE:}
  schema: ${SNOWFLAKE_SCHEMA:}
  warehouse: ${SNOWFLAKE_WAREHOUSE:}
  role: ${SNOWFLAKE_ROLE:}
  table: ${SNOWFLAKE_TABLE:QA_PERF_TEST_CM_PS_TABLEAU_DATA}
```

## 3. Properties

**Only if no existing properties class can hold these**, create `snowflake/SnowflakeProperties.java`:

```java
package <root.package>.snowflake;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "snowflake")
public record SnowflakeProperties(
        String url,
        String user,
        String privateKeyFile,
        String privateKeyPwd,
        String database,
        String schema,
        String warehouse,
        String role,
        String table) {
}
```

Register it:

- If the app already uses `@ConfigurationPropertiesScan`, nothing to do.
- Otherwise add `@EnableConfigurationProperties(SnowflakeProperties.class)` to an existing `@Configuration` class, or to the `@SpringBootApplication` class if there is none. If it already has `@EnableConfigurationProperties`, add `SnowflakeProperties.class` to its list.

If you put the settings in an existing properties class instead, update the `props.xxx()` calls in the service to match.

## 4. Service: `snowflake/SnowflakeService.java`

```java
package <root.package>.snowflake;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Service
public class SnowflakeService {

    private final JdbcTemplate jdbc;
    private final String table;
    private final ObjectMapper mapper;

    @Autowired
    public SnowflakeService(SnowflakeProperties props, ObjectMapper mapper) {
        this(new JdbcTemplate(dataSource(props)), props.table(), mapper);
    }

    SnowflakeService(JdbcTemplate jdbc, String table, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.table = table;
        this.mapper = mapper;
    }

    public List<Map<String, Object>> fetchRows(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 1000));
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM " + table + " LIMIT ?", safeLimit);
        // AGGREGATES is VARIANT/JSON and comes back as a string
        rows.forEach(row -> row.computeIfPresent("AGGREGATES", (k, v) -> {
            try {
                return mapper.readTree(v.toString());
            } catch (Exception e) {
                return v;
            }
        }));
        return rows;
    }

    @PreDestroy
    void close() {
        if (jdbc.getDataSource() instanceof HikariDataSource ds) {
            ds.close();
        }
    }

    // Not a Spring bean on purpose, so it never replaces the app's own DataSource.
    // Lazy: no connection is opened until the first query.
    private static HikariDataSource dataSource(SnowflakeProperties p) {
        HikariDataSource ds = new HikariDataSource();
        ds.setPoolName("snowflake");
        ds.setDriverClassName("net.snowflake.client.api.driver.SnowflakeDriver");
        ds.setJdbcUrl(p.url());
        ds.setUsername(p.user());
        ds.setMaximumPoolSize(2);
        ds.addDataSourceProperty("private_key_file", p.privateKeyFile());
        if (StringUtils.hasText(p.privateKeyPwd())) {
            ds.addDataSourceProperty("private_key_pwd", p.privateKeyPwd());
        }
        ds.addDataSourceProperty("db", p.database());
        ds.addDataSourceProperty("schema", p.schema());
        ds.addDataSourceProperty("warehouse", p.warehouse());
        if (StringUtils.hasText(p.role())) {
            ds.addDataSourceProperty("role", p.role());
        }
        // JSON result format avoids the Arrow / --add-opens error on Java 17+
        ds.addDataSourceProperty("JDBC_QUERY_RESULT_FORMAT", "JSON");
        return ds;
    }
}
```

Keep it exactly like this:
- Use `new HikariDataSource()` with setters. **Do not** use `new HikariDataSource(config)`, because that connects immediately and breaks startup without Snowflake.
- The package-private constructor exists only for the unit test.

## 5. Endpoint: `snowflake/SnowflakeController.java`

```java
package <root.package>.snowflake;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class SnowflakeController {

    private final SnowflakeService service;

    public SnowflakeController(SnowflakeService service) {
        this.service = service;
    }

    @GetMapping("/api/snowflake/tableau-data")
    public List<Map<String, Object>> tableauData(@RequestParam(defaultValue = "10") int limit) {
        return service.fetchRows(limit);
    }
}
```

If the project has a common base path, API prefix, or security config that requires endpoints to be registered (e.g. a `SecurityFilterChain` with explicit `requestMatchers`), follow the existing convention for this one endpoint.

## Using an existing model (only if one exists for this table)

If there is already a class/record for `QA_PERF_TEST_CM_PS_TABLEAU_DATA`, change `fetchRows` and the controller to return `List<ThatModel>`:

- Record → `jdbc.query(sql, new DataClassRowMapper<>(ThatModel.class), safeLimit)`
- POJO with setters → `jdbc.query(sql, new BeanPropertyRowMapper<>(ThatModel.class), safeLimit)`

Both map `HH_SURR_KEY` → `hhSurrKey` automatically. If the model's field names don't follow camelCase, or `aggregates` is not a `String` (e.g. `JsonNode`, `Map`, `Object`), write a small lambda `RowMapper` instead. Read the String columns with `rs.getString("COLUMN")` and set `aggregates` with `mapper.readTree(rs.getString("AGGREGATES"))` (or `mapper.readValue(..., TheType.class)`). Update the unit test to match.

## 6. Test: `src/test/java/<root/package>/snowflake/SnowflakeServiceTest.java`

Uses only JUnit 5 + Mockito from `spring-boot-starter-test` (already in the project; don't add it again):

```java
package <root.package>.snowflake;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SnowflakeServiceTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final SnowflakeService service = new SnowflakeService(jdbc, "MY_TABLE", new ObjectMapper());

    @Test
    void capsLimitAndParsesAggregates() {
        Map<String, Object> row = new HashMap<>(Map.of("VIN", "123", "AGGREGATES", "{\"count\":5}"));
        when(jdbc.queryForList("SELECT * FROM MY_TABLE LIMIT ?", 1000)).thenReturn(List.of(row));

        List<Map<String, Object>> rows = service.fetchRows(5000);

        assertEquals("123", rows.get(0).get("VIN"));
        assertEquals(5, ((JsonNode) rows.get(0).get("AGGREGATES")).get("count").asInt());
    }
}
```

## Done when

- `mvn test` passes, **including all existing tests**, with no Snowflake env vars set.
- Running with the env vars below and calling the endpoint returns rows:

```bash
export SNOWFLAKE_JDBC_URL='jdbc:snowflake://<account>.snowflakecomputing.com/'
export SNOWFLAKE_USER=...
export SNOWFLAKE_PRIVATE_KEY_FILE=/path/to/rsa_key.p8
export SNOWFLAKE_DATABASE=... SNOWFLAKE_SCHEMA=... SNOWFLAKE_WAREHOUSE=...
# optional: SNOWFLAKE_ROLE, SNOWFLAKE_TABLE, SNOWFLAKE_PRIVATE_KEY_PASSPHRASE

curl 'http://localhost:8080/api/snowflake/tableau-data?limit=5'
```

## Summary of changes expected

- `pom.xml`: `snowflake-jdbc` (+ `spring-boot-starter-jdbc` only if missing)
- `application.yml`: `snowflake:` block (+ DataSource auto-config exclude only if needed)
- `snowflake/SnowflakeService.java`: new
- `snowflake/SnowflakeController.java`: new
- `snowflake/SnowflakeProperties.java`: new **only if** no existing properties class was reused
- `snowflake/SnowflakeServiceTest.java`: new
- One-line registration of the properties in an existing config class (if needed)

Nothing else should change.
