# 🌾 Plantations & Fields API Manual

Create plantation records and map up to five fields with automatic area calculation (hectares).

---

## Plantation Base Path

`/api/v1/plantations`

> All endpoints require a bearer token from the auth module.

### Create Plantation

<span style="color:#2E8B57;">**POST**</span> `/api/v1/plantations`

```json
{
  "name": "Fako Highlands Estate",
  "location": "Buea",
  "region": "South-West"
}
```

### List My Plantations

<span style="color:#1E88E5;">**GET**</span> `/api/v1/plantations`

Returns newest-first, scoped to the authenticated owner.

### Get a Plantation

<span style="color:#00838F;">**GET**</span> `/api/v1/plantations/{plantationId}`

---

## Field Base Path

`/api/v1/plantations/{plantationId}/fields`

### Create Field

<span style="color:#6A1B9A;">**POST**</span> `/api/v1/plantations/{plantationId}/fields`

```json
{
  "name": "North Block",
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

- `boundary` must be a closed GeoJSON Polygon (first == last coordinate).
- Max five fields per plantation; attempts beyond that return `400`.
- `areaHectares` is auto-filled using the polygon (rounded to 2 decimals).

### List Fields

<span style="color:#1E88E5;">**GET**</span> `/api/v1/plantations/{plantationId}/fields`

### Get Field Detail

<span style="color:#00838F;">**GET**</span> `/api/v1/plantations/{plantationId}/fields/{fieldId}`

---

### Handy Reminders

- Longitude range: -180 → 180, Latitude range: -90 → 90.
- Ensure the polygon is small (3‑5 fields of manageable size) for accurate area estimates.
- Fields immediately become available to the Crop Management module.
