export const API_CONFIG = {
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 30000,
};

export const SEED_CONFIG = {
    usersCount: 10,
    plantationsPerUser: 2,
    fieldsPerPlantation: 3,
    seasonsPerField: 2,
    activitiesPerSeason: 10,
    photosPerActivity: 2,
    financialRecordsPerField: 15,
    weatherDataPointsPerField: 50,
    alertsPerField: 5,
};

export const USER_CREDENTIALS = {
    password: 'Test@1234',
    rememberMe: true,
};
