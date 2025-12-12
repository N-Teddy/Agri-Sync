# Database Optimizations

This document outlines the database optimizations implemented for AgriSync Pro.

## Indexes Added

### Weather Data

- `idx_weather_data_field_id` - Speeds up queries filtering by field
- `idx_weather_data_recorded_at` - Optimizes date-based queries
- `idx_weather_data_is_forecast` - Filters forecast vs actual data
- `idx_weather_data_field_recorded` - Composite index for common field + date queries

### Field Activities

- `idx_field_activities_field_id` - Field-based filtering
- `idx_field_activities_activity_date` - Date-based sorting and filtering
- `idx_field_activities_planting_season_id` - Season-based queries

### Financial Records

- `idx_financial_records_field_id` - Field-based filtering
- `idx_financial_records_record_date` - Date-based queries
- `idx_financial_records_record_type` - Type filtering (cost/revenue)
- `idx_financial_records_field_date` - Composite index for field + date

### Alerts

- `idx_alerts_field_id` - Field-based filtering
- `idx_alerts_triggered_at` - Date-based sorting
- `idx_alerts_severity` - Severity filtering
- `idx_alerts_resolved_at` - Status filtering (resolved/unresolved)
- `idx_alerts_field_triggered` - Composite index for field + date

### Planting Seasons

- `idx_planting_seasons_field_id` - Field-based filtering
- `idx_planting_seasons_planting_date` - Date-based queries
- `idx_planting_seasons_status` - Status filtering

### Fields & Plantations

- `idx_fields_plantation_id` - Plantation-based queries
- `idx_plantations_owner_id` - Owner-based filtering

### Users

- `idx_users_email` - Email lookup (login)
- `idx_users_google_id` - Google OAuth lookup (partial index)

### Activity Photos

- `idx_activity_photos_activity_id` - Activity-based filtering
- `idx_activity_photos_taken_at` - Date-based sorting

## Running Migrations

To apply these optimizations:

```bash
# Generate migration (if needed)
pnpm migration:generate

# Run migrations
pnpm migration:run

# Revert if needed
pnpm migration:revert
```

## Performance Impact

These indexes significantly improve query performance for:

- Dashboard data loading
- Report generation
- Data export operations
- Alert retrieval
- Weather data queries

## Maintenance

- Indexes are automatically maintained by PostgreSQL
- Monitor index usage with `pg_stat_user_indexes`
- Rebuild indexes if needed: `REINDEX INDEX index_name`

## Future Optimizations

Consider implementing:

- Partitioning for `weather_data` table (by date)
- Materialized views for dashboard aggregations
- Query result caching with Redis
- Database connection pooling optimization
