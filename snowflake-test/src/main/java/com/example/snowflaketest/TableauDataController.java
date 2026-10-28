package com.example.snowflaketest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class TableauDataController {

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final String table;

    public TableauDataController(JdbcTemplate jdbc, ObjectMapper mapper,
                                 @Value("${app.table}") String table) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.table = table;
    }

    /** GET /api/tableau-data?limit=10 */
    @GetMapping("/api/tableau-data")
    public List<Map<String, Object>> get(@RequestParam(defaultValue = "10") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 1000));
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM " + table + " LIMIT ?", safeLimit);

        // AGGREGATES is a VARIANT/JSON column; the driver returns it as a string, so parse it into real JSON.
        for (Map<String, Object> row : rows) {
            row.computeIfPresent("AGGREGATES", (k, v) -> {
                try {
                    return mapper.readTree(v.toString());
                } catch (Exception e) {
                    return v;
                }
            });
        }
        return rows;
    }
}
