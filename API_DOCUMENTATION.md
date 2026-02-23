# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Create User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'content-type: application/json' \
  -d '{"name":"John Doe","email":"john.doe@example.com","password":"SecurePass123!"}'
```

Expected: `201 Created` with user payload.

## Get User by ID

```bash
curl http://localhost:3000/api/v1/users/<USER_ID>
```

Expected: `200 OK` for existing user, `404` if not found/deleted.

## List Users

```bash
curl 'http://localhost:3000/api/v1/users?page=1&limit=10&status=active&sortBy=createdAt&sortOrder=desc'
```

Expected: `200 OK` with:
- `data`
- `total`
- `page`
- `limit`
- `totalPages`

## Update User

```bash
curl -X PATCH http://localhost:3000/api/v1/users/<USER_ID> \
  -H 'content-type: application/json' \
  -d '{"name":"John Updated","status":"suspended"}'
```

Expected: `200 OK` with updated user payload.

## Delete User (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/api/v1/users/<USER_ID>
```

Expected: `204 No Content`.

Subsequent get:

```bash
curl http://localhost:3000/api/v1/users/<USER_ID>
```

Expected: `404 Not Found`.

## Swagger UI

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

The OpenAPI specification is generated from JSDoc annotations using `swagger-jsdoc`.
