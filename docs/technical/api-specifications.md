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

**Prod Base URL:** `https://api.agrisync.pro/v1`

**Dev Base URL** `http://localhost:3000/api/v1`

**Content Type:** `application/json`

**Authentication:** JWT Bearer Token

---

## Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "ChangeMe123!",
  "fullName": "John Doe",
  "phoneNumber": "+237650000000",
  "rememberMe": false
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "accessToken": "eyJhbGciOjADLWk***",
    "refreshToken": "eyJhbGciOiJIUz***",
    "user": {
      "email": "owner@example.com",
      "fullName": "John Doe",
      "phoneNumber": "+237650000000",
      "isEmailVerified": false,
      "emailVerificationExpiresAt": "2025-12-17T15:42:58.221Z",
      "emailVerifiedAt": null,
      "avatarUrl": null,
      "googleId": null,
      "refreshTokenExpiresAt": null,
      "id": "aaae6319-226f-4835-b7d5-f17978d814a6",
      "createdAt": "2025-12-16T15:42:58.222Z",
      "updatedAt": "2025-12-16T15:42:58.222Z"
    }
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "ChangeMe123!",
  "rememberMe": true
}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "accessToken": "eyJhbGciOjADLWk***",
    "refreshToken": "eyJhbGciOiJIUz***",
    "user": {
      "id": "aaae6319-226f-4835-b7d5-f17978d814a6",
      "createdAt": "2025-12-16T15:42:58.222Z",
      "updatedAt": "2025-12-16T15:42:58.325Z",
      "email": "owner@example.com",
      "fullName": "John Doe",
      "phoneNumber": "+237650000000",
      "isEmailVerified": false,
      "emailVerificationExpiresAt": "2025-12-17T15:42:58.221Z",
      "emailVerifiedAt": null,
      "avatarUrl": null,
      "googleId": null,
      "refreshTokenExpiresAt": "2025-12-23T15:42:58.000Z"
    }
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1***"
}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "accessToken": "eyJhbGciOjADLWk***",
    "refreshToken": "eyJhbGciOiJIUz***",
    "user": {
      "id": "aaae6319-226f-4835-b7d5-f17978d814a6",
      "createdAt": "2025-12-16T15:42:58.222Z",
      "updatedAt": "2025-12-16T15:42:58.325Z",
      "email": "owner@example.com",
      "fullName": "John Doe",
      "phoneNumber": "+237650000000",
      "isEmailVerified": false,
      "emailVerificationExpiresAt": "2025-12-17T15:42:58.221Z",
      "emailVerifiedAt": null,
      "avatarUrl": null,
      "googleId": null,
      "refreshTokenExpiresAt": "2025-12-23T15:42:58.000Z"
    }
  }
}
```

### Update Profile

```http
POST /auth/profile
Content-Type: application/json

{
  "fullName": "John Doe",
  "phoneNumber": "+237650000000"
}

Response: 200 ok
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "aaae6319-226f-4835-b7d5-f17978d814a6",
    "createdAt": "2025-12-16T15:42:58.222Z",
    "updatedAt": "2025-12-16T15:49:25.186Z",
    "email": "owner@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+237650000000",
    "isEmailVerified": false,
    "emailVerificationExpiresAt": "2025-12-17T15:42:58.221Z",
    "emailVerifiedAt": null,
    "avatarUrl": null,
    "googleId": null,
    "refreshTokenExpiresAt": "2026-01-15T15:49:25.000Z"
  }
}
```

### Get Profile

```http

GET /auth/me
Content-Type: application/json
Authorization: Bearer {access_token}

Response: 200 ok

{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "aaae6319-226f-4835-b7d5-f17978d814a6",
    "createdAt": "2025-12-16T15:42:58.222Z",
    "updatedAt": "2025-12-16T15:49:25.186Z",
    "email": "owner@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+237650000000",
    "isEmailVerified": false,
    "emailVerificationExpiresAt": "2025-12-17T15:42:58.221Z",
    "emailVerifiedAt": null,
    "avatarUrl": null,
    "googleId": null,
    "refreshTokenExpiresAt": "2026-01-15T15:49:25.000Z"
  }
}
```

### Add Profile Picture

```http
POST /auth/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer {access_token}

{
  "avatar: "image.png"
}

Response: 200 ok

{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "avatarUrl": "avatars/aaae6319-226f-4835-b7d5-f17978d814a6-1765901244565.png"
  }
}
```

---

## Core Endpoints

### Plantations

#### Create Plantation

```http
POST /plantations
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "name": "Mount Fako Estate",
  "location": "Buea",
  "region": "South-West"
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "name": "Mount Fako Estate",
    "location": "Buea",
    "region": "South-West",
    "owner": {
      "id": "aaae6319-226f-4835-b7d5-f17978d814a6"
    },
    "id": "4e0a22e4-f9d8-4db3-8381-3c89ac5bf315",
    "createdAt": "2025-12-16T16:29:16.263Z",
    "updatedAt": "2025-12-16T16:29:16.263Z"
  }
}
```

#### Get All Plantations

```http
GET /plantations
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "5333b0b4-4515-4136-84b3-ed84beb2c62b",
      "createdAt": "2025-12-16T15:34:44.703Z",
      "updatedAt": "2025-12-16T15:34:44.703Z",
      "name": "Buea Plantation",
      "location": "Garoua, Cameroon",
      "region": "South-West"
    },
    {
      "id": "e91848fa-4140-4f9a-aa2c-b9512be9d4f9",
      "createdAt": "2025-12-16T15:34:44.684Z",
      "updatedAt": "2025-12-16T15:34:44.684Z",
      "name": "Buea Ranch",
      "location": "Yaounde, Cameroon",
      "region": "Centre"
    }
  ]
}
```

#### Get Plantation by ID

```http
GET /plantations/{plantationId}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "5333b0b4-4515-4136-84b3-ed84beb2c62b",
    "createdAt": "2025-12-16T15:34:44.703Z",
    "updatedAt": "2025-12-16T15:34:44.703Z",
    "name": "Buea Plantation",
    "location": "Garoua, Cameroon",
    "region": "South-West"
  }
}
```

### Fields

#### Create Field

```http
POST /plantations/{plantationId}/fields
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "name": "Block A - North",
  "soilType": "Loamy",
  "boundary": {
    "type": "Polygon",
    "coordinates": [
      [
        [9.312744, 4.152969],
        [9.314117, 4.152969],
        [9.314117, 4.154026],
        [9.312744, 4.154026],
        [9.312744, 4.152969]
      ]
    ]
  }
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "name": "Block A - North",
    "boundary": {
      "type": "Polygon",
      "coordinates": [
        [
          [9.312744, 4.152969],
          [9.314117, 4.152969],
          [9.314117, 4.154026],
          [9.312744, 4.154026],
          [9.312744, 4.152969]
        ]
      ]
    },
    "areaHectares": "1.80",
    "soilType": "Loamy",
    "plantation": {
      "id": "4e0a22e4-f9d8-4db3-8381-3c89ac5bf315",
      "createdAt": "2025-12-16T16:29:16.263Z",
      "updatedAt": "2025-12-16T16:29:16.263Z",
      "name": "Mount Fako Estate",
      "location": "Buea",
      "region": "South-West"
    },
    "currentCrop": null,
    "id": "72c95575-2fc6-441e-a825-505fea1d053e",
    "createdAt": "2025-12-16T16:34:26.890Z",
    "updatedAt": "2025-12-16T16:34:26.890Z"
  }
}
```

#### List Fields

```http
GET /plantations/{plantationId}/fields
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "59aa319d-dca2-4b21-bad0-21a3d85e1c47",
      "createdAt": "2025-12-16T15:34:48.269Z",
      "updatedAt": "2025-12-16T15:34:50.387Z",
      "name": "Field Palm Avenue 12",
      "boundary": {
        "type": "Polygon",
        "coordinates": [
          [
            [11.920576, 4.642385],
            [11.922576, 4.642385],
            [11.922576, 4.644385],
            [11.920576, 4.644385],
            [11.920576, 4.642385]
          ]
        ]
      },
      "areaHectares": "4.97",
      "soilType": "Loamy",
      "currentCrop": "maize"
    },
    {
      "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
      "createdAt": "2025-12-16T15:34:48.259Z",
      "updatedAt": "2025-12-16T15:34:49.315Z",
      "name": "Field Palm Avenue 20",
      "boundary": {
        "type": "Polygon",
        "coordinates": [
          [
            [12.852589, 5.022209],
            [12.854589, 5.022209],
            [12.854589, 5.024209],
            [12.852589, 5.024209],
            [12.852589, 5.022209]
          ]
        ]
      },
      "areaHectares": "4.98",
      "soilType": "Peaty",
      "currentCrop": "coffee_arabica"
    },
    {
      "id": "0bc6a740-3522-4426-af2d-9c6f66c94b20",
      "createdAt": "2025-12-16T15:34:48.246Z",
      "updatedAt": "2025-12-16T15:34:48.295Z",
      "name": "Field Cocoa Lane 45",
      "boundary": {
        "type": "Polygon",
        "coordinates": [
          [
            [ 13.960477, 7.18497],
            [ 13.962477, 7.18497],
            [ 13.962477, 7.18697],
            [ 13.960477, 7.18697],
            [ 13.960477, 7.18497]
          ]
        ]
      },
      "areaHectares": "5.00",
      "soilType": "Clay",
      "currentCrop": "banana"
    }
  ]
}
```

#### Get Field by ID

```http
GET /plantations/{plantationId}/fields/{fieldId}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "72c95575-2fc6-441e-a825-505fea1d053e",
    "createdAt": "2025-12-16T16:34:26.890Z",
    "updatedAt": "2025-12-16T16:34:26.890Z",
    "name": "Block A - North",
    "boundary": {
      "type": "Polygon",
      "coordinates": [
        [
          [9.312744,4.152969],
          [9.314117,4.152969],
          [9.314117,4.154026],
          [9.312744,4.154026],
          [9.312744,4.152969]
        ]
      ]
    },
    "areaHectares": "1.80",
    "soilType": "Loamy",
    "currentCrop": null
  }
}
```

---

## Crop Management

### Planting Seasons

#### Create Planting Season

```http
POST /fields/{fieldId}/planting-seasons
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "cropType": "COFFEE_ROBUSTA",
  "plantingDate": "2025-02-01",
  "expectedHarvestDate": "2025-08-01"
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "cropType": "coffee_robusta",
    "plantingDate": "2025-02-01",
    "expectedHarvestDate": "2025-08-01",
    "status": "active",
    "field": {
      "id": "72c95575-2fc6-441e-a825-505fea1d053e",
      "createdAt": "2025-12-16T16:34:26.890Z",
      "updatedAt": "2025-12-16T16:34:26.890Z",
      "name": "Block A - North",
      "boundary": {
        "type": "Polygon",
        "coordinates": [
          [
            [9.312744,4.152969],
            [9.314117,4.152969],
            [9.314117,4.154026],
            [9.312744,4.154026],
            [9.312744,4.152969]
          ]
        ]
      },
      "areaHectares": "1.80",
      "soilType": "Loamy",
      "currentCrop": null,
      "plantation": {
        "id": "4e0a22e4-f9d8-4db3-8381-3c89ac5bf315",
        "createdAt": "2025-12-16T16:29:16.263Z",
        "updatedAt": "2025-12-16T16:29:16.263Z",
        "name": "Mount Fako Estate",
        "location": "Buea",
        "region": "South-West",
        "owner": {
          "id": "aaae6319-226f-4835-b7d5-f17978d814a6",
          "createdAt": "2025-12-16T15:42:58.222Z",
          "updatedAt": "2025-12-16T16:07:24.579Z",
          "email": "owner@example.com",
          "fullName": "John Doe",
          "phoneNumber": "+237650000000",
          "passwordHash": "$2b$10$hYKaKM1k6Ei.CE6moaaZ5eocDC.ImfenUdKaGFOEkUtLuXzyC0T7.",
          "isEmailVerified": false,
          "emailVerificationToken": "27b9069a2223bd566aa7c29cafc6aff26c3913c21f49922b7648185eca202e26",
          "emailVerificationExpiresAt": "2025-12-17T15:42:58.221Z",
          "emailVerifiedAt": null,
          "avatarUrl": "avatars/aaae6319-226f-4835-b7d5-f17978d814a6-1765901244565.png",
          "googleId": null,
          "refreshTokenHash": "$2b$10$n83XerEhcca9WULnAR0DI.2r4hw0QJmOw0zuaDp1blTp.nlszAype",
          "refreshTokenExpiresAt": "2026-01-15T15:49:25.000Z"
        }
      }
    },
    "growthStage": "maturation",
    "actualHarvestDate": null,
    "yieldKg": null,
    "id": "3ecb7c45-a148-42ef-8aae-a0769b6347fd",
    "createdAt": "2025-12-16T16:40:26.662Z",
    "updatedAt": "2025-12-16T16:40:26.662Z"
  }
}
```

#### List Planting Seasons

```http
GET /fields/{fieldId}/planting-seasons
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "069f1b12-d691-4338-8a4a-640d1e79d747",
      "createdAt": "2025-12-16T15:34:50.373Z",
      "updatedAt": "2025-12-16T15:34:50.373Z",
      "cropType": "maize",
      "plantingDate": "2025-05-16",
      "expectedHarvestDate": "2025-09-16",
      "actualHarvestDate": null,
      "yieldKg": null,
      "status": "active",
      "growthStage": "maturation"
    }
  ]
}
```

#### Mark Harvest Complete

```http
PATCH /fields/{fieldId}/planting-seasons/{seasonId}/harvest
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "actualHarvestDate": "2025-09-15",
  "yieldKg": 1500
}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "069f1b12-d691-4338-8a4a-640d1e79d747",
    "createdAt": "2025-12-16T15:34:50.373Z",
    "updatedAt": "2025-12-16T16:45:01.848Z",
    "cropType": "maize",
    "plantingDate": "2025-05-16",
    "expectedHarvestDate": "2025-09-16",
    "actualHarvestDate": "2025-09-15",
    "yieldKg": "1500",
    "status": "harvested",
    "growthStage": "post_harvest"
  }
}
```

### Field Activities

#### Log Activity

```http
POST /fields/{fieldId}/activities
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "activityType": "PLANTING",
  "activityDate": "2025-02-05",
  "notes": "Applied organic fertilizer on row 1",
  "inputProduct": "NPK 20-10-10",
  "inputCostXaf": 12500,
  "plantingSeasonId": "uuid"
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "uuid",
    "activityType": "PLANTING",
    "activityDate": "2025-02-05"
  }
}
```

#### Get Activities

```http
GET /fields/{fieldId}/activities?plantingSeasonId={uuid}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "315dccd4-83b2-45b2-b5c2-8a3c64133ccf",
      "createdAt": "2025-12-16T15:34:50.778Z",
      "updatedAt": "2025-12-16T15:34:50.778Z",
      "activityType": "spraying",
      "activityDate": "2025-08-21",
      "notes": "Sustainable soil harvest premium care organic sustainable harvest quality.",
      "inputProduct": "Compost Mix",
      "inputCostXaf": "26305.00",
      "plantingSeason": {
        "id": "069f1b12-d691-4338-8a4a-640d1e79d747",
        "createdAt": "2025-12-16T15:34:50.373Z",
        "updatedAt": "2025-12-16T16:45:01.848Z",
        "cropType": "maize",
        "plantingDate": "2025-05-16",
        "expectedHarvestDate": "2025-09-16",
        "actualHarvestDate": "2025-09-15",
        "yieldKg": "1500.00",
        "status": "harvested",
        "growthStage": "post_harvest"
      }
    },
    {
      "id": "a06527ed-3474-4c1c-890f-61513c130628",
      "createdAt": "2025-12-16T15:34:50.746Z",
      "updatedAt": "2025-12-16T15:34:50.746Z",
      "activityType": "land_preparation",
      "activityDate": "2025-08-04",
      "notes": "Quality nourish quality organic nourish nourish care.",
      "inputProduct": null,
      "inputCostXaf": null,
      "plantingSeason": {
        "id": "069f1b12-d691-4338-8a4a-640d1e79d747",
        "createdAt": "2025-12-16T15:34:50.373Z",
        "updatedAt": "2025-12-16T16:45:01.848Z",
        "cropType": "maize",
        "plantingDate": "2025-05-16",
        "expectedHarvestDate": "2025-09-16",
        "actualHarvestDate": "2025-09-15",
        "yieldKg": "1500.00",
        "status": "harvested",
        "growthStage": "post_harvest"
      }
    },
    {
      "id": "4dd2e247-cac4-4803-ab34-2ee4677840b8",
      "createdAt": "2025-12-16T15:34:50.846Z",
      "updatedAt": "2025-12-16T15:34:50.846Z",
      "activityType": "fertilizer_application",
      "activityDate": "2025-07-11",
      "notes": "Fresh organic soil care care harvest yield organic soil.",
      "inputProduct": "Soil Booster",
      "inputCostXaf": "25231.00",
      "plantingSeason": {
        "id": "069f1b12-d691-4338-8a4a-640d1e79d747",
        "createdAt": "2025-12-16T15:34:50.373Z",
        "updatedAt": "2025-12-16T16:45:01.848Z",
        "cropType": "maize",
        "plantingDate": "2025-05-16",
        "expectedHarvestDate": "2025-09-16",
        "actualHarvestDate": "2025-09-15",
        "yieldKg": "1500.00",
        "status": "harvested",
        "growthStage": "post_harvest"
      }
    },
    {
      "id": "1ce86057-8d6a-46ac-91e6-e844a9d3abdb",
      "createdAt": "2025-12-16T15:34:50.817Z",
      "updatedAt": "2025-12-16T15:34:50.817Z",
      "activityType": "land_preparation",
      "activityDate": "2025-06-28",
      "notes": "Organic soil soil green quality sustainable fresh sustainable growth soil yield quality.",
      "inputProduct": null,
      "inputCostXaf": null,
      "plantingSeason": {
        "id": "069f1b12-d691-4338-8a4a-640d1e79d747",
        "createdAt": "2025-12-16T15:34:50.373Z",
        "updatedAt": "2025-12-16T16:45:01.848Z",
        "cropType": "maize",
        "plantingDate": "2025-05-16",
        "expectedHarvestDate": "2025-09-16",
        "actualHarvestDate": "2025-09-15",
        "yieldKg": "1500.00",
        "status": "harvested",
        "growthStage": "post_harvest"
      }
    }
  ]
}
```

### Activity Photos

#### Upload Photo

```http
POST /fields/{fieldId}/activities/{activityId}/photos
Content-Type: multipart/form-data
Authorization: Bearer {access_token}

{
  "photo": "binary_data",
  "caption": "Fertilizer application on Field A"
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "photoUrl": "http://localhost:3000/uploads/activity/609a0557-b03f-4f26-a9c5-cbb1385a4fa8.jpeg",
    "caption": "string",
    "width": 611,
    "height": 699,
    "fileSize": 39209,
    "takenAt": "2025-12-16T16:52:20.797Z",
    "activity": {
      "id": "7b664af4-cdcb-4828-bc83-4ff9e7dd004c",
      "createdAt": "2025-12-16T15:34:50.761Z",
      "updatedAt": "2025-12-16T15:34:50.761Z",
      "activityType": "weeding",
      "activityDate": "2025-09-01",
      "notes": "Sustainable care sustainable protect nourish premium yield growth yield organic soil care.",
      "inputProduct": null,
      "inputCostXaf": null,
      "field": {
        "id": "59aa319d-dca2-4b21-bad0-21a3d85e1c47",
        "createdAt": "2025-12-16T15:34:48.269Z",
        "updatedAt": "2025-12-16T16:45:01.857Z",
        "name": "Field Palm Avenue 12",
        "boundary": {
          "type": "Polygon",
          "coordinates": [
            [
              [11.920576,4.642385],
              [11.922576,4.642385],
              [11.922576,4.644385],
              [11.920576,4.644385],
              [11.920576,4.642385]
            ]
          ]
        },
        "areaHectares": "4.97",
        "soilType": "Loamy",
        "currentCrop": null
      }
    },
    "publicId": null,
    "id": "24420ea8-5ac6-44a1-8ade-4115fa2a8541",
    "createdAt": "2025-12-16T16:52:20.798Z",
    "updatedAt": "2025-12-16T16:52:20.798Z"
  }
}
```

#### Get Photos

```http
GET /fields/{fieldId}/activities/{activityId}/photos
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "24420ea8-5ac6-44a1-8ade-4115fa2a8541",
      "createdAt": "2025-12-16T16:52:20.798Z",
      "updatedAt": "2025-12-16T16:52:20.798Z",
      "photoUrl": "http://localhost:3000/uploads/activity/609a0557-b03f-4f26-a9c5-cbb1385a4fa8.jpeg",
      "publicId": null,
      "caption": "string",
      "width": 611,
      "height": 699,
      "fileSize": 39209,
      "takenAt": "2025-12-16T16:52:20.797Z"
    },
    {
      "id": "00a52e26-9cd2-40d1-8118-46e5e73d0218",
      "createdAt": "2025-12-16T15:34:51.048Z",
      "updatedAt": "2025-12-16T15:34:51.048Z",
      "photoUrl": "http://localhost:3000/uploads/activity/6bf2806c-7aff-4559-b4fc-335d298d3e5c.jpeg",
      "publicId": null,
      "caption": "Sample photo 2",
      "width": 1,
      "height": 1,
      "fileSize": 505,
      "takenAt": "2025-12-16T15:34:51.047Z"
    },
    {
      "id": "e581a45f-6818-4e38-bc5e-4586e78323d2",
      "createdAt": "2025-12-16T15:34:51.019Z",
      "updatedAt": "2025-12-16T15:34:51.019Z",
      "photoUrl": "http://localhost:3000/uploads/activity/3c0849c1-d60b-45cb-9305-a9c491641edb.jpeg",
      "publicId": null,
      "caption": "Sample photo 1",
      "width": 1,
      "height": 1,
      "fileSize": 505,
      "takenAt": "2025-12-16T15:34:51.018Z"
    }
  ]
}
```

#### Delete Photo

```http
DELETE /fields/{fieldId}/activities/{activityId}/photos/{photoId}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully"
}
```

---

## Financial Records

### Record Cost

```http
POST /fields/{fieldId}/financial-records/costs
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "amountXaf": 45000,
  "recordDate": "2025-02-12",
  "productName": "NPK 20-10-10",
  "description": "Applied on Field Block A rows 1-3"
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "uuid",
    "type": "COST",
    "amountXaf": 45000,
    "recordDate": "2025-02-12"
  }
}
```

### Record Revenue

```http
POST /fields/{fieldId}/financial-records/revenue
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "cropType": "COFFEE_ARABICA",
  "quantityKg": 1500,
  "pricePerKgXaf": 2500,
  "recordDate": "2025-09-01",
  "buyerName": "Douala Coffee Traders",
  "description": "Sold to Douala Coffee Traders"
}

Response: 201 Created
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "uuid",
    "type": "REVENUE",
    "amountXaf": 3750000,
    "recordDate": "2025-09-01"
  }
}
```

### Get Records

```http
GET /fields/{fieldId}/financial-records?recordType=COST&startDate=2025-01-01&endDate=2025-03-31
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "uuid",
      "type": "COST",
      "amountXaf": 45000,
      "recordDate": "2025-02-12"
    }
  ]
}
```

### Get Field Summary

```http
GET /fields/{fieldId}/financial-records/summary
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "totalRevenue": 3750000,
    "totalCost": 45000,
    "netProfit": 3705000
  }
}
```

---

## Alerts

### Get Alerts

```http
GET /alerts?fieldId={uuid}&alertType=PEST_OUTBREAK&severity=HIGH&unacknowledgedOnly=true
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "id": "uuid",
      "type": "PEST_OUTBREAK",
      "severity": "HIGH",
      "message": "Locust swarm detected near Block A",
      "isAcknowledged": false
    }
  ]
}
```

### Get Unacknowledged Count

```http
GET /alerts/unacknowledged-count
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "count": 5
  }
}
```

### Acknowledge Alert

```http
PATCH /alerts/{id}/acknowledge
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "uuid",
    "isAcknowledged": true
  }
}
```

### Resolve Alert

```http
PATCH /alerts/{id}/resolve
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "id": "uuid",
    "status": "RESOLVED"
  }
}
```

---

## Weather

### Get Current Weather

```http
GET /fields/{fieldId}/weather/current
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "recordedAt": "2025-12-16T17:00:36.000Z",
    "temperatureC": 24.35,
    "humidityPercent": 80,
    "source": "openweather",
    "isForecast": false
  }
}
```

### Get Forecast

```http
GET /fields/{fieldId}/weather/forecast?days=3
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": [
    {
      "recordedAt": "2025-12-16T21:00:00.000Z",
      "temperatureC": 23.4,
      "humidityPercent": 83.5,
      "rainfallMm": 0.49,
      "source": "openweather",
      "isForecast": true
    },
    {
      "recordedAt": "2025-12-17T21:00:00.000Z",
      "temperatureC": 24.09,
      "humidityPercent": 78.25,
      "rainfallMm": 2.56,
      "source": "openweather",
      "isForecast": true
    },
    {
      "recordedAt": "2025-12-18T21:00:00.000Z",
      "temperatureC": 24.35,
      "humidityPercent": 77.38,
      "rainfallMm": 1.67,
      "source": "openweather",
      "isForecast": true
    }
  ]
}
```

---

## Reports

### Field Performance Report

```http
GET /reports/field-performance?fieldId={uuid}&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "fieldId": "uuid",
    "totalYieldKg": 5000,
    "totalRevenue": 12500000,
    "totalCosts": 2000000
  }
}
```

### Seasonal Summary Report

```http
GET /reports/seasonal-summary?seasonId={uuid}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "seasonId": "uuid",
    "cropType": "COFFEE_ROBUSTA",
    "durationDays": 180,
    "efficiency": 0.85
  }
}
```

### Weather Impact Report

```http
GET /reports/weather-impact?fieldId={uuid}&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "rainfallTotalMm": 1200,
    "averageTemperature": 26.5,
    "extremeWeatherEvents": 3
  }
}
```

---

## Data Export

### Export Financial Records

```http
GET /export/financial-records?fieldId={uuid}
Authorization: Bearer {access_token}
Accept: text/csv

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="financial-records-....csv"

Date,Type,Amount,Description
2025-01-01,COST,5000,Fertilizer
...
```

### Export Activities

```http
GET /export/activities?fieldId={uuid}
Authorization: Bearer {access_token}
Accept: text/csv

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="activities-....csv"

Date,Type,Notes
2025-01-01,PLANTING,Initial planting
...
```

### Export Fields

```http
GET /export/fields
Authorization: Bearer {access_token}
Accept: text/csv

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="fields-....csv"

Name,Location,Area
Block A,Buea,2.5
...
```

### Export Planting Seasons

```http
GET /export/planting-seasons?fieldId={uuid}
Authorization: Bearer {access_token}
Accept: text/csv

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="planting-seasons-....csv"

Crop,Planting Date,Harvest Date,Status
Coffee,2025-01-01,2025-06-01,HARVESTED
...
```

---

## Dashboard

### Get Summary

```http
GET /dashboard/summary
Authorization: Bearer {access_token}

Response: 200 OK
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "statistics": {
      "totalFields": 6,
      "totalPlantations": 2,
      "totalActivities": 60,
      "totalAlerts": 0
    },
    "fields": [
      {
        "id": "59aa319d-dca2-4b21-bad0-21a3d85e1c47",
        "name": "Field Palm Avenue 12",
        "areaHectares": "4.97",
        "currentCrop": null
      },
      {
        "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
        "name": "Field Palm Avenue 20",
        "areaHectares": "4.98",
        "currentCrop": "coffee_arabica"
      },
      {
        "id": "0bc6a740-3522-4426-af2d-9c6f66c94b20",
        "name": "Field Cocoa Lane 45",
        "areaHectares": "5.00",
        "currentCrop": "banana"
      },
      {
        "id": "9b99ea10-6627-420b-a23c-982d675dd601",
        "name": "Field Harvest Way 4",
        "areaHectares": "4.96",
        "currentCrop": "coffee_robusta"
      },
      {
        "id": "18dd5065-9e00-4b84-aa60-1d8b6da7c918",
        "name": "Field Coffee Street 3",
        "areaHectares": "5.00",
        "currentCrop": "coffee_robusta"
      },
      {
        "id": "647bac4d-d502-4fdf-a25f-ea40b3a696cf",
        "name": "Field Palm Avenue 41",
        "areaHectares": "4.99",
        "currentCrop": "maize"
      }
    ],
    "weatherOverview": [
      {
        "fieldId": "59aa319d-dca2-4b21-bad0-21a3d85e1c47",
        "fieldName": "Field Palm Avenue 12",
        "recordedAt": "2025-12-16T16:55:09.000Z",
        "temperatureC": 25.35,
        "humidityPercent": 42,
        "source": "openweather"
      },
      {
        "fieldId": "cd4607fb-436c-40f6-8ab8-371289b761b2",
        "fieldName": "Field Palm Avenue 20",
        "recordedAt": "2025-12-16T16:45:01.000Z",
        "temperatureC": 26.8,
        "humidityPercent": 24,
        "source": "openweather"
      },
      {
        "fieldId": "0bc6a740-3522-4426-af2d-9c6f66c94b20",
        "fieldName": "Field Cocoa Lane 45",
        "recordedAt": "2025-12-16T16:45:01.000Z",
        "temperatureC": 22.96,
        "humidityPercent": 18,
        "source": "openweather"
      },
      {
        "fieldId": "9b99ea10-6627-420b-a23c-982d675dd601",
        "fieldName": "Field Harvest Way 4",
        "recordedAt": "2025-12-16T16:45:00.000Z",
        "temperatureC": 27.64,
        "humidityPercent": 78,
        "source": "openweather"
      },
      {
        "fieldId": "18dd5065-9e00-4b84-aa60-1d8b6da7c918",
        "fieldName": "Field Coffee Street 3",
        "recordedAt": "2025-12-16T16:45:00.000Z",
        "temperatureC": 29.62,
        "humidityPercent": 18,
        "source": "openweather"
      },
      {
        "fieldId": "647bac4d-d502-4fdf-a25f-ea40b3a696cf",
        "fieldName": "Field Palm Avenue 41",
        "recordedAt": "2025-12-16T16:45:00.000Z",
        "temperatureC": 21.33,
        "humidityPercent": 21,
        "source": "openweather"
      }
    ],
    "recentActivities": [
      {
        "id": "ee174e05-6949-4555-bfb7-1cd8e20cf58d",
        "createdAt": "2025-12-16T15:34:49.553Z",
        "updatedAt": "2025-12-16T15:34:49.553Z",
        "activityType": "fertilizer_application",
        "activityDate": "2026-02-14",
        "notes": "Yield nourish sustainable yield protect sustainable protect quality soil.",
        "inputProduct": "Mulch Cover",
        "inputCostXaf": "37892.00",
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "f6a02c2d-d4e8-45d0-915e-615af2c9733c",
        "createdAt": "2025-12-16T15:34:49.594Z",
        "updatedAt": "2025-12-16T15:34:49.594Z",
        "activityType": "harvesting",
        "activityDate": "2026-02-07",
        "notes": "Nourish soil soil nourish organic protect care soil growth harvest.",
        "inputProduct": null,
        "inputCostXaf": null,
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "4504a7c4-b527-4064-9fc6-e4754f04d166",
        "createdAt": "2025-12-16T15:34:49.642Z",
        "updatedAt": "2025-12-16T15:34:49.642Z",
        "activityType": "planting",
        "activityDate": "2026-01-27",
        "notes": "Yield fresh soil yield yield harvest protect harvest care premium.",
        "inputProduct": null,
        "inputCostXaf": null,
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "502f2f20-390a-4641-af1e-7889a8923b0d",
        "createdAt": "2025-12-16T15:34:49.667Z",
        "updatedAt": "2025-12-16T15:34:49.667Z",
        "activityType": "fertilizer_application",
        "activityDate": "2026-01-15",
        "notes": "Harvest growth premium green sustainable harvest care quality harvest.",
        "inputProduct": "Organic Fertilizer",
        "inputCostXaf": "39482.00",
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "e7933245-d1a2-4523-9470-acda4c2c675a",
        "createdAt": "2025-12-16T15:34:49.701Z",
        "updatedAt": "2025-12-16T15:34:49.701Z",
        "activityType": "spraying",
        "activityDate": "2025-12-24",
        "notes": "Green quality nourish protect quality care sustainable organic growth.",
        "inputProduct": "Seed Pack",
        "inputCostXaf": "49239.00",
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "0c8fd26d-252c-4060-a712-7d12bd1b2d96",
        "createdAt": "2025-12-16T15:34:49.719Z",
        "updatedAt": "2025-12-16T15:34:49.719Z",
        "activityType": "harvesting",
        "activityDate": "2025-12-02",
        "notes": "Quality organic protect nourish sustainable sustainable.",
        "inputProduct": null,
        "inputCostXaf": null,
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "5f50afe0-014a-4ede-948a-10b6f7b146fd",
        "createdAt": "2025-12-16T15:34:49.684Z",
        "updatedAt": "2025-12-16T15:34:49.684Z",
        "activityType": "planting",
        "activityDate": "2025-11-11",
        "notes": "Quality sustainable yield quality green yield.",
        "inputProduct": null,
        "inputCostXaf": null,
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "8af3c15d-e50a-4c18-a0b9-8d43dcc957f6",
        "createdAt": "2025-12-16T15:34:49.579Z",
        "updatedAt": "2025-12-16T15:34:49.579Z",
        "activityType": "harvesting",
        "activityDate": "2025-11-04",
        "notes": "Fresh growth green quality green care quality.",
        "inputProduct": null,
        "inputCostXaf": null,
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "d6df92ef-a90c-4fb1-907c-22058dd69aaa",
        "createdAt": "2025-12-16T15:34:49.610Z",
        "updatedAt": "2025-12-16T15:34:49.610Z",
        "activityType": "fertilizer_application",
        "activityDate": "2025-10-20",
        "notes": "Nourish growth growth harvest sustainable premium premium.",
        "inputProduct": "Seed Pack",
        "inputCostXaf": "31103.00",
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      },
      {
        "id": "adb72641-5a5c-4868-962a-3125eb0aafac",
        "createdAt": "2025-12-16T15:34:49.625Z",
        "updatedAt": "2025-12-16T15:34:49.625Z",
        "activityType": "planting",
        "activityDate": "2025-10-17",
        "notes": "Yield fresh green protect yield quality yield soil organic protect.",
        "inputProduct": null,
        "inputCostXaf": null,
        "field": {
          "id": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "createdAt": "2025-12-16T15:34:48.259Z",
          "updatedAt": "2025-12-16T15:34:49.315Z",
          "name": "Field Palm Avenue 20",
          "boundary": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.852589,5.022209],
                [12.854589,5.022209],
                [12.854589,5.024209],
                [12.852589,5.024209],
                [12.852589,5.022209]
              ]
            ]
          },
          "areaHectares": "4.98",
          "soilType": "Peaty",
          "currentCrop": "coffee_arabica"
        },
        "plantingSeason": {
          "id": "378a690e-8de5-4f4a-9c37-cdf369020f3c",
          "createdAt": "2025-12-16T15:34:49.310Z",
          "updatedAt": "2025-12-16T15:34:49.310Z",
          "cropType": "coffee_arabica",
          "plantingDate": "2025-10-16",
          "expectedHarvestDate": "2026-02-16",
          "actualHarvestDate": null,
          "yieldKg": null,
          "status": "active",
          "growthStage": "flowering"
        }
      }
    ],
    "activeAlerts": [],
    "alertStatistics": {
      "total": 0,
      "unacknowledged": 0,
      "bySevertiy": {
        "low": 0,
        "medium": 0,
        "high": 0
      }
    },
    "financialSnapshot": {
      "totals": {
        "costs": 2839798,
        "revenue": 88643615.1,
        "profit": 85803817.1,
        "profitMargin": 96.8
      },
      "perField": [
        {
          "fieldId": "59aa319d-dca2-4b21-bad0-21a3d85e1c47",
          "fieldName": "Field Palm Avenue 12",
          "totalCostsXaf": 427577,
          "totalRevenueXaf": 11305670.46,
          "profitXaf": 10878093.46,
          "profitStatus": "profit"
        },
        {
          "fieldId": "cd4607fb-436c-40f6-8ab8-371289b761b2",
          "fieldName": "Field Palm Avenue 20",
          "totalCostsXaf": 482652,
          "totalRevenueXaf": 11995301.14,
          "profitXaf": 11512649.14,
          "profitStatus": "profit"
        },
        {
          "fieldId": "0bc6a740-3522-4426-af2d-9c6f66c94b20",
          "fieldName": "Field Cocoa Lane 45",
          "totalCostsXaf": 623602,
          "totalRevenueXaf": 16172276.58,
          "profitXaf": 15548674.58,
          "profitStatus": "profit"
        },
        {
          "fieldId": "9b99ea10-6627-420b-a23c-982d675dd601",
          "fieldName": "Field Harvest Way 4",
          "totalCostsXaf": 396125,
          "totalRevenueXaf": 18686684.79,
          "profitXaf": 18290559.79,
          "profitStatus": "profit"
        },
        {
          "fieldId": "18dd5065-9e00-4b84-aa60-1d8b6da7c918",
          "fieldName": "Field Coffee Street 3",
          "totalCostsXaf": 549288,
          "totalRevenueXaf": 10846192.1,
          "profitXaf": 10296904.1,
          "profitStatus": "profit"
        },
        {
          "fieldId": "647bac4d-d502-4fdf-a25f-ea40b3a696cf",
          "fieldName": "Field Palm Avenue 41",
          "totalCostsXaf": 360554,
          "totalRevenueXaf": 19637490.03,
          "profitXaf": 19276936.03,
          "profitStatus": "profit"
        }
      ]
    },
    "fieldPerformance": [
      {
        "fieldId": "59aa319d-dca2-4b21-bad0-21a3d85e1c47",
        "fieldName": "Field Palm Avenue 12",
        "currentCrop": null,
        "profitability": 10878093.46,
        "status": "profitable",
        "totalCosts": 427577,
        "totalRevenue": 11305670.46
      },
      {
        "fieldId": "cd4607fb-436c-40f6-8ab8-371289b761b2",
        "fieldName": "Field Palm Avenue 20",
        "currentCrop": "coffee_arabica",
        "profitability": 11512649.14,
        "status": "profitable",
        "totalCosts": 482652,
        "totalRevenue": 11995301.14
      },
      {
        "fieldId": "0bc6a740-3522-4426-af2d-9c6f66c94b20",
        "fieldName": "Field Cocoa Lane 45",
        "currentCrop": "banana",
        "profitability": 15548674.58,
        "status": "profitable",
        "totalCosts": 623602,
        "totalRevenue": 16172276.58
      },
      {
        "fieldId": "9b99ea10-6627-420b-a23c-982d675dd601",
        "fieldName": "Field Harvest Way 4",
        "currentCrop": "coffee_robusta",
        "profitability": 18290559.79,
        "status": "profitable",
        "totalCosts": 396125,
        "totalRevenue": 18686684.79
      },
      {
        "fieldId": "18dd5065-9e00-4b84-aa60-1d8b6da7c918",
        "fieldName": "Field Coffee Street 3",
        "currentCrop": "coffee_robusta",
        "profitability": 10296904.1,
        "status": "profitable",
        "totalCosts": 549288,
        "totalRevenue": 10846192.1
      },
      {
        "fieldId": "647bac4d-d502-4fdf-a25f-ea40b3a696cf",
        "fieldName": "Field Palm Avenue 41",
        "currentCrop": "maize",
        "profitability": 19276936.03,
        "status": "profitable",
        "totalCosts": 360554,
        "totalRevenue": 19637490.03
      }
    ]
  }
}
```

---

## System Health

### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "success",
  "message": "Application healthy",
  "data": {
    "status": "ok",
    "info": {
      "memory_heap": {
        "status": "up"
      },
      "memory_rss": {
        "status": "up"
      }
    },
    "error": {},
    "details": {
      "memory_heap": {
        "status": "up"
      },
      "memory_rss": {
        "status": "up"
      }
    }
  }
}
```

---

## Rate Limiting & Webhooks

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
