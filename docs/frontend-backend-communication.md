## Frontend–Backend Communication

The React frontend communicates with the FastAPI backend using HTTP requests and JSON.

### Base URL

The backend base URL is configured using an environment variable.

```env
VITE_API_URL=http://localhost:8000/api/v1
```

The frontend should not hardcode the backend URL inside components or modules.

The shared HTTP client is located in:

```text
src/shared/api/
```

### Authentication

Authentication is handled by the FastAPI backend.

After login, the frontend receives an authentication token. The token is included in protected API requests using the `Authorization` header:

```http
Authorization: Bearer <token>
```

Authentication state is managed by the `auth` module.

### API Requests

Each module is responsible for its own API requests.

For example:

```text
modules/
└── learning-path/
    ├── api/
    │   └── learningPathApi.ts
    ├── components/
    ├── hooks/
    ├── types.ts
    └── index.ts
```

Components should not make HTTP requests directly. API calls should be placed inside the module's `api/` folder.

The shared HTTP client handles common behavior such as:

- Base URL
- Authentication headers
- JSON headers
- Common request configuration
- Common error handling

### Request Flow

The normal request flow is:

```text
Page / Component
      ↓
Module Hook
      ↓
Module API
      ↓
Shared HTTP Client
      ↓
FastAPI
      ↓
PostgreSQL / AI Provider
```

The React application never communicates directly with PostgreSQL or the AI provider.

### Error Handling

FastAPI should return errors using a consistent JSON format and the correct HTTP status code.

For example:

```json
{
  "detail": "Learning path not found"
}
```

The frontend HTTP client handles common errors, while each module can handle errors specific to its functionality.

Common HTTP status codes include:

- `400` — Invalid request
- `401` — Authentication required or invalid token
- `403` — User does not have permission
- `404` — Resource not found
- `422` — Validation error
- `500` — Internal server error

The UI should show simple and clear error messages to the user.
