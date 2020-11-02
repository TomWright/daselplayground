docker-build:
	docker build -t tomwright/daselplayground .

docker-run:
	docker run --rm --name daselplayground -p 8080:8080 tomwright/daselplayground
