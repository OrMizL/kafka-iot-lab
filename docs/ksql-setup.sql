-- docs/ksql-setup.sql
-- Set pragmatic defaults for a single-broker dev stack
SET 'processing.guarantee' = 'at_least_once';

-- 1) Stream over raw sensor topic
CREATE STREAM sensor_raw_stream (
  deviceId STRING,
  ts        BIGINT,
  temperature DOUBLE
) WITH (
  KAFKA_TOPIC  = 'sensor_raw',
  VALUE_FORMAT = 'JSON',
  PARTITIONS   = 1,
  TIMESTAMP    = 'ts'
);

-- 2) Rolling-average minute table (cleaned)
CREATE TABLE temp_by_min
WITH (VALUE_FORMAT='JSON') AS
SELECT
  deviceId,
  TIMESTAMPTOSTRING(WINDOWSTART,
                    'yyyy-MM-dd''T''HH:mm:ss',
                    'Etc/UTC')      AS minute,
  ROUND(AVG(temperature), 1)        AS avg_temp
FROM sensor_raw_stream
WINDOW TUMBLING (SIZE 60 SECONDS)
GROUP BY deviceId
EMIT FINAL;

-- 3) Optional flat stream without key columns
CREATE STREAM temp_by_min_flat
WITH (VALUE_FORMAT='JSON') AS
SELECT deviceId, minute, avg_temp
FROM   temp_by_min
EMIT CHANGES;

-- if not flat: SELECT deviceId, minute, avg_temp FROM temp_by_min EMIT CHANGES;
-- if flat: SELECT * FROM temp_by_min_flat EMIT CHANGES;