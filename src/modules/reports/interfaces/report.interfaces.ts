export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface FieldPerformanceReport {
    field: {
        id: string;
        name: string;
        areaHectares: string;
        soilType?: string;
    };
    currentSeason?: {
        crop: string;
        plantingDate: string;
        expectedHarvestDate?: string;
        daysActive: number;
        status: string;
    };
    financials: {
        totalCosts: number;
        totalRevenue: number;
        grossProfit: number;
        profitPerHectare: number;
        profitMargin: number;
    };
    activities: {
        total: number;
        byType: Record<string, number>;
    };
    weather: {
        avgTemperature: number;
        totalRainfall: number;
        extremeEvents: number;
        dataPoints: number;
    };
    generatedAt: Date;
}

export interface SeasonalSummaryReport {
    season: {
        id: string;
        crop: string;
        plantingDate: string;
        harvestDate?: string;
        expectedHarvestDate?: string;
        status: string;
        durationDays: number;
    };
    field: {
        id: string;
        name: string;
        areaHectares: string;
    };
    activities: {
        total: number;
        byType: Record<string, number>;
        timeline: Array<{
            date: string;
            type: string;
            notes?: string;
        }>;
    };
    financials: {
        inputCosts: number;
        harvestRevenue: number;
        netProfit: number;
        roi: number;
    };
    yield?: {
        quantityKg: number;
        yieldPerHectare: number;
        pricePerKg: number;
    };
    generatedAt: Date;
}

export interface WeatherImpactReport {
    field: {
        id: string;
        name: string;
    };
    period: DateRange;
    weatherSummary: {
        avgTemperature: number;
        minTemperature: number;
        maxTemperature: number;
        totalRainfall: number;
        avgHumidity: number;
        extremeEvents: {
            heavyRain: number;
            temperatureExtremes: number;
            frostWarnings: number;
        };
    };
    alerts: {
        total: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
    };
    correlations: {
        activitiesCount: number;
        yieldImpact?: string;
    };
    generatedAt: Date;
}
