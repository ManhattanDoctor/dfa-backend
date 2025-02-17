start:
	docker-compose up -d

stop:
	docker-compose stop

reset:
	docker-compose down

build:
	rm -f custom-scripts.jar
	jar --create --file custom-scripts.jar --no-manifest -C script .