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
	docker compose exec identity-service npx nx run identity:prisma:generate

identity-generate:
	docker compose exec identity-service npx nx run identity:prisma:generate

identity-studio:
	docker compose exec identity-service npx nx run identity:prisma:studio

identity-migrate-test:
	docker compose exec -e DATABASE_URL=postgresql://postgres:postgres@identity-db-test:5432/identity_test identity-service npx nx run identity:prisma:migrate
	docker compose exec -e DATABASE_URL=postgresql://postgres:postgres@identity-db-test:5432/identity_test identity-service npx nx run identity:prisma:generate

identity-db-test-reset:
	docker compose exec -e DATABASE_URL=postgresql://postgres:postgres@identity-db-test:5432/identity_test identity-service npx nx run identity:prisma:migrate:reset

identity-test:
	docker compose exec identity-service npx nx run identity:test

identity-test-e2e: identity-db-test-reset identity-migrate-test
	docker compose exec -e HOST=identity-service-test -e PORT=3000 identity-service-test npx nx run identity-e2e:e2e