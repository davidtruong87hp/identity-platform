.PHONY: up down build restart migrate generate studio logs

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

restart: down build up

logs:
	docker compose logs -f

# Identity service
identity-migrate:
	docker compose exec identity-service npx nx run identity:prisma:migrate

identity-generate:
	docker compose exec identity-service npx nx run identity:prisma:generate

identity-studio:
	docker compose exec identity-service npx nx run identity:prisma:studio
