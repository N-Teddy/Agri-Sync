-- SQLBook: Code
-- agrisync_database_setup.sql
-- AgriSync Pro Database Setup Script
-- Run this script in your PostgreSQL database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Users & Authentication Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'manager',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    device_type VARCHAR(100),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Plantations & Fields Tables
CREATE TABLE plantations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100) DEFAULT 'Cameroon',
    region VARCHAR(100),
    owner_id UUID REFERENCES users (id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    plantation_id UUID REFERENCES plantations (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boundary GEOGRAPHY (POLYGON, 4326) NOT NULL,
    area_hectares DECIMAL(10, 2),
    soil_type VARCHAR(100),
    elevation DECIMAL(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fields_boundary ON fields USING GIST (boundary);

-- 3. Crops & Planting Seasons Tables
CREATE TABLE crop_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    scientific_name VARCHAR(255),
    optimal_temperature_min DECIMAL(5, 2),
    optimal_temperature_max DECIMAL(5, 2),
    frost_sensitive BOOLEAN DEFAULT false
);

CREATE TABLE planting_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    field_id UUID REFERENCES fields (id) ON DELETE CASCADE,
    crop_type_id UUID REFERENCES crop_types (id),
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    initial_yield_estimate DECIMAL(10, 2),
    actual_yield DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Weather Data Table (Time-Series)
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    field_id UUID REFERENCES fields (id) ON DELETE CASCADE,
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

-- Convert to hypertable for time-series data
SELECT create_hypertable ('weather_data', 'recorded_at');

CREATE INDEX idx_weather_field_time ON weather_data (field_id, recorded_at);

CREATE INDEX idx_weather_forecast ON weather_data (
    field_id,
    is_forecast,
    recorded_at
);

-- 5. Field Activities & Operations Tables
CREATE TABLE activity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    input_type VARCHAR(100)
);

CREATE TABLE field_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    field_id UUID REFERENCES fields (id) ON DELETE CASCADE,
    planting_season_id UUID REFERENCES planting_seasons (id),
    activity_type_id UUID REFERENCES activity_types (id),
    performed_by UUID REFERENCES users (id),
    activity_date DATE NOT NULL,
    description TEXT,
    input_product VARCHAR(255),
    input_quantity DECIMAL(10, 2),
    input_unit VARCHAR(50),
    labor_hours DECIMAL(6, 2),
    worker_count INTEGER,
    equipment_used VARCHAR(255),
    weather_conditions TEXT,
    is_synced BOOLEAN DEFAULT true,
    offline_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    activity_id UUID REFERENCES field_activities (id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Alert System Tables
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users (id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    alert_rule_id UUID REFERENCES alert_rules (id),
    field_id UUID REFERENCES fields (id) ON DELETE CASCADE,
    planting_season_id UUID REFERENCES planting_seasons (id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    triggered_by_metric VARCHAR(100),
    trigger_value DECIMAL(10, 2),
    expected_impact TEXT,
    recommended_action TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users (id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alert_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    alert_id UUID REFERENCES alerts (id) ON DELETE CASCADE,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    notification_type VARCHAR(50) DEFAULT 'push',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 7. Disease & Pest Tracking Tables
CREATE TABLE disease_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    affected_crops TEXT [],
    favorable_conditions JSONB,
    prevention_methods TEXT,
    treatment_methods TEXT
);

CREATE TABLE disease_occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    field_id UUID REFERENCES fields (id) ON DELETE CASCADE,
    disease_type_id UUID REFERENCES disease_types (id),
    planting_season_id UUID REFERENCES planting_seasons (id),
    first_observed DATE NOT NULL,
    severity VARCHAR(50),
    affected_area_percent DECIMAL(5, 2),
    weather_conditions JSONB,
    treatment_applied TEXT,
    treatment_effectiveness VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Financial Tables for Cameroon
CREATE TABLE input_prices_cm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL, -- 'fertilizer', 'pesticide', 'seed', 'herbicide'
    unit_price_xaf DECIMAL(10, 2) NOT NULL,
    unit_type VARCHAR(50) NOT NULL, -- 'kg', 'liter', 'bag', 'plant'
    supplier VARCHAR(255),
    region VARCHAR(100), -- Prices vary by region in Cameroon
    last_updated DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE market_prices_cm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    crop_type VARCHAR(100) NOT NULL,
    quality_grade VARCHAR(50) DEFAULT 'standard', -- 'premium', 'standard', 'commercial'
    price_per_unit_xaf DECIMAL(8, 2) NOT NULL,
    unit_type VARCHAR(50) DEFAULT 'kg', -- 'kg', 'bunch', 'bag'
    market_location VARCHAR(100) NOT NULL, -- 'Douala', 'Yaoundé', 'Bamenda', 'Bafoussam'
    record_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(100), -- 'government', 'market', 'contract'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fixed_costs_cm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    plantation_id UUID REFERENCES plantations (id) ON DELETE CASCADE,
    cost_type VARCHAR(100) NOT NULL, -- 'land_rent', 'transport', 'certification', 'maintenance'
    description TEXT,
    amount_xaf DECIMAL(12, 2) NOT NULL,
    cost_frequency VARCHAR(20) NOT NULL, -- 'per_hectare_year', 'per_season', 'monthly', 'annual'
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Initial Data
-- Crop types common in Cameroon
INSERT INTO
    crop_types (
        id,
        name,
        variety,
        scientific_name,
        optimal_temperature_min,
        optimal_temperature_max,
        frost_sensitive
    )
VALUES (
        uuid_generate_v4 (),
        'Coffee',
        'Arabica',
        'Coffea arabica',
        18.0,
        24.0,
        true
    ),
    (
        uuid_generate_v4 (),
        'Coffee',
        'Robusta',
        'Coffea canephora',
        22.0,
        30.0,
        true
    ),
    (
        uuid_generate_v4 (),
        'Banana',
        'Cavendish',
        'Musa acuminata',
        20.0,
        35.0,
        true
    ),
    (
        uuid_generate_v4 (),
        'Plantain',
        'French',
        'Musa paradisiaca',
        20.0,
        35.0,
        true
    ),
    (
        uuid_generate_v4 (),
        'Maize',
        'Local',
        'Zea mays',
        15.0,
        35.0,
        false
    ),
    (
        uuid_generate_v4 (),
        'Cassava',
        'Sweet',
        'Manihot esculenta',
        25.0,
        35.0,
        true
    ),
    (
        uuid_generate_v4 (),
        'Cocoa',
        'Forastero',
        'Theobroma cacao',
        18.0,
        32.0,
        true
    );

-- Activity types
INSERT INTO
    activity_types (
        id,
        name,
        category,
        input_type
    )
VALUES (
        uuid_generate_v4 (),
        'Land Preparation',
        'cultivation',
        'labor'
    ),
    (
        uuid_generate_v4 (),
        'Planting',
        'cultivation',
        'labor'
    ),
    (
        uuid_generate_v4 (),
        'Fertilizer Application',
        'cultivation',
        'chemical'
    ),
    (
        uuid_generate_v4 (),
        'Weeding',
        'cultivation',
        'labor'
    ),
    (
        uuid_generate_v4 (),
        'Irrigation',
        'cultivation',
        'water'
    ),
    (
        uuid_generate_v4 (),
        'Pesticide Spraying',
        'protection',
        'chemical'
    ),
    (
        uuid_generate_v4 (),
        'Fungicide Application',
        'protection',
        'chemical'
    ),
    (
        uuid_generate_v4 (),
        'Harvesting',
        'harvest',
        'labor'
    ),
    (
        uuid_generate_v4 (),
        'Pruning',
        'cultivation',
        'labor'
    );

-- Disease types in Cameroon
INSERT INTO
    disease_types (
        id,
        name,
        scientific_name,
        affected_crops,
        favorable_conditions
    )
VALUES (
        uuid_generate_v4 (),
        'Black Sigatoka',
        'Mycosphaerella fijiensis',
        '{"Banana", "Plantain"}',
        '{"min_temp": 20, "max_temp": 28, "min_humidity": 85}'
    ),
    (
        uuid_generate_v4 (),
        'Coffee Leaf Rust',
        'Hemileia vastatrix',
        '{"Coffee"}',
        '{"min_temp": 15, "max_temp": 28, "min_humidity": 80}'
    ),
    (
        uuid_generate_v4 (),
        'Cassava Mosaic Virus',
        'African cassava mosaic virus',
        '{"Cassava"}',
        '{"min_temp": 25, "max_temp": 35}'
    ),
    (
        uuid_generate_v4 (),
        'Banana Bacterial Wilt',
        'Xanthomonas campestris',
        '{"Banana", "Plantain"}',
        '{"min_temp": 20, "max_temp": 35, "min_humidity": 70}'
    );

-- Default alert rules
INSERT INTO
    alert_rules (
        id,
        name,
        description,
        conditions,
        severity
    )
VALUES (
        uuid_generate_v4 (),
        'Frost Warning',
        'Alert when temperatures drop below freezing for frost-sensitive crops',
        '{"type": "weather", "metric": "temperature", "operator": "<", "value": 2, "duration_hours": 2, "crop_condition": "any"}',
        'high'
    ),
    (
        uuid_generate_v4 (),
        'Black Sigatoka Risk',
        'High disease risk when humidity and temperature are optimal for Black Sigatoka',
        '{"type": "disease", "disease": "Black Sigatoka", "min_temp": 20, "max_temp": 28, "min_humidity": 85, "duration_hours": 48}',
        'medium'
    ),
    (
        uuid_generate_v4 (),
        'Irrigation Advisory',
        'Suggest irrigation when soil moisture is low and no rain forecast',
        '{"type": "irrigation", "soil_moisture": "low", "rain_forecast": "none", "duration_days": 3}',
        'low'
    );

-- Insert Cameroon-specific financial data
INSERT INTO
    input_prices_cm (
        id,
        product_name,
        product_type,
        unit_price_xaf,
        unit_type,
        supplier,
        region
    )
VALUES (
        uuid_generate_v4 (),
        'NPK 20-10-10',
        'fertilizer',
        800,
        'kg',
        'Local Supplier',
        'West'
    ),
    (
        uuid_generate_v4 (),
        'Urea',
        'fertilizer',
        600,
        'kg',
        'Local Supplier',
        'West'
    ),
    (
        uuid_generate_v4 (),
        'DAP',
        'fertilizer',
        900,
        'kg',
        'Local Supplier',
        'West'
    ),
    (
        uuid_generate_v4 (),
        'Glyphosate',
        'herbicide',
        5000,
        'liter',
        'Agro-Chem',
        'National'
    ),
    (
        uuid_generate_v4 (),
        'Fungicide (Copper)',
        'pesticide',
        8500,
        'liter',
        'Agro-Chem',
        'National'
    ),
    (
        uuid_generate_v4 (),
        'Maize Seeds',
        'seed',
        2500,
        'kg',
        'Seed Co',
        'Northwest'
    ),
    (
        uuid_generate_v4 (),
        'Coffee Seedlings',
        'seed',
        500,
        'plant',
        'Nursery',
        'West'
    ),
    (
        uuid_generate_v4 (),
        'Plantain Suckers',
        'seed',
        800,
        'plant',
        'Local Farm',
        'Littoral'
    );

INSERT INTO
    market_prices_cm (
        id,
        crop_type,
        quality_grade,
        price_per_unit_xaf,
        unit_type,
        market_location
    )
VALUES (
        uuid_generate_v4 (),
        'Coffee',
        'premium',
        2500,
        'kg',
        'Douala'
    ),
    (
        uuid_generate_v4 (),
        'Coffee',
        'standard',
        1800,
        'kg',
        'Douala'
    ),
    (
        uuid_generate_v4 (),
        'Cocoa',
        'premium',
        1800,
        'kg',
        'Douala'
    ),
    (
        uuid_generate_v4 (),
        'Cocoa',
        'standard',
        1200,
        'kg',
        'Douala'
    ),
    (
        uuid_generate_v4 (),
        'Plantain',
        'standard',
        800,
        'bunch',
        'Yaoundé'
    ),
    (
        uuid_generate_v4 (),
        'Banana',
        'standard',
        600,
        'bunch',
        'Yaoundé'
    ),
    (
        uuid_generate_v4 (),
        'Maize',
        'standard',
        400,
        'kg',
        'Bamenda'
    ),
    (
        uuid_generate_v4 (),
        'Cassava',
        'standard',
        250,
        'kg',
        'Bafoussam'
    );

INSERT INTO
    fixed_costs_cm (
        id,
        plantation_id,
        cost_type,
        description,
        amount_xaf,
        cost_frequency
    )
VALUES (
        uuid_generate_v4 (),
        NULL,
        'land_rent',
        'Typical annual land rent per hectare',
        120000,
        'per_hectare_year'
    ),
    (
        uuid_generate_v4 (),
        NULL,
        'transport',
        'Average transport cost per hectare',
        40000,
        'per_hectare_year'
    ),
    (
        uuid_generate_v4 (),
        NULL,
        'certification',
        'Organic certification costs',
        50000,
        'annual'
    ),
    (
        uuid_generate_v4 (),
        NULL,
        'maintenance',
        'Equipment and infrastructure maintenance',
        100000,
        'annual'
    );

-- Display success message
-- Create a database user for the application (optional)
-- CREATE USER agrisync_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agrisync_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agrisync_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'AgriSync Pro database setup completed successfully!';
    RAISE NOTICE 'Tables created: users, plantations, fields, crop_types, planting_seasons, weather_data, activity_types, field_activities, alert_rules, alerts, disease_types, input_prices_cm, market_prices_cm, fixed_costs_cm';
    RAISE NOTICE 'Sample data inserted for crop types, activity types, disease types, financial data and alert rules';
END $$;