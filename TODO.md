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

**Status:** ✅ Implemented
**Priority:** CRITICAL
**Completed:** 2025-12-12

**Implementation Summary:**

- ✅ Created `WeatherCronService` with automated weather fetching
- ✅ Cron job runs every 3 hours (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
- ✅ Fetches current weather and 3-day forecast for all fields
- ✅ Processes fields in batches of 10 to respect API rate limits
- ✅ Includes error handling and logging
- ✅ Added daily cleanup job to remove weather data older than 30 days
- ✅ Integrated with existing OpenWeatherMap API
- ✅ Configured ScheduleModule in app.module.ts

**Files Modified:**

- `src/modules/weather/weather-cron.service.ts` (created)
- `src/modules/weather/weather.module.ts` (updated)
- `src/app.module.ts` (added ScheduleModule)

---

### 2. Alert System & Rules Engine

**Status:** ✅ Implemented (In-App Notifications Only)
**Priority:** CRITICAL
**Completed:** 2025-12-12

**Implementation Summary:**

- ✅ Created `AlertsModule` with full CRUD endpoints
- ✅ Implemented `AlertsService` with filtering capabilities
- ✅ Added `AlertsController` with REST API endpoints
- ✅ Alert rules engine already exists in `WeatherAlertsService`
- ✅ Alerts are automatically created by weather cron job
- ✅ Users can list, acknowledge, resolve, and delete alerts
- ✅ Added unacknowledged count endpoint for badge notifications
- ✅ Proper authorization - users can only access their own alerts
- ⏸️ Push notifications (FCM) - deferred (mobile app not ready)

**API Endpoints:**

- `GET /api/v1/alerts` - List all alerts with filters
- `GET /api/v1/alerts/unacknowledged-count` - Get count for badge
- `GET /api/v1/alerts/:id` - Get specific alert
- `PATCH /api/v1/alerts/:id/acknowledge` - Mark as acknowledged
- `PATCH /api/v1/alerts/:id/resolve` - Mark as resolved
- `DELETE /api/v1/alerts/:id` - Delete alert

**Alert Types (Pre-configured):**

1. Heavy Rain (>50mm forecast)
2. Temperature Extreme (<10°C or >35°C)
3. Frost Warning (<2°C)
4. General Weather

**Files Created:**

- `src/modules/alerts/alerts.module.ts`
- `src/modules/alerts/alerts.controller.ts`
- `src/modules/alerts/alerts.service.ts`
- `src/modules/alerts/dto/get-alerts-query.dto.ts`

**Files Modified:**

- `src/modules/fields/field-access.service.ts` (added `getAllOwnedFields`)
- `src/app.module.ts` (added AlertsModule)

---

### 3. Enhanced Dashboard Aggregations

**Status:** ✅ Implemented
**Priority:** HIGH
**Completed:** 2025-12-12

**Implementation Summary:**

- ✅ Added comprehensive statistics (total fields, plantations, activities, alerts)
- ✅ Enhanced financial snapshot with profit margin calculation
- ✅ Implemented field performance indicators with profitability status
- ✅ Added alert statistics (total, unacknowledged, by severity)
- ✅ Weather overview for all user fields (already existed)
- ✅ Recent activities timeline (last 10 activities)
- ✅ Active alerts summary (last 10 unresolved)
- ✅ Financial breakdown per field

**Dashboard Response Structure:**

```typescript
{
  statistics: {
    totalFields: number;
    totalPlantations: number;
    totalActivities: number;
    totalAlerts: number;
  };
  fields: Field[];
  weatherOverview: WeatherOverviewItem[];
  recentActivities: FieldActivity[];
  activeAlerts: Alert[];
  alertStatistics: {
    total: number;
    unacknowledged: number;
    bySeverity: { low, medium, high };
  };
  financialSnapshot: {
    totals: { costs, revenue, profit, profitMargin };
    perField: FieldFinancialSummary[];
  };
  fieldPerformance: {
    fieldId, fieldName, currentCrop,
    profitability, status, totalCosts, totalRevenue
  }[];
}
```

**Field Performance Status:**

- `profitable`: Profitability > 100 XAF
- `break-even`: -100 XAF ≤ Profitability ≤ 100 XAF
- `loss`: Profitability < -100 XAF
- `no-data`: No financial records

**API Endpoint:**

- `GET /api/v1/dashboard/summary` - Get comprehensive dashboard data

**Files Modified:**

- `src/modules/dashboard/dashboard.service.ts` (enhanced with new metrics)

---

## 🟡 Medium Priority (Should Have for MVP)

### 4. Activity Photo Upload

**Status:** ✅ Implemented
**Priority:** MEDIUM
**Completed:** 2025-12-12

**Implementation Summary:**

- ✅ Created unified `ImageUploadService` supporting both Cloudinary and local storage
- ✅ Automatic mode selection (Cloudinary in production, local in development)
- ✅ Image compression and resizing using Sharp library
- ✅ Subfolder organization by image type (profile, activity, field, plantation)
- ✅ Created `ActivityPhoto` entity with metadata storage
- ✅ Implemented photo upload, retrieval, and deletion endpoints
- ✅ File validation (type, size)
- ✅ Proper user authorization

**Image Processing:**

- Max resolution: 1920x1080
- Quality: 85% JPEG compression
- Progressive JPEG format
- Automatic resizing if needed

**Folder Structure:**

- **Cloudinary:** `AgriSync/{imageType}/`
- **Local:** `uploads/{imageType}/`

**API Endpoints:**

- `POST /api/v1/fields/:fieldId/activities/:activityId/photos` - Upload photo
- `GET /api/v1/fields/:fieldId/activities/:activityId/photos` - List photos
- `DELETE /api/v1/fields/:fieldId/activities/:activityId/photos/:photoId` - Delete photo

**Files Created:**

- `src/common/enums/image-type.enum.ts`
- `src/common/services/image-upload.service.ts`
- `src/common/services/common-services.module.ts`
- `src/entities/activity-photo.entity.ts`
- `src/modules/crop-management/activity-photos.controller.ts`
- `src/modules/crop-management/activity-photos.service.ts`
- `src/modules/crop-management/dto/upload-activity-photo.dto.ts`

**Files Modified:**

- `src/common/services/local-storage.service.ts` (added subfolder support)
- `src/common/third-party/cloudinary.service.ts` (added imageType parameter)
- `src/entities/field-activity.entity.ts` (added photos relationship)
- `src/modules/crop-management/crop-management.module.ts`
- `src/app.module.ts` (added CommonServicesModule)

**Future Extensibility:**
The system is designed to easily support other image types:

- Profile photos
- Field photos
- Plantation photos
- Any future image requirements

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
		dateRange: DateRange
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
		fieldId?: string
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
		reportData: FieldPerformanceReport
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
