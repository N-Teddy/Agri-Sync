# AgriSync Pro - API Specifications

> **RESTful API Documentation and Integration Guide**

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Core Endpoints](#core-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)

---

## API Overview

**Base URL:** `https://api.agrisync.pro/v1`

**Content Type:** `application/json`

**Authentication:** JWT Bearer Token

---

## Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "phone": "+237XXXXXXXXX"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user_id": "uuid"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 604800
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer {refresh_token}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 604800
}
```

---

## Core Endpoints

### Fields

**List All Fields**

```http
GET /fields
Authorization: Bearer {access_token}

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Coffee Field A-1",
      "area_hectares": 12.5,
      "boundary": { GeoJSON },
      "soil_type": "Clay"
    }
  ]
}
```

**Create Field**

```http
POST /fields
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "New Field",
  "plantation_id": "uuid",
  "boundary": { GeoJSON Polygon },
  "soil_type": "Sandy loam"
}

Response: 201 Created
```

**Get Field Details**

```http
GET /fields/{field_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "name": "Coffee Field A-1",
  "area_hectares": 12.5,
  "current_weather": {...},
  "recent_activities": [...],
  "active_alerts": [...]
}
```

---

### Weather

**Get Current Weather**

```http
GET /weather/current/{field_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "field_id": "uuid",
  "recorded_at": "2024-12-09T12:00:00Z",
  "temperature": 24.5,
  "humidity": 78,
  "rainfall": 2.3,
  "wind_speed": 12
}
```

**Get Forecast**

```http
GET /weather/forecast/{field_id}?days=7
Authorization: Bearer {access_token}

Response: 200 OK
{
  "field_id": "uuid",
  "forecast": [
    {
      "date": "2024-12-10",
      "temp_min": 18,
      "temp_max": 26,
      "rainfall_mm": 5.2,
      "humidity_avg": 75
    }
  ]
}
```

---

### Activities

**Log Activity**

```http
POST /activities
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "field_id": "uuid",
  "activity_type_id": "uuid",
  "activity_date": "2024-12-09",
  "description": "Applied NPK fertilizer",
  "input_product": "NPK 20-10-10",
  "input_quantity": 50,
  "input_unit": "kg"
}

Response: 201 Created
```

**Upload Activity Photo**

```http
POST /activities/{activity_id}/photos
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

photo: [file]
caption: "After fertilizer application"

Response: 201 Created
{
  "photo_url": "https://s3.../photo.jpg"
}
```

---

### Alerts

**Get Active Alerts**

```http
GET /alerts?status=active
Authorization: Bearer {access_token}

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "title": "Frost Warning",
      "severity": "high",
      "field_name": "Coffee Field C-4",
      "triggered_at": "2024-12-09T18:00:00Z"
    }
  ]
}
```

**Acknowledge Alert**

```http
POST /alerts/{alert_id}/acknowledge
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Alert acknowledged"
}
```

---

### Financial

**Record Cost**

```http
POST /financial/costs
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "field_id": "uuid",
  "cost_type": "fertilizer",
  "amount_xaf": 45000,
  "date": "2024-12-09",
  "description": "NPK fertilizer purchase"
}

Response: 201 Created
```

**Record Revenue**

```http
POST /financial/revenue
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "field_id": "uuid",
  "crop_type": "Coffee",
  "quantity_kg": 500,
  "price_per_kg_xaf": 2500,
  "date": "2024-12-09"
}

Response: 201 Created
```

---

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "boundary",
      "message": "Invalid GeoJSON format"
    }
  ]
}
```

### Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Invalid/missing token    |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

---

## Rate Limiting

**Limits by Endpoint:**

- Login: 5 requests / 15 minutes
- General API: 100 requests / minute
- Weather: 20 requests / minute
- File Upload: 10 requests / hour

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702134000
```

---

## Webhooks

### Configure Webhook

```http
POST /webhooks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["alert.created", "activity.logged"],
  "secret": "your-webhook-secret"
}

Response: 201 Created
```

### Webhook Events

**Alert Created:**

```json
{
  "event": "alert.created",
  "timestamp": "2024-12-09T12:00:00Z",
  "data": {
    "alert_id": "uuid",
    "field_id": "uuid",
    "severity": "high",
    "title": "Frost Warning"
  }
}
```

**Activity Logged:**

```json
{
  "event": "activity.logged",
  "timestamp": "2024-12-09T12:00:00Z",
  "data": {
    "activity_id": "uuid",
    "field_id": "uuid",
    "activity_type": "Fertilizer Application"
  }
}
```

---

For complete API reference with all endpoints and schemas, see the **Swagger/OpenAPI documentation** at:
`https://api.agrisync.pro/docs`
