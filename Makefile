up:        ## start local Kafka stack
	docker compose up -d

down:      ## stop & remove containers
	docker compose down

ksql:      ## open interactive ksqlDB shell
	docker exec -it $$(docker compose ps -q ksqldb) \
		ksql http://ksqldb:8088

ksql-seed:   ## run the bootstrap SQL
	docker exec -i $$(docker compose ps -q ksqldb) \
	  ksql http://ksqldb:8088 < docs/ksql-setup.sql

gateway: ## start WebSocket gateway
	node --experimental-modules src/gateway.js

reset-hard: ## full tear-down (containers + data volumes)
	docker compose down --volumes --remove-orphans
	docker volume prune -f

reset-soft: ## drop all ksql objects, keep broker data
	make ksql <<'EOF'
	TERMINATE ALL;
	DROP STREAM IF EXISTS sensor_raw_stream DELETE TOPIC;
	DROP STREAM IF EXISTS temp_by_min_stream DELETE TOPIC;
	DROP TABLE  IF EXISTS temp_by_min DELETE TOPIC;
	EOF