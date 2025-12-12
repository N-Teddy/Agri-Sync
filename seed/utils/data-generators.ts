import { faker } from '@faker-js/faker';

export const generateUserData = (index: number) => ({
    email: `farmer${index}@agrisync.test`,
    fullName: faker.person.fullName(),
    phoneNumber: faker.phone.number({
        style: 'international',
    }),
});

export const generatePlantationData = () => ({
    name: `${faker.location.city()} ${faker.helpers.arrayElement(['Farm', 'Estate', 'Plantation', 'Ranch'])}`,
    location: faker.location.city() + ', Cameroon',
});

export const generateFieldData = () => {
    const area = faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 });
    return {
        name: `Field ${faker.location.street()}`,
        areaHectares: area.toString(),
        soilType: faker.helpers.arrayElement([
            'Loamy',
            'Clay',
            'Sandy',
            'Silty',
            'Peaty',
        ]),
        currentCrop: faker.helpers.arrayElement([
            'corn',
            'cassava',
            'plantain',
            'cocoa',
            'coffee',
        ]),
    };
};

export const generateSeasonData = () => {
    const plantingDate = faker.date.past({ years: 1 });
    const expectedHarvest = new Date(plantingDate);
    expectedHarvest.setMonth(expectedHarvest.getMonth() + 4);

    return {
        cropType: faker.helpers.arrayElement([
            'corn',
            'cassava',
            'plantain',
            'cocoa',
            'coffee',
            'beans',
            'yam',
        ]),
        plantingDate: plantingDate.toISOString().split('T')[0],
        expectedHarvestDate: expectedHarvest.toISOString().split('T')[0],
    };
};

export const generateActivityData = (seasonStart: Date) => {
    const activityDate = faker.date.between({
        from: seasonStart,
        to: new Date(),
    });

    const activityType = faker.helpers.arrayElement([
        'planting',
        'watering',
        'fertilizing',
        'weeding',
        'pest_control',
        'harvesting',
    ]);

    const inputCost =
        activityType === 'fertilizing' || activityType === 'pest_control'
            ? faker.number.int({ min: 5000, max: 50000 })
            : null;

    return {
        activityType,
        activityDate: activityDate.toISOString().split('T')[0],
        notes: faker.lorem.sentence(),
        inputProduct:
            inputCost ? faker.commerce.productName() : undefined,
        inputCostXaf: inputCost?.toString(),
    };
};

export const generateFinancialData = () => {
    const recordType = faker.helpers.arrayElement(['cost', 'revenue']);
    const amount = faker.number.int({
        min: recordType === 'cost' ? 1000 : 10000,
        max: recordType === 'cost' ? 100000 : 500000,
    });

    return {
        recordType,
        amountXaf: amount.toString(),
        recordDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        description: faker.lorem.sentence(),
        productName: recordType === 'revenue' ? faker.commerce.product() : undefined,
    };
};

export const generateWeatherData = () => {
    const temp = faker.number.float({ min: 18, max: 35, fractionDigits: 1 });
    const humidity = faker.number.float({ min: 40, max: 95, fractionDigits: 1 });
    const rainfall = faker.number.float({ min: 0, max: 100, fractionDigits: 1 });

    return {
        recordedAt: faker.date.recent({ days: 30 }).toISOString(),
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
