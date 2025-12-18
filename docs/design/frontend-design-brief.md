# AgriSync Pro – Frontend Design Brief

Comprehensive reference for the UI/UX designer. Grounded in the implemented NestJS API (`/api/v1`), current domain rules, and PWA-first delivery goals.

---

## 1) Product Context
- Mission: Help plantation owners track fields, seasons, activities, weather, alerts, and finances, then turn them into actionable insight.
- Platform: Responsive React PWA (desktop-first, tablet and mobile friendly); online-only for MVP (show offline banner + disable submissions when offline).
- Data backbone: Single-owner model (no team-sharing UI), JWT auth, JSON APIs with `{ status, message, data }` envelope, CSV exports, image uploads for avatars and activity photos.
- Unit conventions: Dates `YYYY-MM-DD`, currency XAF only, polygons as GeoJSON `[lng, lat]`, areas returned in hectares (computed server-side).
- No destructive flows: plantations, fields, seasons, and activities are create + view only (no edit/delete endpoints today).

## 2) Target Users & Goals
- **Plantation owner/manager (primary)**: Wants a fast overview (weather, alerts, profitability), easy logging of activities, quick cost/revenue capture, and simple reporting/export.
- **Field supervisor (secondary, mobile)**: Quick activity logging with photos; per-field weather + alert visibility; minimal navigation overhead.
- **Account holder**: Auth, profile update (name/phone), avatar upload.

## 3) Information Architecture (main nav)
- Dashboard
- Plantations → Plantation detail → Fields list → Field detail
- Seasons (per field)
- Activities & Photos
- Weather & Alerts
- Financials
- Reports & Exports
- Profile

Keep nav adaptable: left sidebar on desktop, bottom tab bar on mobile with FAB for “Add activity”.

## 4) Key Entities to Visualize
- **Plantation:** `name, location, region, createdAt`; has up to 5 fields.
- **Field:** `name, soilType?, boundary (Polygon), areaHectares, currentCrop?`.
- **PlantingSeason:** `cropType, plantingDate, expectedHarvestDate?, actualHarvestDate?, yieldKg?, status (planned|active|harvested|archived), growthStage`.
- **FieldActivity:** `activityType, activityDate, notes?, inputProduct?, inputCostXaf?, plantingSeasonId?`.
- **ActivityPhoto:** `photoUrl, caption?, width, height, fileSize, takenAt`.
- **FinancialRecord:** `recordType (cost|revenue), amountXaf, recordDate, productName?, description?, cropType?, quantityKg?, pricePerKgXaf?`.
- **Alert:** `alertType, severity (low|medium|high), message/title, isAcknowledged, status?, triggeredAt`.
- **WeatherData:** `recordedAt, temperatureC, humidityPercent, rainfallMm?, isForecast, source`.

## 5) Screen Requirements

### Auth & Profile
- Login/Register with remember-me; email/password only (Google SSO optional later).
- Error + validation messaging surfaced from API `message`.
- Profile screen: edit `fullName`, `phoneNumber`; avatar upload (image only, max 5 MB); show email + verification status (read-only).

### Dashboard
- **Hero tiles:** total plantations, total fields, activities count, alerts count.
- **Financial snapshot:** totals for costs, revenue, profit, profit margin; per-field top list with profit badges (profit/loss/breakeven).
- **Weather overview:** cards per field with temperature/humidity and source; link to field weather view.
- **Recent activities (10):** type, date, field, cost badge if present, thumbnail stack (max 3).
- **Active alerts (up to 10):** severity chips, alert type, field, triggered time; actions: acknowledge, resolve.
- Empty states with CTA to create plantation/field/activity.

### Plantations & Fields
- Plantations list: cards with name/location/region, field count, “slots left” indicator (max 5).
- Plantation detail: fields list table + mini map preview per field.
- Field creation: map-driven polygon draw (instructions: click-to-add point, double-click to close); show computed hectares after save; inputs: name (required), soilType (optional).
- Field detail: map preview, area, soil type, current crop; latest season card; activity feed snippet; weather mini-card; alerts badge; button to “Add activity” and “Start season” if none active.

### Planting Seasons
- Seasons list per field: status badge, crop type, planting/expected harvest dates, growthStage text.
- Create season form: select cropType, plantingDate, expectedHarvestDate (optional). Block overlapping active/planned seasons; show inline error.
- Season detail: timeline of activities (filtered to season), growthStage chip, expected vs actual harvest dates; CTA to “Mark harvest” (modal capturing `actualHarvestDate`, `yieldKg`).
- No edit/delete of seasons; only harvest action.

### Activities & Photos
- Activities list: filters (field, season, activityType, date range), table/list rows with type, date, notes excerpt, cost badge, linked season, photo count.
- Log activity form: `activityType` select, `activityDate`, notes, `inputProduct`, `inputCostXaf`, optional season selector; helper text if active season will auto-link.
- Activity detail: full notes, cost info, linked season, photo gallery (grid/lightbox). Actions: upload photo (image MIME only), delete photo, duplicate activity (if implemented later, keep space minimal).
- Photo upload UX: drag/drop + file picker, preview, progress state, error for non-image/oversize; capture `caption` optional.

### Weather & Alerts
- Weather tab per field: current conditions card, 3–7 day forecast list (date, temp, humidity, rainfall mm, source badge).
- Alerts center: filters (field, alertType, severity, unacknowledgedOnly); list with severity chips, title/message, field name, triggered time; row actions: acknowledge, resolve; detail drawer shows recommendations text block.
- Show suppression hint: “Similar alerts muted for 6 hours after action.”

### Financials
- Add cost form: amountXaf (>0), recordDate, productName, description. XAF currency symbol lock; numeric keypad on mobile.
- Add revenue form: cropType, quantityKg (>0), pricePerKgXaf (>0), auto-calc amount, recordDate, buyerName/description optional.
- Financial summary per field: totals (costs, revenue, profit, profitStatus badge) + small bar chart; link to CSV export.
- Records list: filters (recordType, date range), table columns: date, type chip, amount (aligned right), product/description, cropType.

### Reports & Exports
- Reports hub: three cards (Field Performance, Seasonal Summary, Weather Impact) with short descriptions; date/field/season selectors; generate button.
- Result view: metric tiles (profit margin, profit/ha), charts (line for revenue vs costs over time, bar for activity counts, stacked bar for alerts by severity); include “Download CSV” buttons for financial records/activities/fields/planting seasons.
- Show “data freshness” note (weather history retained ~30 days).

### Profile & System Health
- Profile page (see Auth); session info optional.
- Health check badge somewhere low-visibility (if needed): “API healthy” pulling `/health`.

## 6) Components & Interaction Patterns
- **Navigation:** Desktop sidebar with icons + labels; mobile bottom nav (Dashboard, Fields, Activities, Alerts, Financials) + FAB for “Add activity”.
- **Status chips:** Use consistent colors: planned (blue), active (green), harvested (teal), archived (gray); alert severity low (cool gray), medium (amber), high (red).
- **Cards & tables:** Cards for summaries; tables/lists for records with sticky headers on desktop, condensed list on mobile.
- **Forms:** Left-aligned labels, inline validation showing API `message`, disabled submit while posting; date pickers use UTC date-only.
- **Maps:** Simple polygon drawing toolbar (add vertex, undo last, reset). Show helper copy about `[lng, lat]` order handled automatically.
- **Uploads:** Avatar + activity photo inputs accept image only; show progress, cancel, error states; display returned URL thumbnails.
- **Filters & chips:** Reusable filter bar with dropdowns and clear-all; persistent pill for active filters.
- **Empty/loading/error states:** Skeletons for dashboards/lists; empty CTA (“Log first activity”); inline error with retry.

## 7) Visual Direction & Tone
- Mood: Reliable agritech, “field intelligence”, pragmatic not corporate.
- Palette suggestion: earthy greens + warm neutrals with a high-contrast accent (e.g., deep green primary, amber accent). Avoid purple defaults.
- Typography: Intentional sans with character (e.g., “Manrope”/“Space Grotesk”); avoid system defaults. Pair with monospaced numeric font for tables if needed.
- Iconography: Line icons with filled variants for alerts/severity.
- Motion: Subtle transitions on cards, staggered list reveal on dashboard, progress animation on uploads; avoid gratuitous micro-motions.

## 8) Responsiveness
- Breakpoints: Desktop ≥1280px (sidebar + dense tables), Tablet 768–1279px (collapsible sidebar, two-column cards), Mobile ≤767px (bottom nav, single-column, stacked cards).
- Map and photo galleries must be touch-friendly; prioritize thumb reach for FAB/add actions on mobile.
- Charts: Simplify legends on mobile; allow horizontal scroll for wide tables.

## 9) Content & Copy
- Voice: Direct, operational, low-jargon. Examples: “Log activity”, “Mark harvest”, “Acknowledge alert”.
- Helper text: “Area is auto-calculated after save”, “Weather data older than 30 days may be unavailable”.
- Error copy: “Could not save activity. Check your connection and try again.”

## 10) Data States to Design
- Loading skeletons for: dashboard tiles, tables, cards, map placeholder.
- Empty states for: no plantations, no fields, no seasons, no activities, no alerts, no financial records, no reports yet.
- Warning states: high-severity alerts; failed photo upload; overlapping season attempt.
- Success toasts/snackbars for create/acknowledge/resolve/upload.

## 11) Assets the Designer Should Produce
- High-fidelity layouts for all screens above in desktop and mobile variations.
- Reusable components: cards, chips, tables, filters, forms, modals, polygon-draw controls, upload widget, chart styles.
- Icon set for activity types, alert types/severity, weather conditions.
- Illustration/empty-state placeholders for key “no data” scenarios.
- Style kit: color tokens, typography scale, spacing, shadows, radius, motion specs.

## 12) References from Backend
- Swagger: `/api/docs` for live schemas.
- CSV download endpoints: `/export/financial-records`, `/export/activities`, `/export/fields`, `/export/planting-seasons`.
- Important constraints: 5 fields max per plantation; one active/planned season per field; costs/revenue must be positive; weather requests can trigger alerts (avoid rapid re-fetch loops); image uploads compress to 1920×1080 @ 85% quality server-side.

This brief is intentionally execution-ready: it maps real API capabilities and constraints to UI requirements so design artifacts can move straight into implementation.
