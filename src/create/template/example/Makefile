.PHONY: start
start:
	cd opentelemetry-demo && docker compose up --force-recreate --remove-orphans --detach
	@echo ""
	@echo "OpenTelemetry Demo in minimal mode is running."
	@echo "Go to http://localhost:8080 for the demo UI."

.PHONY: stop
stop:
	cd opentelemetry-demo &&docker compose down --remove-orphans --volumes
	@echo ""
	@echo "OpenTelemetry Demo is stopped."
