# snowflake-test

Minimal Spring Boot app that connects to Snowflake with key-pair auth, logs a
connectivity check on startup, and exposes one endpoint that reads
`QA_PERF_TEST_CM_PS_TABLEAU_DATA`.

## Run

Requires Java 21+ and Maven.

```bash
export SNOWFLAKE_JDBC_URL='jdbc:snowflake://<account_identifier>.snowflakecomputing.com/'
export SNOWFLAKE_USER='<user>'
export SNOWFLAKE_PRIVATE_KEY_FILE='/path/to/rsa_key.p8'
export SNOWFLAKE_DATABASE='<database>'
export SNOWFLAKE_SCHEMA='<schema>'
export SNOWFLAKE_WAREHOUSE='<warehouse>'
# optional: SNOWFLAKE_ROLE, SNOWFLAKE_TABLE
# encrypted key? uncomment private_key_pwd in application.yml and export SNOWFLAKE_PRIVATE_KEY_PASSPHRASE

mvn spring-boot:run
```

On startup you should see a log line like
`Connected to Snowflake: {USER_NAME=..., WAREHOUSE=..., DB=..., ...}`.
If the connection fails, the app exits with the Snowflake error.

## Endpoint

```bash
curl 'http://localhost:8080/api/tableau-data?limit=10'
```

Returns a JSON array of rows (`limit` defaults to 10, capped at 1000). The
`AGGREGATES` column is returned as nested JSON rather than an escaped string.
