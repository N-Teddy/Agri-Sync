import type { AppConfiguration } from '../../src/config/configuration';

export const buildTestConfiguration = (): AppConfiguration => ({
	app: {
		name: 'Agri Sync Pro (Test)',
		env: 'test',
		port: 4000,
		apiVersion: '1',
		globalPrefix: 'api',
		webUrl: 'http://localhost:4000',
	},
	database: {
		url: 'sqlite://:memory:',
	},
	supabase: {
		url: 'http://localhost',
		serviceRoleKey: 'test',
		databaseUrl: 'postgres://test',
	},
	mail: {
		host: 'smtp.example.com',
		port: 1025,
		user: 'user',
		pass: 'pass',
		from: 'Agri Sync Pro <no-reply@test>',
	},
	cloudinary: {
		cloudName: 'demo',
		apiKey: 'key',
		apiSecret: 'secret',
	},
	storage: {
		uploadsDir: 'uploads-test',
	},
	google: {
		clientId: 'test-google-client-id',
		clientSecret: 'test-google-client-secret',
	},
	jwt: {
		secret: 'test-secret',
		expiresIn: '15m',
		refreshSecret: 'test-refresh-secret',
		refreshExpiresIn: '1d',
		rememberMeRefreshExpiresIn: '7d',
	},
	redis: {
		host: 'localhost',
		port: 6379,
		password: undefined,
	},
	security: {
		apiKey: 'test-api-key',
	},
	weather: {
		apiKey: 'test-weather-api-key',
		baseUrl: 'https://api.test-weather.com',
		defaultForecastDays: 3,
	},
});
