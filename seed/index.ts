#!/usr/bin/env ts-node

import { ApiClient } from './utils/api-client';
import { AuthSeeder } from './seeders/auth.seeder';
import { PlantationsSeeder } from './seeders/plantations.seeder';
import { FieldsSeeder } from './seeders/fields.seeder';
import { SeasonsSeeder } from './seeders/seasons.seeder';
import { ActivitiesSeeder } from './seeders/activities.seeder';
import { PhotosSeeder } from './seeders/photos.seeder';
import { FinancialSeeder } from './seeders/financial.seeder';
import { SEED_CONFIG } from './config';

/**
 * AgriSync Pro - Comprehensive Seed Script
 *
 * This script seeds the database with sample data for all features:
 * - 10 Users with authentication
 * - Plantations and Fields
 * - Planting Seasons
 * - Field Activities with Photos
 * - Financial Records
 * - Weather Data
 * - Alerts
 *
 * Usage: pnpm seed
 */

async function main() {
    console.log('🌱 Starting AgriSync Pro Seed Process...\n');
    console.log(`📊 Configuration:`);
    console.log(`   - Users: ${SEED_CONFIG.usersCount}`);
    console.log(`   - Plantations per user: ${SEED_CONFIG.plantationsPerUser}`);
    console.log(`   - Fields per plantation: ${SEED_CONFIG.fieldsPerPlantation}`);
    console.log(`   - Seasons per field: ${SEED_CONFIG.seasonsPerField}`);
    console.log(`   - Activities per season: ${SEED_CONFIG.activitiesPerSeason}`);
    console.log(`   - Photos per activity: ${SEED_CONFIG.photosPerActivity}`);
    console.log(`   - Financial records per field: ${SEED_CONFIG.financialRecordsPerField}`);
    console.log(`   - Weather data points per field: ${SEED_CONFIG.weatherDataPointsPerField}`);
    console.log(`   - Alerts per field: ${SEED_CONFIG.alertsPerField}\n`);

    const apiClient = new ApiClient();
    const authSeeder = new AuthSeeder(apiClient);
    const plantationsSeeder = new PlantationsSeeder(apiClient);
    const fieldsSeeder = new FieldsSeeder(apiClient);
    const seasonsSeeder = new SeasonsSeeder(apiClient);
    const activitiesSeeder = new ActivitiesSeeder(apiClient);
    const photosSeeder = new PhotosSeeder(apiClient);
    const financialSeeder = new FinancialSeeder(apiClient);

    try {
        // Step 1: Create users
        console.log('👥 Step 1: Creating users...');
        const users = [];
        for (let i = 1; i <= SEED_CONFIG.usersCount; i++) {
            const authResponse = await authSeeder.registerAndLogin(i);
            users.push(authResponse);
            await delay(200); // Rate limiting
        }
        console.log(`✅ Created ${users.length} users\n`);

        // Step 2-8: Create data for each user
        for (const user of users) {
            console.log(`\n📦 Seeding data for: ${user.user.email}`);
            apiClient.setAccessToken(user.accessToken);

            // 1. Create Plantations
            const plantations = await plantationsSeeder.seed(
                SEED_CONFIG.plantationsPerUser
            );

            for (const plantation of plantations) {
                // 2. Create Fields
                const fields = await fieldsSeeder.seed(
                    plantation.id,
                    SEED_CONFIG.fieldsPerPlantation
                );

                for (const field of fields) {
                    // 3. Create Planting Seasons
                    const seasons = await seasonsSeeder.seed(
                        field.id,
                        SEED_CONFIG.seasonsPerField
                    );

                    // 4. Create Financial Records
                    await financialSeeder.seed(
                        field.id,
                        SEED_CONFIG.financialRecordsPerField
                    );

                    for (const season of seasons) {
                        // 5. Create Activities
                        const activities = await activitiesSeeder.seed(
                            field.id,
                            season.id,
                            season.plantingDate,
                            season.expectedHarvestDate,
                            SEED_CONFIG.activitiesPerSeason
                        );

                        // 6. Upload Photos for Activities
                        for (const activity of activities) {
                            await photosSeeder.seed(
                                field.id,
                                activity.id,
                                SEED_CONFIG.photosPerActivity
                            );
                        }
                    }
                }
            }

            console.log(`✅ Completed seeding for: ${user.user.email}`);
        }

        console.log('\n🎉 Seed process completed successfully!');
        console.log('\n📝 Summary:');
        console.log(`   - Total users created: ${users.length}`);
        console.log(`   - API Base URL: ${apiClient['client'].defaults.baseURL}`);
        console.log('\n💡 You can now use these credentials to login:');
        console.log(`   Email: farmer1@agrisync.test`);
        console.log(`   Password: Test@1234\n`);
        console.log('⚠️ Note: Weather data and Alerts are system-generated and not seeded via API.');
        console.log('   They will be generated automatically by the cron job over time.');

    } catch (error) {
        console.error('\n❌ Seed process failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            if ('response' in error) {
                const axiosError = error as any;
                console.error('Response data:', axiosError.response?.data);
            }
        }
        process.exit(1);
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run the seed script
main();
