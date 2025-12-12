# AgriSync Pro - Backend TODO List

> **Last Updated:** 2025-12-12
> **MVP Target:** Week 6 Completion

---

## 📊 Progress Overview

- ✅ **Completed:** Authentication, Field Management, Basic Crop Management, Financial Tracking
- 🚧 **In Progress:** Weather Integration, Dashboard
- ❌ **Not Started:** Alert System, Reporting, Photo Upload, Data Export

---

## 🔴 High Priority (Critical for MVP)

### 1. Weather Data Ingestion & Cron Job

**Status:** ❌ Not Implemented
**Priority:** CRITICAL
**Estimated Time:** 4-6 hours

**Requirements:**

- [ ] Set up cron job to fetch weather data every 3 hours
- [ ] Integrate OpenWeatherMap API (or alternative)
- [ ] Fetch weather for all active fields based on their coordinates
- [ ] Store current weather and 3-day forecast in `weather_data` table
- [ ] Handle API rate limits and errors gracefully
- [ ] Add logging for weather fetch operations

**Implementation Details:**

```typescript
// src/modules/weather/weather-cron.service.ts
@Injectable()
export class WeatherCronService {
  @Cron('0 */3 * * *') // Every 3 hours
  async fetchWeatherForAllFields() {
    // 1. Get all active fields with coordinates
    // 2. Fetch weather from OpenWeatherMap API
    // 3. Store in weather_data table
    // 4. Mark is_forecast = false for current weather
    // 5. Store 3-day forecast with is_forecast = true
  }
}
```

**API Endpoints Needed:**

- None (background job only)

**Database Changes:**

- Ensure `weather_data` table has proper indexes on `field_id` and `recorded_at`

---

### 2. Alert System & Rules Engine

**Status:** ❌ Not Implemented
**Priority:** CRITICAL
**Estimated Time:** 8-10 hours

**Requirements:**

- [ ] Create alert rules engine with pre-configured rules
- [ ] Implement alert triggering based on weather conditions
- [ ] Create alert CRUD endpoints
- [ ] Add alert acknowledgment functionality
- [ ] Integrate with Firebase FCM for push notifications
- [ ] Store alert history in database

**Pre-configured Alert Rules:**

1. **Heavy Rain Alert:** >50mm rainfall forecast in next 24 hours
2. **Temperature Extreme:** <10°C or >35°C
3. **Frost Warning:** <2°C for sensitive crops (Coffee, Cocoa, Plantain, Banana)
4. **Drought Alert:** No rainfall for 7+ days (optional for MVP)

**Implementation Details:**

```typescript
// src/modules/alerts/alert-rules.service.ts
@Injectable()
export class AlertRulesService {
  async evaluateWeatherAlerts(fieldId: string, weatherData: WeatherData) {
    // 1. Check heavy rain (>50mm)
    // 2. Check temperature extremes
    // 3. Check frost conditions for sensitive crops
    // 4. Create alert if conditions met
    // 5. Send push notification via FCM
  }
}
```

**API Endpoints:**

```typescript
// GET /api/v1/alerts - List all alerts for user
// GET /api/v1/alerts/:id - Get alert details
// PATCH /api/v1/alerts/:id/acknowledge - Mark alert as acknowledged
// DELETE /api/v1/alerts/:id - Delete/dismiss alert
```

**Database Schema:**

```sql
-- Already exists in alert.entity.ts, verify completeness:
- id (UUID, PK)
- field_id (UUID, FK)
- alert_type (VARCHAR) -- 'heavy_rain', 'temperature_extreme', 'frost_warning'
- title (VARCHAR)
- message (TEXT)
- severity (VARCHAR) -- 'low', 'medium', 'high', 'critical'
- triggered_at (TIMESTAMPTZ)
- acknowledged (BOOLEAN)
- acknowledged_at (TIMESTAMPTZ, NULLABLE)
- created_at (TIMESTAMPTZ)
```

**Integration Points:**

- Weather cron job should trigger alert evaluation after fetching new data
- FCM service should send push notifications when alerts are created

---

### 3. Enhanced Dashboard Aggregations

**Status:** 🚧 Partially Implemented
**Priority:** HIGH
**Estimated Time:** 4-5 hours

**Requirements:**

- [ ] Add weather overview for all user's fields
- [ ] Include recent activities timeline (last 7 days)
- [ ] Show active alerts count and summary
- [ ] Display financial snapshot (total costs vs revenue)
- [ ] Add profitability indicators per field
- [ ] Include upcoming tasks/reminders (optional)

**Current Implementation:**

```typescript
// src/modules/dashboard/dashboard.service.ts
// Expand DashboardSummary interface
```

**Enhanced Response Structure:**

```typescript
interface DashboardSummary {
  // Existing fields
  totalFields: number;
  totalPlantations: number;

  // New fields needed:
  weatherOverview: {
    fieldId: string;
    fieldName: string;
    currentTemp: number;
    currentCondition: string;
    alerts: number;
  }[];

  recentActivities: {
    id: string;
    fieldName: string;
    activityType: string;
    date: string;
    description: string;
  }[];

  activeAlerts: {
    id: string;
    severity: string;
    title: string;
    fieldName: string;
    triggeredAt: string;
  }[];

  financialSnapshot: {
    totalCosts: number;
    totalRevenue: number;
    grossProfit: number;
    profitMargin: number;
  };

  fieldPerformance: {
    fieldId: string;
    fieldName: string;
    currentCrop: string;
    profitability: number; // XAF
    status: 'profitable' | 'break-even' | 'loss';
  }[];
}
```

**API Endpoint:**

```typescript
// GET /api/v1/dashboard/summary - Already exists, enhance response
```

---

## 🟡 Medium Priority (Should Have for MVP)

### 4. Activity Photo Upload

**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Estimated Time:** 6-8 hours

**Requirements:**

- [ ] Integrate Cloudinary or AWS S3 for image storage
- [ ] Add image compression before upload (Sharp library)
- [ ] Create photo upload endpoint for activities
- [ ] Store photo URLs in database
- [ ] Add photo retrieval endpoint
- [ ] Implement photo deletion
- [ ] Add file size and type validation (max 5MB, JPEG/PNG only)

**Implementation Details:**

```typescript
// src/modules/crop-management/activity-photos.service.ts
@Injectable()
export class ActivityPhotosService {
  async uploadPhoto(
    activityId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // 1. Validate file (size, type)
    // 2. Compress image using Sharp
    // 3. Upload to Cloudinary/S3
    // 4. Store URL in database
    // 5. Return photo URL
  }
}
```

**API Endpoints:**

```typescript
// POST /api/v1/fields/:fieldId/activities/:activityId/photos
// GET /api/v1/fields/:fieldId/activities/:activityId/photos
// DELETE /api/v1/fields/:fieldId/activities/:activityId/photos/:photoId
```

**Database Schema:**

```sql
-- Create new table: activity_photos
CREATE TABLE activity_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES field_activities(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  file_size INTEGER,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_photos_activity_id ON activity_photos(activity_id);
```

**Dependencies:**

```bash
pnpm add cloudinary sharp
# OR
pnpm add @aws-sdk/client-s3 sharp
```

---

### 5. Report Generation Service

**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Estimated Time:** 6-8 hours

**Requirements:**

- [ ] Field performance summary report
- [ ] Seasonal cost vs revenue report
- [ ] Weather impact summary report
- [ ] Activity timeline report
- [ ] Financial profitability report

**Implementation Details:**

```typescript
// src/modules/reports/reports.service.ts
@Injectable()
export class ReportsService {
  async generateFieldPerformanceReport(userId: string, fieldId: string) {
    // 1. Get field details
    // 2. Get all planting seasons
    // 3. Calculate total costs, revenue, profit
    // 4. Get activity count by type
    // 5. Get weather statistics
    // 6. Return formatted report
  }

  async generateSeasonalSummary(userId: string, seasonId: string) {
    // 1. Get season details
    // 2. Get all activities for season
    // 3. Calculate input costs
    // 4. Get harvest data
    // 5. Calculate profitability
    // 6. Return formatted report
  }

  async generateWeatherImpactReport(
    userId: string,
    fieldId: string,
    dateRange: DateRange,
  ) {
    // 1. Get weather data for date range
    // 2. Correlate with activities and yields
    // 3. Identify weather patterns
    // 4. Return impact analysis
  }
}
```

**API Endpoints:**

```typescript
// GET /api/v1/reports/field-performance?fieldId=xxx
// GET /api/v1/reports/seasonal-summary?seasonId=xxx
// GET /api/v1/reports/weather-impact?fieldId=xxx&startDate=xxx&endDate=xxx
// GET /api/v1/reports/activity-timeline?fieldId=xxx&startDate=xxx&endDate=xxx
```

**Response Format:**

```typescript
interface FieldPerformanceReport {
  field: {
    id: string;
    name: string;
    area: number;
  };
  currentSeason: {
    crop: string;
    plantingDate: string;
    daysActive: number;
  };
  financials: {
    totalCosts: number;
    totalRevenue: number;
    grossProfit: number;
    profitPerHectare: number;
  };
  activities: {
    total: number;
    byType: Record<string, number>;
  };
  weather: {
    avgTemperature: number;
    totalRainfall: number;
    extremeEvents: number;
  };
}
```

---

### 6. Data Export (CSV/Excel)

**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Estimated Time:** 4-5 hours

**Requirements:**

- [ ] Export financial records to CSV
- [ ] Export activities to CSV
- [ ] Export field data to CSV
- [ ] Export planting seasons to CSV
- [ ] Optional: Excel format support

**Implementation Details:**

```typescript
// src/modules/export/export.service.ts
@Injectable()
export class ExportService {
  async exportFinancialRecords(
    userId: string,
    fieldId?: string,
  ): Promise<string> {
    // 1. Query financial records
    // 2. Format as CSV
    // 3. Return CSV string or file path
  }

  async exportActivities(userId: string, fieldId?: string): Promise<string> {
    // 1. Query activities
    // 2. Format as CSV
    // 3. Return CSV string or file path
  }
}
```

**API Endpoints:**

```typescript
// GET /api/v1/export/financial-records?format=csv&fieldId=xxx
// GET /api/v1/export/activities?format=csv&fieldId=xxx
// GET /api/v1/export/fields?format=csv
// GET /api/v1/export/planting-seasons?format=csv&fieldId=xxx
```

**Dependencies:**

```bash
pnpm add csv-writer
# OR for Excel support
pnpm add exceljs
```

---

## 🟢 Low Priority (Nice to Have)

### 7. PDF Report Generation

**Status:** ❌ Not Implemented
**Priority:** LOW
**Estimated Time:** 6-8 hours

**Requirements:**

- [ ] Generate PDF reports from report data
- [ ] Add company logo and branding
- [ ] Include charts and visualizations
- [ ] Support multiple report templates

**Implementation Details:**

```typescript
// src/modules/reports/pdf-generator.service.ts
@Injectable()
export class PdfGeneratorService {
  async generateFieldPerformancePdf(
    reportData: FieldPerformanceReport,
  ): Promise<Buffer> {
    // 1. Create PDF document
    // 2. Add header with logo
    // 3. Add report sections
    // 4. Add charts (optional)
    // 5. Return PDF buffer
  }
}
```

**API Endpoints:**

```typescript
// GET /api/v1/reports/field-performance/pdf?fieldId=xxx
// GET /api/v1/reports/seasonal-summary/pdf?seasonId=xxx
```

**Dependencies:**

```bash
pnpm add pdfkit
# OR
pnpm add puppeteer
```

---

### 8. Email Notifications for Alerts

**Status:** ❌ Not Implemented
**Priority:** LOW
**Estimated Time:** 3-4 hours

**Requirements:**

- [ ] Send email when critical alerts are triggered
- [ ] Weekly summary emails (optional)
- [ ] Harvest reminder emails (optional)
- [ ] Email templates with branding

**Implementation Details:**

```typescript
// src/modules/email/alert-email.service.ts
@Injectable()
export class AlertEmailService {
  async sendAlertEmail(userId: string, alert: Alert) {
    // 1. Get user email
    // 2. Format alert email template
    // 3. Send via email service
  }
}
```

**Integration:**

- Hook into alert creation in `AlertRulesService`
- Use existing email module

---

## 🔧 Technical Debt & Improvements

### 9. Database Optimizations

**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Estimated Time:** 2-3 hours

**Tasks:**

- [ ] Add indexes for frequently queried fields

  ```sql
  CREATE INDEX idx_weather_data_field_id ON weather_data(field_id);
  CREATE INDEX idx_weather_data_recorded_at ON weather_data(recorded_at);
  CREATE INDEX idx_field_activities_field_id ON field_activities(field_id);
  CREATE INDEX idx_field_activities_activity_date ON field_activities(activity_date);
  CREATE INDEX idx_financial_records_field_id ON financial_records(field_id);
  CREATE INDEX idx_alerts_field_id ON alerts(field_id);
  CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at);
  ```

- [ ] Consider partitioning `weather_data` by date (if data volume is high)
- [ ] Add soft delete for critical entities (users, plantations, fields)
- [ ] Implement database backup strategy

---

### 10. API Documentation

**Status:** 🚧 Partially Implemented
**Priority:** MEDIUM
**Estimated Time:** 3-4 hours

**Tasks:**

- [ ] Complete Swagger/OpenAPI documentation for all endpoints
- [ ] Add example requests and responses
- [ ] Document error codes and messages
- [ ] Add authentication requirements to all protected endpoints
- [ ] Create API usage guide

**Implementation:**

```typescript
// Enhance existing Swagger decorators
@ApiOperation({ summary: 'Get field performance report' })
@ApiResponse({ status: 200, description: 'Report generated successfully', type: FieldPerformanceReport })
@ApiResponse({ status: 404, description: 'Field not found' })
@ApiResponse({ status: 403, description: 'Unauthorized access' })
```

---

### 11. Business Logic Validations

**Status:** 🚧 Partially Implemented
**Priority:** HIGH
**Estimated Time:** 4-5 hours

**Tasks:**

- [ ] **Planting Season Validation**
  - Only 1 active planting season per field
  - Prevent overlapping planting seasons
  - Validate harvest date is after planting date

- [ ] **Activity Validation**
  - Activity date should be within planting season dates
  - Cannot log activities for harvested seasons
  - Validate activity types are appropriate for crop type

- [ ] **Financial Calculations**
  - Auto-calculate gross profit per field
  - Auto-calculate ROI per season
  - Calculate profitability indicators
  - Validate amounts are positive

**Implementation:**

```typescript
// src/modules/crop-management/planting-seasons.service.ts
async createSeason(userId: string, fieldId: string, dto: CreatePlantingSeasonDto) {
  // 1. Check if field has active season
  const activeSeason = await this.findActiveSeasonForField(fieldId);
  if (activeSeason) {
    throw new BadRequestException('Field already has an active or planned season');
  }

  // 2. Validate dates
  if (dto.expectedHarvestDate && dto.expectedHarvestDate <= dto.plantingDate) {
    throw new BadRequestException('Harvest date must be after planting date');
  }

  // 3. Create season
  // ...
}
```

---

### 12. Error Handling & Logging

**Status:** 🚧 Partially Implemented
**Priority:** MEDIUM
**Estimated Time:** 3-4 hours

**Tasks:**

- [ ] Standardize error responses across all endpoints
- [ ] Add proper validation error messages
- [ ] Implement global exception filters
- [ ] Add request/response logging
- [ ] Integrate error tracking (Sentry, LogRocket, etc.)

**Implementation:**

```typescript
// src/common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 1. Log error
    // 2. Format error response
    // 3. Send to error tracking service
    // 4. Return standardized error
  }
}
```

---

### 13. Testing

**Status:** ❌ Not Implemented
**Priority:** MEDIUM
**Estimated Time:** 10-15 hours

**Tasks:**

- [ ] Unit tests for services (80% coverage target)
- [ ] Integration tests for controllers
- [ ] E2E tests for critical flows:
  - User registration and login
  - Field creation and management
  - Activity logging
  - Financial recording
  - Weather data retrieval
  - Alert triggering

**Implementation:**

```typescript
// test/field-management.e2e-spec.ts
describe('Field Management (e2e)', () => {
  it('should create a field with valid boundary', async () => {
    // Test implementation
  });

  it('should calculate field area correctly', async () => {
    // Test implementation
  });
});
```

**Dependencies:**

```bash
# Already in package.json
jest
supertest
@nestjs/testing
```

---

## 📅 Suggested Implementation Timeline

### Week 5 (Current Week)

- [x] Complete seed data generation
- [ ] Implement weather cron job (Day 1-2)
- [ ] Build alert system (Day 3-5)

### Week 6 (Final MVP Week)

- [ ] Enhance dashboard aggregations (Day 1)
- [ ] Implement basic reporting (Day 2-3)
- [ ] Add activity photo upload (Day 4)
- [ ] Database optimizations (Day 5)
- [ ] Testing and bug fixes (Day 5-7)

### Post-MVP (Optional)

- [ ] PDF report generation
- [ ] Data export functionality
- [ ] Email notifications
- [ ] Comprehensive testing
- [ ] Performance optimization

---

## 🎯 MVP Success Criteria

Before considering MVP complete, ensure:

- ✅ All authentication flows work
- ✅ Users can create and manage fields
- ✅ Weather data is automatically fetched and displayed
- ✅ Alerts are triggered based on weather conditions
- ✅ Activities can be logged with optional photos
- ✅ Financial tracking shows profitability
- ✅ Dashboard provides comprehensive overview
- ✅ Basic reports are available
- ✅ API is documented
- ✅ Critical bugs are fixed

---

## 📝 Notes

- **Priority levels** are based on MVP requirements from `docs/development/mvp-scope.md`
- **Time estimates** are approximate and may vary based on complexity
- **Dependencies** should be installed as needed
- **Testing** should be done incrementally, not as a final step
- **Documentation** should be updated as features are implemented

---

**Last Review:** 2025-12-12
**Next Review:** After Week 5 completion
