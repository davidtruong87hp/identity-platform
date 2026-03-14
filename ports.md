# Port Registry

## Services

| Service               | Internal Port | External Port | Description             |
| --------------------- | ------------- | ------------- | ----------------------- |
| identity-service      | 3000          | 3002          | Identity service (dev)  |
| identity-service-test | 3000          | 3003          | Identity service (test) |

## Databases

| Service          | Internal Port | External Port | Description        |
| ---------------- | ------------- | ------------- | ------------------ |
| identity-db      | 5432          | 5432          | Identity DB (dev)  |
| identity-db-test | 5432          | 5433          | Identity DB (test) |

## Tools

| Service  | Internal Port | External Port | Description            |
| -------- | ------------- | ------------- | ---------------------- |
| rabbitmq | 5672          | 5672          | RabbitMQ AMQP          |
| rabbitmq | 15672         | 15673         | RabbitMQ Management UI |
| mailhog  | 1025          | 1025          | SMTP (dev)             |
| mailhog  | 8025          | 8025          | Mailhog Web UI         |
| minio    | 9000          | 9000          | MinIO S3 API           |
| minio    | 9001          | 9001          | MinIO Console UI       |
