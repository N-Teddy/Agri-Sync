- give me the detaied list of functionaities  for an mvp
AgriSync Pro - MVP Functionalities List
🎯 MVP Core Focus

Goal: Deliver essential value with minimal complexity for Cameroonian plantation owners
📱 MVP User Roles

    Plantation Owner - Primary user

    Farm Manager - Optional secondary user

🏗️ MVP Modules & Features
Module 1: Authentication & Basic Setup (Week 1-2)
1.1 User Management
typescript

// Core Functions:
- Owner registration with email/password
- Email verification
- Login/logout functionality
- Basic profile management (name, phone)
- No team management in MVP

1.2 Plantation & Field Setup
typescript

// Core Functions:
- Create single plantation (name, location, region)
- Draw field boundaries on map (3-5 fields max)
- Auto-calculate field area in hectares
- Basic field info (name, soil type optional)

Module 2: Crop Management (Week 2-3)
2.1 Basic Crop Planning
typescript

// Core Functions:
- Select from pre-defined Cameroonian crops:
  * Coffee (Arabica/Robusta)
  * Cocoa
  * Plantain/Banana
  * Maize
- Record planting date per field
- Track crop growth stage (auto-calculated)
- Mark harvest completion with yield recording

2.2 Simple Activity Logging
typescript

// Core Functions:
- Log basic field activities:
  * Land Preparation
  * Planting
  * Fertilizer Application
  * Spraying (Pesticides/Fungicides)
  * Weeding
  * Harvesting
- Record: Date, field, activity type, notes
- Optional: Input product name (free text)
- No quantity tracking in MVP

Module 3: Weather Intelligence (Week 3-4)
3.1 Basic Weather Display
typescript

// Core Functions:
- Current weather per field (temperature, humidity, rainfall)
- 3-day weather forecast
- Simple weather alerts (rain, temperature extremes)
- No hyper-local downscaling in MVP

3.2 Essential Weather Alerts
typescript

// Pre-configured Alerts:
- Heavy Rain Alert: >50mm rain forecast
- Temperature Extreme: <10°C or >35°C
- Frost Warning: <2°C for sensitive crops
- Basic push notifications only

Module 4: Financial Tracking (Week 4-5)
4.1 Simple Cost Recording
typescript

// Core Functions:
- Record input purchases:
  * Product name, cost in XAF, date
  * Assign to specific fields
- No inventory management
- No price catalog integration

4.2 Basic Revenue & Profitability
typescript

// Core Functions:
- Record harvest sales:
  * Crop, quantity, price per kg, total revenue
- Calculate per-field:
  * Total input costs
  * Total revenue
  * Gross profit
- Simple profit/loss indicator per field

Module 5: Dashboard & Reporting (Week 5-6)
5.1 Main Dashboard
typescript

// Core Views:
- Weather overview for all fields
- Recent activities timeline
- Active alerts summary
- Basic financial snapshot (total costs vs revenue)

5.2 Simple Reports
typescript

// MVP Reports:
- Field performance summary
- Seasonal cost vs revenue
- Weather impact summary (basic correlation)
- No advanced analytics

🔄 MVP User Flows
Flow 1: Initial Setup (15 minutes)
text

1. Register account → Verify email
2. Create plantation → Basic info
3. Draw 3-5 fields → Map integration
4. Set up current crops → Planting dates
5. Ready to use

Flow 2: Daily Operations (5 minutes/day)
text

Morning:
1. Check weather dashboard → Plan activities
2. Review alerts → Take action if needed

During Day:
1. Log completed activities → Quick entry
2. Record input purchases → When they happen

End of Day:
1. Quick dashboard review → 2-minute check

Flow 3: Harvest Recording (2 minutes/harvest)
text

1. Select field → Mark as harvested
2. Enter yield data → Quantity in kg
3. Record sale → Price and revenue
4. System calculates profitability

🚫 What's NOT in MVP
Excluded Features:
typescript

// Complex Features:
- Team management (single user only)
- Advanced alert rules configuration
- Disease prediction models
- Inventory management
- Equipment tracking
- Labor cost calculation
- Advanced reporting
- Mobile offline sync
- Multi-plantation support
- API integrations beyond weather

Simplified Assumptions:
typescript

// MVP Simplifications:
- Single currency (XAF)
- Manual price entry (no market data feeds)
- Basic weather data (no micro-climate)
- No historical data analysis
- No predictive analytics
- No image uploads for activities
- No SMS/email notifications (push only)

📊 MVP Data Structure
Essential Data Points:
typescript

// Per Field:
- Boundary (polygon)
- Area (hectares)
- Current crop
- Planting date
- Activities log
- Input costs
- Harvest data

// Per Season:
- Total input costs
- Total revenue
- Profit calculation

🎯 MVP Success Metrics
Functional Requirements:
typescript

const mvpSuccessCriteria = {
  usability: 'Plantation owner can setup in <15 minutes',
  dailyUse: 'Daily operations take <5 minutes',
  value: 'Clear profitability per field visible',
  reliability: 'Weather data 90% accurate',
  performance: 'App loads in <3 seconds'
};

Business Validation:
typescript

// MVP Goals:
- Prove farmers will use the app daily
- Validate weather alert usefulness
- Confirm financial tracking value
- Gather feedback for next version
- Test core technology stack

🔧 MVP Technical Scope
Frontend (React PWA):
typescript

// Core Pages:
- Login/Register
- Dashboard
- Field Management
- Activity Logging
- Weather View
- Financial Summary
- Settings

Backend (NestJS):
typescript

// Core APIs:
- Authentication
- Plantation/Field CRUD
- Weather data ingestion
- Activity logging
- Financial recording
- Basic alerts
- Simple reports

This MVP focuses on delivering the core value proposition: helping Cameroonian plantation owners make better decisions using weather data and basic financial tracking, with minimal complexity and maximum usability.
- give me a structure diagram for the mvp
- ask questions upon ambiuguity
AgriSync Pro - MVP Structure Diagram
🏗️ MVP Architecture Overview
text

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React PWA     │    │   NestJS API     │   │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)      │◄──►│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
    ┌───────────┐         ┌──────────────┐         ┌─────────────┐
    │  Service  │         │  External    │         │  PostGIS    │
    │  Worker   │         │   Weather    │         │  Extension  │
    │ (PWA)     │         │     API      │         │             │
    └───────────┘         └──────────────┘         └─────────────┘

📱 Frontend Structure (React PWA)
text

src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── forms/
│   │   ├── FieldForm.tsx
│   │   ├── ActivityForm.tsx
│   │   └── FinancialForm.tsx
│   └── maps/
│       └── FieldMap.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Fields/
│   │   ├── FieldList.tsx
│   │   └── FieldDetail.tsx
│   ├── Activities/
│   │   ├── ActivityLog.tsx
│   │   └── ActivityForm.tsx
│   ├── Weather/
│   │   └── WeatherView.tsx
│   ├── Financial/
│   │   └── FinancialSummary.tsx
│   └── Auth/
│       ├── Login.tsx
│       └── Register.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── weather.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useFields.ts
│   └── useWeather.ts
└── utils/
    ├── constants.ts
    └── helpers.ts

🔧 Backend Structure (NestJS)
text

src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── guards/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   ├── plantations/
│   │   ├── plantations.controller.ts
│   │   ├── plantations.service.ts
│   ├── fields/
│   │   ├── fields.controller.ts
│   │   ├── fields.service.ts
│   ├── weather/
│   │   ├── weather.controller.ts
│   │   ├── weather.service.ts
│   ├── activities/
│   │   ├── activities.controller.ts
│   │   ├── activities.service.ts
│   └── financial/
│       ├── financial.controller.ts
│       ├── financial.service.ts
├── common/
│   ├── filters/
│   ├── interceptors/
│   └── decorators/
└── config/
    ├── database.config.ts
    └── app.config.ts

🗄️ Database Schema (MVP Simplified)
text

users
├── id, email, name, role, created_at
└── ➡️ plantations

plantations
├── id, name, location, region, owner_id
└── ➡️ fields

fields
├── id, plantation_id, name, boundary, area_hectares, current_crop
└── ➡️ planting_seasons, activities, weather_data

planting_seasons
├── id, field_id, crop_type, planting_date, harvest_date, yield
└── ➡️ activities

activities
├── id, field_id, type, date, notes, input_product, input_cost
└── ➡️ (no relations in MVP)

weather_data
├── id, field_id, recorded_at, temperature, humidity, rainfall
└── (standalone)

financial_records
├── id, field_id, type, amount_xaf, date, description
└── (standalone)

🔄 MVP Data Flow
User Registration Flow:
text

1. User fills registration form
2. System creates user + default plantation
3. User redirected to field setup
4. User draws fields on map
5. System ready for daily use

Daily Operation Flow:
text

1. User opens app → Dashboard loads
2. System checks weather → Displays alerts
3. User logs activities → Simple form
4. User records costs → Quick entry
5. System updates financial summary

Weather Data Flow:
text

1. Cron job fetches weather (every 3 hours)
2. System stores per-field data
3. Frontend fetches latest weather
4. Alert engine checks conditions
5. Push notifications sent if needed

❓ Questions for Clarification
1. User Management

    Should MVP support multiple plantations per owner?

    Do we need password reset functionality?

    Should we include basic user profile editing?

2. Field Management

    Maximum number of fields per plantation?

    Should we support field status (active/fallow)?

    Do we need field history (what was planted before)?

3. Weather Integration

    Which weather API specifically? (OpenWeatherMap, WeatherAPI, other?)

    How often should we update weather data?

    Should we store historical weather data?

4. Financial Tracking

    Should we categorize costs (fertilizer, pesticides, etc.)?

    Do we need to track revenue per harvest or per sale?

    Should we include basic charts for financial data?

5. Activity Logging

    Should activities be tied to specific planting seasons?

    Do we need activity templates for common tasks?

    Should we include basic activity scheduling?

6. Notifications

    Push notifications only, or include email/SMS?

    Should users configure notification preferences?

    Do we need notification history?

7. Data Persistence

    How much historical data should we keep?

    Should we include data export functionality?

    Do we need backup/restore features?

8. Mobile Experience

    PWA only, or consider Capacitor for app stores?

    Should we optimize for low-bandwidth areas?

    Do we need offline functionality in MVP?

9. Security

    Basic JWT auth sufficient?

    Should we include rate limiting?

    Do we need data validation beyond TypeORM?

10. Deployment

    Single region deployment (where?)

    How to handle database backups?

    Monitoring and error tracking needed?

🎯 MVP Core User Journey
text

Day 1:
Register → Setup Plantation → Create Fields → Add Current Crops

Week 1:
Check Weather → Log Activities → Record Costs → View Dashboard

Month 1:
Record Harvest → View Profitability → Plan Next Season

Please clarify the ambiguous points above so I can refine the MVP structure accordingly.
- generate an erd diagram for the data base.
- ask questions upon ambiguity

I'll create an ERD diagram for the AgriSync Pro database. Based on our previous discussions, here's the entity-relationship diagram:
🗄️ AgriSync Pro - Entity Relationship Diagram
text

┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│     users       │      │   plantations    │      │   crop_types    │
├─────────────────┤      ├──────────────────┤      ├─────────────────┤
│ id (PK)         │┼──┼││ id (PK)         ││┼──┼││ id (PK)         │
│ email           │      │ name            │      │ name            │
│ phone           │      │ location        │      │ variety         │
│ full_name       │      │ country         │      │ scientific_name │
│ role            │      │ region          │      │ opt_temp_min    │
│ password_hash   │      │ owner_id (FK)   │┼────┼│ opt_temp_max    │
│ is_active       │      │ created_at      │      │ frost_sensitive │
│ created_at      │      └──────────────────┘      └─────────────────┘
│ updated_at      │                │
└─────────────────┘                │1
         │                         │
         │1                        │*
         │*                        │
┌─────────────────┐                ▼
│ user_sessions   │      ┌─────────────────┐
├─────────────────┤      │     fields      │
│ id (PK)         │      ├─────────────────┤
│ user_id (FK)    │┼────┼│ id (PK)         │
│ device_type     │      │ plantation_id(FK)│
│ last_active     │      │ name            │
│ created_at      │      │ boundary (GEO)  │
└─────────────────┘      │ area_hectares   │
                         │ soil_type       │
                         │ elevation       │
                         │ created_at      │
                         └─────────────────┘
                                  │1
                                  │*
                                  │
                  ┌───────────────────────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌─────────────────┐                ┌─────────────────┐
        │ planting_seasons│                │  weather_data   │
        ├─────────────────┤                ├─────────────────┤
        │ id (PK)         │                │ id (PK)         │
        │ field_id (FK)   │┼──────────────┼│ field_id (FK)   │
        │ crop_type_id(FK)│┼────┐         │ recorded_at      │
        │ planting_date   │     │         │ temperature      │
        │ exp_harvest_date│     │         │ humidity         │
        │ actual_harvest  │     │         │ rainfall         │
        │ yield_estimate  │     │         │ wind_speed       │
        │ actual_yield    │     │         │ forecast_source  │
        │ status          │     │         │ is_forecast      │
        │ created_at      │     │         │ created_at       │
        └─────────────────┘     │         └─────────────────┘
                  │1            │
                  │*            │
                  │             │
        ┌─────────────────┐     │         ┌─────────────────┐
        │ field_activities│     │         │  input_prices_cm│
        ├─────────────────┤     │         ├─────────────────┤
        │ id (PK)         │     │         │ id (PK)         │
        │ field_id (FK)   │┼────┘         │ product_name    │
        │ planting_season┼┘               │ product_type    │
        │ activity_type_id│               │ unit_price_xaf  │
        │ performed_by(FK)│               │ unit_type       │
        │ activity_date   │               │ supplier        │
        │ description     │               │ region          │
        │ input_product   │               │ last_updated    │
        │ input_quantity  │               │ is_active       │
        │ input_unit      │               │ created_at      │
        │ is_synced       │               └─────────────────┘
        │ offline_id      │
        │ created_at      │                       │
        └─────────────────┘                       │
                  │1                              │
                  │*                              │
                  │                               │
        ┌─────────────────┐              ┌─────────────────┐
        │ activity_photos │              │ market_prices_cm│
        ├─────────────────┤              ├─────────────────┤
        │ id (PK)         │              │ id (PK)         │
        │ activity_id(FK) │┼─────────────│ crop_type       │
        │ photo_url       │              │ quality_grade   │
        │ caption         │              │ price_per_unit_xaf│
        │ taken_at        │              │ unit_type       │
        └─────────────────┘              │ market_location │
                                         │ record_date     │
                  ┌─────────────────┐    │ source          │
                  │  activity_types │    │ created_at      │
                  ├─────────────────┤    └─────────────────┘
                  │ id (PK)         │
                  │ name            │            ┌─────────────────┐
                  │ category        │            │  fixed_costs_cm │
                  │ input_type      │            ├─────────────────┤
                  └─────────────────┘            │ id (PK)         │
                           │1                    │ plantation_id(FK)│
                           │*                    │ cost_type       │
                           │                     │ description     │
                  ┌─────────────────┐            │ amount_xaf      │
                  │ field_activities│┼───────────│ cost_frequency  │
                  └─────────────────┘            │ start_date      │
                                                 │ end_date        │
┌─────────────────┐                │             │ is_active       │
│   alert_rules   │                │             │ created_at      │
├─────────────────┤                │             └─────────────────┘
│ id (PK)         │                │
│ name            │                │                     │1
│ description     │                │                     │*
│ conditions(JSON)│                │                     │
│ severity        │                │             ┌─────────────────┐
│ is_active       │                │             │ financial_records│
│ created_by(FK)  │                │             ├─────────────────┤
│ created_at      │                │             │ id (PK)         │
└─────────────────┘                │             │ field_id (FK)   │
         │1                        │             │ type            │
         │*                        │             │ amount_xaf      │
         │                         │             │ date            │
┌─────────────────┐                │             │ description     │
│     alerts      │                │             │ created_at      │
├─────────────────┤                │             └─────────────────┘
│ id (PK)         │                │
│ alert_rule_id(FK)│               │
│ field_id (FK)   │┼───────────────┘
│ planting_season┼┘
│ title          │
│ message        │
│ severity       │
│ triggered_by   │
│ trigger_value  │
│ expected_impact│
│ recommendation │
│ triggered_at   │
│ acknowledged_at│
│ acknowledged_by│
│ resolved_at    │
│ created_at     │
└─────────────────┘
         │1
         │*
         │
┌─────────────────┐
│alert_notifications│
├─────────────────┤
│ id (PK)         │
│ alert_id (FK)   │
│ user_id (FK)    │
│ notification_type│
│ sent_at         │
│ delivered       │
│ read_at         │
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│  disease_types  │      │disease_occurrences│
├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │
│ name            │┼──┼││ field_id (FK)   │
│ scientific_name │      │ disease_type_id(FK)│
│ affected_crops  │      │ planting_season┼┘
│ favorable_cond  │      │ first_observed │
│ prevention      │      │ severity       │
│ treatment       │      │ affected_area  │
└─────────────────┘      │ weather_cond   │
                         │ treatment_applied│
                         │ effectiveness   │
                         │ created_at      │
                         └─────────────────┘

❓ Questions for Clarification
1. Relationships & Cardinality

    Should field_activities be directly linked to planting_seasons or just to fields?

    Should financial_records link to planting_seasons or just to fields?

    Should alerts always require a planting_season_id or can they be field-only?

2. Financial Structure

    Do we need a separate financial_records table, or can we use field_activities for costs?

    Should revenue be stored in financial_records or in planting_seasons?

    Do we need to track payments/dates for financial records?

3. Weather Data Relationships

    Should weather_data always link to a specific field_id?

    Do we need to store weather data for plantation level as fallback?

    Should we have a separate table for weather alerts vs system alerts?

4. User Management

    Should user_sessions track device details for push notifications?

    Do we need user preferences table for notification settings?

    Should we track user activity logs for auditing?

5. Activity & Input Tracking

    Should field_activities have a direct link to input_prices_cm?

    Do we need to track inventory levels, or just costs?

    Should activity types be fixed enum or configurable?

6. Alert System

    Should alert_rules be user-specific or system-wide?

    Do we need alert categories (weather, disease, financial)?

    Should we track alert effectiveness metrics?

7. Data Lifecycle

    Should we have soft delete for all tables?

    Do we need archival strategies for old weather data?

    Should planting seasons be automatically created or manual?

8. Geospatial Data

    Should we store multiple geometry types (points for weather stations)?

    Do we need spatial indexes beyond field boundaries?

    Should we calculate distances between fields?

9. Market Data

    Should market_prices_cm link to crop_types or just use text?

    Do we need to track price sources and reliability?

    Should we store historical price trends?

10. Performance Considerations

    Do we need partitioning for large tables (weather_data, activities)?

    Should we have summary tables for dashboard performance?

    Do we need full-text search capabilities?

🔍 **Key Relationship Decisions
- give me the mvp erd
AgriSync Pro - MVP ERD (Simplified)
text

┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│     users       │      │   plantations    │      │   crop_types    │
├─────────────────┤      ├──────────────────┤      ├─────────────────┤
│ id (PK)         │┼──┼││ id (PK)         ││┼──┼││ id (PK)         │
│ email           │      │ name            │      │ name            │
│ full_name       │      │ location        │      │ variety         │
│ password_hash   │      │ region          │      │ created_at      │
│ created_at      │      │ owner_id (FK)   │┼────┼└─────────────────┘
└─────────────────┘      │ created_at      │
                         └──────────────────┘
                                  │1
                                  │*
                                  │
                         ┌─────────────────┐
                         │     fields      │
                         ├─────────────────┤
                         │ id (PK)         │
                         │ plantation_id(FK)│
                         │ name            │
                         │ boundary (GEO)  │
                         │ area_hectares   │
                         │ created_at      │
                         └─────────────────┘
                                  │1
                                  │*
                                  │
                         ┌─────────────────┐
                         │ planting_seasons│
                         ├─────────────────┤
                         │ id (PK)         │
                         │ field_id (FK)   │┼────┐
                         │ crop_type       │     │
                         │ planting_date   │     │
                         │ harvest_date    │     │
                         │ yield_kg        │     │
                         │ status          │     │
                         │ created_at      │     │
                         └─────────────────┘     │
                                  │1             │
                                  │*             │
                                  │              │
                         ┌─────────────────┐     │
                         │ field_activities│     │
                         ├─────────────────┤     │
                         │ id (PK)         │     │
                         │ field_id (FK)   │┼────┘
                         │ activity_type   │
                         │ activity_date   │
                         │ description     │
                         │ input_product   │
                         │ input_cost_xaf  │
                         │ created_at      │
                         └─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│  weather_data   │      │ financial_records│
├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │
│ field_id (FK)   │┼────┼│ field_id (FK)   │
│ recorded_at     │      │ record_type     │
│ temperature     │      │ amount_xaf      │
│ humidity        │      │ description     │
│ rainfall        │      │ record_date     │
│ is_forecast     │      │ created_at      │
│ created_at      │      └─────────────────┘
└─────────────────┘

┌─────────────────┐
│     alerts      │
├─────────────────┤
│ id (PK)         │
│ field_id (FK)   │┼──┐
│ alert_type      │   │
│ message         │   │
│ severity        │   │
│ triggered_at    │   │
│ acknowledged    │   │
│ created_at      │   │
└─────────────────┘   │
                      │
                      │
              All foreign keys reference
              the tables shown above

🎯 MVP Table Definitions
1. users
sql

- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- full_name (VARCHAR)
- password_hash (VARCHAR)
- created_at (TIMESTAMPTZ)

2. plantations
sql

- id (UUID, PK)
- name (VARCHAR)
- location (VARCHAR)
- region (VARCHAR)
- owner_id (UUID, FK → users.id)
- created_at (TIMESTAMPTZ)

3. fields
sql

- id (UUID, PK)
- plantation_id (UUID, FK → plantations.id)
- name (VARCHAR)
- boundary (GEOGRAPHY/POLYGON)
- area_hectares (DECIMAL)
- created_at (TIMESTAMPTZ)

4. planting_seasons
sql

- id (UUID, PK)
- field_id (UUID, FK → fields.id)
- crop_type (VARCHAR) -- 'Coffee', 'Maize', etc.
- planting_date (DATE)
- harvest_date (DATE, NULLABLE)
- yield_kg (DECIMAL, NULLABLE)
- status (VARCHAR) -- 'active', 'harvested'
- created_at (TIMESTAMPTZ)

5. field_activities
sql

- id (UUID, PK)
- field_id (UUID, FK → fields.id)
- activity_type (VARCHAR) -- 'planting', 'spraying', etc.
- activity_date (DATE)
- description (TEXT, NULLABLE)
- input_product (VARCHAR, NULLABLE)
- input_cost_xaf (DECIMAL, NULLABLE)
- created_at (TIMESTAMPTZ)

6. weather_data
sql

- id (UUID, PK)
- field_id (UUID, FK → fields.id)
- recorded_at (TIMESTAMPTZ)
- temperature (DECIMAL)
- humidity (DECIMAL)
- rainfall (DECIMAL)
- is_forecast (BOOLEAN)
- created_at (TIMESTAMPTZ)

7. financial_records
sql

- id (UUID, PK)
- field_id (UUID, FK → fields.id)
- record_type (VARCHAR) -- 'cost', 'revenue'
- amount_xaf (DECIMAL)
- description (TEXT)
- record_date (DATE)
- created_at (TIMESTAMPTZ)

8. alerts
sql

- id (UUID, PK)
- field_id (UUID, FK → fields.id)
- alert_type (VARCHAR) -- 'weather', 'financial'
- message (TEXT)
- severity (VARCHAR) -- 'low', 'medium', 'high'
- triggered_at (TIMESTAMPTZ)
- acknowledged (BOOLEAN, DEFAULT false)
- created_at (TIMESTAMPTZ)

🔄 MVP Relationships Summary

    1 user → Many plantations

    1 plantation → Many fields

    1 field → Many planting_seasons (but only 1 active)

    1 field → Many field_activities

    1 field → Many weather_data entries

    1 field → Many financial_records

    1 field → Many alerts

❓ MVP-Specific Questions
1. Data Simplicity

    Should we remove crop_types table and just use text fields?

    Do we need planting_seasons table or can activities handle everything?

    Should financial records be merged into activities?

2. Weather Data

    Do we need historical weather data in MVP?

    Should we store forecast data separately from current weather?

    How many days of weather history do we need?

3. Financial Tracking

    Should we track costs per activity OR separate financial records?

    Do we need revenue tracking per harvest or per sale?

    Should we include basic profit calculation in MVP?

4. Alert System

    Should alerts be persistent or just push notifications?

    Do we need alert categories beyond weather?

    Should users be able to configure alert thresholds?

5. User Experience

    Single active planting season per field?

    How many activities should we track per field?

    Should we include basic reporting in MVP?

6. Performance

    Do we need indexes beyond primary keys?

    Should we partition weather_data table?

    How much historical data should we keep?

This MVP ERD focuses on the absolute essentials while maintaining the core value proposition for Cameroonian plantation owners.