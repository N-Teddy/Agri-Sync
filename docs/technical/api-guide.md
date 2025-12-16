# AgriSync Pro API Guide (v1)

Practical, code-accurate reference for integrating with the NestJS backend. Use together with Swagger at `/api/docs`.

---

## Core Conventions

- **Base path:** `/api/v1` (set in `app-config.util.ts`)
- **Auth:** `Authorization: Bearer <accessToken>` on all routes except auth flows
- **Content types:** `application/json` unless otherwise noted; file uploads use `multipart/form-data`
- **Response envelope:** Every success is wrapped as
  ```json
  { "status": "success", "message": "Request processed successfully", "data": { ... } }
  ```
  Errors are formatted by `AllExceptionsFilter`
  ```json
  { "status": "error", "message": "Human-readable reason", "errors": {...}, "timestamp": "...", "path": "/api/v1/..." }
  ```
- **Dates:** ISO strings (`YYYY-MM-DD`) normalized server-side
- **Numbers:** Monetary/yield values are stored with 2‑decimal precision; send as numbers
- **Versioning:** URI versioning (`/v1`) is enabled; keep paths version-aware

---

## Module Endpoints

### Auth & Profile (`/auth`)
- `POST /register` — `{ email, password, fullName, phoneNumber?, rememberMe? }` → tokens + sanitized `user`
- `POST /login` — same payload as register (minus `fullName`) → tokens + `user`
- `POST /google` — `{ idToken, rememberMe? }` → tokens + `user`; links/creates Google account
- `POST /verify-email` or `GET /verify-email?token=` — `{ message }`; link URL uses `${webUrl}/api/auth/verify-email?token=...`
- `POST /refresh` — `{ refreshToken }` → new token pair + `user`
- `POST /logout` — clears stored refresh token; `{ message }`
- `GET /me` — current profile (no secrets)
- `PATCH /profile` — `{ fullName?, phoneNumber? }` → updated profile
- `POST /profile/avatar` — `multipart/form-data` with `avatar` (≤5 MB, image/*) → `{ avatarUrl }`; auto-cloud uploads in production

### Plantations (`/plantations`)
- `POST /` — create plantation `{ name, location, region }`
- `GET /` — list owner plantations (desc by `createdAt`)
- `GET /:plantationId` — single plantation (ownership enforced)

### Fields (`/plantations/:plantationId/fields`)
- `POST /` — create field `{ name, soilType?, boundary: GeoJSON Polygon }`; server calculates `areaHectares`; max **5 fields** per plantation
- `GET /` — list fields for plantation
- `GET /:fieldId` — field detail with computed `areaHectares` and `currentCrop`

**Boundary rules:** GeoJSON polygon with closed ring (first point equals last, `[lng, lat]` order); invalid geometry returns 400. Area is computed via `field-geometry.util`.

### Planting Seasons (`/fields/:fieldId/planting-seasons`)
- `POST /` — `{ cropType, plantingDate, expectedHarvestDate? }`; rejects if any PLANNED/ACTIVE season exists or dates overlap
- `GET /` — seasons for field (newest first) with derived `growthStage`
- `GET /:seasonId` — specific season with `growthStage`
- `PATCH /:seasonId/harvest` — `{ actualHarvestDate, yieldKg }`; sets status to `harvested`, clears `field.currentCrop`

### Field Activities (`/fields/:fieldId/activities`)
- `POST /` — `{ activityType, activityDate, notes?, inputProduct?, inputCostXaf?, plantingSeasonId? }`; validates against active season dates/status if provided/available
- `GET /` — optional `plantingSeasonId` filter; sorted newest first

### Activity Photos (`/fields/:fieldId/activities/:activityId/photos`)
- `POST /` — `multipart/form-data` with `photo` (image/*) and optional `caption` (255 chars); server resizes/compresses to max 1920×1080 @85% quality
- `GET /` — list photos for activity (desc by `takenAt`)
- `DELETE /:photoId` — removes DB record and image from storage/Cloudinary

### Weather (`/fields/:fieldId/weather`)
- `GET /current` — fetches live reading from OpenWeather, persists it, triggers alert evaluation; returns `{ recordedAt, temperatureC?, humidityPercent?, rainfallMm?, source, isForecast:false }`
- `GET /forecast?days=1-7` — saves and returns normalized daily forecasts; also evaluated for alerts

### Alerts (`/alerts`)
- `GET /` — filters: `fieldId?`, `alertType?`, `severity?`, `unacknowledgedOnly?`, `unresolvedOnly?`; returns alerts ordered by `triggeredAt DESC`
- `GET /unacknowledged-count` — `{ count }` badge helper
- `GET /:id` — single alert (ownership enforced)
- `PATCH /:id/acknowledge` — stamps `acknowledgedAt`
- `PATCH /:id/resolve` — stamps `resolvedAt` (and `acknowledgedAt` if missing)
- `DELETE /:id` — remove alert

**Alert triggers (weather):**
- Heavy rain ≥ 50 mm → `alertType: heavy_rain`, severity HIGH
- Temperature ≤ 10 °C or ≥ 35 °C → `temperature_extreme`, severity MEDIUM/HIGH
- Frost ≤ 2 °C → `frost_warning`, severity HIGH
Suppression: same type/field will not re-fire within 6 hours. High severity sends email via `AlertEmailService`.

### Financial Records (`/fields/:fieldId/financial-records`)
- `POST /costs` — `{ amountXaf (>0), recordDate, productName?, description? }`
- `POST /revenue` — `{ cropType, quantityKg (>0), pricePerKgXaf (>0), recordDate, description?, buyerName? }`; revenue stored as `quantityKg * pricePerKg`
- `GET /` — optional filters: `recordType`, `startDate`, `endDate`; ordered by `recordDate DESC`
- `GET /summary` — `{ fieldId, fieldName, totalCostsXaf, totalRevenueXaf, profitXaf, profitStatus }`

### Dashboard (`/dashboard/summary`)
Aggregated view for the authenticated user:
- `statistics`: totals for fields, plantations, activities, alerts
- `fields`: `{ id, name, areaHectares, currentCrop }[]`
- `weatherOverview`: latest weather per field
- `recentActivities`: last 10 with field + season relations
- `activeAlerts`: last 10 unresolved
- `alertStatistics`: `{ total, unacknowledged, bySevertiy: { low, medium, high } }`
- `financialSnapshot`: totals + per-field summaries
- `fieldPerformance`: profitability per field with status `profitable | break-even | loss | no-data`

### Reports (`/reports`)
- `GET /field-performance?fieldId=` — profit per hectare, profit margin, activity counts, weather averages, and current-season summary
- `GET /seasonal-summary?seasonId=` — timeline of activities, input costs, harvest revenue, ROI, yield metrics
- `GET /weather-impact?fieldId=&startDate=&endDate=` — weather summary, extreme event counts, alert breakdowns, activity correlation

### Data Export (`/export`)
All endpoints stream CSV with `Content-Disposition` set:
- `GET /financial-records?fieldId?` — costs/revenue with crop/product columns
- `GET /activities?fieldId?` — activities with season crop + input costs
- `GET /fields` — field list with area/current crop
- `GET /planting-seasons?fieldId?` — seasons with harvest/yield/status/growthStage

---

## Integration Tips

- Enforce client-side file limits for avatars (≤5 MB) and activity photos (image MIME type) to avoid 400 responses.
- When drawing field polygons, ensure a closed ring and ≥4 points before submission.
- Surface backend validation messages directly; common failures are overlapping seasons, missing active season for activities, and exceeding the 5-field limit per plantation.
- Weather calls persist data and may trigger alerts; avoid unnecessary polling.
- CSV exports require Bearer auth and return text/csv; handle as file downloads with the suggested filenames returned in the `Content-Disposition` header.

