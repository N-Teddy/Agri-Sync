# Agri Sync Pro – Frontend Delivery Blueprint

> Single source of truth for anyone building the customer-facing experience (human or AI). Covers API contracts, data relationships, UX constraints, and open questions that still need product input.

---

## 1. Platform Snapshot

- **API host template:** `https://<api-domain>/api/v1`
- **Auth:** Bearer JWT (`Authorization: Bearer <accessToken>`) issued by the Auth module. Refresh tokens are long-lived JWTs stored client-side (http-only cookie or secure storage).
- **Response envelope:** Every success payload is wrapped as  
  ```json
  { "status": "success", "message": "Request processed successfully", "data": { ... } }
  ```  
  Errors bubble up as  
  ```json
  { "status": "error", "message": "Human-readable issue", "errors": {...}, "timestamp": "...", "path": "/api/v1/..." }
  ```
- **Dates:** Must be sent as ISO date strings (`YYYY-MM-DD`). Backend normalizes via `normalizeDateInput`.
- **Numbers:** Monetary and yield fields accept numbers but are stored as strings (fixed precision). Always send decimals as numbers so validation can run.
- **Files:** Avatar uploads must be sent as `multipart/form-data` with field `avatar` (max 5 MB).
- **Swagger:** Interactive docs live at `/api/docs` (same host). Useful for trying payloads once OAuth header is set.

---

## 2. Domain Model Map

### 2.1 User
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key, returned after auth calls |
| `email`, `fullName`, `phoneNumber?` | string | Phone optional |
| `isEmailVerified` | boolean | Blocks some flows until true |
| `avatarUrl?` | string | Public CDN/local path |
| `googleId?` | string | Present when user linked Google |
| `refreshTokenExpiresAt?` | ISO string | For showing session expiry |

### 2.2 Plantation
| Field | Type | Notes |
| --- | --- | --- |
| `id`, `name`, `location`, `region` | string | Simple metadata |
| `owner` | User ref | Always the logged-in owner |
| `fields` | Field[] | Only returned when explicitly expanded |

### 2.3 Field
| Field | Type | Notes |
| --- | --- | --- |
| `id`, `name`, `soilType?` | string | Soil optional |
| `boundary` | GeoJSON Polygon | Coordinates array `[[lng, lat], ...]`, first point equals last |
| `areaHectares` | string | Derived from polygon (2 decimal places) |
| `currentCrop?` | enum `CropType` | Auto-updated when seasons start/end |
| `plantation` | Plantation ref | Always belongs to a plantation |

**CropType options:** `coffee_arabica`, `coffee_robusta`, `cocoa`, `plantain`, `banana`, `maize`.

### 2.4 PlantingSeason
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | |
| `field` | Field ref | Ownership enforced server-side |
| `cropType` | CropType enum | Must match dropdown |
| `plantingDate`, `expectedHarvestDate?`, `actualHarvestDate?` | `YYYY-MM-DD` | Dates normalized |
| `yieldKg?` | string | Set during harvest |
| `status` | enum | `planned`, `active`, `harvested`, `archived` |
| `growthStage?` | string | Derived by backend (`planned`, `germination`, `vegetative`, `flowering`, `fruiting`, `maturation`, `post_harvest`) |

### 2.5 FieldActivity
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | |
| `field` | Field ref | |
| `plantingSeason?` | Season ref | Optional, auto-attached if an active season exists |
| `activityType` | enum | `land_preparation`, `planting`, `fertilizer_application`, `spraying`, `weeding`, `harvesting` |
| `activityDate` | `YYYY-MM-DD` | Required |
| `notes?`, `inputProduct?` | string | Max 500 and 255 chars |
| `inputCostXaf?` | string | Number sent in request, stored at 2 decimal precision |

---

## 3. Feature Workflows & API Contracts

### 3.1 Authentication & Profile

| Intent | Method & Path | Auth | Body Summary | Response |
| --- | --- | --- | --- | --- |
| Register | `POST /auth/register` | Public | `{ email, password, fullName, phoneNumber?, rememberMe? }` | `{ accessToken, refreshToken, user }` |
| Login | `POST /auth/login` | Public | Same as register minus name | Tokens + user |
| Google SSO | `POST /auth/google` | Public | `{ idToken, rememberMe? }` | Tokens + user |
| Verify email (API) | `POST /auth/verify-email` or `GET /auth/verify-email?token=` | Public | `{ token }` | `{ message }` |
| Refresh tokens | `POST /auth/refresh` | Public | `{ refreshToken }` | New token pair |
| Logout | `POST /auth/logout` | Bearer | none | `{ message }` |
| Me | `GET /auth/me` | Bearer | — | User profile |
| Update profile | `PATCH /auth/profile` | Bearer | `{ fullName?, phoneNumber? }` | Updated user |
| Upload avatar | `POST /auth/profile/avatar` | Bearer | `multipart/form-data` with `avatar` | `{ avatarUrl }` |

**UI notes**
- Registration/login forms need a “Remember me” control (longer refresh TTL).
- Email verification link hits `/auth/verify-email?token=...`; deep-link from email should land on frontend route that forwards token to API and shows success/failure state.
- Access tokens expire quickly (`jwt.expiresIn`, default 15 min). Frontend must refresh proactively using stored refresh token.
- Avatar upload should limit client-side file size and type before hitting API to avoid 400 errors.

### 3.2 Plantation Management

| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Create plantation | `POST /plantations` | `{ name, location, region }` | Auth required |
| List plantations | `GET /plantations` | — | Sorted by `createdAt DESC` |
| Plantation detail | `GET /plantations/:plantationId` | — | Ensures ownership |

**UX guidance**
- Keep a simple wizard: metadata only (no geospatial inputs).  
- Provide create CTA from dashboard and show empty state with illustration when no plantations exist.

### 3.3 Field Management (per plantation)

| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Create field | `POST /plantations/:plantationId/fields` | `{ name, soilType?, boundary }` | Valid GeoJSON polygon; max 5 fields per plantation |
| List fields | `GET /plantations/:plantationId/fields` | — | Sorted newest first |
| Field detail | `GET /plantations/:plantationId/fields/:fieldId` | — | Returns computed `areaHectares`, `currentCrop` |

**Boundary requirements**
- GeoJSON polygon coordinates must be `[longitude, latitude]` and form a closed ring (first point = last point).
- Frontend should provide a drawing interface (Leaflet/Mapbox) that serializes to GeoJSON and enforces minimum 4 points.
- API auto-computes `areaHectares` via planar calculation, so no manual input is needed; show the computed value once the field is saved.

### 3.4 Planting Seasons (per field)

| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Create season | `POST /fields/:fieldId/planting-seasons` | `{ cropType, plantingDate, expectedHarvestDate? }` | Rejects if PLANNED/ACTIVE season already exists |
| List seasons | `GET /fields/:fieldId/planting-seasons` | — | Sorted newest first, `growthStage` recalculated on read |
| Season detail | `GET /fields/:fieldId/planting-seasons/:seasonId` | — | Includes derived `growthStage` |
| Mark harvest | `PATCH /fields/:fieldId/planting-seasons/:seasonId/harvest` | `{ actualHarvestDate, yieldKg }` | Transitions status to `harvested`, clears `field.currentCrop` |

**Business rules surfaced to UI**
- Only one PLANNED/ACTIVE season per field; disable the “Add season” action if one exists and show context (“Complete current season to start a new one”).
- `growthStage` is derived from planting date + today’s date (or harvest date). Present as badges/timeline and avoid client-side recalculation to stay in sync.
- Harvest modal must capture yield in kilograms (number >= 0). Backend stores as decimal string.

### 3.5 Field Activities (per field)

| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Log activity | `POST /fields/:fieldId/activities` | `{ activityType, activityDate, notes?, inputProduct?, inputCostXaf?, plantingSeasonId? }` | If `plantingSeasonId` omitted, attaches to active season when present |
| List activities | `GET /fields/:fieldId/activities?plantingSeasonId=` | — | Returns newest first with optional filter |

**UI hints**
- Provide enum-driven dropdown for `activityType`.
- Show cost column labeled “XAF” (Central African CFA franc).
- When a field lacks an active season, prompt user to pick a season before logging to avoid backend `BadRequestException`.
- Activity feed should show association to a season when available.

---

## 4. Derived Data & Constraints

- **Field limit:** Each plantation may host at most **5** fields (`PlantationFieldsService`). Communicate remaining slots in UI.
- **Area calculation:** Done server-side using `field-geometry.util`. Do **not** ask users for area; display computed hectares on cards.
- **Ownership enforcement:** Every `/fields/...` or `/plantations/...` endpoint cross-checks the authenticated owner (`FieldAccessService`). No shared access is implemented yet.
- **Season growth stage:** Calculated with `calculateGrowthStage`. States progress automatically; front-end only reads.
- **Auto-updated field crop:** Starting a season sets `field.currentCrop = cropType`; harvesting resets to `null`. Field detail views can rely on that to highlight “Current crop”.
- **Activity cost precision:** Input cost is stored with 2 decimals. Always send numbers (e.g., `12500.5`)—backend converts to fixed string.
- **File storage:** In production, avatars are mirrored to Cloudinary; locally they live under `/uploads`. Always use returned `avatarUrl`.

---

## 5. Suggested Screen Inventory

1. **Auth stack:** Register, Login, Forgot/Verify Email screens with remember-me toggle and Google OAuth button.
2. **Dashboard:** Summary of plantations, quick stats (total hectares = sum of `field.areaHectares`), CTA to add plantation/field.
3. **Plantation Detail:** Tabs for Overview (metadata, list of fields) and maybe future Alerts/Weather placeholders.
4. **Field Detail:** Map preview of boundary, area, soil type, `currentCrop`, latest season card, activity feed.
5. **Season Timeline:** Table of all seasons with status badges, actions (“Mark harvest”) gated by status.
6. **Activity Log:** Filterable list by season, expandable rows for notes/input cost.

Each screen should gracefully handle empty states (no plantations, no fields, first season, etc.) because the API will return empty arrays.

---

## 6. Implementation Notes for AI/Automation

- **State hydration:** On app boot, call `/auth/me`, then `/plantations` → for each, lazily load `/fields` only when user drills in to avoid N+1 requests.
- **Caching:** Cache reference data (crop types, activity types, season statuses) locally—they are static enums baked into the backend.
- **Error handling:** Display `message` from error envelope. Validation errors appear under `errors.message` or `errors.message[]` depending on NestJS pipe output.
- **Testing:** Use Swagger or Insomnia collections with the documented payloads. Remember to include `Accept: application/json`.
- **CI/CD handoff:** Provide `.env` mapping for `APP_WEB_URL` because verification emails embed `${webUrl}/${globalPrefix}/auth/verify-email?token=...`. Frontend route should intercept `/api/auth/verify-email`.

---

## 7. Known Gaps & Questions for Product

1. **Field editing & deletion** – No endpoints exist. Should the frontend disable those actions or do we need update/delete APIs?
2. **Season planning** – Backend supports `PlantingSeasonStatus.PLANNED` but there is no explicit API to create a planned season (only active). Do we need UI/endpoint adjustments for future planning?
3. **Activity attachments** – Farmers often add photos/receipts, but the current schema lacks upload support. Should the UI plan for this (and we add API later) or skip entirely?
4. **Weather/alerts placeholders** – Entities such as `WeatherData` and `Alert` exist but no controllers populate them yet. Should the frontend reserve UI real estate or hide until services land?
5. **Currency localization** – Costs are denominated in XAF. Do we need multi-currency support or formatting toggles for pilots outside Central Africa?

Please confirm these before locking UI scope; responses may imply new backend tickets.

---

## 8. Quick Reference Payloads

### 8.1 Create Field
```json
POST /plantations/{plantationId}/fields
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
```

### 8.2 Create Planting Season
```json
POST /fields/{fieldId}/planting-seasons
{
  "cropType": "coffee_robusta",
  "plantingDate": "2025-02-01",
  "expectedHarvestDate": "2025-08-01"
}
```

### 8.3 Log Field Activity
```json
POST /fields/{fieldId}/activities
{
  "activityType": "fertilizer_application",
  "activityDate": "2025-03-15",
  "notes": "Applied organic fertilizer row 1",
  "inputProduct": "NPK 20-10-10",
  "inputCostXaf": 12500,
  "plantingSeasonId": "ec0e2adc-8f6d-42b9-90e8-a50cf50f1265"
}
```

Use these payloads as templates for fixtures, documentation snippets, or API client generation scripts.

---

**Last updated:** _(auto-generated during latest code analysis)_ – Regenerate whenever backend contracts change.
