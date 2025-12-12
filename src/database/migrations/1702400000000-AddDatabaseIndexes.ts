import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseIndexes1702400000000 implements MigrationInterface {
    name = 'AddDatabaseIndexes1702400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Weather Data Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_weather_data_field_id"
            ON "weather_data" ("field_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_weather_data_recorded_at"
            ON "weather_data" ("recorded_at")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_weather_data_is_forecast"
            ON "weather_data" ("is_forecast")
        `);

        // Field Activities Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_field_activities_field_id"
            ON "field_activities" ("field_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_field_activities_activity_date"
            ON "field_activities" ("activity_date")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_field_activities_planting_season_id"
            ON "field_activities" ("planting_season_id")
        `);

        // Financial Records Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_financial_records_field_id"
            ON "financial_records" ("field_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_financial_records_record_date"
            ON "financial_records" ("record_date")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_financial_records_record_type"
            ON "financial_records" ("record_type")
        `);

        // Alerts Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_alerts_field_id"
            ON "alerts" ("field_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_alerts_triggered_at"
            ON "alerts" ("triggered_at")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_alerts_severity"
            ON "alerts" ("severity")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_alerts_resolved_at"
            ON "alerts" ("resolved_at")
        `);

        // Planting Seasons Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_planting_seasons_field_id"
            ON "planting_seasons" ("field_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_planting_seasons_planting_date"
            ON "planting_seasons" ("planting_date")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_planting_seasons_status"
            ON "planting_seasons" ("status")
        `);

        // Fields Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_fields_plantation_id"
            ON "fields" ("plantation_id")
        `);

        // Plantations Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_plantations_owner_id"
            ON "plantations" ("owner_id")
        `);

        // Users Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_users_email"
            ON "users" ("email")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_users_google_id"
            ON "users" ("google_id")
            WHERE "google_id" IS NOT NULL
        `);

        // Activity Photos Indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_activity_photos_activity_id"
            ON "activity_photos" ("activity_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_activity_photos_taken_at"
            ON "activity_photos" ("taken_at")
        `);

        // Composite Indexes for common queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_weather_data_field_recorded"
            ON "weather_data" ("field_id", "recorded_at" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_alerts_field_triggered"
            ON "alerts" ("field_id", "triggered_at" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_financial_records_field_date"
            ON "financial_records" ("field_id", "record_date" DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all indexes
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_weather_data_field_id"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_weather_data_recorded_at"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_weather_data_is_forecast"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_field_activities_field_id"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_field_activities_activity_date"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_field_activities_planting_season_id"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_financial_records_field_id"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_financial_records_record_date"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_financial_records_record_type"`
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_alerts_field_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_alerts_triggered_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_alerts_severity"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_alerts_resolved_at"`);
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_planting_seasons_field_id"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_planting_seasons_planting_date"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_planting_seasons_status"`
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_fields_plantation_id"`);
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_plantations_owner_id"`
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_google_id"`);
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_activity_photos_activity_id"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_activity_photos_taken_at"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_weather_data_field_recorded"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_alerts_field_triggered"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_financial_records_field_date"`
        );
    }
}
