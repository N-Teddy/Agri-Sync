# AgriSync Pro - System Architecture

> **Technical Architecture Overview for AgriSync Pro Platform**

---

## Table of Contents

1. [System Vision](#system-vision)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [Microservices Architecture](#microservices-architecture)
5. [Data Flow & Processing](#data-flow--processing)
6. [Integration Points](#integration-points)
7. [Deployment Architecture](#deployment-architecture)
8. [Security Architecture](#security-architecture)
9. [Performance & Scalability](#performance--scalability)

---

## System Vision

**AgriSync Pro** is a decision-support system that transforms weather data and farm records into actionable intelligence for plantation managers.

### Core Value Propositions

1. **Prevent Loss** - Early warning system for weather risks and disease outbreaks
2. **Optimize Resources** - Precision timing for irrigation, spraying, and harvesting
3. **Centralize Knowledge** - Digital record-keeping with intelligent insights
4. **Scale Expertise** - Make experienced manager knowledge systematic and reproducible

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React PWA  │  │ Mobile PWA   │  │  Dashboard   │      │
│  │  (Desktop)   │  │  (Phone)     │  │   (Tablet)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API GATEWAY   │
                    │    (NestJS)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│    Weather     │  │  Crop Management │  │   Alerting     │
│    Service     │  │     Service      │  │    Service     │
└───────┬────────┘  └───────┬──────────┘  └───────┬────────┘
        │                    │                     │
        │           ┌────────▼────────┐            │
        │           │   Analytics     │            │
        │           │    Service      │            │
        │           └────────┬────────┘            │
        │                    │                   │
   ┌────▼────────────────────▼───────────────────▼─────┐
   │                 DATA LAYER                         │
   ├────────────────────────────────────────────────────┤
   │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
   │  │ PostgreSQL  │  │ TimescaleDB  │  │  Redis   │ │
   │  │  + PostGIS  │  │ (Time-Series)│  │  Cache   │ │
   │  └─────────────┘  └──────────────┘  └──────────┘ │
   └────────────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   External APIs │
                    ├─────────────────┤
                    │ • Weather APIs  │
                    │ • FCM/SMS       │
                    │ • Cloud Storage │
                    └─────────────────┘
```

---

## Core Components

### 1. Client Layer (Progressive Web Application)

**Technology Stack:**

- React 18 + TypeScript
- Vite build tool
- Material UI (MUI) v5 for components
- React Router v6 for navigation

**Key Features:**

- **Progressive Web App** - Installable, offline-capable
- **Responsive Design** - Works on desktop, tablet, mobile
- **Offline-First** - Service workers + IndexedDB
- **Push Notifications** - Real-time alerts
- **Camera Integration** - Photo documentation
- **GPS Integration** - Location tracking

**PWA Components:**

```javascript
// Service Worker Strategy
- App Shell: CacheFirst (instant loading)
- Weather Data: NetworkFirst (fresh with fallback)
- Field Data: NetworkFirst + Background Sync
- Static Assets: CacheFirst (performance)
```

---

### 2. API Gateway Layer

**Technology:** NestJS 10+

**Responsibilities:**

- Request routing to microservices
- Authentication & authorization (JWT)
- Rate limiting & throttling
- API versioning
- Request/response transformation
- Centralized logging

**Security Features:**

- JWT-based authentication
- Role-based access control (RBAC)
- Request validation
- CORS configuration
- Helmet security headers

---

### 3. Microservices Layer

#### A. Weather Service

**Responsibilities:**

- Fetch data from external weather APIs
- Field-level weather downscaling
- Forecast aggregation and caching
- Historical weather data management

**Technology:**

- NestJS with Bull queue for scheduled jobs
- Redis for caching (1-3 hour TTL)
- TimescaleDB for time-series storage

**Data Flow:**

```
External Weather APIs → Ingestion Service → Processing
   ↓
Weather Database (TimescaleDB)
   ↓
Field-Level Downscaling (ML Model)
   ↓
Cached Forecasts (Redis) → Client Apps
```

---

#### B. Crop Management Service

**Responsibilities:**

- Field boundary management (geospatial)
- Crop calendar and growth stage tracking
- Activity logging and history
- Photo management and storage

**Technology:**

- NestJS + TypeORM
- PostgreSQL + PostGIS for spatial data
- AWS S3 (or equivalent) for photo storage
- Sharp for image processing

**Spatial Capabilities:**

```sql
-- Field boundary storage
ST_GeomFromGeoJSON()

-- Area calculation
ST_Area(boundary) / 10000 as hectares

-- Proximity queries
ST_DWithin(boundary, point, distance)
```

---

#### C. Alert Service

**Responsibilities:**

- Rule engine for alert conditions
- Alert generation and prioritization
- Notification delivery (push, SMS, email)
- Alert lifecycle management

**Technology:**

- NestJS with WebSockets (Socket.IO)
- Bull queue for alert processing
- Firebase Cloud Messaging (FCM)
- Twilio for SMS

**Alert Flow:**

```
Weather Data + Crop Data → Rule Engine
   ↓
Alert Generated
   ↓
┌──────────┬──────────┬──────────┐
│   Push   │   SMS    │  Email   │
└──────────┴──────────┴──────────┘
   ↓
User Notification → Acknowledgment → Resolution
```

---

#### D. Analytics Service

**Responsibilities:**

- Data aggregation and reporting
- Financial calculations (ROI, profitability)
- Performance metrics
- Report generation (PDF, Excel)

**Technology:**

- NestJS + TypeORM
- PostgreSQL materialized views
- PDF generation libraries
- Caching for dashboard queries

---

### 4. Data Layer

#### PostgreSQL + PostGIS

**Purpose:** Primary relational database with spatial capabilities

**Schema Highlights:**

- Users & authentication
- Plantations & fields (with spatial data)
- Crop types & planting seasons
- Activity logs & photos
- Financial records
- Alert rules & history

**Spatial Extensions:**

```sql
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

-- Spatial indexes for performance
CREATE INDEX idx_fields_boundary
ON fields USING GIST(boundary);
```

---

#### TimescaleDB Extension

**Purpose:** Time-series data for weather tracking

**Features:**

- Automatic data partitioning by time
- Efficient compression for historical data
- Fast aggregation queries
- Retention policies

**Usage:**

```sql
-- Convert weather_data to hypertable
SELECT create_hypertable(
  'weather_data',
  'recorded_at'
);

-- Automatic 1-hour aggregation
CREATE MATERIALIZED VIEW weather_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', recorded_at) AS hour,
  field_id,
  AVG(temperature) as avg_temp,
  AVG(humidity) as avg_humidity,
  SUM(rainfall) as total_rainfall
FROM weather_data
GROUP BY hour, field_id;
```

---

#### Redis Cache

**Purpose:** Performance optimization and job queuing

**Use Cases:**

- Weather API response caching (1-3 hours)
- Session management
- Bull queue for background jobs
- Rate limiting counters
- Real-time data pub/sub

**Configuration:**

```javascript
// Cache Strategy
{
  weather_current: 3600,      // 1 hour
  weather_forecast: 10800,    // 3 hours
  field_metadata: 86400,      // 24 hours
  user_session: 604800        // 7 days
}
```

---

## Microservices Architecture

### Service Communication

**Synchronous Communication:**

- HTTP/REST for request-response
- WebSocket for real-time updates

**Asynchronous Communication:**

- Bull queue + Redis for background jobs
- Pub/Sub for event-driven workflows

### Inter-Service Data Flow

```
┌─────────────────┐
│  Weather Service│
└────────┬────────┘
         │ Published Event:
         │ "weather.updated"
         ▼
┌─────────────────┐
│  Alert Service  │◄──── Subscribes to weather events
└────────┬────────┘
         │ Evaluates rules
         ▼
┌─────────────────┐
│ Notification Svc│
└─────────────────┘
```

---

## Data Flow & Processing

### 1. Weather Data Ingestion Flow

```
┌──────────────────┐
│ External Weather │
│      APIs        │
└────────┬─────────┘
         │ Every 3 hours (cron)
         ▼
┌─────────────────┐
│ Weather Ingester│ (NestJS scheduled job)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation &   │
│  Transformation │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TimescaleDB    │ (Store)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Field-Level     │ (Downscaling algorithm)
│  Downscaling    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis Cache    │ (Fast retrieval)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PWA Clients   │
└─────────────────┘
```

---

### 2. Alert Generation Flow

```
┌─────────────────┐      ┌─────────────────┐
│  Weather Data   │      │   Crop Data     │
└────────┬────────┘      └────────┬────────┘
         │                        │
         └────────────┬───────────┘
                      ▼
            ┌─────────────────┐
            │  Alert Rule     │
            │    Engine       │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Condition      │
            │   Evaluation    │
            └────────┬────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   Condition                 Condition
   Not Met                     Met
        │                         │
        ▼                         ▼
 Continue                  ┌─────────────────┐
 Monitoring                │ Generate Alert  │
                           └────────┬────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │ Push           │  │ SMS            │  │ Email          │
       │ Notification   │  │ (Twilio)       │  │ (Resend)       │
       └────────┬───────┘  └────────┬───────┘  └────────┬───────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    ▼
                          ┌─────────────────┐
                          │ User Receives   │
                          │   Alert         │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Acknowledge    │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  Take Action    │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   Log Response  │
                          └─────────────────┘
```

---

### 3. Activity Logging with Offline Sync

```
Field Supervisor (Mobile PWA)
         │
         ▼
┌─────────────────┐
│ Log Activity    │ (Offline capable)
│  + Photos       │
└────────┬────────┘
         │
         ▼
    Network?
         │
    ┌────┴────┐
    │         │
   No        Yes
    │         │
    │         └──────┐
    │                │
    ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│ IndexedDB       │  │ API Server      │
│ (Local Queue)   │  │ (Immediate sync)│
└────────┬────────┘  └────────┬────────┘
         │                     │
    Network                    │
    Restored                   │
         │                     │
         └──────┬──────────────┘
                │
                ▼
       ┌─────────────────┐
       │ Background Sync │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Conflict        │
       │ Resolution      │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ PostgreSQL      │
       │ (Persisted)     │
       └─────────────────┘
```

---

## Integration Points

### External Weather APIs

**Primary Sources:**

- OpenWeatherMap API
- WeatherAPI.com
- Visual Crossing Weather

**Backup Sources:**

- NOAA API
- AccuWeather API

**Integration Strategy:**

- Multi-source aggregation for reliability
- Weighted averaging based on historical accuracy
- Automatic failover on API failure
- Rate limit management

**Data Points Collected:**

```javascript
{
  temperature: Number,      // °C
  humidity: Number,         // %
  rainfall: Number,         // mm
  wind_speed: Number,       // km/h
  wind_direction: Number,   // degrees
  solar_radiation: Number,  // W/m²
  pressure: Number,         // hPa
  forecast_hours: Array     // 0-168 (7 days)
}
```

---

### Notification Services

**Firebase Cloud Messaging (FCM):**

- Web push notifications
- Mobile push notifications
- Token management

**Twilio SMS:**

- Critical alerts only
- Regional phone number support
- Delivery confirmation

**Email (Resend/Nodemailer):**

- Digest reports
- Non-urgent alerts
- Document delivery

---

### Cloud Storage

**AWS S3 (or equivalent):**

- Activity photos
- Generated reports (PDF/Excel)
- User profile images
- Backup exports

**CloudFront CDN:**

- Fast global delivery
- Cached static assets
- Reduced origin load

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────┐
│             CLOUDFLARE CDN (Global)                 │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│ Vercel/Netlify│         │  AWS/DigitalOcean│
│   (PWA Frontend)│         │  (NestJS Backend)│
└───────────────┘         └────────┬──────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
        │ AWS RDS       │ │ Redis Cloud   │ │ AWS S3        │
        │ PostgreSQL    │ │ (Cache)       │ │ (Storage)     │
        │ + PostGIS     │ │               │ │               │
        └───────────────┘ └───────────────┘ └───────────────┘
```

### Infrastructure Components

**Frontend Deployment:**

- **Platform:** Vercel or Netlify
- **Features:** Global CDN, automatic HTTPS, preview deployments
- **Build:** Vite production build
- **CDN:** Automatic edge caching

**Backend Deployment:**

- **Platform:** AWS EC2 or DigitalOcean Droplet
- **Setup:** Docker containers with Docker Compose
- **Scaling:** Horizontal scaling with load balancer
- **Health Monitoring:** Automated health checks

**Database:**

- **Platform:** AWS RDS PostgreSQL with PostGIS
- **Backup:** Automated daily backups, point-in-time recovery
- **Scaling:** Read replicas for analytics queries
- **Monitoring:** CloudWatch metrics

**Cache & Queue:**

- **Platform:** Redis Cloud or AWS ElastiCache
- **Configuration:** Cluster mode for high availability
- **Persistence:** AOF + RDB for data durability

---

## Security Architecture

### Authentication & Authorization

**JWT-Based Authentication:**

```javascript
// Token Structure
{
  access_token: {
    user_id: UUID,
    role: string,
    exp: timestamp (7 days)
  },
  refresh_token: {
    user_id: UUID,
    exp: timestamp (30 days)
  }
}
```

**Role-Based Access Control (RBAC):**

- **Owner:** Full access to all resources
- **Manager:** Field operations, reports, alerts
- **Supervisor:** Activity logging, basic viewing
- **Worker:** Limited activity logging only

---

### Data Security

**Encryption:**

- **In Transit:** TLS 1.3 for all communications
- **At Rest:** AES-256 encryption for database
- **Passwords:** bcrypt hashing (10-12 rounds)

**Data Privacy:**

- Client data ownership guaranteed
- GDPR-compliant data handling
- Right to data export and deletion
- No third-party data sharing

---

### Application Security

**Security Headers:**

```javascript
// Helmet configuration
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
```

**Rate Limiting:**

```javascript
// Rate limits by endpoint
{
  login: 5 requests / 15 minutes,
  api_general: 100 requests / minute,
  weather: 20 requests / minute,
  upload: 10 requests / hour
}
```

---

## Performance & Scalability

### Performance Targets

| Metric                     | Target      | Measurement                |
| -------------------------- | ----------- | -------------------------- |
| **Page Load Time**         | < 2s        | First Contentful Paint     |
| **API Response Time**      | < 500ms     | P95 latency                |
| **Weather Update Latency** | < 5 minutes | Real-time sync             |
| **Offline Sync**           | < 10s       | Background sync completion |
| **Map Rendering**          | < 1s        | Field boundary display     |

---

### Scalability Strategy

**Horizontal Scaling:**

- Stateless backend services (easy replication)
- Load balancer distribution
- Auto-scaling based on CPU/memory usage

**Database Optimizations:**

- Spatial indexes for PostGIS queries
- Materialized views for dashboards
- Query result caching (Redis)
- Read replicas for analytics

**Caching Strategy:**

```
L1: Browser Cache (Service Worker)
L2: CDN Cache (CloudFront)
L3: Application Cache (Redis)
L4: Database Query Cache
```

---

### Monitoring & Observability

**Application Monitoring:**

- **Sentry:** Error tracking and alerting
- **LogRocket:** Session replay for debugging
- **Google Analytics:** Usage patterns

**Performance Monitoring:**

- **Lighthouse CI:** PWA metrics
- **Core Web Vitals:** User experience metrics
- **Real User Monitoring (RUM):** Actual performance data

**Infrastructure Monitoring:**

- **CloudWatch:** AWS resources
- **Uptime Robot:** Availability monitoring
- **Log aggregation:** Centralized logging

---

## Conclusion

The AgriSync Pro architecture is designed for:

- ✅ **Reliability** - Multi-layer redundancy and failover
- ✅ **Performance** - Optimized for low-latency operations
- ✅ **Scalability** - Horizontal scaling capabilities
- ✅ **Security** - Defense-in-depth approach
- ✅ **Maintainability** - Microservices for independent deployment
- ✅ **Offline-First** - Works in low-connectivity environments

**Next Steps:** See [Technology Stack](technology-stack.md) for detailed technology choices and implementation guidance.
