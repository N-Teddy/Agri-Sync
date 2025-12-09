# AgriSync Pro - Database Schema

> **Complete Database Design with Entity Relationship Diagrams**

---

## Table of Contents

1. [Overview](#overview)
2. [ERD - Entity Relationship Diagram](#erd---entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Spatial Data with PostGIS](#spatial-data-with-postgis)
5. [Time-Series Data with TimescaleDB](#time-series-data-with-timescaledb)
6. [Indexes & Performance](#indexes--performance)
7. [Sample Queries](#sample-queries)

---

## Overview

AgriSync Pro uses **PostgreSQL 14+** with two critical extensions:

- **PostGIS** - For geospatial field boundary data
- **TimescaleDB** - For efficient time-series weather data storage

### Database Setup

Complete SQL setup script available at: [`assets/database/setup.sql`](../assets/database/setup.sql)

**Required Extensions:**

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

---

## ERD - Entity Relationship Diagram

### Complete System ERD

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│     users       │      │   plantations    │      │   crop_types    │
├─────────────────┤      ├──────────────────┤      ├─────────────────┤
│ id (PK)         │──┐   │ id (PK)          │  ┌───│ id (PK)         │
│ email           │  │   │ name             │  │   │ name            │
│ phone           │  │   │ location         │  │   │ variety         │
│ full_name       │  │   │ region           │  │   │ scientific_name │
│ role            │  │   │ owner_id (FK)    │──┘   │ opt_temp_min    │
│ password_hash   │  │   │ created_at       │      │ opt_temp_max    │
│ is_active       │  │   └──────────────────┘      │ frost_sensitive │
│ created_at      │  │            │                 └─────────────────┘
└─────────────────┘  │            │1
         │           │            │*
         │1          │            │
         │*          │   ┌────────▼─────────┐
┌─────────────────┐  │   │     fields       │
│ user_sessions   │  │   ├──────────────────┤
├─────────────────┤  │   │ id (PK)          │
│ id (PK)         │  │   │ plantation_id(FK)│
│ user_id (FK)    │──┘   │ name             │
│ device_type     │      │ boundary (GEO)   │ ◄── PostGIS geometry
│ last_active     │      │ area_hectares    │
└─────────────────┘      │ soil_type        │
                         │ elevation        │
                         └────────┬─────────┘
                                  │1
                                  │*
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │ planting_seasons │        │  weather_data    │ ◄── TimescaleDB
         ├──────────────────┤        ├──────────────────┤
         │ id (PK)          │        │ id (PK)          │
         │ field_id (FK)    │──┐     │ field_id (FK)    │
         │ crop_type_id(FK) │──│─┐   │ recorded_at      │
         │ planting_date    │  │ │   │ temperature      │
         │ harvest_date     │  │ │   │ humidity         │
         │ yield_kg         │  │ │   │ rainfall         │
         │ status           │  │ │   │ is_forecast      │
         └────────┬─────────┘  │ │   └──────────────────┘
                  │1           │ │
                  │*           │ │
         ┌────────▼─────────┐  │ │
         │ field_activities │  │ │
         ├──────────────────┤  │ │
         │ id (PK)          │  │ │
         │ field_id (FK)    │  │ │
         │ planting_season  │──┘ │
         │ activity_type_id │────┘
         │ performed_by(FK) │
         │ activity_date    │
         │ input_product    │
         │ input_quantity   │
         │ is_synced        │ ◄── Offline sync tracking
         └────────┬─────────┘
                  │1
                  │*
         ┌────────▼─────────┐
         │ activity_photos  │
         ├──────────────────┤
         │ id (PK)          │
         │ activity_id(FK)  │
         │ photo_url        │
         │ caption          │
         └──────────────────┘

┌─────────────────┐      ┌──────────────────┐
│  alert_rules    │      │     alerts       │
├─────────────────┤      ├──────────────────┤
│ id (PK)         │──┐   │ id (PK)          │
│ name            │  │   │ alert_rule_id(FK)│──┘
│ conditions(JSON)│  │   │ field_id (FK)    │
│ severity        │  │   │ title            │
│ is_active       │  │   │ message          │
└─────────────────┘  │   │ triggered_at     │
         │1          │   │ acknowledged_at  │
         │*          │   │ resolved_at      │
┌─────────────────┐  │   └────────┬─────────┘
│alert_notificatns│  │            │1
├─────────────────┤  │            │*
│ id (PK)         │  │   ┌────────▼─────────┐
│ alert_id (FK)   │──┘   │alert_notificatns │
│ user_id (FK)    │      ├──────────────────┤
│ notification_typ│      │ id (PK)          │
│ sent_at         │      │ alert_id (FK)    │
│ delivered       │      │ user_id (FK)     │
└─────────────────┘      │ sent_at          │
                         └──────────────────┘

┌─────────────────┐      ┌──────────────────────┐
│  disease_types  │      │ disease_occurrences  │
├─────────────────┤      ├──────────────────────┤
│ id (PK)         │──┐   │ id (PK)              │
│ name            │  │   │ disease_type_id (FK) │──┘
│ scientific_name │  │   │ field_id (FK)        │
│ affected_crops  │  │   │ first_observed       │
│ favorable_cond  │  │   │ severity             │
└─────────────────┘  │   │ treatment_applied    │
                         └──────────────────────┘
```

---

## Table Definitions

### User Management Tables

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'manager',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Store user accounts with authentication credentials
**Key Fields:**

- `role`: 'owner', 'manager', 'supervisor', 'worker'
- `password_hash`: bcrypt hashed password

---

#### user_sessions

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(100),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Track user sessions for security and analytics
**Use Cases:**

- Multi-device session management
- Activity tracking
- Security auditing

---

### Plantation & Field Tables

#### plantations

```sql
CREATE TABLE plantations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100) DEFAULT 'Cameroon',
    region VARCHAR(100),
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Top-level organization unit
**Relationships:** One plantation → Many fields

---

#### fields

```sql
CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plantation_id UUID REFERENCES plantations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    area_hectares DECIMAL(10, 2),
    soil_type VARCHAR(100),
    elevation DECIMAL(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fields_boundary ON fields USING GIST(boundary);
```

**Purpose:** Individual field with geospatial boundary
**Key Features:**

- **boundary:** PostGIS GEOGRAPHY type for precise spatial data
- **area_hectares:** Auto-calculated from boundary
- **Spatial index:** GIST index for fast spatial queries

**See:** [Spatial Data with PostGIS](#spatial-data-with-postgis)

---

### Crop Management Tables

#### crop_types

```sql
CREATE TABLE crop_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    scientific_name VARCHAR(255),
    optimal_temperature_min DECIMAL(5, 2),
    optimal_temperature_max DECIMAL(5, 2),
    frost_sensitive BOOLEAN DEFAULT false
);
```

**Purpose:** Reference data for crop characteristics
**Pre-loaded Data:** Coffee, Cocoa, Banana, Plantain, Maize, Cassava

---

#### planting_seasons

```sql
CREATE TABLE planting_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    crop_type_id UUID REFERENCES crop_types(id),
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    initial_yield_estimate DECIMAL(10, 2),
    actual_yield DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Track individual planting seasons
**Status Values:** 'active', 'harvested', 'abandoned'

---

### Activity Tracking Tables

#### field_activities

```sql
CREATE TABLE field_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    planting_season_id UUID REFERENCES planting_seasons(id),
    activity_type_id UUID REFERENCES activity_types(id),
    performed_by UUID REFERENCES users(id),
    activity_date DATE NOT NULL,
    description TEXT,
    input_product VARCHAR(255),
    input_quantity DECIMAL(10, 2),
    input_unit VARCHAR(50),
    labor_hours DECIMAL(6, 2),
    worker_count INTEGER,
    is_synced BOOLEAN DEFAULT true,
    offline_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Log all field activities
**Offline Support:**

- `is_synced`: Tracks sync status
- `offline_id`: Client-side unique ID for conflict resolution

---

#### activity_photos

```sql
CREATE TABLE activity_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES field_activities(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Photo documentation of activities
**Storage:** URLs point to cloud storage (AWS S3)

---

### Weather Data Table

#### weather_data (TimescaleDB Hypertable)

```sql
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    rainfall DECIMAL(6, 2),
    wind_speed DECIMAL(5, 2),
    wind_direction DECIMAL(5, 2),
    solar_radiation DECIMAL(8, 2),
    forecast_source VARCHAR(100),
    is_forecast BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('weather_data', 'recorded_at');

-- Indexes for performance
CREATE INDEX idx_weather_field_time
ON weather_data(field_id, recorded_at);

CREATE INDEX idx_weather_forecast
ON weather_data(field_id, is_forecast, recorded_at);
```

**Purpose:** Store time-series weather data
**See:** [Time-Series Data with TimescaleDB](#time-series-data-with-timescaledb)

---

### Alert System Tables

#### alert_rules

```sql
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Configurable alert rules
**Conditions Format (JSONB):**

```json
{
  "type": "weather",
  "metric": "temperature",
  "operator": "<",
  "value": 2,
  "duration_hours": 2
}
```

---

#### alerts

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_rule_id UUID REFERENCES alert_rules(id),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Alert instances
**Lifecycle:** triggered → acknowledged → resolved

---

### Financial Tables (Cameroon-Specific)

#### input_prices_cm

```sql
CREATE TABLE input_prices_cm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    unit_price_xaf DECIMAL(10, 2) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    supplier VARCHAR(255),
    region VARCHAR(100),
    last_updated DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true
);
```

**Purpose:** Track input costs in XAF
**Product Types:** 'fertilizer', 'pesticide', 'seed', 'herbicide'

---

#### market_prices_cm

```sql
CREATE TABLE market_prices_cm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_type VARCHAR(100) NOT NULL,
    quality_grade VARCHAR(50) DEFAULT 'standard',
    price_per_unit_xaf DECIMAL(8, 2) NOT NULL,
    unit_type VARCHAR(50) DEFAULT 'kg',
    market_location VARCHAR(100) NOT NULL,
    record_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(100)
);
```

**Purpose:** Market price tracking
**Markets:** Douala, Yaoundé, Bamenda, Bafoussam

---

## Spatial Data with PostGIS

### Field Boundary Storage

**GeoJSON Format:**

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [11.5194, 3.848],
      [11.5205, 3.848],
      [11.5205, 3.849],
      [11.5194, 3.849],
      [11.5194, 3.848]
    ]
  ]
}
```

**Insert Boundary:**

```sql
INSERT INTO fields (name, plantation_id, boundary)
VALUES (
    'Coffee Field A-1',
    'plantation-uuid-here',
    ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[[11.5194, 3.8480], ...]]
    }')
);
```

---

### Common Spatial Queries

**Calculate Field Area (in hectares):**

```sql
SELECT
    name,
    ST_Area(boundary::geometry) / 10000 AS area_hectares
FROM fields;
```

**Find Fields Within Distance:**

```sql
SELECT
    f1.name,
    ST_Distance(f1.boundary, f2.boundary) / 1000 AS distance_km
FROM fields f1, fields f2
WHERE f1.id != f2.id
  AND ST_DWithin(f1.boundary, f2.boundary, 5000); -- 5km
```

**Check if Point is Within Field:**

```sql
SELECT name
FROM fields
WHERE ST_Contains(
    boundary,
    ST_SetSRID(ST_Point(11.5200, 3.8485), 4326)
);
```

---

## Time-Series Data with TimescaleDB

### Hypertable Benefits

1. **Automatic Partitioning** - Data partitioned by time
2. **Compression** - Older data compressed automatically
3. **Fast Aggregation** - Optimized time-bucket queries
4. **Retention Policies** - Auto-delete old data

### Continuous Aggregates

**Hourly Weather Aggregation:**

```sql
CREATE MATERIALIZED VIEW weather_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', recorded_at) AS hour,
    field_id,
    AVG(temperature) AS avg_temp,
    AVG(humidity) AS avg_humidity,
    SUM(rainfall) AS total_rainfall,
    AVG(wind_speed) AS avg_wind_speed
FROM weather_data
GROUP BY hour, field_id;
```

**Daily Summary:**

```sql
CREATE MATERIALIZED VIEW weather_daily
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', recorded_at) AS day,
    field_id,
    MIN(temperature) AS min_temp,
    MAX(temperature) AS max_temp,
    AVG(temperature) AS avg_temp,
    SUM(rainfall) AS total_rainfall
FROM weather_data
GROUP BY day, field_id;
```

---

### Retention Policies

**Auto-delete raw data older than 2 years:**

```sql
SELECT add_retention_policy('weather_data', INTERVAL '2 years');
```

**Keep aggregates for 5 years:**

```sql
SELECT add_retention_policy('weather_daily', INTERVAL '5 years');
```

---

## Indexes & Performance

### Critical Indexes

**Spatial Indexes:**

```sql
CREATE INDEX idx_fields_boundary
ON fields USING GIST(boundary);
```

**Time-Series Indexes:**

```sql
CREATE INDEX idx_weather_field_time
ON weather_data(field_id, recorded_at DESC);

CREATE INDEX idx_weather_forecast
ON weather_data(field_id, is_forecast, recorded_at DESC);
```

**Foreign Key Indexes:**

```sql
CREATE INDEX idx_activities_field
ON field_activities(field_id, activity_date DESC);

CREATE INDEX idx_activities_season
ON field_activities(planting_season_id);

CREATE INDEX idx_alerts_field
ON alerts(field_id, triggered_at DESC);
```

---

### Query Optimization Tips

**1. Use Materialized Views for Dashboards:**

```sql
CREATE MATERIALIZED VIEW dashboard_summary AS
SELECT
    f.id,
    f.name,
    COUNT(DISTINCT fa.id) AS activity_count,
    COUNT(DISTINCT a.id) AS alert_count,
    MAX(w.recorded_at) AS last_weather_update
FROM fields f
LEFT JOIN field_activities fa ON f.id = fa.field_id
LEFT JOIN alerts a ON f.id = a.field_id
LEFT JOIN weather_data w ON f.id = w.field_id
GROUP BY f.id, f.name;
```

**2. Limit Weather Data Queries:**

```sql
-- Good: Use time range
SELECT * FROM weather_data
WHERE field_id = 'uuid'
  AND recorded_at >= NOW() - INTERVAL '7 days';

-- Bad: Full table scan
SELECT * FROM weather_data WHERE field_id = 'uuid';
```

---

## Sample Queries

### Get Field with Latest Weather

```sql
SELECT
    f.name AS field_name,
    f.area_hectares,
    w.temperature,
    w.humidity,
    w.rainfall,
    w.recorded_at
FROM fields f
LEFT JOIN LATERAL (
    SELECT *
    FROM weather_data
    WHERE field_id = f.id
      AND is_forecast = false
    ORDER BY recorded_at DESC
    LIMIT 1
) w ON true
WHERE f.plantation_id = 'plantation-uuid';
```

### Activity Summary by Field

```sql
SELECT
    f.name AS field_name,
    at.name AS activity_type,
    COUNT(*) AS activity_count,
    SUM(fa.labor_hours) AS total_hours,
    SUM(fa.input_quantity * ip.unit_price_xaf) AS estimated_cost
FROM field_activities fa
JOIN fields f ON fa.field_id = f.id
JOIN activity_types at ON fa.activity_type_id = at.id
LEFT JOIN input_prices_cm ip ON fa.input_product = ip.product_name
WHERE fa.activity_date >= '2024-01-01'
GROUP BY f.name, at.name
ORDER BY f.name, activity_count DESC;
```

### Unacknowledged Critical Alerts

```sql
SELECT
    a.title,
    a.message,
    a.severity,
    f.name AS field_name,
    a.triggered_at
FROM alerts a
JOIN fields f ON a.field_id = f.id
WHERE a.acknowledged_at IS NULL
  AND a.severity = 'high'
ORDER BY a.triggered_at DESC;
```

---

## Database Maintenance

### Vacuum & Analyze

```sql
-- Regular maintenance
VACUUM ANALYZE;

-- Specific tables
VACUUM ANALYZE fields;
VACUUM ANALYZE weather_data;
```

### Refresh Materialized Views

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY weather_hourly;
REFRESH MATERIALIZED VIEW CONCURRENTLY weather_daily;
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_summary;
```

---

## Resources

- **Setup SQL Script:** [`assets/database/setup.sql`](../assets/database/setup.sql)
- **Entity Definitions:** [`assets/database/entity/`](../assets/database/entity/)
- **PostGIS Documentation:** https://postgis.net/documentation/
- **TimescaleDB Documentation:** https://docs.timescale.com/

---

**Next Steps:** See [Architecture](architecture.md) for how this database integrates with the overall system.
