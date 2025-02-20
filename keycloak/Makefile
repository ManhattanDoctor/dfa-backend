#HCCcsCzWAXeoxy5B6mJFDL3AMAeHacKR

start:
	docker-compose up -d

stop:
	docker-compose stop

rebuild:
	rm -f custom-scripts.jar
	jar --create --file custom-scripts.jar --no-manifest -C script .