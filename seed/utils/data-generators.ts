import { randomUUID } from 'crypto';

import { ActivityType } from '../../src/common/enums/activity-type.enum';
import { CropType } from '../../src/common/enums/crop-type.enum';
import { FinancialRecordType } from '../../src/common/enums/financial-record-type.enum';

const sampleCities = [
    'Buea',
    'Limbe',
    'Douala',
    'Yaounde',
    'Bamenda',
    'Kumba',
    'Nkongsamba',
    'Edea',
    'Kribi',
    'Garoua',
];

const sampleRegions = [
    'South-West',
    'Littoral',
    'Centre',
    'North-West',
    'West',
    'South',
];

const sampleStreets = [
    'Main Road',
    'Palm Avenue',
    'Cocoa Lane',
    'Coffee Street',
    'Plantain Drive',
    'Harvest Way',
    'River Road',
    'Hill View',
    'Sunrise Blvd',
];

const sampleWords = [
    'quality',
    'premium',
    'organic',
    'fresh',
    'sustainable',
    'green',
    'harvest',
    'yield',
    'soil',
    'growth',
    'care',
    'nourish',
    'protect',
];

const sampleProducts = [
    'Organic Fertilizer',
    'Compost Mix',
    'Pest Control Spray',
    'Mulch Cover',
    'Irrigation Kit',
    'Seed Pack',
    'Soil Booster',
    'Foliar Feed',
];

const randomItem = <T>(items: T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (
    min: number,
    max: number,
    fractionDigits: number
): number => {
    const factor = 10 ** fractionDigits;
    return (
        Math.floor((Math.random() * (max - min) + min) * factor) / factor
    );
};

const randomDateBetween = (from: Date, to: Date): Date => {
    const fromMs = from.getTime();
    const toMs = to.getTime();
    const randomMs = randomInt(fromMs, toMs);
    return new Date(randomMs);
};

const randomSentence = (): string => {
    const wordCount = randomInt(6, 12);
    const words = Array.from({ length: wordCount }, () =>
        randomItem(sampleWords)
    );
    return (
        words[0].charAt(0).toUpperCase() +
        words.join(' ').slice(1) +
        '.'
    );
};

export const generateUserData = (index: number) => ({
    email: `farmer${index}@agrisync.test`,
    fullName: `Farmer ${index} ${randomItem(['Ngala', 'Tata', 'Mbeng', 'Akoh', 'Ndi'])}`,
    phoneNumber: `+2376${randomInt(10000000, 99999999)}`,
});

export const generatePlantationData = () => ({
    name: `${randomItem(sampleCities)} ${randomItem(['Farm', 'Estate', 'Plantation', 'Ranch'])}`,
    location: `${randomItem(sampleCities)}, Cameroon`,
    region: randomItem(sampleRegions),
});

export const generateFieldData = () => {
    const centerLat = randomFloat(2, 8, 6);
    const centerLng = randomFloat(8, 15, 6);
    const delta = 0.001; // ~100m box

    const polygon = [
        [centerLng - delta, centerLat - delta],
        [centerLng + delta, centerLat - delta],
        [centerLng + delta, centerLat + delta],
        [centerLng - delta, centerLat + delta],
        [centerLng - delta, centerLat - delta], // close polygon
    ];

    return {
        name: `Field ${randomItem(sampleStreets)} ${randomInt(1, 50)}`,
        soilType: randomItem([
            'Loamy',
            'Clay',
            'Sandy',
            'Silty',
            'Peaty',
        ]),
        boundary: {
            type: 'Polygon',
            coordinates: [polygon],
        },
    };
};

export const generateSeasonData = () => {
    const plantingDate = new Date();
    plantingDate.setMonth(plantingDate.getMonth() - randomInt(2, 10));
    const expectedHarvest = new Date(plantingDate);
    expectedHarvest.setMonth(expectedHarvest.getMonth() + 4);

    return {
        cropType: randomItem(Object.values(CropType)),
        plantingDate: plantingDate.toISOString().split('T')[0],
        expectedHarvestDate: expectedHarvest.toISOString().split('T')[0],
    };
};

export const generateActivityData = (
    seasonStart: Date,
    seasonEnd: Date
) => {
    const activityDate = randomDateBetween(seasonStart, seasonEnd);

    const activityType = randomItem([
        ActivityType.LAND_PREPARATION,
        ActivityType.PLANTING,
        ActivityType.FERTILIZER_APPLICATION,
        ActivityType.SPRAYING,
        ActivityType.WEEDING,
        ActivityType.HARVESTING,
    ]);

    const hasInputCost =
        activityType === ActivityType.FERTILIZER_APPLICATION ||
        activityType === ActivityType.SPRAYING;

    const inputCost = hasInputCost
        ? randomInt(5000, 50000)
        : undefined;

    return {
        activityType,
        activityDate: activityDate.toISOString().split('T')[0],
        notes: randomSentence(),
        inputProduct: hasInputCost ? randomItem(sampleProducts) : undefined,
        inputCostXaf: inputCost,
    };
};

export const generateFinancialData = () => {
    const recordType = randomItem([
        FinancialRecordType.COST,
        FinancialRecordType.REVENUE,
    ]);

    const recordDate = new Date();
    recordDate.setDate(recordDate.getDate() - randomInt(10, 300));

    if (recordType === FinancialRecordType.COST) {
        return {
            recordType,
            amountXaf: randomInt(1000, 100000),
            recordDate: recordDate.toISOString().split('T')[0],
            description: randomSentence(),
            productName: randomItem(sampleProducts),
        };
    }

    const quantityKg = randomFloat(50, 2000, 2);
    const pricePerKgXaf = randomFloat(500, 3500, 2);

    return {
        recordType,
        recordDate: recordDate.toISOString().split('T')[0],
        cropType: randomItem(Object.values(CropType)),
        quantityKg,
        pricePerKgXaf,
        description: `Sale ref ${randomUUID().slice(0, 8)}`,
        buyerName: `Buyer ${randomInt(1, 50)}`,
    };
};

export const generateWeatherData = () => {
    const temp = randomFloat(18, 35, 1);
    const humidity = randomFloat(40, 95, 1);
    const rainfall = randomFloat(0, 100, 1);
    const recordedAt = new Date();
    recordedAt.setDate(recordedAt.getDate() - randomInt(0, 30));

    return {
        recordedAt: recordedAt.toISOString(),
        temperatureC: temp.toString(),
        humidityPercent: humidity.toString(),
        rainfallMm: rainfall.toString(),
        isForecast: false,
        source: 'seed-data',
    };
};

export const generateImageBuffer = (): Buffer => {
    // Generate a simple 1x1 pixel PNG
    const pngHeader = Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
    ]);
    const pngData = Buffer.from([
        0x00,
        0x00,
        0x00,
        0x0d,
        0x49,
        0x48,
        0x44,
        0x52,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x01,
        0x08,
        0x02,
        0x00,
        0x00,
        0x00,
        0x90,
        0x77,
        0x53,
        0xde,
        0x00,
        0x00,
        0x00,
        0x0c,
        0x49,
        0x44,
        0x41,
        0x54,
        0x08,
        0xd7,
        0x63,
        0xf8,
        0xcf,
        0xc0,
        0x00,
        0x00,
        0x03,
        0x01,
        0x01,
        0x00,
        0x18,
        0xdd,
        0x8d,
        0xb4,
        0x00,
        0x00,
        0x00,
        0x00,
        0x49,
        0x45,
        0x4e,
        0x44,
        0xae,
        0x42,
        0x60,
        0x82,
    ]);
    return Buffer.concat([pngHeader, pngData]);
};
