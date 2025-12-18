# Agri Sync Pro – Frontend Delivery Blueprint (Updated)

Single source of truth for anyone building the customer-facing experience. Reflects the implemented backend (weather cron + alerts, dashboard aggregations, reports, CSV export, activity photos).

---

## 1) Platform Snapshot

- **API host template:** `https://<api-domain>/api/v1`
- **Auth:** JWT Bearer on all non-auth routes; refresh tokens are long-lived JWTs stored client-side.
- **Response envelope:** Success → `{ status: "success", message, data }`; Errors → `{ status: "error", message, errors?, timestamp, path }`.
- **Dates & numbers:** Send dates as `YYYY-MM-DD`; monetary/yield numbers as numeric values (backend stores fixed 2-decimal strings).
- **Files:** Avatars via `avatar` field (≤5 MB, image/*); activity photos via `photo` field (image/*, resized to 1920×1080 @85% quality).
- **Versioning & docs:** URI versioning (`/v1`); Swagger at `/api/docs` for live payloads.

---

## 2) Domain Model Map (frontend-facing)

| Entity | Key Fields | Notes |
| --- | --- | --- |
| User | `id, email, fullName, phoneNumber?, avatarUrl?, isEmailVerified, refreshTokenExpiresAt?` | Google SSO links `googleId`; profile edit limited to name/phone; avatar upload returns URL |
| Plantation | `id, name, location, region, createdAt` | Owner is always the logged-in user; no sharing/roles (MVP) |
| Field | `id, plantationId, name, soilType?, boundary (GeoJSON Polygon), areaHectares, currentCrop?` | Area calculated server-side; max 5 fields/plantation |
| PlantingSeason | `id, fieldId, cropType, plantingDate, expectedHarvestDate?, actualHarvestDate?, yieldKg?, status, growthStage` | `status`: planned/active/harvested/archived; growthStage derived server-side |
| FieldActivity | `id, fieldId, plantingSeasonId?, activityType, activityDate, notes?, inputProduct?, inputCostXaf?` | Auto-linked to active season when omitted |
| ActivityPhoto | `id, activityId, photoUrl, caption?, width, height, fileSize, takenAt` | Stored locally or Cloudinary depending on env |
| FinancialRecord | `id, fieldId, recordType (cost|revenue), recordDate, amountXaf, productName?, description?, cropType?, quantityKg?, pricePerKgXaf?` | Revenue totals = quantity × price |
| Alert | `id, fieldId, alertType, severity, title, message, triggeredAt, acknowledgedAt?, resolvedAt?, metadata` | Weather-driven alerts with suppression window |
| WeatherData | `id, fieldId, recordedAt, temperatureC?, humidityPercent?, rainfallMm?, isForecast, source` | Populated by live/forecast calls and cron job |

Enums to cache client-side: `CropType`, `ActivityType`, `PlantingSeasonStatus`, `AlertType`, `AlertSeverity`, `FinancialRecordType`.

---

## 3) Feature Workflows & API Contracts (happy paths)

### Auth & Profile
| Intent | Method & Path | Payload | Response |
| --- | --- | --- | --- |
| Register | `POST /auth/register` | `{ email, password, fullName, phoneNumber?, rememberMe? }` | `{ accessToken, refreshToken, user }` |
| Login | `POST /auth/login` | `{ email, password, rememberMe? }` | tokens + `user` |
| Google SSO | `POST /auth/google` | `{ idToken, rememberMe? }` | tokens + `user` |
| Verify email | `POST /auth/verify-email` or `GET /auth/verify-email?token=` | `{ token }` | `{ message }` |
| Refresh | `POST /auth/refresh` | `{ refreshToken }` | new tokens + `user` |
| Logout | `POST /auth/logout` | — | `{ message }` |
| Me | `GET /auth/me` | — | profile |
| Update profile | `PATCH /auth/profile` | `{ fullName?, phoneNumber? }` | updated profile |
| Upload avatar | `POST /auth/profile/avatar` | multipart with `avatar` | `{ avatarUrl }` |

### Plantation & Field Management
| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Create plantation | `POST /plantations` | `{ name, location, region }` | Auth required |
| List plantations | `GET /plantations` | — | Ordered newest first |
| Plantation detail | `GET /plantations/:plantationId` | — | Ownership enforced |
| Create field | `POST /plantations/:plantationId/fields` | `{ name, soilType?, boundary }` | GeoJSON polygon; max 5 fields/plantation |
| List fields | `GET /plantations/:plantationId/fields` | — | Returns computed `areaHectares` |
| Field detail | `GET /plantations/:plantationId/fields/:fieldId` | — | Includes `currentCrop` |

Boundary UX: enforce closed polygon, `[lng, lat]` order, ≥4 points, show computed hectares after save.

### Planting Seasons
| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Create season | `POST /fields/:fieldId/planting-seasons` | `{ cropType, plantingDate, expectedHarvestDate? }` | Rejects overlapping or concurrent planned/active seasons |
| List seasons | `GET /fields/:fieldId/planting-seasons` | — | Sorted newest first; `growthStage` derived |
| Season detail | `GET /fields/:fieldId/planting-seasons/:seasonId` | — | Derived `growthStage` |
| Mark harvest | `PATCH /fields/:fieldId/planting-seasons/:seasonId/harvest` | `{ actualHarvestDate, yieldKg }` | Sets status harvested, clears `field.currentCrop` |

### Field Activities & Photos
| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Log activity | `POST /fields/:fieldId/activities` | `{ activityType, activityDate, notes?, inputProduct?, inputCostXaf?, plantingSeasonId? }` | Validates season window; auto-attach active season |
| List activities | `GET /fields/:fieldId/activities?plantingSeasonId=` | — | Newest first |
| Upload activity photo | `POST /fields/:fieldId/activities/:activityId/photos` | multipart `photo`, `caption?` | Image MIME only; resized/compressed |
| List photos | `GET /fields/:fieldId/activities/:activityId/photos` | — | Desc by `takenAt` |
| Delete photo | `DELETE /fields/:fieldId/activities/:activityId/photos/:photoId` | — | Cleans storage + DB |

### Weather & Alerts
| Intent | Method & Path | Query | Notes |
| --- | --- | --- | --- |
| Current weather | `GET /fields/:fieldId/weather/current` | — | Fetches live reading, saves, evaluates alerts |
| Forecast | `GET /fields/:fieldId/weather/forecast` | `days` 1–7 | Saves normalized daily forecasts |
| List alerts | `GET /alerts` | `fieldId?, alertType?, severity?, unacknowledgedOnly?, unresolvedOnly?` | Ordered by `triggeredAt DESC` |
| Unacknowledged badge | `GET /alerts/unacknowledged-count` | — | `{ count }` |
| Alert detail | `GET /alerts/:id` | — | Ownership enforced |
| Acknowledge | `PATCH /alerts/:id/acknowledge` | — | Sets `acknowledgedAt` |
| Resolve | `PATCH /alerts/:id/resolve` | — | Sets `resolvedAt` (and ack if missing) |
| Delete | `DELETE /alerts/:id` | — | Removes alert |

Weather alert rules: heavy rain ≥50 mm (HIGH), temperature ≤10 °C or ≥35 °C (MEDIUM/HIGH), frost ≤2 °C (HIGH); 6‑hour suppression per field/type; HIGH triggers email.

### Financial Tracking
| Intent | Method & Path | Body | Notes |
| --- | --- | --- | --- |
| Record cost | `POST /fields/:fieldId/financial-records/costs` | `{ amountXaf>0, recordDate, productName?, description? }` | Stores 2‑decimal strings |
| Record revenue | `POST /fields/:fieldId/financial-records/revenue` | `{ cropType, quantityKg>0, pricePerKgXaf>0, recordDate, description?, buyerName? }` | `amountXaf` = quantity × price |
| List records | `GET /fields/:fieldId/financial-records?recordType&startDate&endDate` | — | Newest first |
| Field summary | `GET /fields/:fieldId/financial-records/summary` | — | Returns totals + `profitStatus` (`profit|loss|breakeven`) |

### Dashboard & Analytics
| Intent | Method & Path | Response Highlights |
| --- | --- | --- |
| Dashboard summary | `GET /dashboard/summary` | Totals (fields/plantations/activities/alerts), weather overview per field, recent activities (10), active alerts (10), alert stats, financial totals + per-field summary, field performance (`profitable/break-even/loss/no-data`) |
| Reports: field performance | `GET /reports/field-performance?fieldId=` | Profit margin, profit/ha, activity counts by type, weather averages, current season snapshot |
| Reports: seasonal summary | `GET /reports/seasonal-summary?seasonId=` | Activity timeline, input costs, harvest revenue, ROI, yield metrics |
| Reports: weather impact | `GET /reports/weather-impact?fieldId=&startDate=&endDate=` | Weather summary, extreme events, alert breakdown, activity correlation |
| CSV export | `GET /export/financial-records|activities|fields|planting-seasons` (+optional `fieldId`) | Streams CSV with sensible filenames via `Content-Disposition` |

---

## 4) Derived Rules & Constraints to Surface in UI

- **Field cap:** Max 5 fields per plantation (`PlantationFieldsService`).
- **Season exclusivity:** One planned/active season per field; overlapping dates rejected.
- **Activity window:** Activity dates must fall within season window; harvesting activities only when season is ACTIVE; harvested seasons reject new activities.
- **Cost validations:** Costs/revenue must be >0; quantities/prices positive.
- **Growth stage:** Derived server-side (`calculateGrowthStage`); display as returned.
- **Auto crop sync:** Creating a season sets `field.currentCrop`; harvesting clears it.
- **Alert suppression:** Same type/field suppressed for 6 hours; severity determines email sending.
- **Image rules:** Activity photos must be image MIME; server compresses/resizes; store/display returned `photoUrl`.
- **Area calculation:** Backend calculates hectares from polygon; client should not accept manual area input.
- **Access control:** Single-owner model only; do not expose team sharing or role management UI.
- **View-only for entities:** No edit/delete flows for plantations, fields, planting seasons, or activities; UI should allow creation and viewing only.
- **Currency:** XAF-only; no localization or secondary currency display for MVP.
- **Forecast horizon:** Allow full 7-day selection (config allows 1–7); default can match backend config.
- **Data retention copy:** Weather history is cleaned after 30 days; note this in UI/tooltips for weather/reports.

---

## 5) Screen Inventory (suggested)

- **Auth stack:** Register/Login with remember-me + Google SSO; email verification handoff screen (consumes `token` from URL).
- **Dashboard:** Stats tiles, financial snapshot, weather overview per field, recent activities (10), active alerts (10), quick CTA to add plantation/field/activity.
- **Plantation detail:** Metadata + list of fields with remaining field slots indicator; no edit/delete actions.
- **Field detail:** Map preview, computed area, soil type, current crop, latest season card, activity feed, weather mini-card, alerts badge; no edit/delete actions on the field itself.
- **Season timeline:** Table/list of seasons with status badge, growth stage, harvest action (opens modal to capture yield/date); no edit/delete of seasons beyond harvest completion.
- **Activity log:** Filter by season; rows show cost, notes, attachments preview; create and photo upload/delete allowed, but no edit/delete of activities themselves.
- **Weather & alerts center:** Current/forecast tabs per field, alert list with ack/resolve controls and severity chips.
- **Financials:** Cost/revenue entry forms (XAF), per-field summary, link to CSV export buttons.
- **Reports & export:** Trigger report calls, show generated metrics, and provide CSV download links (hide PDF export affordance).

Empty states should guide creation (no plantations → “Create your first plantation” CTA; no seasons → “Start a planting season”).

---

## 6) Implementation Notes for Automation

- **Boot sequence:** `GET /auth/me` → `GET /plantations` → lazy-load fields when a plantation is opened; fetch dashboard summary once per session for homepage.
- **Caching:** Store enum lists locally; they are static.
- **Errors:** Surface `message` from error envelope; validation errors come from DTO pipes (400).
- **Weather calls:** They persist data and may create alerts; avoid polling on every render.
- **Files:** Pre-validate size/type client-side; show upload progress; use returned URL.
- **Downloads:** CSV endpoints set `Content-Disposition`; handle as file downloads.
- **Time zones:** Backend treats date strings as UTC date-only; avoid sending time components.
- **Connectivity:** Online-only experience for now; show offline messaging and block submissions when offline.
- **Forecast selector:** Permit 1–7 day selection; consider defaulting to backend’s `defaultForecastDays`.
- **Weather history UX:** Add helper text that weather data older than 30 days is purged.

---

## 7) Open Questions / Product Decisions Needed

None for now — decisions above are locked.
