export interface AppConfiguration {
	app: {
		name: string;
		env: string;
		port: number;
		apiVersion: string;
		globalPrefix: string;
		webUrl: string;
	};
	database: {
		url: string;
	};
	supabase?: {
		url?: string;
		serviceRoleKey?: string;
		databaseUrl?: string;
	};
	mail: {
		host: string;
		port: number;
		user: string;
		pass: string;
		from: string;
	};
	cloudinary: {
		cloudName?: string;
		apiKey?: string;
		apiSecret?: string;
	};
	storage: {
		uploadsDir: string;
	};
	google: {
		clientId: string;
		clientSecret: string;
	};
	jwt: {
		secret: string;
		expiresIn: string;
		refreshSecret: string;
		refreshExpiresIn: string;
		rememberMeRefreshExpiresIn: string;
	};
	redis: {
		host: string;
		port: number;
		password?: string;
	};
	security: {
		apiKey?: string;
	};
	weather: {
		apiKey: string;
		baseUrl: string;
		defaultForecastDays: number;
	};
}

const configuration = (): AppConfiguration => {
	const env = process.env.NODE_ENV ?? 'development';

	return {
		app: {
			name: process.env.APP_NAME ?? 'Agri Sync Pro',
			env,
			port: Number(process.env.PORT) || 3000,
			apiVersion: process.env.API_VERSION ?? '1',
			globalPrefix: 'api',
			webUrl: process.env.APP_WEB_URL ?? 'http://agri-sync.local:5173',
		},
		database: {
			url: process.env.DATABASE_URL ?? '',
		},
		supabase: {
			url: process.env.SUPABASE_URL ?? undefined,
			serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? undefined,
			databaseUrl: process.env.SUPABASE_DB_URL ?? undefined,
		},
		mail: {
			host: process.env.EMAIL_HOST ?? '',
			port: Number(process.env.EMAIL_PORT) || 587,
			user: process.env.EMAIL_USER ?? '',
			pass: process.env.EMAIL_PASS ?? '',
			from:
				process.env.EMAIL_FROM ??
				'Agri Sync Pro <no-reply@agrisyncpro.com>',
		},
		cloudinary: {
			cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? undefined,
			apiKey: process.env.CLOUDINARY_API_KEY ?? undefined,
			apiSecret: process.env.CLOUDINARY_API_SECRET ?? undefined,
		},
		storage: {
			uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
		},
		jwt: {
			secret: process.env.JWT_SECRET ?? '',
			expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
			refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
			refreshExpiresIn: process.env.JWT_REFREsSH_EXPIRES_IN ?? '7d',
			rememberMeRefreshExpiresIn:
				process.env.JWT_REMEMBER_ME_REFRESH_EXPIRES_IN ?? '30d',
		},
		redis: {
			host: process.env.REDIS_HOST ?? 'localhost',
			port: Number(process.env.REDIS_PORT) || 6379,
			password: process.env.REDIS_PASSWORD,
		},
		security: {
			apiKey: process.env.SECURITY_API_KEY,
		},
		weather: {
			apiKey: process.env.WEATHER_API_KEY ?? '',
			baseUrl:
				process.env.WEATHER_API_BASE_URL ??
				'https://api.openweathermap.org/data/2.5',
			defaultForecastDays:
				Number(process.env.WEATHER_DEFAULT_FORECAST_DAYS) || 3,
		},
	};
};

export default configuration;
