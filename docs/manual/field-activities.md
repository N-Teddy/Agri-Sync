# 🧾 Field Activities API Manual

Fast logging for land prep, planting, spraying, and more, tied to specific fields and planting seasons.

---

## Base Path

`/api/v1/fields/:fieldId/activities`

---

## Log an Activity

<span style="color:#2E8B57;">**POST**</span> `/api/v1/fields/:fieldId/activities`

- Auto-links to the active planting season if `plantingSeasonId` is omitted.
- Supports optional notes, product info, and XAF cost tracking.

```json
{
  "activityType": "fertilizer_application",
  "activityDate": "2025-03-12",
  "notes": "Applied organic compost on rows 1-3",
  "inputProduct": "BioCompost X",
  "inputCostXaf": 18000
}
```

```json
{
  "id": "c182...91d",
  "activityType": "fertilizer_application",
  "activityDate": "2025-03-12",
  "notes": "Applied organic compost on rows 1-3",
  "inputProduct": "BioCompost X",
  "inputCostXaf": "18000.00",
  "plantingSeasonId": "ae4a...f12",
  "fieldId": "f5aa...7d9"
}
```

---

## Fetch Activities

<span style="color:#1E88E5;">**GET**</span> `/api/v1/fields/:fieldId/activities`

Query params:

| Param | Type | Description |
| --- | --- | --- |
| `plantingSeasonId` | UUID | Filter to a single season |

Results are sorted newest-first by `activityDate`.

---

## Activity Types

<span style="color:#8E24AA;">LAND_PREPARATION</span> ·
<span style="color:#8E24AA;">PLANTING</span> ·
<span style="color:#8E24AA;">FERTILIZER_APPLICATION</span> ·
<span style="color:#8E24AA;">SPRAYING</span> ·
<span style="color:#8E24AA;">WEEDING</span> ·
<span style="color:#8E24AA;">HARVESTING</span>

---

### Notes & Tips

- All dates use `YYYY-MM-DD`.
- If no active season exists and no `plantingSeasonId` is provided, the activity will only attach to the field.
- Costs are stored with two decimals; send integers or floats in XAF.
