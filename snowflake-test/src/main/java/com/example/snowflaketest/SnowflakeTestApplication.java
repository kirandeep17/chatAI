package com.example.snowflaketest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Map;

@SpringBootApplication
public class SnowflakeTestApplication {

    private static final Logger log = LoggerFactory.getLogger(SnowflakeTestApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SnowflakeTestApplication.class, args);
    }

    /** Connectivity check on startup: fails fast if Snowflake can't be reached. */
    @Bean
    ApplicationRunner connectivityCheck(JdbcTemplate jdbc) {
        return args -> {
            Map<String, Object> info = jdbc.queryForMap(
                    "SELECT CURRENT_USER() AS USER_NAME, CURRENT_ROLE() AS ROLE_NAME, "
                            + "CURRENT_WAREHOUSE() AS WAREHOUSE, CURRENT_DATABASE() AS DB, "
                            + "CURRENT_SCHEMA() AS SCHEMA_NAME, CURRENT_VERSION() AS VERSION");
            log.info("Connected to Snowflake: {}", info);
        };
    }
}
