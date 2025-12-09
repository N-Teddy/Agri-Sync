# AgriSync Pro - Project Brief

> **Unified Crop, Climate, and Financial Intelligence for Cameroonian Plantations**

**Author:** AgriSync Product Team
**Date:** 2024
**Version:** 1.0

---

## Table of Contents

1. [Project Snapshot](#project-snapshot)
2. [Pain Points We Solve](#pain-points-we-solve)
3. [Solution Overview](#solution-overview)
4. [Personas & Critical Workflows](#personas--critical-workflows)
5. [Product Scope](#product-scope)
6. [MVP Scope](#mvp-scope)
7. [Beyond MVP Enhancements](#beyond-mvp-enhancements)
8. [AI & Decision Intelligence Roadmap](#ai--decision-intelligence-roadmap)
9. [Technical Architecture & Stack](#technical-architecture--stack)
10. [Implementation Timeline](#implementation-timeline)
11. [Value & ROI Narrative](#value--roi-narrative)
12. [Setup & Enablement Notes](#setup--enablement-notes)

---

## Project Snapshot

- **Vision**: Deliver a digital farm manager that fuses hyper-local weather, crop activity tracking, and financial insights so plantation teams can act before risks hit yield.
- **Target Users**: Cameroonian plantation owners, farm managers, and field supervisors overseeing 50–500+ hectares.
- **Core Value**: Prevent crop loss, optimize resource use, and centralize institutional knowledge through proactive, data-backed recommendations.
- **Engagement Model**: B2B2C SaaS with annual subscriptions priced by monitored hectares and a no-risk 50-hectare pilot.

---

## Pain Points We Solve

### 1. Weather Uncertainty

Regional forecasts miss micro-climate swings that ruin planting, spraying, and irrigation schedules.

**Example:** Generic "Bamenda: 30% chance of rain" doesn't help when one field at higher elevation gets 15mm while another gets none.

### 2. Reactive Operations

Pests, diseases, and water stress are discovered only after visible damage, burning labor and inputs.

**Example:** Black Sigatoka detection often happens too late for effective treatment, causing 30-50% yield loss.

### 3. Resource Inefficiency

Diesel, fertilizer, and labor are wasted because timing is based on habit instead of conditions.

**Example:** Over-irrigation wastes water and diesel; under-irrigation stresses crops and reduces yield.

### 4. Information Silos

Weather data, crop logs, and financial records live in disconnected notebooks or personal memory.

**Example:** Manager knows "something went wrong last season" but can't correlate specific weather events with yield outcomes.

---

## Solution Overview

AgriSync Pro combines three pillars to act as a digital command center:

### 1. Hyper-Local Weather Intelligence

Merges field boundaries, elevation data, and multiple APIs to generate field-level forecasts with actionable alerts.

**Example Output:**
_"Coffee Field C-4: 15mm rain expected tomorrow 2-4 PM, Southwest winds 15km/h. Delay spraying until Wednesday."_

### 2. Integrated Crop and Activity Management

Digital logbook with growth stage tracking, activity histories, and photo evidence to understand cause and effect across a season.

**Features:**

- Draw geo-referenced fields with auto-calculated area
- Configure crop calendars with planting/harvest dates
- Log activities with photos and offline sync
- Track growth stages automatically

### 3. AI-Powered Alerting and Recommendations

Evaluates weather, crop stage, and historical behavior to trigger preventive advisories through push/SMS.

**Alert Types:**

- Frost warnings for sensitive crops
- Disease risk predictions (e.g., Black Sigatoka)
- Irrigation timing advisories
- Optimal harvest windows

---

## Contextual Case Studies

### Case Study 1: Banana Black Sigatoka Prevention

**The Problem:**

- Fungal disease thriving in warm, humid conditions (humidity >90%, temp ~25°C)
- Traditional detection often too late
- Potential yield loss: 30-50%

**AgriSync Pro Solution:**

```
Alert Generated:
🚨 HIGH DISEASE RISK for Banana Field B-2
Conditions perfect for Black Sigatoka next 48 hours.
Recommend fungicide application within 24 hours.
```

**Results:**

- ✅ Preventive treatment instead of reactive
- ✅ Chemical cost reduction: 30-40%
- ✅ Yield protection: 25-45%

---

### Case Study 2: Rice Irrigation Optimization (Ndop Plain)

**The Problem:**

- Over-irrigation wastes water and diesel
- Under-irrigation stresses crops
- Nutrient leaching from poor timing

**AgriSync Pro Solution:**

```
Alert Generated:
💧 IRRIGATION ADVISORY for Rice Field R-7
Soil moisture depleting. No rain forecast 5 days.
Optimal window: Thursday 6-10 AM.
```

**Results:**

- ✅ Diesel cost reduction: 15-20%
- ✅ Water optimization: 20-25%
- ✅ Fertilizer efficiency improvement: 15-20%

---

### Case Study 3: Coffee Frost Protection (Western Highlands)

**The Problem:**

- Sudden temperature drops damage flowering coffee
- Traditional forecasting insufficiently precise
- Single event can cause 70% yield loss

**AgriSync Pro Solution:**

```
Alert Generated:
❄️ FROST WARNING for Coffee Field C-4
Temperatures dropping to 1°C tonight at 4 AM.
Activate protection measures immediately.
```

**Results:**

- ✅ Critical early warning (12-24 hours advance)
- ✅ Time to implement protective measures
- ✅ Potential harvest salvation: 60-70%

---

## Personas & Critical Workflows

| Role                 | Responsibilities                                  | High-Value Journeys                                                                                                        |
| -------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Plantation Owner** | Approves investment, monitors profitability       | Registration & onboarding, team setup, financial dashboard, scheduled report exports                                       |
| **Farm Manager**     | Plans operations, configures alerts, assigns work | Morning briefing, season planning, alert configuration & response, disease/pest monitoring, financial & labor oversight    |
| **Field Supervisor** | Executes and logs field tasks, scouts risks       | Daily task review via mobile PWA, offline activity logging with photos, disease/pest scouting, alert response verification |

**Detailed User Flows:** See [User Flows Guide](../user-guides/user-flows.md)

---

## Product Scope

### Field & Crop Management

- Draw geo-referenced fields, auto-calc area, store soil/elevation notes
- Configure crop calendars with planting/harvest, growth-stage tracking, and activity history
- View per-field dashboards (weather, alerts, photos, activities)

### Activity Logging

- Log land prep, planting, fertilizer, spraying, weeding, irrigation, and harvest events with optional inputs and photos
- Offline-first mobile workflow with conflict resolution once connected

### Weather Intelligence

- Current conditions and 3–7-day forecasts per field with confidence indicators
- Weather impact analysis (rainfall vs. soil moisture, temperature vs. growth)
- Map overlays for weather fronts and risk hotspots

### Alert & Notification Engine

- Pre-built rules for frost, heavy rain, heat stress, disease, irrigation, and harvest timing
- Configurable thresholds, recipients, and delivery channels (push, SMS, in-app)
- Alert lifecycle: generation → notification → acknowledgement → logged response

### Financial Tracking & Reporting

- Input cost recording (product, amount, field allocation) and harvest sale tracking
- Profitability snapshots per field/season with gross margin indicators
- Dashboards for weather overview, activity timeline, alerts, and cost vs. revenue
- Report builder for financials, weather impact, and alert effectiveness (exportable PDF/Excel)

---

## MVP Scope (First 6 Weeks)

The MVP targets rapid value delivery with essential features:

### Week 1-2: Foundation

- Authentication (email/password, email verification)
- Single-plantation setup
- Draw up to five fields on map with boundary polygons

### Week 2-3: Crop Planning & Activity Logging

- Predefined crops: Coffee, Cocoa, Plantain/Banana, Maize
- Record planting dates with auto growth stage tracking
- Basic activity logging (land prep, planting, fertilizer, spraying, weeding, harvesting)

### Week 3-4: Weather Intelligence

- Current weather display per field (temperature, humidity, rainfall)
- 3-day forecast
- Essential alerts: heavy rain (>50mm), temperature extremes (<10°C or >35°C), frost (<2°C)

### Week 4-5: Financial Tracking

- Input cost capture (product name, cost in XAF, field assignment)
- Harvest revenue logging (crop, quantity, price/kg)
- Per-field profit calculation (total costs vs. revenue)

### Week 5-6: Dashboard & Reporting

- Unified dashboard (weather overview, activities timeline, alerts, financial snapshot)
- Simple reports: field performance, seasonal P&L, weather impact summary

**Out of Scope for MVP:**

- Multi-user roles beyond owner
- Advanced alert customization
- AI-driven disease models
- Inventory tracking
- Offline sync
- SMS/email notifications
- Multi-plantation support

**Full MVP Details:** See [MVP Scope](../development/mvp-scope.md)

---

## Beyond MVP Enhancements

### Phase 2: Intelligence Engine (Months 4-6)

- Role-based access control with granular permissions
- Advanced rules engine and configurable notification matrix
- Offline-first synchronization

### Phase 3: Advanced Features (Months 7-9)

- Worker management and inventory tracking
- Predictive analytics (yield forecasting, disease/pest ML models)
- Irrigation optimization algorithms

### Phase 4: Integrations & Scale (Months 10-12)

- API integrations for market prices
- Third-party sensor integrations
- Multi-plantation management
- Advanced customization options

---

## AI & Decision Intelligence Roadmap

### High Priority (Launch + First Data)

1. **Weather Downscaling** - ML models combining topography, historical data, and APIs for field-level forecasts
2. **Disease Risk Prediction** - Classification blending humidity, temperature, crop stage, and treatment history
3. **Pest Infestation Forecasting** - Time-series models capturing seasonal pest cycles per crop and micro-climate
4. **Yield Prediction** - Regression using weather, activity logs, and input usage to anticipate season outcomes

### Medium Priority (Post Data Maturity)

5. **Irrigation Optimization** - Evapotranspiration + soil models recommending exact watering windows
6. **Harvest Timing** - Growing Degree Day tracking to pinpoint market-ready windows
7. **Input Recommendations** - Prescription suggestions for fertilizer/chemicals based on soil and historical performance

### Advanced (After 6-12 Months of Data)

8. **Anomaly Detection** - Surface unusual field patterns using unsupervised learning
9. **Climate Adaptation Insights** - Long-term guidance to adjust practices to shifting climate baselines

**Strategy:** Start with rule-based heuristics, collect 6-12 months of field data, then replace high-value rules with localized AI models.

**Full AI Features:** See [AI & ML Features](../technical/ai-ml-features.md)

---

## Technical Architecture & Stack

### System Overview

- **Clients**: React-based PWA (mobile, tablet, desktop) plus future native wrappers
- **Gateway & Microservices**: NestJS API gateway orchestrating Weather, Crop Management, Alerting, Analytics, and Notification services
- **Data Stores**: PostgreSQL + PostGIS for relational & spatial data, TimescaleDB extension for weather time-series, object storage for photos, Redis for caching and job queues
- **AI/ML Engine**: Consumes time-series and relational data for risk scoring, feeding alert engine and analytics
- **Integrations**: Weather APIs (OpenWeatherMap, WeatherAPI, Visual Crossing), messaging (Firebase FCM, Twilio SMS), mapping (Leaflet/OpenStreetMap, Mapbox optional)

### Frontend Stack (PWA-first)

- React 18 + TypeScript, Vite toolchain, Material UI + Emotion, React Router v6
- PWA tooling: Workbox, `vite-plugin-pwa`, IndexedDB/`idb-keyval`, Background Sync API, Push Notifications API
- Mapping: React-Leaflet with Leaflet Draw, Turf.js for spatial calculations
- Visualization: Recharts for analytics, Leaflet heatmap plugins for weather overlays

### Backend Stack

- NestJS 10+, TypeORM, Class Validator, ConfigModule
- Auth: Passport.js with JWT, bcrypt, RBAC
- Real-time + jobs: `@nestjs/websockets` with Socket.IO, Bull queues + Redis, scheduled cron jobs
- File handling: Multer + Sharp, storage via AWS S3, PDF generation for reports

### Data & Infrastructure

- PostgreSQL 14+ with PostGIS (spatial) and TimescaleDB (time-series)
- Redis for caching weather responses and queue management
- Deployment: Vercel/Netlify for PWA, AWS EC2/DigitalOcean for NestJS, AWS RDS Postgres + PostGIS, Redis Cloud/ElastiCache, S3 + CloudFront for assets
- Monitoring: Sentry, LogRocket, Google Analytics, Lighthouse CI, Core Web Vitals
- Dev experience: ESLint (Airbnb), Prettier, Husky hooks, Jest testing, Docker Compose

**Full Technical Details:** See [Architecture](../technical/architecture.md) and [Technology Stack](../technical/technology-stack.md)

---

## Implementation Timeline

### Phase 1: Pilot Preparation (Weeks 1-2)

- Map 50-hectare test block
- Train managers and field staff
- Configure initial alerts
- **Offering:** Risk-free pilot

### Phase 2: Validation (Months 1-3)

- Track alert accuracy
- Quantify cost savings
- Measure yield impact
- **Decision Point:** Go/no-go checkpoint

### Phase 3: Full Rollout (Month 4)

- Scale to full plantation
- Enable advanced analytics
- Configure custom reporting

### Phase 4: Intelligence Expansion (Months 4-6)

- Build alert rules engine
- Crop growth tracking
- Offline mobile capabilities

### Phase 5: Advanced Features (Months 7-9)

- ML risk prediction
- Multi-plantation management
- API integrations

### Phase 6: Optimization (Months 10-12)

- Performance tuning
- Advanced customization
- Scale readiness

---

## Value & ROI Narrative

### Cost Model

- **Annual subscription** priced per monitored hectare
- **Pilot cost**: Equivalent to cost of a junior farm manager
- **Risk mitigation**: No-risk 50-hectare pilot with go/no-go decision point

### Projected ROI (100-hectare Farm)

| Cost Area                 | Impact                                               | Savings/Gains                 |
| ------------------------- | ---------------------------------------------------- | ----------------------------- |
| **Chemical Applications** | 40% reduction in applications + 10% yield protection | 40% chemical cost + 10% yield |
| **Diesel (Irrigation)**   | Precision timing                                     | 15-20% reduction              |
| **Fertilizer Efficiency** | Optimized timing                                     | 20% savings                   |
| **Labor Productivity**    | Proactive planning                                   | 15% efficiency gain           |
| **Yield Improvement**     | Better timing & protection                           | 10-15% increase               |

**Net Impact:** **20-35% lift in net profitability** when alerts and insights are actioned consistently.

### Value Drivers

1. **Prevented Losses** - Early warnings protect against catastrophic events
2. **Resource Optimization** - Precision timing reduces waste
3. **Knowledge Centralization** - Digital records enable continuous improvement
4. **Scalable Expertise** - Systematic approach vs. individual memory

---

## Setup & Enablement Notes

### PostGIS Installation

Follow OS-specific steps in [Setup Guide](../development/setup-guide.md):

- Ubuntu/Debian: `sudo apt install postgresql-16-postgis-3`
- Windows: Use StackBuilder
- macOS: `brew install postgis`

Enable per database with:

```sql
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;  -- optional
```

### Training & Support

- **Douala-based agronomist** + WhatsApp hotline
- **Training workshops** for managers and field staff
- **Voice-to-text entry** for easier data input
- **Multilingual support**: French, English, Cameroonian Pidgin
- **Offline-first design** ensures continuity in low-connectivity regions

### Data Governance

- **Client retains data ownership** - contracts reinforce privacy
- **Recommendations augment expertise** - not replace human judgment
- **Transparent algorithms** - explainable AI for trust
- **Data security** - encrypted storage and transmission

---

## Supporting Documentation

### Quick Reference

- **MVP scope & exclusions**: [MVP Scope](../development/mvp-scope.md)
- **Detailed use cases**: [User Flows](../user-guides/user-flows.md)
- **Technology deep dive**: [Technology Stack](../technical/technology-stack.md)
- **AI functionality priorities**: [AI & ML Features](../technical/ai-ml-features.md)
- **Database setup**: [Database Schema](../technical/database-schema.md)

### Visual Diagrams

All diagrams are available in `../assets/diagrams/`:

- Class Diagram
- Use Case Diagram
- User Flow Diagram
- Authentication Sequence Diagram
- Disease Risk Prediction Sequence Diagram
- Field Activity Logging Sequence Diagram
- Financial Report Generation Sequence Diagram
- Weather Alert Generation Sequence Diagram

---

**This consolidated brief keeps the project narrative, functional scope, technical architecture, and rollout plan in one professional yet digestible reference for stakeholders and new contributors.**
