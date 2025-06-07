up:        ## start local Kafka stack
	docker compose up -d

down:      ## stop & remove containers
	docker compose down

ksql:      ## open interactive ksqlDB shell
	docker exec -it $$(docker compose ps -q ksqldb) \
		ksql http://ksqldb:8088