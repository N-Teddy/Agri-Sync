# AgriSync Pro - Seed Data

This directory contains a modular seed system for populating the database with comprehensive sample data.

## 📁 Structure

```
seed/
├── index.ts                 # Main entry point
├── config.ts                # Configuration (users count, data amounts)
├── utils/
│   ├── api-client.ts        # HTTP client wrapper
│   └── data-generators.ts   # Fake data generators
└── seeders/
    ├── auth.seeder.ts       # ✅ User registration & login
    ├── plantations.seeder.ts # TODO: Plantation creation
    ├── fields.seeder.ts      # TODO: Field creation
    ├── seasons.seeder.ts     # TODO: Planting seasons
    ├── activities.seeder.ts  # TODO: Field activities
    ├── photos.seeder.ts      # TODO: Activity photos
    ├── financial.seeder.ts   # TODO: Financial records
    ├── weather.seeder.ts     # TODO: Weather data
    └── alerts.seeder.ts      # TODO: Alerts
```

## 🚀 Usage

```bash
# Run the seed script
pnpm seed

# Or with ts-node directly
ts-node seed/index.ts
```

## ⚙️ Configuration

Edit `seed/config.ts` to customize:

```typescript
export const SEED_CONFIG = {
	usersCount: 10, // Number of users to create
	plantationsPerUser: 2, // Plantations per user
	fieldsPerPlantation: 3, // Fields per plantation
	seasonsPerField: 2, // Seasons per field
	activitiesPerSeason: 10, // Activities per season
	photosPerActivity: 2, // Photos per activity
	financialRecordsPerField: 15, // Financial records per field
	weatherDataPointsPerField: 50, // Weather data points per field
	alertsPerField: 5, // Alerts per field
};
```

## 📊 Sample Data Generated

### Users (10)

- Email: `farmer1@agrisync.test` to `farmer10@agrisync.test`
- Password: `Test@1234`
- Full names: Generated with Faker
- Phone numbers: Cameroon format

### Per User:

- **2 Plantations** with realistic names
- **6 Fields** (3 per plantation) with:
    - Area: 0.5 - 10 hectares
    - Soil types: Loamy, Clay, Sandy, etc.
    - Current crops: Corn, Cassava, Plantain, etc.

### Per Field:

- **2 Planting Seasons** with:
    - Crop type
    - Planting and expected harvest dates
    - Status tracking

- **20 Activities** (10 per season):
    - Types: Planting, Watering, Fertilizing, Weeding, etc.
    - Dates within season timeframe
    - Input costs for relevant activities

- **40 Photos** (2 per activity):
    - Sample PNG images
    - Captions

- **15 Financial Records**:
    - Mix of costs and revenue
    - Realistic amounts in XAF
    - Product names for revenue

- **50 Weather Data Points**:
    - Temperature: 18-35°C
    - Humidity: 40-95%
    - Rainfall: 0-100mm
    - Last 30 days

- **5 Alerts**:
    - Various severity levels
    - Weather-related alerts
    - Triggered dates

## 🎯 Total Data Created

With default configuration:

- **10 users**
- **20 plantations**
- **60 fields**
- **120 planting seasons**
- **1,200 activities**
- **2,400 photos**
- **900 financial records**
- **3,000 weather data points**
- **300 alerts**

**Total: ~8,000+ database records**

## 🔧 Implementation Status

### ✅ Completed

- [x] Project structure
- [x] Configuration system
- [x] API client utility
- [x] Data generators
- [x] Auth seeder (user registration & login)

### 📝 TODO (To be implemented)

- [ ] Plantations seeder
- [ ] Fields seeder
- [ ] Seasons seeder
- [ ] Activities seeder
- [ ] Photos seeder
- [ ] Financial seeder
- [ ] Weather seeder
- [ ] Alerts seeder

## 📝 Implementation Guide

Each seeder should follow this pattern:

```typescript
import { ApiClient } from '../utils/api-client';
import { generateXData } from '../utils/data-generators';

export class XSeeder {
	constructor(private apiClient: ApiClient) {}

	async seed(params: any): Promise<any> {
		console.log('🌱 Seeding X...');

		const data = generateXData();
		const response = await this.apiClient.post('/endpoint', data);

		console.log('✅ X seeded');
		return response;
	}
}
```

## 🧪 Testing Endpoints

The seed data covers ALL API endpoints:

### Auth

- POST `/auth/register`
- POST `/auth/login`

### Plantations

- POST `/plantations`
- GET `/plantations`

### Fields

- POST `/plantations/:id/fields`
- GET `/plantations/:id/fields`

### Seasons

- POST `/fields/:id/seasons`
- GET `/fields/:id/seasons`

### Activities

- POST `/fields/:id/activities`
- GET `/fields/:id/activities`

### Photos

- POST `/fields/:fieldId/activities/:activityId/photos`
- GET `/fields/:fieldId/activities/:activityId/photos`

### Financial

- POST `/fields/:id/financial-records`
- GET `/fields/:id/financial-records`

### Weather

- POST `/weather/fields/:id` (admin/cron)
- GET `/weather/fields/:id`

### Alerts

- GET `/alerts`
- PATCH `/alerts/:id/acknowledge`

### Reports

- GET `/reports/field-performance?fieldId=xxx`
- GET `/reports/seasonal-summary?seasonId=xxx`
- GET `/reports/weather-impact?fieldId=xxx&startDate=xxx&endDate=xxx`

### Export

- GET `/export/financial-records?fieldId=xxx`
- GET `/export/activities?fieldId=xxx`
- GET `/export/fields`
- GET `/export/planting-seasons?fieldId=xxx`

### Dashboard

- GET `/dashboard/summary`

## 🔐 Authentication

All seeders use the ApiClient which automatically:

- Includes Bearer token in requests
- Handles token refresh
- Manages authentication state

## 🎨 Data Quality

- **Realistic**: Uses Faker.js for authentic-looking data
- **Consistent**: Maintains referential integrity
- **Varied**: Different crops, activities, amounts
- **Temporal**: Proper date sequences

## 🚨 Important Notes

1. **Clean Database**: Run migrations before seeding
2. **API Running**: Ensure backend is running on `localhost:3000`
3. **Rate Limiting**: Built-in delays to avoid overwhelming the API
4. **Error Handling**: Comprehensive error logging

## 📖 Next Steps

To complete the seed system:

1. Implement remaining seeders (plantations, fields, etc.)
2. Add them to `seed/index.ts` main function
3. Test with: `pnpm seed`
4. Verify data in database and via API

## 💡 Tips

- Start small: Test with 2-3 users first
- Check logs: Detailed console output for debugging
- Verify data: Use Swagger UI or Postman to verify
- Clean up: Drop database and re-run for fresh data
