# 🌱 Planting Seasons API Manual

Modern endpoints to plan, monitor, and close out crop seasons per field.

---

## Base Path

`/api/v1/fields/:fieldId/planting-seasons`

> Replace `:fieldId` with the UUID of the field you own.

---

## Create a Season

<span style="color:#2E8B57;">**POST**</span> `/api/v1/fields/:fieldId/planting-seasons`

- Starts a new active season (only one active/planned season per field).
- Automatically sets the field’s `currentCrop`.

```json
{
  "cropType": "coffee_robusta",
  "plantingDate": "2025-02-01",
  "expectedHarvestDate": "2025-08-15"
}
```

```json
{
  "id": "ae4a...f12",
  "fieldId": "f5aa...7d9",
  "cropType": "coffee_robusta",
  "plantingDate": "2025-02-01",
  "expectedHarvestDate": "2025-08-15",
  "status": "active",
  "growthStage": "germination"
}
```

---

## List Seasons for a Field

<span style="color:#1E88E5;">**GET**</span> `/api/v1/fields/:fieldId/planting-seasons`

- Returns seasons ordered by most recent planting date.
- `growthStage` is recalculated on the fly (germination → maturation).

---

## Get a Single Season

<span style="color:#00838F;">**GET**</span> `/api/v1/fields/:fieldId/planting-seasons/:seasonId`

- Full detail for dashboards or season overview screens.

---

## Mark Harvest Complete

<span style="color:#EF6C00;">**PATCH**</span> `/api/v1/fields/:fieldId/planting-seasons/:seasonId/harvest`

- Locks the season, captures yield, frees the field for another crop.
- `growthStage` switches to `post_harvest`.

```json
{
  "actualHarvestDate": "2025-09-20",
  "yieldKg": 1420
}
```

```json
{
  "id": "ae4a...f12",
  "status": "harvested",
  "actualHarvestDate": "2025-09-20",
  "yieldKg": "1420",
  "growthStage": "post_harvest"
}
```

---

### Notes & Tips

- Every request requires a bearer token (JWT) from the auth module.
- Date strings must use `YYYY-MM-DD`.
- Trying to add a second active season returns `400 Field already has an active or planned season`.
